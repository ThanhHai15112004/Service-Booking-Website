import { AdminBookingRepository } from "../../Repository/Admin/adminBooking.repository";
import { BookingStatus } from "../../models/Booking/booking.model";
import { BookingRepository } from "../../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../../Repository/Hotel/availability.repository";
import { PaymentMethod } from "../../models/Payment/payment.model";

export class AdminBookingService {
  private adminBookingRepo = new AdminBookingRepository();
  private bookingRepo = new BookingRepository();
  private availabilityRepo = new AvailabilityRepository();

  // Lấy danh sách bookings với filters và pagination
  async getAllBookings(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BookingStatus;
    paymentMethod?: string;
    paymentStatus?: string;
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "created_at" | "total_amount" | "status";
    sortOrder?: "ASC" | "DESC";
  }) {
    try {
      const result = await this.adminBookingRepo.getAllBookings(params);
      return {
        success: true,
        data: {
          bookings: result.bookings,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getAllBookings error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách bookings",
      };
    }
  }

  // Lấy chi tiết booking cho admin
  async getBookingDetail(bookingId: string) {
    try {
      const booking = await this.adminBookingRepo.getBookingDetailForAdmin(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking",
        };
      }

      // Lấy danh sách rooms
      const rooms = await this.adminBookingRepo.getBookingRooms(bookingId);

      // Lấy activity logs (tạo từ dữ liệu có sẵn)
      const activityLogs = await this.adminBookingRepo.getBookingActivityLog(bookingId);

      // Lấy status history (từ activity logs)
      const statusHistory = await this.adminBookingRepo.getStatusHistory(bookingId);

      // Lấy internal notes (từ special_requests)
      const internalNotes = await this.adminBookingRepo.getInternalNotes(bookingId);

      return {
        success: true,
        data: {
          ...booking,
          rooms,
          activityLogs,
          statusHistory,
          internalNotes,
        },
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getBookingDetail error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết booking",
      };
    }
  }

  // Cập nhật booking status
  async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    adminId: string,
    adminName: string,
    reason?: string
  ) {
    try {
      // Lấy booking hiện tại
      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking",
        };
      }

      const oldStatus = booking.status;

      // Validate status transition
      const validTransitions: Record<string, string[]> = {
        CREATED: ["PENDING_CONFIRMATION", "CONFIRMED", "CANCELLED"],
        PENDING_CONFIRMATION: ["CONFIRMED", "CANCELLED"],
        CONFIRMED: ["CHECKED_IN", "CANCELLED"],
        CHECKED_IN: ["CHECKED_OUT", "COMPLETED"],
        CHECKED_OUT: ["COMPLETED"],
        COMPLETED: [],
        CANCELLED: [],
      };

      if (!validTransitions[oldStatus]?.includes(newStatus)) {
        return {
          success: false,
          message: `Không thể chuyển từ trạng thái ${oldStatus} sang ${newStatus}`,
        };
      }

      // Update booking status
      const updated = await this.bookingRepo.updateBooking(bookingId, {
        status: newStatus,
      });

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật trạng thái booking",
        };
      }

      // Activity log được tạo tự động từ dữ liệu booking (không cần lưu vào DB)
      console.log(`[AdminBookingService] Status changed: ${oldStatus} → ${newStatus} by ${adminName} (${adminId})`);

      // Nếu status là CANCELLED, unlock rooms (atomic transaction)
      if (newStatus === "CANCELLED") {
        try {
          // Sử dụng cancelBookingAndUnlockRooms để đảm bảo atomicity
          const { BookingRepository } = await import("../../Repository/Booking/booking.repository");
          const bookingRepoForCancel = new BookingRepository();
          const unlockResult = await bookingRepoForCancel.cancelBookingAndUnlockRooms(bookingId);
          
          if (unlockResult.success) {
            console.log(`[AdminBookingService] Unlocked ${unlockResult.unlockedRooms} room(s) for cancelled booking ${bookingId}`);
          } else {
            console.warn(`[AdminBookingService] Failed to unlock rooms for cancelled booking ${bookingId}`);
          }
        } catch (error: any) {
          console.error(`[AdminBookingService] Error unlocking rooms for cancelled booking ${bookingId}:`, error.message);
          // Không throw error vì booking đã được cancel thành công, chỉ log warning
        }
      }

      return {
        success: true,
        message: "Cập nhật trạng thái thành công",
      };
    } catch (error: any) {
      console.error("[AdminBookingService] updateBookingStatus error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật trạng thái",
      };
    }
  }

  // Cập nhật booking (edit)
  async updateBooking(
    bookingId: string,
    updates: {
      specialRequests?: string;
      checkIn?: string;
      checkOut?: string;
    },
    adminId: string,
    adminName: string
  ) {
    try {
      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking",
        };
      }

      // Update special requests (giữ lại admin_notes nếu có)
      if (updates.specialRequests !== undefined) {
        // Lấy internal notes hiện tại
        const existingNotes = await this.adminBookingRepo.getInternalNotes(bookingId);
        
        // Tạo special_requests data
        let specialRequestsData: any = {};
        if (existingNotes.length > 0 || booking.special_requests) {
          // Nếu có admin notes hoặc special_requests hiện tại là JSON, giữ lại format JSON
          if (booking.special_requests) {
            try {
              const parsed = JSON.parse(booking.special_requests);
              if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.admin_notes)) {
                specialRequestsData = parsed;
              }
            } catch (e) {
              // Không phải JSON, tạo mới
            }
          }
          
          // Cập nhật customer_requests
          specialRequestsData.customer_requests = updates.specialRequests || null;
          
          // Giữ lại admin_notes nếu có
          if (existingNotes.length > 0) {
            specialRequestsData.admin_notes = existingNotes.map((n: any) => ({
              id: n.id || Date.now(),
              admin_id: n.admin_id,
              admin_name: n.admin_name,
              note: n.note,
              created_at: n.created_at || new Date().toISOString(),
            }));
          }
          
          // Lưu dưới dạng JSON
          await this.bookingRepo.updateBooking(bookingId, {
            special_requests: JSON.stringify(specialRequestsData),
          });
        } else {
          // Nếu không có admin notes, lưu như string thông thường
          await this.bookingRepo.updateBooking(bookingId, {
            special_requests: updates.specialRequests || undefined,
          });
        }
      }

      // Update dates nếu có
      if (updates.checkIn || updates.checkOut) {
        const bookingDetails = await this.bookingRepo.getBookingDetailsByBookingId(bookingId);
        for (const detail of bookingDetails) {
          await this.bookingRepo.updateBookingDetailById(detail.booking_detail_id, {
            checkin_date: updates.checkIn || detail.checkin_date,
            checkout_date: updates.checkOut || detail.checkout_date,
          });
        }
      }

      // Activity log được tạo tự động từ dữ liệu booking (không cần lưu vào DB)
      console.log(`[AdminBookingService] Booking updated by ${adminName} (${adminId})`);

      return {
        success: true,
        message: "Cập nhật booking thành công",
      };
    } catch (error: any) {
      console.error("[AdminBookingService] updateBooking error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật booking",
      };
    }
  }

  // Thêm internal note (lưu vào special_requests dưới dạng JSON)
  async addInternalNote(
    bookingId: string,
    adminId: string,
    adminName: string,
    note: string
  ) {
    try {
      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking",
        };
      }

      if (!note || !note.trim()) {
        return {
          success: false,
          message: "Vui lòng nhập ghi chú",
        };
      }

      // Lấy internal notes hiện tại
      const existingNotes = await this.adminBookingRepo.getInternalNotes(bookingId);
      
      // Tạo note mới
      const newNote = {
        id: Date.now(),
        admin_id: adminId,
        admin_name: adminName,
        note: note.trim(),
        created_at: new Date().toISOString(),
      };

      // Thêm note mới vào danh sách
      const updatedNotes = [...existingNotes, newNote];

      // Lưu vào special_requests dưới dạng JSON
      // Format: { customer_requests: "...", admin_notes: [...] }
      let specialRequestsData: any = {};
      
      // Nếu special_requests hiện tại là JSON, parse nó
      if (booking.special_requests) {
        try {
          const parsed = JSON.parse(booking.special_requests);
          if (typeof parsed === 'object' && parsed !== null) {
            specialRequestsData = parsed;
          } else {
            // Nếu không phải object, coi như là customer_requests cũ
            specialRequestsData.customer_requests = booking.special_requests;
          }
        } catch (e) {
          // Nếu không parse được, coi như là customer_requests
          specialRequestsData.customer_requests = booking.special_requests;
        }
      }

      // Cập nhật admin_notes
      specialRequestsData.admin_notes = updatedNotes.map((n: any) => ({
        id: n.id || Date.now(),
        admin_id: n.admin_id || adminId,
        admin_name: n.admin_name || adminName,
        note: n.note,
        created_at: n.created_at || new Date().toISOString(),
      }));

      // Lưu lại vào database
      await this.bookingRepo.updateBooking(bookingId, {
        special_requests: JSON.stringify(specialRequestsData),
      });

      return {
        success: true,
        message: "Thêm ghi chú thành công",
      };
    } catch (error: any) {
      console.error("[AdminBookingService] addInternalNote error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi thêm ghi chú",
      };
    }
  }

  // Lấy dashboard stats
  async getDashboardStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const stats = await this.adminBookingRepo.getDashboardStats(params);
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getDashboardStats error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê dashboard",
      };
    }
  }

  // Lấy report stats
  async getReportStats(params: {
    period?: "7days" | "month" | "quarter" | "year";
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const stats = await this.adminBookingRepo.getReportStats(params);
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getReportStats error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê báo cáo",
      };
    }
  }

  // Lấy danh sách payments
  async getPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const result = await this.adminBookingRepo.getPayments(params);
      return {
        success: true,
        data: {
          payments: result.payments,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
          statistics: result.statistics || {
            totalRevenue: 0,
            pendingAmount: 0,
            refundedAmount: 0,
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getPayments error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách payments",
      };
    }
  }

  // Lấy danh sách discount usage
  async getDiscountUsage(params: {
    page?: number;
    limit?: number;
    search?: string;
    discountType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const result = await this.adminBookingRepo.getDiscountUsage(params);
      return {
        success: true,
        data: {
          discounts: result.discounts,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getDiscountUsage error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách discount usage",
      };
    }
  }

  // Lấy activity logs
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    adminId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const result = await this.adminBookingRepo.getActivityLogs(params);
      return {
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminBookingService] getActivityLogs error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy activity logs",
      };
    }
  }

  // Tạo booking thủ công (admin tạo)
  async createManualBooking(
    accountId: string,
    hotelId: string,
    roomIds: string[],
    checkIn: string,
    checkOut: string,
    guestsCount: number,
    paymentMethod: PaymentMethod,
    adminId: string,
    specialRequests?: string,
    skipAvailabilityCheck?: boolean
  ) {
    try {
      // Validate inputs
      if (!accountId || !hotelId || !roomIds || roomIds.length === 0) {
        return {
          success: false,
          message: "Thiếu thông tin cần thiết",
        };
      }

      // Verify hotel exists
      const hotel = await this.bookingRepo.getHotelById(hotelId);
      if (!hotel) {
        return {
          success: false,
          message: "Khách sạn không tồn tại",
        };
      }

      // Check availability (nếu không skip)
      if (!skipAvailabilityCheck) {
        for (const roomId of roomIds) {
          const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
            roomId,
            checkIn,
            checkOut,
            1
          );
          if (!hasEnough) {
            return {
              success: false,
              message: `Phòng ${roomId} không có sẵn cho khoảng thời gian này`,
            };
          }
        }
      }

      // Calculate price
      const priceCalculation = await this.bookingRepo.calculateBookingPrice(
        roomIds[0],
        checkIn,
        checkOut,
        roomIds.length
      );

      if (!priceCalculation) {
        return {
          success: false,
          message: "Không tìm thấy thông tin giá cho khoảng thời gian này",
        };
      }

      // Create booking
      const bookingId = this.bookingRepo.generateBookingId();
      const booking = {
        booking_id: bookingId,
        account_id: accountId,
        hotel_id: hotelId,
        status: "CONFIRMED" as BookingStatus, // Admin tạo booking sẽ tự động CONFIRMED
        subtotal: priceCalculation.subtotal,
        tax_amount: priceCalculation.taxAmount,
        discount_amount: priceCalculation.discountAmount,
        total_amount: priceCalculation.totalAmount,
        special_requests: specialRequests || undefined,
      };

      const bookingCreated = await this.bookingRepo.createBooking(booking);
      if (!bookingCreated) {
        return {
          success: false,
          message: "Không thể tạo booking",
        };
      }

      // Create booking details
      const pricePerRoom = priceCalculation.subtotal / roomIds.length;
      const avgPricePerNight = pricePerRoom / priceCalculation.nightsCount;

      for (const roomId of roomIds) {
        const bookingDetail = {
          booking_detail_id: this.bookingRepo.generateBookingDetailId(),
          booking_id: bookingId,
          room_id: roomId,
          checkin_date: checkIn,
          checkout_date: checkOut,
          guests_count: Math.ceil(guestsCount / roomIds.length),
          price_per_night: avgPricePerNight,
          nights_count: priceCalculation.nightsCount,
          total_price: pricePerRoom,
        };

        await this.bookingRepo.createBookingDetail(bookingDetail);

        // Lock rooms (reduce availability)
        if (!skipAvailabilityCheck) {
          await this.availabilityRepo.reduceAvailableRooms(
            roomId,
            checkIn,
            checkOut,
            1
          );
        }
      }

      // Create payment record
      const { PaymentRepository } = await import("../../Repository/Payment/payment.repository");
      const paymentRepo = new PaymentRepository();
      const paymentId = paymentRepo.generatePaymentId();
      const paymentCreated = await paymentRepo.createPayment({
        payment_id: paymentId,
        booking_id: bookingId,
        method: paymentMethod,
        status: paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER" ? "PENDING" : "SUCCESS",
        amount_due: priceCalculation.totalAmount,
        amount_paid: paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER" ? 0 : priceCalculation.totalAmount,
      });

      if (!paymentCreated) {
        // Rollback: cancel booking và unlock rooms
        await this.bookingRepo.cancelBooking(bookingId);
        for (const roomId of roomIds) {
          await this.availabilityRepo.increaseAvailableRooms(
            roomId,
            checkIn,
            checkOut,
            1
          );
        }
        return {
          success: false,
          message: "Không thể tạo payment",
        };
      }

      // Activity log được tạo tự động từ dữ liệu booking (không cần lưu vào DB)
      console.log(`[AdminBookingService] Manual booking created by Admin (${adminId}): ${bookingId}`);

      return {
        success: true,
        data: {
          bookingId,
          bookingCode: this.bookingRepo.generateBookingCode(),
        },
        message: "Tạo booking thành công",
      };
    } catch (error: any) {
      console.error("[AdminBookingService] createManualBooking error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo booking",
      };
    }
  }
}

