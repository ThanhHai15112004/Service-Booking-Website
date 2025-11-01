import { Request, Response } from "express";
import { BookingService } from "../../services/Booking/booking.service";
import { CreateBookingRequest, CreateTemporaryBookingRequest } from "../../models/Booking/booking.model";

const bookingService = new BookingService();

// Hàm tạo booking tạm thời (status CREATED) khi vào trang booking
export const createTemporaryBooking = async (req: Request, res: Response) => {
  try {
    const request: CreateTemporaryBookingRequest = req.body;
    const accountId = (req as any).user?.account_id;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để đặt phòng"
      });
    }

    const result = await bookingService.createTemporaryBooking(request, accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[BookingController] createTemporaryBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo booking tạm thời"
    });
  }
};

// Hàm tạo booking mới
export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingRequest: CreateBookingRequest = req.body;
    const accountId = (req as any).user?.account_id;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để đặt phòng"
      });
    }

    const result = await bookingService.createBooking(bookingRequest, accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[BookingController] createBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo booking"
    });
  }
};

// Hàm lấy thông tin booking theo ID
export const getBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const accountId = (req as any).user?.account_id;

    const result = await bookingService.getBookingById(bookingId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    if (accountId && result.data.account_id !== accountId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem booking này"
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[BookingController] getBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin booking"
    });
  }
};

// Hàm lấy danh sách bookings của user
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).user?.account_id;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    const result = await bookingService.getBookingsByAccount(accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[BookingController] getMyBookings error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách booking"
    });
  }
};

// Hàm hủy booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const accountId = (req as any).user?.account_id;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    const result = await bookingService.cancelBooking(bookingId, accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[BookingController] cancelBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi hủy booking"
    });
  }
};

