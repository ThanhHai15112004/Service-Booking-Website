import pool from "../../config/db";
import { Account } from "../../models/Auth/account.model";

export class ProfileRepository {
  // Hàm lấy thông tin user
  async getProfile(accountId: string): Promise<Partial<Account> | null> {
    const [rows]: any = await pool.query(
      `SELECT account_id, username, full_name, email, phone_number, status, role, is_verified, avatar_url, provider, created_at, updated_at
       FROM account
       WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Hàm lấy booking statistics của user
  async getBookingStatistics(accountId: string): Promise<any> {
    const [rows]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'CREATED' THEN 1 ELSE 0 END) as created_count,
        SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_count,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(total_amount) as total_spent,
        MAX(created_at) as last_booking_date
       FROM booking
       WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0] : {
      total_bookings: 0,
      created_count: 0,
      paid_count: 0,
      confirmed_count: 0,
      completed_count: 0,
      cancelled_count: 0,
      total_spent: 0,
      last_booking_date: null
    };
  }

  // Hàm cập nhật thông tin user
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

  // Hàm lấy hash mật khẩu
  async getPasswordHash(accountId: string): Promise<string | null> {
    const [rows]: any = await pool.query(
      `SELECT password_hash FROM account WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0].password_hash : null;
  }

  // Hàm cập nhật mật khẩu
  async updatePassword(accountId: string, newHash: string): Promise<void> {
    await pool.query(
      `UPDATE account SET password_hash = ?, updated_at = NOW() WHERE account_id = ?`,
      [newHash, accountId]
    );
  }

  // Hàm xóa refresh token (buộc login lại)
  async revokeRefreshTokens(accountId: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE account_id = ?`, [
      accountId,
    ]);
  }
}
