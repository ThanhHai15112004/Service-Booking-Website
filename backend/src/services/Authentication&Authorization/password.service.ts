import pool from "../../config/db";
import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { sendPasswordResetEmail } from "./email.service";
dotenv.config();

// Mặc định 15 phút.
function parseExpireToMinutes(raw: string | undefined): number {
  const val = raw || "15m";
  if (val.endsWith("m")) return parseInt(val.replace("m", ""), 10);
  if (val.endsWith("h")) return parseInt(val.replace("h", ""), 10) * 60;
    return parseInt(val, 10);
}

/**
 * Không tiết lộ việc email có tồn tại hay không.
 * Nếu email tồn tại: tạo token, lưu hạn, gửi mail.
 * Nếu không tồn tại: vẫn trả OK.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  // Kiểm tra account theo email
  const [rows]: any = await pool.execute("SELECT account_id FROM account WHERE email = ?", [email]);

  // Luôn trả OK sau cùng, nhưng chỉ tạo token khi có account
  if (rows.length === 0) {
    return; // email không tồn tại -> im lặng để tránh dò
  }

  const accountId = rows[0].account_id as string;

  // Tạo token & hạn
  const token = crypto.randomBytes(32).toString("hex");
  const minutes = parseExpireToMinutes(process.env.PASSWORD_RESET_EXPIRES_IN);

  // Lưu token vào DB (bảng account)
  await pool.execute(
    `
      UPDATE account 
      SET reset_token = ?, reset_expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
      WHERE account_id = ?
    `,
    [token, minutes, accountId]
  );

  // Gửi email chứa link reset
  await sendPasswordResetEmail(email, token);
}


// Verify reset token validity
export async function verifyResetToken(token: string): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT account_id, reset_expires_at 
     FROM account 
     WHERE reset_token = ? 
       AND reset_expires_at > NOW()`,
    [token]
  );

  // Không có kết quả → token không hợp lệ hoặc hết hạn
  if (rows.length === 0) return false;

  return true;
}



/**
 * Đổi mật khẩu mới bằng reset token.
 * - Kiểm tra token còn hạn
 * - Hash mật khẩu mới
 * - Cập nhật account + xoá reset_token
 * - Thu hồi toàn bộ refresh tokens của account (force logout)
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
  // Tìm account theo token còn hạn
  const [rows]: any = await pool.query(
    `SELECT account_id 
       FROM account 
      WHERE reset_token = ? 
        AND reset_expires_at > NOW()`,
    [token]
  );

  if (rows.length === 0) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn.");
  }

  const accountId: string = rows[0].account_id;

  // Hash mật khẩu mới
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);

  // Transaction: update account + revoke refresh tokens
  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();

    // Cập nhật mật khẩu + xoá reset token
    await conn.execute(
      `UPDATE account
          SET password_hash = ?, 
              reset_token = NULL, 
              reset_expires_at = NULL,
              updated_at = CURRENT_TIMESTAMP
        WHERE account_id = ?`,
      [password_hash, accountId]
    );

    // Thu hồi toàn bộ refresh tokens đang lưu (bắt buộc đăng nhập lại)
    await conn.execute(
      `DELETE FROM refresh_tokens WHERE account_id = ?`,
      [accountId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}