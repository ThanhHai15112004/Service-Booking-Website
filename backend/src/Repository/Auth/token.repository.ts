// src/Repository/Auth/token.repository.ts
import pool from "../../config/db";
import { RefreshToken } from "../../models/Auth/refresh_token.model";

export class TokenRepository {
    // Lưu refresh token
  async saveRefreshToken(account_id: string, token: string): Promise<void> {
    const raw = process.env.JWT_REFRESH_EXPIRES_IN || "6h";
    
    // ✅ Parse expiration time correctly (support h, d, m formats)
    let hours = 6; // default
    if (raw.endsWith("h")) {
      hours = parseInt(raw.replace("h", ""), 10);
    } else if (raw.endsWith("d")) {
      const days = parseInt(raw.replace("d", ""), 10);
      hours = days * 24;
    } else if (raw.endsWith("m")) {
      const minutes = parseInt(raw.replace("m", ""), 10);
      hours = Math.ceil(minutes / 60); // Round up to nearest hour
    } else {
      // Try to parse as hours if no suffix
      hours = parseInt(raw, 10) || 6;
    }

    await pool.execute(
      `INSERT INTO refresh_tokens (account_id, token, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
      [account_id, token, hours]
    );
  }

  // Kiểm tra tính hợp lệ của refresh token
  async isRefreshTokenValid(token: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT 1 FROM refresh_tokens WHERE token = ? AND expires_at > NOW()`,
      [token]
    );
    return rows.length > 0;
  }

  // Thu hồi refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE token = ?`, [token]);
  }

  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token = ?`,
      [token]
    );
    return rows.length ? (rows[0] as RefreshToken) : null;
  }
}
