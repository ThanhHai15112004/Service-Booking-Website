import { Request, Response } from "express";
import { BookingService } from "../../services/Booking/booking.service";

const bookingService = new BookingService();

// Endpoint để download invoice PDF
// Hiện tại chỉ redirect về booking detail page để in, có thể implement PDF generation sau
export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const accountId = res.locals.accountId;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    // Verify booking belongs to user
    const bookingResult = await bookingService.getBookingById(bookingId);
    
    if (!bookingResult.success || !bookingResult.data) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy hóa đơn"
      });
    }

    const booking = bookingResult.data;
    
    // Verify ownership
    if (booking.account_id !== accountId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập hóa đơn này"
      });
    }

    // Hiện tại trả về JSON với thông tin booking để frontend có thể render PDF
    // Có thể implement PDF generation bằng jspdf hoặc puppeteer sau
    res.json({
      success: true,
      message: "Vui lòng sử dụng nút Print để tải hóa đơn",
      data: {
        booking_id: booking.booking_id,
        booking_code: booking.booking_code,
        booking: booking
      }
    });
    
  } catch (err: any) {
    console.error('[InvoiceController] Error in downloadInvoice:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi tải hóa đơn."
    });
  }
};

