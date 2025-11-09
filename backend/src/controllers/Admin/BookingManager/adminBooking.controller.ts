import { Request, Response } from "express";
import { AdminBookingService } from "../../../services/Admin/adminBooking.service";
import { BookingStatus } from "../../../models/Booking/booking.model";

const adminBookingService = new AdminBookingService();

// Lấy danh sách bookings
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      status,
      paymentMethod,
      paymentStatus,
      hotelId,
      dateFrom,
      dateTo,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const result = await adminBookingService.getAllBookings({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      status: status as BookingStatus,
      paymentMethod: paymentMethod as string,
      paymentStatus: paymentStatus as string,
      hotelId: hotelId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      sortBy: sortBy as "created_at" | "total_amount" | "status",
      sortOrder: sortOrder as "ASC" | "DESC",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getAllBookings error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách bookings",
    });
  }
};

// Lấy chi tiết booking
export const getBookingDetail = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const result = await adminBookingService.getBookingDetail(bookingId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getBookingDetail error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết booking",
    });
  }
};

// Cập nhật booking status
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    const adminId = (req as any).user?.account_id;
    const adminName = (req as any).user?.email || "Admin";

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu trạng thái mới",
      });
    }

    const result = await adminBookingService.updateBookingStatus(
      bookingId,
      status,
      adminId,
      adminName,
      reason
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] updateBookingStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái",
    });
  }
};

// Cập nhật booking (edit)
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { specialRequests, checkIn, checkOut } = req.body;
    const adminId = (req as any).user?.account_id;
    const adminName = (req as any).user?.email || "Admin";

    const result = await adminBookingService.updateBooking(
      bookingId,
      {
        specialRequests,
        checkIn,
        checkOut,
      },
      adminId,
      adminName
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] updateBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật booking",
    });
  }
};

// Thêm internal note
export const addInternalNote = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { note } = req.body;
    const adminId = (req as any).user?.account_id;
    const adminName = (req as any).user?.email || "Admin";

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Thiếu nội dung ghi chú",
      });
    }

    const result = await adminBookingService.addInternalNote(
      bookingId,
      adminId,
      adminName,
      note
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] addInternalNote error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm ghi chú",
    });
  }
};

// Lấy dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const result = await adminBookingService.getDashboardStats({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getDashboardStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê dashboard",
    });
  }
};

// Lấy report stats
export const getReportStats = async (req: Request, res: Response) => {
  try {
    const {
      period = "month",
      hotelId,
      dateFrom,
      dateTo,
    } = req.query;

    const result = await adminBookingService.getReportStats({
      period: period as "7days" | "month" | "quarter" | "year",
      hotelId: hotelId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getReportStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê báo cáo",
    });
  }
};

// Lấy danh sách payments
export const getPayments = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      paymentMethod,
      status,
      dateFrom,
      dateTo,
    } = req.query;

    const result = await adminBookingService.getPayments({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      paymentMethod: paymentMethod as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getPayments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách payments",
    });
  }
};

// Lấy danh sách discount usage
export const getDiscountUsage = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      discountType,
      status,
      dateFrom,
      dateTo,
    } = req.query;

    const result = await adminBookingService.getDiscountUsage({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      discountType: discountType as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getDiscountUsage error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách discount usage",
    });
  }
};

// Lấy activity logs
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      adminId,
      action,
      dateFrom,
      dateTo,
    } = req.query;

    const result = await adminBookingService.getActivityLogs({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      adminId: adminId as string,
      action: action as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] getActivityLogs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy activity logs",
    });
  }
};

// Tạo booking thủ công
export const createManualBooking = async (req: Request, res: Response) => {
  try {
    const {
      accountId,
      hotelId,
      roomIds,
      checkIn,
      checkOut,
      guestsCount,
      paymentMethod,
      specialRequests,
      skipAvailabilityCheck,
    } = req.body;

    const adminId = (req as any).user?.account_id;

    if (!accountId || !hotelId || !roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin cần thiết",
      });
    }

    const result = await adminBookingService.createManualBooking(
      accountId,
      hotelId,
      roomIds,
      checkIn,
      checkOut,
      guestsCount,
      paymentMethod,
      adminId,
      specialRequests,
      skipAvailabilityCheck
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[AdminBookingController] createManualBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo booking",
    });
  }
};

// Gửi lại email xác nhận (placeholder - sẽ implement sau)
export const sendConfirmationEmail = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    // TODO: Implement email service
    res.status(200).json({
      success: true,
      message: "Đã gửi lại email xác nhận",
    });
  } catch (error: any) {
    console.error("[AdminBookingController] sendConfirmationEmail error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi email",
    });
  }
};

// Cập nhật payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu trạng thái mới",
      });
    }

    const { PaymentRepository } = await import("../../../Repository/Payment/payment.repository");
    const paymentRepo = new PaymentRepository();
    
    const payment = await paymentRepo.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy payment",
      });
    }

    const updated = await paymentRepo.updatePaymentStatus(
      paymentId,
      status,
      status === "SUCCESS" ? payment.amount_due : payment.amount_paid
    );

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Không thể cập nhật trạng thái payment",
      });
    }

    // Nếu payment status = SUCCESS, cập nhật booking status thành PENDING_CONFIRMATION
    if (status === "SUCCESS") {
      const { BookingRepository } = await import("../../../Repository/Booking/booking.repository");
      const bookingRepo = new BookingRepository();
      await bookingRepo.updateBooking(payment.booking_id, {
        status: "PENDING_CONFIRMATION",
      });
    }

    // Nếu payment status = FAILED, tự động hủy booking và unlock rooms
    if (status === "FAILED") {
      const { AdminBookingRepository } = await import("../../../Repository/Admin/adminBooking.repository");
      const adminBookingRepo = new AdminBookingRepository();
      const cancelResult = await adminBookingRepo.cancelBookingAndUnlockRoomsForAdmin(payment.booking_id);
      
      if (cancelResult.success) {
        return res.status(200).json({
          success: true,
          message: `Đã cập nhật trạng thái payment thành FAILED và tự động hủy booking. Đã unlock ${cancelResult.unlockedRooms} phòng.`,
        });
      } else {
        // Nếu không thể hủy booking (có thể đã bị hủy hoặc đã hoàn tất), vẫn cập nhật payment status
        return res.status(200).json({
          success: true,
          message: `Đã cập nhật trạng thái payment thành FAILED. ${cancelResult.message || "Không thể hủy booking"}`,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái payment thành công",
    });
  } catch (error: any) {
    console.error("[AdminBookingController] updatePaymentStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật trạng thái payment",
    });
  }
};

