import cron from "node-cron";
import pool from "../config/db";

export function startCleanupJob(): void {
    cron.schedule("*/1 * * * *", async () => {
    try {
      // ✅ Soft delete: Chỉ chuyển status sang DELETED, không xóa khỏi database
      const [result]: any = await pool.query(`
        UPDATE account
        SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP
        WHERE status = 'PENDING'
          AND is_verified = FALSE
          AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 15
      `);

      if (result.affectedRows > 0) {
        console.log(`🧹 Đã chuyển ${result.affectedRows} tài khoản PENDING quá 15 phút sang DELETED.`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi cleanup tài khoản chưa xác thực:", error);
    }
  });

  console.log("⏱️ Cron job cleanup tài khoản PENDING sau 15 phút đã khởi động (soft delete).");
}