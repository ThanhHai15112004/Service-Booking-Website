import cron from "node-cron";
import pool from "../config/db";
import { BookingRepository } from "../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../Repository/Hotel/availability.repository";

const bookingRepo = new BookingRepository();
const availabilityRepo = new AvailabilityRepository();

// Hàm cleanup expired bookings (CREATED status quá 20 phút)
export function startCleanupExpiredBookingsJob(): void {
  // Chạy mỗi 5 phút để cleanup các booking expired
  cron.schedule("*/5 * * * *", async () => {
    try {
      // Lấy tất cả booking CREATED quá 20 phút
      const [bookings]: any = await pool.query(`
        SELECT booking_id, status, created_at
        FROM booking
        WHERE status = 'CREATED'
          AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 20
      `);

      if (bookings.length === 0) {
        return;
      }

      console.log(`🧹 Tìm thấy ${bookings.length} booking CREATED đã hết hạn, đang cleanup...`);

      let cancelledCount = 0;
      let unlockedCount = 0;

      for (const booking of bookings) {
        try {
          // Cancel booking (set status = CANCELLED)
          const cancelled = await bookingRepo.cancelBooking(booking.booking_id);
          
          if (cancelled) {
            cancelledCount++;

            // Unlock phòng - tăng lại availability
            const bookingDetails = await bookingRepo.getBookingDetailsByBookingId(booking.booking_id);
            
            for (const detail of bookingDetails) {
              try {
                await availabilityRepo.increaseAvailableRooms(
                  detail.room_id,
                  detail.checkin_date,
                  detail.checkout_date,
                  1
                );
                unlockedCount++;
              } catch (error: any) {
                console.error(`❌ Lỗi unlock phòng ${detail.room_id} cho booking ${booking.booking_id}:`, error.message);
              }
            }
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

  console.log("⏱️ Cron job cleanup expired bookings đã khởi động (chạy mỗi 5 phút).");
}

