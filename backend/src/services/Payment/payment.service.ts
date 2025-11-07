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

      // Kiểm tra đã có payment chưa
      const existingPayment = await this.paymentRepo.getPaymentByBookingId(bookingId);
      if (existingPayment) {
        // ✅ Idempotent: nếu đã có payment (thường là PENDING), trả về payment hiện có
        return {
          success: true,
          data: existingPayment,
          message: "Payment đã tồn tại cho booking này"
        };
      }

      // Kiểm tra booking status phải là CREATED để tạo payment mới
      if (booking.status !== 'CREATED' && booking.status !== 'PENDING_CONFIRMATION') {
        return {
          success: false,
          message: `Booking đã được xử lý (status: ${booking.status}). Không thể tạo payment mới.`
        };
      }

      // Tạo payment với status PENDING
      // Booking status vẫn giữ CREATED (sẽ chuyển sang PENDING_CONFIRMATION khi payment SUCCESS)
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

      // Booking status vẫn giữ CREATED (sẽ chuyển sang PENDING_CONFIRMATION khi payment SUCCESS)
      // Không cần cập nhật booking status ở đây

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

      // ✅ CRITICAL: Nếu payment status = SUCCESS, cập nhật booking status
      if (status === 'SUCCESS') {
        // Sau khi thanh toán thành công → chuyển sang PENDING_CONFIRMATION (chờ admin xác nhận)
        const bookingStatus: BookingStatus = 'PENDING_CONFIRMATION';

        console.log(`[PaymentService] Updating booking ${payment.booking_id} status from ${(await this.bookingRepo.getBookingById(payment.booking_id))?.status || 'UNKNOWN'} to PENDING_CONFIRMATION after payment SUCCESS`);
        
        // ✅ Lấy booking hiện tại để kiểm tra
        const currentBooking = await this.bookingRepo.getBookingById(payment.booking_id);
        if (currentBooking) {
          console.log(`[PaymentService] Current booking status before update: ${currentBooking.status}`);
        }
        
        try {
          const bookingUpdated = await this.bookingRepo.updateBooking(payment.booking_id, {
            status: bookingStatus
          });
          
          if (bookingUpdated) {
            // ✅ Verify lại booking status sau khi update
            const verifyBooking = await this.bookingRepo.getBookingById(payment.booking_id);
            if (verifyBooking) {
              console.log(`✅ [PaymentService] Successfully updated booking ${payment.booking_id} status to PENDING_CONFIRMATION. Verified status: ${verifyBooking.status}`);
              
              // ✅ Double-check: Nếu status không phải PENDING_CONFIRMATION, thử update lại
              if (verifyBooking.status !== 'PENDING_CONFIRMATION') {
                console.error(`❌ [PaymentService] CRITICAL: Booking status mismatch! Expected PENDING_CONFIRMATION but got ${verifyBooking.status}. Retrying update...`);
                const retryUpdated = await this.bookingRepo.updateBooking(payment.booking_id, {
                  status: bookingStatus
                });
                if (retryUpdated) {
                  const retryVerify = await this.bookingRepo.getBookingById(payment.booking_id);
                  console.log(`✅ [PaymentService] Retry update successful. Final status: ${retryVerify?.status || 'UNKNOWN'}`);
                }
              }
            } else {
              console.error(`❌ [PaymentService] Cannot verify booking after update - booking not found`);
            }
          } else {
            console.error(`❌ [PaymentService] Failed to update booking ${payment.booking_id} status to PENDING_CONFIRMATION. updateBooking returned false.`);
          }
        } catch (error: any) {
          console.error(`❌ [PaymentService] updatePaymentStatus error: ${error.message}`);
          // ✅ Re-throw error để booking.service có thể xử lý
          throw error;
        }
      }

      // ✅ CRITICAL: Nếu payment status = FAILED, unlock rooms và cancel booking
      // Note: Nếu booking đã CANCELLED rồi (từ cancelBooking service), thì không unlock nữa để tránh duplicate
      if (status === 'FAILED') {
        try {
          // Lấy booking để kiểm tra
          const { BookingRepository } = await import("../../Repository/Booking/booking.repository");
          const { AvailabilityRepository } = await import("../../Repository/Hotel/availability.repository");
          const bookingRepo = new BookingRepository();
          const availabilityRepo = new AvailabilityRepository();
          
          const booking = await bookingRepo.getBookingById(payment.booking_id);
          
          // Chỉ unlock nếu booking status là CREATED hoặc PENDING_CONFIRMATION (chưa confirm và chưa bị cancel)
          // Nếu đã CANCELLED rồi thì skip (có thể đã được unlock bởi cancelBooking service)
          if (booking && booking.status !== 'CANCELLED' && (booking.status === 'CREATED' || booking.status === 'PENDING_CONFIRMATION')) {
            // Cancel booking
            await bookingRepo.cancelBooking(payment.booking_id);
            
            // Unlock rooms - tăng lại availability
            const bookingDetails = await bookingRepo.getBookingDetailsByBookingId(payment.booking_id);
            
            console.log(`[PaymentService] Unlocking rooms for booking ${payment.booking_id} when payment FAILED, found ${bookingDetails.length} details`);
            
            // Helper để normalize date format
            const normalizeDate = (date: Date | string): string => {
              if (!date) return '';
              const d = typeof date === 'string' ? new Date(date) : date;
              const year = d.getFullYear();
              const month = (d.getMonth() + 1).toString().padStart(2, '0');
              const day = d.getDate().toString().padStart(2, '0');
              return `${year}-${month}-${day}`;
            };
            
            for (const detail of bookingDetails) {
              try {
                // ✅ Normalize date format để đảm bảo đúng format YYYY-MM-DD
                const checkInDate = normalizeDate(detail.checkin_date);
                const checkOutDate = normalizeDate(detail.checkout_date);
                
                const unlockResult = await availabilityRepo.increaseAvailableRooms(
                  detail.room_id,
                  checkInDate,
                  checkOutDate,
                  1
                );
                
                if (unlockResult.success && unlockResult.affectedRows > 0) {
                  console.log(`✅ [PaymentService] Unlocked room ${detail.room_id} for dates ${checkInDate} to ${checkOutDate} when payment FAILED, affectedRows: ${unlockResult.affectedRows}`);
                } else {
                  console.error(`⚠️ [PaymentService] Failed to unlock room ${detail.room_id} for dates ${checkInDate} to ${checkOutDate} when payment FAILED. affectedRows: ${unlockResult.affectedRows}. Check if room_price_schedule record exists!`);
                }
              } catch (unlockError: any) {
                console.error(`❌ [PaymentService] Error unlocking room ${detail.room_id} when payment FAILED:`, unlockError.message);
              }
            }
          } else if (booking && booking.status === 'CANCELLED') {
            console.log(`ℹ️ Booking ${payment.booking_id} đã bị cancel trước đó, skip unlock trong updatePaymentStatus`);
          }
        } catch (unlockError: any) {
          console.error("[PaymentService] Failed to unlock rooms when payment FAILED:", unlockError.message);
          // Không throw error vì payment đã được update rồi
        }
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

