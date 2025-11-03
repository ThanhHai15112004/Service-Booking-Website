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
          // Cancel booking (set status = CANCELLED)
          const cancelled = await bookingRepo.cancelBooking(booking.booking_id);
          
          if (cancelled) {
            cancelledCount++;

            // Unlock phòng - tăng lại availability
            const bookingDetails = await bookingRepo.getBookingDetailsByBookingId(booking.booking_id);
            console.log(`[CleanupJob] Unlocking rooms for expired booking ${booking.booking_id}, found ${bookingDetails.length} details`);
            
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
                  console.log(`✅ [CleanupJob] Unlocked room ${detail.room_id} for dates ${checkInDate} to ${checkOutDate}, affectedRows: ${unlockResult.affectedRows}`);
                  unlockedCount++;
                } else {
                  console.error(`⚠️ [CleanupJob] Failed to unlock room ${detail.room_id} for dates ${checkInDate} to ${checkOutDate}. affectedRows: ${unlockResult.affectedRows}. Check if room_price_schedule record exists!`);
                }
              } catch (error: any) {
                console.error(`❌ [CleanupJob] Error unlocking room ${detail.room_id} for booking ${booking.booking_id}:`, error.message);
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

  console.log(`⏱️ Cron job cleanup expired bookings đã khởi động (chạy mỗi 1 phút, booking expires sau ${BOOKING_EXPIRATION_MINUTES} phút).`);
}

