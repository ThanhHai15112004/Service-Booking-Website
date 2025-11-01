import { BookingRepository } from "../../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../../Repository/Hotel/availability.repository";
import { RoomRepository } from "../../Repository/Hotel/room.repository";
import {
  CreateBookingRequest,
  CreateTemporaryBookingRequest,
  BookingConfirmation,
  BookingResponse,
  Booking,
  BookingDetail,
  BookingStatus
} from "../../models/Booking/booking.model";
import { BookingValidator } from "../../utils/booking.validator";
import { calculateNights } from "../../helpers/date.helper";

export class BookingService {
  private bookingRepo = new BookingRepository();
  private availabilityRepo = new AvailabilityRepository();
  private roomRepo = new RoomRepository();

  // Hàm tạo booking tạm thời (status CREATED) khi vào trang booking
  async createTemporaryBooking(
    request: CreateTemporaryBookingRequest,
    accountId: string
  ): Promise<BookingResponse<{ bookingId: string; bookingCode: string; expiresAt: Date }>> {
    try {
      // Validate basic info
      if (!request.hotelId || !request.roomTypeId || !request.checkIn || !request.checkOut) {
        return { 
          success: false, 
          message: "Thiếu thông tin cần thiết để tạo booking tạm thời" 
        };
      }

      // Verify hotel exists
      const hotel = await this.bookingRepo.getHotelById(request.hotelId);
      if (!hotel) {
        return { 
          success: false, 
          message: "Khách sạn không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      // ✅ Check availability by roomTypeId first (aggregate check for all rooms of this type)
      const availabilityCheck = await this.availabilityRepo.hasEnoughRoomTypeAvailability(
        request.roomTypeId,
        request.checkIn,
        request.checkOut,
        request.rooms
      );

      if (!availabilityCheck.hasEnough) {
        return {
          success: false,
          message: `Không đủ phòng trống. Hiện chỉ còn ${availabilityCheck.minAvailable} phòng, bạn cần ${request.rooms} phòng. Vui lòng chọn số phòng ít hơn hoặc thời gian khác.`
        };
      }

      // Chọn request.rooms số phòng vật lý (ví dụ: 2 phòng)
      const availableRooms = await this.availabilityRepo.getAvailableRoomsInType(
        request.roomTypeId,
        request.checkIn,
        request.checkOut,
        request.rooms
      );
      
      if (availableRooms.length < request.rooms) {
        return {
          success: false,
          message: `Không đủ phòng trống. Chỉ tìm thấy ${availableRooms.length} phòng, bạn cần ${request.rooms} phòng. Vui lòng chọn số phòng ít hơn hoặc thời gian khác.`
        };
      }

      // Chọn request.rooms số phòng đầu tiên có sẵn
      const selectedRoomIds = availableRooms.slice(0, request.rooms).map(room => room.room_id);

      // Tính giá từ phòng đầu tiên, sau đó nhân với số phòng
      const priceCalculation = await this.bookingRepo.calculateBookingPrice(
        selectedRoomIds[0],
        request.checkIn,
        request.checkOut,
        1
      );

      if (!priceCalculation) {
        return {
          success: false,
          message: "Không tìm thấy thông tin giá cho khoảng thời gian này"
        };
      }

      // Tính giá tổng cho tất cả phòng
      const totalSubtotal = priceCalculation.subtotal * request.rooms;
      const totalTaxAmount = totalSubtotal * 0.1;
      const totalDiscountAmount = 0;
      const totalAmount = totalSubtotal + totalTaxAmount - totalDiscountAmount;

      // Lock tất cả các phòng vật lý đã chọn (20 phút)
      const lockedRooms: string[] = [];
      for (const roomId of selectedRoomIds) {
        const lockResult = await this.availabilityRepo.reduceAvailableRooms(
          roomId,
          request.checkIn,
          request.checkOut,
          1
        );

        if (!lockResult.success) {
          // Rollback: tăng lại availability cho các phòng đã lock
          for (const lockedRoomId of lockedRooms) {
            await this.availabilityRepo.increaseAvailableRooms(
              lockedRoomId,
              request.checkIn,
              request.checkOut,
              1
            );
          }
          return {
            success: false,
            message: `Không thể đặt phòng ${roomId}. Phòng có thể đã được đặt bởi người khác.`
          };
        }
        lockedRooms.push(roomId);
      }

      // Create temporary booking (status CREATED)
      const bookingId = this.bookingRepo.generateBookingId();
      const bookingCode = this.bookingRepo.generateBookingCode();
      
      // Expires in 20 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 20);

      const booking: Omit<Booking, 'created_at' | 'updated_at'> = {
        booking_id: bookingId,
        account_id: accountId,
        hotel_id: request.hotelId,
        status: 'CREATED',
        subtotal: totalSubtotal,
        tax_amount: totalTaxAmount,
        discount_amount: totalDiscountAmount,
        total_amount: totalAmount,
        special_requests: undefined
      };

      const bookingCreated = await this.bookingRepo.createBooking(booking);
      if (!bookingCreated) {
        // Rollback: increase availability cho tất cả phòng đã lock
        for (const roomId of lockedRooms) {
          await this.availabilityRepo.increaseAvailableRooms(
            roomId,
            request.checkIn,
            request.checkOut,
            1
          );
        }
        return {
          success: false,
          message: "Không thể tạo booking tạm thời. Vui lòng thử lại."
        };
      }

      // Tạo booking detail cho từng phòng vật lý - phân bổ guests dựa trên capacity
      const pricePerRoom = priceCalculation.subtotal;
      const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount;
      
      // Phân bổ adults dựa trên capacity của từng phòng (chỉ tính adults, không tính children)
      let remainingAdults = request.adults;
      
      for (const roomId of selectedRoomIds) {
        // Lấy thông tin phòng để biết capacity
        const room = await this.bookingRepo.getRoomById(roomId);
        if (!room) {
          // Rollback
          await this.bookingRepo.cancelBooking(bookingId);
          for (const lockedRoomId of lockedRooms) {
            await this.availabilityRepo.increaseAvailableRooms(
              lockedRoomId,
              request.checkIn,
              request.checkOut,
              1
            );
          }
          return {
            success: false,
            message: `Không tìm thấy thông tin phòng ${roomId}`
          };
        }

        // Phân bổ guests: min(capacity, remaining_adults)
        const roomGuests = Math.min(room.capacity, remainingAdults);
        remainingAdults -= roomGuests;

        const bookingDetail: BookingDetail = {
          booking_detail_id: this.bookingRepo.generateBookingDetailId(),
          booking_id: bookingId,
          room_id: roomId,
          checkin_date: request.checkIn,
          checkout_date: request.checkOut,
          guests_count: roomGuests, // Chỉ tính adults, không tính children
          price_per_night: avgPricePerNight,
          nights_count: priceCalculation.nightsCount,
          total_price: pricePerRoom
        };

        const detailCreated = await this.bookingRepo.createBookingDetail(bookingDetail);
        if (!detailCreated) {
          // Rollback: xóa booking và tăng lại availability
          await this.bookingRepo.cancelBooking(bookingId);
          for (const lockedRoomId of lockedRooms) {
            await this.availabilityRepo.increaseAvailableRooms(
              lockedRoomId,
              request.checkIn,
              request.checkOut,
              1
            );
          }
          return {
            success: false,
            message: "Không thể tạo booking detail. Vui lòng thử lại."
          };
        }
      }

      return {
        success: true,
        data: {
          bookingId,
          bookingCode,
          expiresAt
        },
        message: "Booking tạm thời đã được tạo. Bạn có 20 phút để hoàn tất đặt phòng."
      };

    } catch (error: any) {
      console.error("[BookingService] createTemporaryBooking error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo booking tạm thời"
      };
    }
  }

  // Hàm tạo hoặc cập nhật booking (hoàn tất booking từ CREATED)
  async createBooking(
    request: CreateBookingRequest,
    accountId: string
  ): Promise<BookingResponse<BookingConfirmation>> {
    try {
      // Step 1: Validate request
      const validation = BookingValidator.validateCreateBookingRequest(request);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Kiểm tra và cập nhật booking tạm thời nếu có
      let existingBooking: any = null;
      let bookingId: string;
      let bookingCode: string;

      if (request.bookingId) {
        existingBooking = await this.bookingRepo.getBookingById(request.bookingId);
        
        if (!existingBooking) {
          console.error("[BookingService] Booking not found:", request.bookingId);
          return {
            success: false,
            message: "Không tìm thấy booking tạm thời. Vui lòng thử lại."
          };
        }

        if (existingBooking.account_id !== accountId) {
          console.error("[BookingService] Booking ownership mismatch");
          return {
            success: false,
            message: "Bạn không có quyền cập nhật booking này"
          };
        }

        // Cho phép update booking khi status là CREATED hoặc PAID
        // CREATED → CONFIRMED (nếu chưa có payment)
        // PAID → CONFIRMED (khi user xác nhận ở Step 2)
        if (existingBooking.status !== 'CREATED' && existingBooking.status !== 'PAID') {
          console.error("[BookingService] Cannot update booking with status:", existingBooking.status);
          return {
            success: false,
            message: `Booking này đã được xử lý (status: ${existingBooking.status}). Vui lòng tạo booking mới.`
          };
        }

        bookingId = request.bookingId;
        bookingCode = existingBooking.booking_code || this.bookingRepo.generateBookingCode();
      } else {
        console.error("[BookingService] Missing bookingId - creating new booking (should not happen)");
        bookingId = this.bookingRepo.generateBookingId();
        bookingCode = this.bookingRepo.generateBookingCode();
      }

      // Step 2: Verify hotel exists and is active
      const hotel = await this.bookingRepo.getHotelById(request.hotelId);
      if (!hotel) {
        return { 
          success: false, 
          message: "Khách sạn không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      // Logic xử lý phòng cho existing booking hoặc booking mới
      let selectedRoomIds: string[] = [];
      
      if (existingBooking) {
        // Lấy tất cả booking_details của booking tạm thời
        const existingDetails = await this.bookingRepo.getBookingDetailsByBookingId(bookingId);
        
        if (existingDetails.length === 0) {
          return {
            success: false,
            message: "Booking không có thông tin phòng. Vui lòng tạo booking mới."
          };
        }

        // Lấy danh sách room_id từ booking_details
        selectedRoomIds = existingDetails.map(detail => detail.room_id);

        // Kiểm tra số phòng khớp với request
        if (selectedRoomIds.length !== request.rooms) {
          return {
            success: false,
            message: `Số phòng không khớp. Booking hiện tại có ${selectedRoomIds.length} phòng, nhưng yêu cầu ${request.rooms} phòng. Vui lòng tạo booking mới.`
          };
        }

        // Verify tất cả phòng thuộc hotel
        for (const roomId of selectedRoomIds) {
          const room = await this.bookingRepo.getRoomById(roomId);
          if (!room || room.hotel_id !== request.hotelId) {
            return {
              success: false,
              message: `Phòng ${roomId} không thuộc khách sạn này`
            };
          }
        }
      } else {
        // Tự động chọn phòng nếu có roomTypeId (tạo booking mới - không nên xảy ra)
        if ((request as any).roomTypeId) {
          const availableRooms = await this.availabilityRepo.getAvailableRoomsInType(
            (request as any).roomTypeId,
            request.checkIn,
            request.checkOut,
            request.rooms
          );
          
          if (availableRooms.length < request.rooms) {
            return {
              success: false,
              message: `Không đủ phòng trống. Chỉ tìm thấy ${availableRooms.length} phòng, bạn cần ${request.rooms} phòng.`
            };
          }
          
          selectedRoomIds = availableRooms.slice(0, request.rooms).map(room => room.room_id);
        } else if (request.roomId) {
          selectedRoomIds = [request.roomId];
        } else {
          return {
            success: false,
            message: "Thiếu thông tin phòng. Vui lòng chọn phòng hoặc loại phòng."
          };
        }
      }

      // Verify tất cả phòng tồn tại và active (nếu chưa verify)
      if (existingBooking) {
        // Đã verify ở trên
      } else {
        const firstRoom = await this.bookingRepo.getRoomById(selectedRoomIds[0]);
        if (!firstRoom) {
          return { 
            success: false, 
            message: "Phòng không tồn tại hoặc đã ngưng hoạt động" 
          };
        }

        if (firstRoom.hotel_id !== request.hotelId) {
          return { 
            success: false, 
            message: "Phòng không thuộc khách sạn này" 
          };
        }

        // Kiểm tra capacity
        const totalCapacity = firstRoom.capacity * request.rooms;
        const totalGuests = request.adults + (request.children || 0);

        if (totalCapacity < totalGuests) {
          const minRoomsNeeded = Math.ceil(totalGuests / firstRoom.capacity);
          return {
            success: false,
            message: `Không đủ chỗ! Phòng ${firstRoom.room_type_name || 'này'} chỉ chứa tối đa ` +
                     `${firstRoom.capacity} người/phòng. Bạn đặt ${request.rooms} phòng ` +
                     `(tổng capacity: ${totalCapacity} người) nhưng có ${totalGuests} người. ` +
                     `Vui lòng đặt ít nhất ${minRoomsNeeded} phòng hoặc giảm số người.`
          };
        }
      }

      // Tính giá từ phòng đầu tiên, sau đó nhân với số phòng
      const priceCalculation = await this.bookingRepo.calculateBookingPrice(
        selectedRoomIds[0],
        request.checkIn,
        request.checkOut,
        1
      );

      if (!priceCalculation) {
        return {
          success: false,
          message: "Không tìm thấy thông tin giá cho khoảng thời gian này"
        };
      }

      // Tính giá tổng cho tất cả phòng
      const totalSubtotal = priceCalculation.subtotal * request.rooms;
      const totalTaxAmount = totalSubtotal * 0.1;
      const totalDiscountAmount = 0;
      const totalAmount = totalSubtotal + totalTaxAmount - totalDiscountAmount;

      // Kiểm tra availability và lock phòng
      if (existingBooking) {
        // Nếu dates thay đổi, cần release lock cũ và lock dates mới cho tất cả phòng
        const datesChanged = existingBooking.checkin_date !== request.checkIn || 
                             existingBooking.checkout_date !== request.checkOut;

        if (datesChanged) {
          // Release lock cho dates cũ (tất cả phòng)
          for (const roomId of selectedRoomIds) {
            await this.availabilityRepo.increaseAvailableRooms(
              roomId,
              existingBooking.checkin_date,
              existingBooking.checkout_date,
              1
            );
          }

          // Kiểm tra availability cho dates mới (tất cả phòng)
          for (const roomId of selectedRoomIds) {
            const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
              roomId,
              request.checkIn,
              request.checkOut,
              1
            );

            if (!hasEnough) {
              // Rollback: lock lại dates cũ cho tất cả phòng
              for (const lockedRoomId of selectedRoomIds) {
                await this.availabilityRepo.reduceAvailableRooms(
                  lockedRoomId,
                  existingBooking.checkin_date,
                  existingBooking.checkout_date,
                  1
                );
              }
              return {
                success: false,
                message: `Không đủ phòng trống cho ngày mới. Vui lòng chọn ngày khác.`
              };
            }
          }

          // Lock dates mới (tất cả phòng)
          const lockedRooms: string[] = [];
          for (const roomId of selectedRoomIds) {
            const lockResult = await this.availabilityRepo.reduceAvailableRooms(
              roomId,
              request.checkIn,
              request.checkOut,
              1
            );

            if (!lockResult.success) {
              // Rollback: unlock dates mới và lock lại dates cũ
              for (const lockedRoomId of lockedRooms) {
                await this.availabilityRepo.increaseAvailableRooms(
                  lockedRoomId,
                  request.checkIn,
                  request.checkOut,
                  1
                );
              }
              for (const lockedRoomId of selectedRoomIds) {
                await this.availabilityRepo.reduceAvailableRooms(
                  lockedRoomId,
                  existingBooking.checkin_date,
                  existingBooking.checkout_date,
                  1
                );
              }
              return {
                success: false,
                message: "Không thể cập nhật ngày đặt phòng. Vui lòng thử lại."
              };
            }
            lockedRooms.push(roomId);
          }
        }
        // Nếu dates không thay đổi, các phòng đã được lock trong createTemporaryBooking, không cần lock lại
      } else {
        // Tạo booking mới - kiểm tra và lock phòng (tất cả phòng)
        for (const roomId of selectedRoomIds) {
          const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
            roomId,
            request.checkIn,
            request.checkOut,
            1
          );

          if (!hasEnough) {
            return {
              success: false,
              message: `Không đủ phòng trống. Vui lòng chọn số phòng ít hơn hoặc thời gian khác.`
            };
          }
        }

        // Lock tất cả phòng
        const lockedRooms: string[] = [];
        for (const roomId of selectedRoomIds) {
          const lockResult = await this.availabilityRepo.reduceAvailableRooms(
            roomId,
            request.checkIn,
            request.checkOut,
            1
          );

          if (!lockResult.success) {
            // Rollback: unlock các phòng đã lock
            for (const lockedRoomId of lockedRooms) {
              await this.availabilityRepo.increaseAvailableRooms(
                lockedRoomId,
                request.checkIn,
                request.checkOut,
                1
              );
            }
            return {
              success: false,
              message: "Không thể đặt phòng. Phòng có thể đã được đặt bởi người khác."
            };
          }
          lockedRooms.push(roomId);
        }
      }

      // Cập nhật booking status và payment status khi user xác nhận ở Step 2
      // Booking status → CONFIRMED
      // Payment status → SUCCESS
      let finalBookingStatus: BookingStatus = existingBooking ? existingBooking.status : 'CREATED';
      let paymentUpdated = false;
      
      if (existingBooking) {
        // Kiểm tra payment để cập nhật payment status thành SUCCESS
        const { PaymentRepository } = await import("../../Repository/Payment/payment.repository");
        const paymentRepo = new PaymentRepository();
        const existingPayment = await paymentRepo.getPaymentByBookingId(existingBooking.booking_id);
        
        if (existingPayment) {
          // Cập nhật payment status thành SUCCESS khi user xác nhận ở Step 2
          const { PaymentService } = await import("../Payment/payment.service");
          const paymentService = new PaymentService();
          const paymentUpdateResult = await paymentService.updatePaymentStatus(
            existingPayment.payment_id,
            'SUCCESS',
            existingPayment.amount_due // amountPaid = amountDue vì đã xác nhận
          );
          
          if (paymentUpdateResult.success) {
            paymentUpdated = true;
          }
        }
        
        // Cập nhật booking status thành CONFIRMED khi user xác nhận ở Step 2
        finalBookingStatus = 'CONFIRMED';
      }

      if (existingBooking) {
        const datesChanged = existingBooking.checkin_date !== request.checkIn || 
                             existingBooking.checkout_date !== request.checkOut;

        const updateBookingData: any = {
          status: finalBookingStatus, // CONFIRMED khi xác nhận ở Step 2
          special_requests: request.specialRequests || null
        };

        if (datesChanged) {
          updateBookingData.subtotal = totalSubtotal;
          updateBookingData.tax_amount = totalTaxAmount;
          updateBookingData.discount_amount = totalDiscountAmount;
          updateBookingData.total_amount = totalAmount;
        }

        const updated = await this.bookingRepo.updateBooking(bookingId, updateBookingData);

        if (!updated) {
          if (datesChanged) {
            // Rollback: unlock dates mới và lock lại dates cũ cho tất cả phòng
            for (const roomId of selectedRoomIds) {
              await this.availabilityRepo.increaseAvailableRooms(
                roomId,
                request.checkIn,
                request.checkOut,
                1
              );
              await this.availabilityRepo.reduceAvailableRooms(
                roomId,
                existingBooking.checkin_date,
                existingBooking.checkout_date,
                1
              );
            }
          }
          return {
            success: false,
            message: "Không thể cập nhật booking. Vui lòng thử lại."
          };
        }

        // Cập nhật tất cả booking_details nếu dates thay đổi
        if (datesChanged) {
          const pricePerRoom = priceCalculation.subtotal;
          const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount;

          // Lấy tất cả booking_details
          const existingDetails = await this.bookingRepo.getBookingDetailsByBookingId(bookingId);
          
          // Phân bổ adults dựa trên capacity của từng phòng (chỉ tính adults, không tính children)
          let remainingAdults = request.adults;
          
          // Cập nhật từng booking_detail
          for (const detail of existingDetails) {
            // Lấy thông tin phòng để biết capacity
            const room = await this.bookingRepo.getRoomById(detail.room_id);
            if (!room) {
              console.error(`[BookingService] Room not found: ${detail.room_id}`);
              continue;
            }

            // Phân bổ guests: min(capacity, remaining_adults)
            const roomGuests = Math.min(room.capacity, remainingAdults);
            remainingAdults -= roomGuests;

            const detailUpdated = await this.bookingRepo.updateBookingDetailById(detail.booking_detail_id, {
              checkin_date: request.checkIn,
              checkout_date: request.checkOut,
              guests_count: roomGuests, // Chỉ tính adults, không tính children
              price_per_night: avgPricePerNight,
              nights_count: priceCalculation.nightsCount,
              total_price: pricePerRoom
            });

            if (!detailUpdated) {
              console.error(`[BookingService] Failed to update booking_detail ${detail.booking_detail_id}`);
            }
          }
        }
      } else {
        // Tạo booking mới (không nên xảy ra trong flow bình thường)
        console.error("[BookingService] Creating new booking without existingBooking");
        const booking: Omit<Booking, 'created_at' | 'updated_at'> = {
          booking_id: bookingId,
          account_id: accountId,
          hotel_id: request.hotelId,
          status: 'CREATED', // New booking luôn là CREATED
          subtotal: totalSubtotal,
          tax_amount: totalTaxAmount,
          discount_amount: totalDiscountAmount,
          total_amount: totalAmount,
          special_requests: request.specialRequests
        };

        const bookingCreated = await this.bookingRepo.createBooking(booking);
        if (!bookingCreated) {
          // Rollback: unlock tất cả phòng đã lock
          for (const roomId of selectedRoomIds) {
            await this.availabilityRepo.increaseAvailableRooms(
              roomId,
              request.checkIn,
              request.checkOut,
              1
            );
          }
          return {
            success: false,
            message: "Không thể tạo booking. Vui lòng thử lại."
          };
        }
      }

      // Tạo booking_detail cho từng phòng nếu là booking mới - phân bổ guests dựa trên capacity
      if (!existingBooking) {
        const pricePerRoom = priceCalculation.subtotal;
        const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount;

        // Phân bổ adults dựa trên capacity của từng phòng (chỉ tính adults, không tính children)
        let remainingAdults = request.adults;

        for (const roomId of selectedRoomIds) {
          // Lấy thông tin phòng để biết capacity
          const room = await this.bookingRepo.getRoomById(roomId);
          if (!room) {
            // Rollback
            await this.bookingRepo.cancelBooking(bookingId);
            for (const lockedRoomId of selectedRoomIds) {
              await this.availabilityRepo.increaseAvailableRooms(
                lockedRoomId,
                request.checkIn,
                request.checkOut,
                1
              );
            }
            return {
              success: false,
              message: `Không tìm thấy thông tin phòng ${roomId}`
            };
          }

          // Phân bổ guests: min(capacity, remaining_adults)
          const roomGuests = Math.min(room.capacity, remainingAdults);
          remainingAdults -= roomGuests;

          const bookingDetail: BookingDetail = {
            booking_detail_id: this.bookingRepo.generateBookingDetailId(),
            booking_id: bookingId,
            room_id: roomId,
            checkin_date: request.checkIn,
            checkout_date: request.checkOut,
            guests_count: roomGuests, // Chỉ tính adults, không tính children
            price_per_night: avgPricePerNight,
            nights_count: priceCalculation.nightsCount,
            total_price: pricePerRoom
          };

          const detailCreated = await this.bookingRepo.createBookingDetail(bookingDetail);
          if (!detailCreated) {
            // Rollback: xóa booking và unlock tất cả phòng
            await this.bookingRepo.cancelBooking(bookingId);
            for (const lockedRoomId of selectedRoomIds) {
              await this.availabilityRepo.increaseAvailableRooms(
                lockedRoomId,
                request.checkIn,
                request.checkOut,
                1
              );
            }
            return {
              success: false,
              message: "Không thể tạo booking detail. Vui lòng thử lại."
            };
          }
        }
      }

      // Tính payment deadline (24 giờ cho CASH/bank transfer)
      let paymentDeadline: string | undefined;
      if (request.paymentMethod !== 'VNPAY' && request.paymentMethod !== 'MOMO') {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 24);
        paymentDeadline = deadline.toISOString();
      }

      // Lấy thông tin phòng đầu tiên để hiển thị
      const firstRoom = await this.bookingRepo.getRoomById(selectedRoomIds[0]);
      if (!firstRoom) {
        return {
          success: false,
          message: "Không tìm thấy thông tin phòng"
        };
      }

      // Lấy lại booking từ database để đảm bảo có status mới nhất (đã được cập nhật ở trên)
      const updatedBookingFromDb = existingBooking ? await this.bookingRepo.getBookingById(bookingId) : null;
      const confirmedBookingStatus = updatedBookingFromDb ? updatedBookingFromDb.status : finalBookingStatus;

      // Tạo booking confirmation
      const confirmation: BookingConfirmation = {
        bookingId: bookingId,
        bookingCode: bookingCode,
        status: confirmedBookingStatus,
        hotel: {
          id: hotel.hotel_id,
          name: hotel.name,
          address: hotel.address,
          phone: hotel.phone_number
        },
        room: {
          id: selectedRoomIds[0],
          name: firstRoom.room_type_name,
          type: firstRoom.bed_type,
          roomNumber: firstRoom.room_number || null
        },
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        nights: priceCalculation.nightsCount,
        rooms: request.rooms,
        adults: request.adults,
        children: request.children,
        guestInfo: request.guestInfo,
        priceBreakdown: {
          subtotal: totalSubtotal,
          taxAmount: totalTaxAmount,
          discountAmount: totalDiscountAmount,
          totalPrice: totalAmount
        },
        paymentMethod: request.paymentMethod,
        paymentStatus: 'pending', // Booking vẫn ở trạng thái CREATED, chưa confirm nên payment status là pending
        paymentDeadline: paymentDeadline,
        specialRequests: request.specialRequests,
        createdAt: new Date()
      };

      return {
        success: true,
        data: confirmation,
        message: "Đặt phòng thành công!"
      };

    } catch (error: any) {
      console.error("[BookingService] createBooking error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo booking"
      };
    }
  }

  // Hàm lấy thông tin booking theo ID
  async getBookingById(bookingId: string): Promise<BookingResponse<any>> {
    try {
      const validation = BookingValidator.validateBookingId(bookingId);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking"
        };
      }

      return {
        success: true,
        data: booking
      };
    } catch (error: any) {
      console.error("[BookingService] getBookingById error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thông tin booking"
      };
    }
  }

  // Hàm lấy danh sách booking theo account ID
  async getBookingsByAccount(accountId: string): Promise<BookingResponse<any[]>> {
    try {
      const bookings = await this.bookingRepo.getBookingsByAccountId(accountId);
      
      return {
        success: true,
        data: bookings
      };
    } catch (error: any) {
      console.error("[BookingService] getBookingsByAccount error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách booking"
      };
    }
  }

  // Hàm hủy booking
  async cancelBooking(bookingId: string, accountId: string): Promise<BookingResponse<any>> {
    try {
      const validation = BookingValidator.validateBookingId(bookingId);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Lấy booking để verify ownership và lấy thông tin phòng
      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking"
        };
      }

      // Verify ownership
      if (booking.account_id !== accountId) {
        return {
          success: false,
          message: "Bạn không có quyền hủy booking này"
        };
      }

      // Check if already cancelled
      if (booking.status === 'CANCELLED') {
        return {
          success: false,
          message: "Booking đã được hủy trước đó"
        };
      }

      // Cancel booking
      const cancelled = await this.bookingRepo.cancelBooking(bookingId);
      if (!cancelled) {
        return {
          success: false,
          message: "Không thể hủy booking"
        };
      }

      // Cập nhật payment status thành FAILED khi booking bị cancel
      const { PaymentRepository } = await import("../../Repository/Payment/payment.repository");
      const paymentRepo = new PaymentRepository();
      const existingPayment = await paymentRepo.getPaymentByBookingId(bookingId);
      
      if (existingPayment) {
        // Cập nhật payment status thành FAILED
        const { PaymentService } = await import("../Payment/payment.service");
        const paymentService = new PaymentService();
        await paymentService.updatePaymentStatus(
          existingPayment.payment_id,
          'FAILED',
          0 // amountPaid = 0 vì đã hủy
        );
      }

      // Release phòng - tăng lại availability cho tất cả phòng
      const bookingDetails = await this.bookingRepo.getBookingDetailsByBookingId(bookingId);
      for (const detail of bookingDetails) {
        await this.availabilityRepo.increaseAvailableRooms(
          detail.room_id,
          detail.checkin_date,
          detail.checkout_date,
          1
        );
      }

      return {
        success: true,
        message: "Hủy booking thành công"
      };
    } catch (error: any) {
      console.error("[BookingService] cancelBooking error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi hủy booking"
      };
    }
  }
}

