import cron from "node-cron";
import pool from "../config/db";
import { BookingRepository } from "../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../Repository/Hotel/availability.repository";
import { BOOKING_EXPIRATION_MINUTES } from "../config/booking.constants";

const bookingRepo = new BookingRepository();
const availabilityRepo = new AvailabilityRepository();

// Hàm cleanup expired bookings (CREATED status quá BOOKING_EXPIRATION_MINUTES phút)
export function startCleanupExpiredBookingsJob(): void {
  // Chạy mỗi 1 phút để cleanup các booking expired (faster for testing with 2 min expiry)
  cron.schedule("*/1 * * * *", async () => {
    try {
      // Lấy tất cả booking CREATED quá BOOKING_EXPIRATION_MINUTES phút
      const [bookings]: any = await pool.query(`
        SELECT booking_id, status, created_at
        FROM booking
        WHERE status = 'CREATED'
          AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > ?
      `, [BOOKING_EXPIRATION_MINUTES]);

      if (bookings.length === 0) {
        return;
      }

      console.log(`🧹 Tìm thấy ${bookings.length} booking CREATED đã hết hạn, đang cleanup...`);

      let cancelledCount = 0;
      let unlockedCount = 0;

      for (const booking of bookings) {
        try {
          // ✅ Cancel booking và unlock phòng ĐỒNG THỜI trong cùng transaction
          const result = await bookingRepo.cancelBookingAndUnlockRooms(booking.booking_id);
          
          if (result.success) {
            cancelledCount++;
            unlockedCount += result.unlockedRooms;
            console.log(`✅ [CleanupJob] Canceled booking ${booking.booking_id} and unlocked ${result.unlockedRooms} room(s)`);
          } else {
            console.error(`⚠️ [CleanupJob] Failed to cancel booking ${booking.booking_id} (may have been already cancelled)`);
          }
        } catch (error: any) {
          console.error(`❌ Lỗi khi cancel booking ${booking.booking_id}:`, error.message);
        }
      }

      if (cancelledCount > 0 || unlockedCount > 0) {
        console.log(`✅ Đã cleanup ${cancelledCount} booking và unlock ${unlockedCount} phòng.`);
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi cleanup expired bookings:", error.message);
    }
  });

  console.log(`⏱️ Cron job cleanup expired bookings đã khởi động (chạy mỗi 1 phút, booking expires sau ${BOOKING_EXPIRATION_MINUTES} phút).`);
}

