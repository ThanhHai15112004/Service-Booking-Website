import cron from "node-cron";
import pool from "../config/db";
import { BookingRepository } from "../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../Repository/Hotel/availability.repository";

const bookingRepo = new BookingRepository();
const availabilityRepo = new AvailabilityRepository();

// Hàm tự động hủy booking đã CONFIRMED nhưng không check-in sau ngày check-in
export function startAutoCancelNoShowBookingsJob(): void {
  // Chạy mỗi ngày lúc 2:00 AM để kiểm tra và hủy các booking không check-in
  cron.schedule("0 2 * * *", async () => {
    try {
      // Lấy tất cả booking CONFIRMED mà ngày check-in đã qua và chưa check-in
      const [bookings]: any = await pool.query(`
        SELECT DISTINCT b.booking_id, b.status, b.hotel_id, MIN(bd.checkin_date) as checkin_date
        FROM booking b
        INNER JOIN booking_detail bd ON b.booking_id = bd.booking_id
        WHERE b.status = 'CONFIRMED'
          AND DATE(bd.checkin_date) < CURDATE()
        GROUP BY b.booking_id, b.status, b.hotel_id
      `);

      if (bookings.length === 0) {
        return;
      }

      console.log(`🧹 Tìm thấy ${bookings.length} booking CONFIRMED đã quá ngày check-in nhưng chưa check-in, đang hủy...`);

      let cancelledCount = 0;
      let unlockedCount = 0;

      for (const booking of bookings) {
        try {
          // Cancel booking và unlock phòng
          const result = await bookingRepo.cancelBookingAndUnlockRooms(booking.booking_id);
          
          if (result.success) {
            cancelledCount++;
            unlockedCount += result.unlockedRooms;
            console.log(`✅ [AutoCancelNoShowJob] Canceled booking ${booking.booking_id} (no-show) and unlocked ${result.unlockedRooms} room(s)`);
          } else {
            console.error(`⚠️ [AutoCancelNoShowJob] Failed to cancel booking ${booking.booking_id} (may have been already cancelled)`);
          }
        } catch (error: any) {
          console.error(`❌ Lỗi khi cancel booking ${booking.booking_id}:`, error.message);
        }
      }

      if (cancelledCount > 0 || unlockedCount > 0) {
        console.log(`✅ Đã tự động hủy ${cancelledCount} booking no-show và unlock ${unlockedCount} phòng.`);
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi tự động hủy booking no-show:", error.message);
    }
  });

  console.log(`⏱️ Cron job tự động hủy booking no-show đã khởi động (chạy mỗi ngày lúc 2:00 AM).`);
}

