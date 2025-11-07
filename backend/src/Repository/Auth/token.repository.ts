import pool from "../../config/db";
import { RefreshToken } from "../../models/Auth/refresh_token.model";

export class TokenRepository {
  // Hàm lưu refresh token (parse expiration time từ h, d, m formats)
  // hours: undefined = dùng từ env, số cụ thể = dùng số đó
  async saveRefreshToken(account_id: string, token: string, hours?: number): Promise<void> {
    let expirationHours: number;
    
    if (hours !== undefined) {
      // Nếu có truyền hours cụ thể (cho ADMIN/STAFF), dùng luôn
      expirationHours = hours;
    } else {
      // Nếu không, parse từ env (cho USER)
      const raw = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
      
      if (raw.endsWith("h")) {
        expirationHours = parseInt(raw.replace("h", ""), 10);
      } else if (raw.endsWith("d")) {
        const days = parseInt(raw.replace("d", ""), 10);
        expirationHours = days * 24;
      } else if (raw.endsWith("m")) {
        const minutes = parseInt(raw.replace("m", ""), 10);
        expirationHours = Math.ceil(minutes / 60);
      } else {
        expirationHours = parseInt(raw, 10) || 168; // default 7 days
      }
    }

    await pool.execute(
      `INSERT INTO refresh_tokens (account_id, token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
      [account_id, token, expirationHours]
    );
  }

  // Hàm kiểm tra tính hợp lệ của refresh token
  async isRefreshTokenValid(token: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT 1 FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`,
      [token]
    );
    return rows.length > 0;
  }

  // Hàm thu hồi refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE token = ?`, [token]);
  }

  // Hàm lấy refresh token
  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = ?`,
      [token]
    );
    return rows.length ? (rows[0] as RefreshToken) : null;
  }

  // Hàm thu hồi tất cả refresh tokens của một account (chỉ cho phép 1 session)
  async revokeAllRefreshTokens(accountId: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE account_id = ?`, [accountId]);
  }
}
