import { PaymentRepository } from "../../Repository/Payment/payment.repository";
import { BookingRepository } from "../../Repository/Booking/booking.repository";
import { Payment, PaymentMethod, PaymentStatus, PaymentResponse } from "../../models/Payment/payment.model";
import { BookingStatus } from "../../models/Booking/booking.model";

export class PaymentService {
  private paymentRepo = new PaymentRepository();
  private bookingRepo = new BookingRepository();

  // Hàm tạo payment khi confirm booking
  async createPayment(
    bookingId: string,
    method: PaymentMethod,
    amountDue: number
  ): Promise<PaymentResponse<Payment>> {
    try {
      // Kiểm tra booking tồn tại
      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking"
        };
      }

      // Kiểm tra booking status phải là CREATED
      if (booking.status !== 'CREATED') {
        return {
          success: false,
          message: `Booking đã được xử lý (status: ${booking.status}). Không thể tạo payment.`
        };
      }

      // Kiểm tra đã có payment chưa
      const existingPayment = await this.paymentRepo.getPaymentByBookingId(bookingId);
      if (existingPayment) {
        return {
          success: false,
          message: "Payment đã được tạo cho booking này"
        };
      }

      // Tạo payment với status PENDING
      // Cập nhật booking status thành PAID khi tạo payment (Step 1)
      const paymentId = this.paymentRepo.generatePaymentId();
      const payment: Omit<Payment, 'created_at' | 'updated_at'> = {
        payment_id: paymentId,
        booking_id: bookingId,
        method: method,
        status: 'PENDING',
        amount_due: amountDue,
        amount_paid: 0
      };

      const created = await this.paymentRepo.createPayment(payment);
      if (!created) {
        return {
          success: false,
          message: "Không thể tạo payment"
        };
      }

      // Cập nhật booking status thành PAID khi tạo payment (Step 1)
      const bookingUpdated = await this.bookingRepo.updateBooking(bookingId, {
        status: 'PAID'
      });

      if (!bookingUpdated) {
        console.error("[PaymentService] Payment created but failed to update booking status to PAID");
      }

      // Lấy payment vừa tạo
      const newPayment = await this.paymentRepo.getPaymentById(paymentId);
      if (!newPayment) {
        return {
          success: false,
          message: "Payment đã được tạo nhưng không thể lấy thông tin"
        };
      }

      return {
        success: true,
        data: newPayment,
        message: "Tạo payment thành công"
      };
    } catch (error: any) {
      console.error("[PaymentService] createPayment error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo payment"
      };
    }
  }

  // Hàm cập nhật payment status (khi thanh toán thành công/thất bại)
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    amountPaid?: number
  ): Promise<PaymentResponse<Payment>> {
    try {
      // Lấy payment
      const payment = await this.paymentRepo.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment"
        };
      }

      // Cập nhật payment status
      const updated = await this.paymentRepo.updatePaymentStatus(
        paymentId,
        status,
        amountPaid
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật payment status"
        };
      }

      // Nếu payment status = SUCCESS, cập nhật booking status
      if (status === 'SUCCESS') {
        // Nếu là CASH hoặc BANK_TRANSFER thì booking status = CONFIRMED
        // Nếu là VNPAY hoặc MOMO thì booking status = PAID
        const bookingStatus: BookingStatus = 
          (payment.method === 'VNPAY' || payment.method === 'MOMO') 
            ? 'PAID' 
            : 'CONFIRMED';

        await this.bookingRepo.updateBooking(payment.booking_id, {
          status: bookingStatus
        });
      }

      // Lấy payment đã cập nhật
      const updatedPayment = await this.paymentRepo.getPaymentById(paymentId);
      if (!updatedPayment) {
        return {
          success: false,
          message: "Payment đã được cập nhật nhưng không thể lấy thông tin"
        };
      }

      return {
        success: true,
        data: updatedPayment,
        message: "Cập nhật payment status thành công"
      };
    } catch (error: any) {
      console.error("[PaymentService] updatePaymentStatus error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật payment status"
      };
    }
  }

  // Hàm lấy payment theo booking_id
  async getPaymentByBookingId(bookingId: string): Promise<PaymentResponse<Payment | null>> {
    try {
      const payment = await this.paymentRepo.getPaymentByBookingId(bookingId);
      return {
        success: true,
        data: payment
      };
    } catch (error: any) {
      console.error("[PaymentService] getPaymentByBookingId error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy payment"
      };
    }
  }
}

