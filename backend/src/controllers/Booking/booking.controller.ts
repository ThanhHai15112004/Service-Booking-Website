import { Request, Response } from "express";
import { BookingService } from "../../services/Booking/booking.service";
import { CreateBookingRequest } from "../../models/Booking/booking.model";

const bookingService = new BookingService();

// Tạo booking mới
export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingRequest: CreateBookingRequest = req.body;
    
    // Get account ID from authenticated user
    const accountId = (req as any).user?.account_id;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để đặt phòng"
      });
    }

    console.log(`\n🎫 === CREATE BOOKING REQUEST ===`);
    console.log(`👤 User: ${accountId}`);
    console.log(`📦 Request:`, JSON.stringify(bookingRequest, null, 2));

    const result = await bookingService.createBooking(bookingRequest, accountId);

    if (!result.success) {
      console.log(`❌ Booking failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Booking created successfully`);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("❌ Controller error - createBooking:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo booking"
    });
  }
};

// Lấy thông tin booking by ID
export const getBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const accountId = (req as any).user?.account_id;

    console.log(`\n📋 === GET BOOKING ===`);
    console.log(`📦 Booking ID: ${bookingId}`);
    console.log(`👤 User: ${accountId}`);

    const result = await bookingService.getBookingById(bookingId);

    if (!result.success) {
      console.log(`❌ Get booking failed: ${result.message}`);
      return res.status(404).json(result);
    }

    // Verify ownership (optional - tùy business logic)
    if (accountId && result.data.account_id !== accountId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem booking này"
      });
    }

    console.log(`✅ Booking found`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error - getBooking:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin booking"
    });
  }
};

// Lấy danh sách bookings của user
export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).user?.account_id;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    console.log(`\n📋 === GET MY BOOKINGS ===`);
    console.log(`👤 User: ${accountId}`);

    const result = await bookingService.getBookingsByAccount(accountId);

    if (!result.success) {
      console.log(`❌ Get bookings failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Found ${result.data?.length || 0} booking(s)`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error - getMyBookings:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách booking"
    });
  }
};

// Hủy booking
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

    console.log(`\n❌ === CANCEL BOOKING ===`);
    console.log(`📦 Booking ID: ${bookingId}`);
    console.log(`👤 User: ${accountId}`);

    const result = await bookingService.cancelBooking(bookingId, accountId);

    if (!result.success) {
      console.log(`❌ Cancel failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Booking cancelled successfully`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error - cancelBooking:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi hủy booking"
    });
  }
};

