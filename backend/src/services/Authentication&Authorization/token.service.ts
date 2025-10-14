import pool from "../../config/db";
import { RefreshToken } from "../../models/refresh_token.model";
import dotenv from "dotenv";
dotenv.config();

// 🟢 Lưu refresh token vào DB (đọc thời hạn từ .env)
export async function saveRefreshToken(account_id: string, token: string): Promise<void> {
  // Đọc giá trị từ .env
  const raw = process.env.JWT_REFRESH_EXPIRES_IN || "6h";

  // Nếu không có chữ "h" thì mặc định coi là số giờ
  const hours = raw.endsWith("h") ? parseInt(raw.replace("h", ""), 10) : parseInt(raw, 10);

  const query = `
    INSERT INTO refresh_tokens (account_id, token, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))
  `;

  await pool.execute(query, [account_id, token, hours]);
}

// 🟢 Kiểm tra token có tồn tại không
export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`,
    [token]
  );
  return rows.length > 0;
}

// 🟢 Xóa token khi logout
export async function revokeRefreshToken(token: string): Promise<void> {
  await pool.query(`DELETE FROM refresh_tokens WHERE token = ?`, [token]);
}
