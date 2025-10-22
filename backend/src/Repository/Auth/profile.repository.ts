import pool from "../../config/db";
import { Account } from "../../models/Auth/account.model";

export class ProfileRepository {
  // Lấy thông tin user
  async getProfile(accountId: string): Promise<Partial<Account> | null> {
    const [rows]: any = await pool.query(
      `SELECT account_id, full_name, email, phone_number, status, created_at, updated_at
       FROM account
       WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Cập nhật thông tin user
  async updateProfile(
    accountId: string,
    data: { full_name: string; phone_number: string }
  ): Promise<void> {
    const { full_name, phone_number } = data;
    await pool.query(
      `UPDATE account 
       SET full_name = ?, phone_number = ?, updated_at = NOW()
       WHERE account_id = ?`,
      [full_name, phone_number, accountId]
    );
  }

  // Lấy hash mật khẩu
  async getPasswordHash(accountId: string): Promise<string | null> {
    const [rows]: any = await pool.query(
      `SELECT password_hash FROM account WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0].password_hash : null;
  }

  // Cập nhật mật khẩu
  async updatePassword(accountId: string, newHash: string): Promise<void> {
    await pool.query(
      `UPDATE account SET password_hash = ?, updated_at = NOW() WHERE account_id = ?`,
      [newHash, accountId]
    );
  }

  // Xóa refresh token (buộc login lại)
  async revokeRefreshTokens(accountId: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE account_id = ?`, [
      accountId,
    ]);
  }
}
