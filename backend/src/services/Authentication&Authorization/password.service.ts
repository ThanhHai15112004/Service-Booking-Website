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


//Yêu cầu reset mật khẩu.
export async function requestPasswordReset(email: string): Promise<void> {
  // Kiểm tra account theo email
  const [rows]: any = await pool.execute("SELECT account_id FROM account WHERE email = ?", [email]);

  if (rows.length === 0) {
    return; 
  }

  const accountId = rows[0].account_id as string;

  const token = crypto.randomBytes(32).toString("hex");
  const minutes = parseExpireToMinutes(process.env.PASSWORD_RESET_EXPIRES_IN);

  await pool.execute(
    `
      UPDATE account 
      SET reset_token = ?, reset_expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
      WHERE account_id = ?
    `,
    [token, minutes, accountId]
  );

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

  if (rows.length === 0) return false;

  return true;
}



// Reset mật khẩu với token
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
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

  const saltRounds = 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);

  const conn = await (pool as any).getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `UPDATE account
          SET password_hash = ?, 
              reset_token = NULL, 
              reset_expires_at = NULL,
              updated_at = CURRENT_TIMESTAMP
        WHERE account_id = ?`,
      [password_hash, accountId]
    );

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