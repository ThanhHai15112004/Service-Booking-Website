import { Request, Response } from "express";
import { PaymentService } from "../../services/Payment/payment.service";
import { PaymentMethod, PaymentStatus } from "../../models/Payment/payment.model";

const paymentService = new PaymentService();

// Hàm confirm booking (tạo payment và cập nhật booking status)
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const accountId = (req as any).user?.account_id;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu bookingId hoặc paymentMethod"
      });
    }

    // Map paymentMethod từ frontend (có thể là 'cash', 'bank_transfer') sang backend
    let method: PaymentMethod;
    if (paymentMethod === 'cash' || paymentMethod === 'CASH') {
      method = 'CASH';
    } else if (paymentMethod === 'bank_transfer' || paymentMethod === 'BANK_TRANSFER') {
      method = 'BANK_TRANSFER';
    } else if (paymentMethod === 'online_payment' || paymentMethod === 'VNPAY') {
      method = 'VNPAY';
    } else if (paymentMethod === 'MOMO') {
      method = 'MOMO';
    } else {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ"
      });
    }

    // Lấy booking để lấy total_amount và verify ownership
    const { BookingService: BookingServiceClass } = await import("../../services/Booking/booking.service");
    const bookingServiceInstance = new BookingServiceClass();
    const bookingResultInstance = await bookingServiceInstance.getBookingById(bookingId);

    if (!bookingResultInstance.success || !bookingResultInstance.data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking"
      });
    }

    const bookingData = bookingResultInstance.data;
    
    // Kiểm tra booking thuộc về user
    if (bookingData.account_id !== accountId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xác nhận booking này"
      });
    }

    // Tạo payment
    const result = await paymentService.createPayment(
      bookingId,
      method,
      bookingData.total_amount || bookingData.total_amount
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Lấy lại booking để lấy status mới nhất (đã được cập nhật thành PAID trong service)
    const updatedBookingResult = await bookingServiceInstance.getBookingById(bookingId);
    
    const finalBookingStatus = updatedBookingResult.success && updatedBookingResult.data 
      ? updatedBookingResult.data.status 
      : 'PAID';

    res.status(200).json({
      success: true,
      data: {
        bookingId,
        payment: result.data,
        bookingStatus: finalBookingStatus // Booking status = PAID khi tạo payment
      },
      message: "Tạo payment thành công."
    });
  } catch (error: any) {
    console.error("[PaymentController] confirmBooking error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xác nhận booking"
    });
  }
};

// Hàm cập nhật payment status (khi thanh toán thành công)
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status, amountPaid } = req.body;
    const accountId = (req as any).user?.account_id;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu payment status"
      });
    }

    const validStatuses: PaymentStatus[] = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Payment status không hợp lệ"
      });
    }

    const result = await paymentService.updatePaymentStatus(
      paymentId,
      status,
      amountPaid
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PaymentController] updatePaymentStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật payment status"
    });
  }
};

// Hàm lấy payment theo booking_id
export const getPaymentByBookingId = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const accountId = (req as any).user?.account_id;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    const result = await paymentService.getPaymentByBookingId(bookingId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PaymentController] getPaymentByBookingId error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy payment"
    });
  }
};

