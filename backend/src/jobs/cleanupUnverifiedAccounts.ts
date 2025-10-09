import cron from "node-cron";
import pool from "../config/db";

export function startCleanupJob(): void {
    cron.schedule("*/1 * * * *", async () => {
    try {
      const [result]: any = await pool.query(`
        DELETE FROM account
        WHERE status = 'PENDING'
          AND is_verified = FALSE
          AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) > 15
      `);

      if (result.affectedRows > 0) {
        console.log(`🧹 Đã xoá ${result.affectedRows} tài khoản PENDING quá 15 phút.`);
      }
    } catch (error) {
      console.error("❌ Lỗi khi xoá tài khoản chưa xác thực:", error);
    }
  });

  console.log("⏱️ Cron job xoá tài khoản PENDING sau 15 phút đã khởi động.");
}