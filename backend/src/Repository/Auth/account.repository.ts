import pool from "../../config/db";
import { Account } from "../../models/account.model";

export class AccountRepository {
  // Đếm số lượng email tồn tại
  async countByEmail(email: string): Promise<number> {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE email = ?",
      [email]
    );
    return rows[0]?.count || 0;
  }

  // Tạo mới tài khoản
  async create(account: Partial<Account>): Promise<void> {
    const keys = Object.keys(account);
    const values = Object.values(account);

    const columns = keys.join(", ");
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO account (${columns}) VALUES (${placeholders})`;
    await pool.query(sql, values);
  }

  // Tìm tài khoản theo email
  async findByEmail(email: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
      "SELECT * FROM account WHERE email = ? LIMIT 1",
      [email]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  // Tìm tài khoản bằng verify_token (và kiểm tra trạng thái)
  async findByVerifyToken(token: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
      `SELECT * 
       FROM account 
       WHERE verify_token = ? 
         AND status = 'PENDING'
         AND (is_verified = FALSE OR is_verified IS NULL)
       LIMIT 1`,
      [token]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  // Cập nhật tài khoản thành verified
  async markVerified(account_id: string): Promise<void> {
    await pool.query(
      `UPDATE account 
       SET is_verified = TRUE,
           verify_token = NULL,
           verify_expires_at = NULL,
           status = 'ACTIVE'
       WHERE account_id = ?`,
      [account_id]
    );
  }

  // Cập nhật token xác minh mới (resend)
  async updateVerificationEmail(
    account_id: string,
    newToken: string
  ): Promise<void> {
    await pool.query(
      `UPDATE account
       SET verify_token = ?,
           verify_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
           last_verification_email_at = NOW(),
           resend_count = resend_count + 1,
           status = 'PENDING'
       WHERE account_id = ?`,
      [newToken, account_id]
    );
  }

  // Lấy thông tin xác minh để giới hạn resend
  async getVerificationStats(email: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
      `SELECT account_id, full_name, is_verified, status,
              last_verification_email_at, resend_count, last_resend_reset_at
       FROM account
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  //  Reset lại giới hạn resend
  async resetResendLimit(account_id: string): Promise<void> {
    await pool.query(
      `UPDATE account 
       SET resend_count = 0, last_resend_reset_at = NOW()
       WHERE account_id = ?`,
      [account_id]
    );
  }

  // Đếm số tài khoản tạo trong ngày hiện tại
  async countAccountsCreatedToday(): Promise<number> {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE DATE(created_at) = CURDATE()"
    );
    return rows[0]?.count || 0;
  }

  // Lấy email theo account_id
  async getEmailByAccountId(accountId: string): Promise<string | null> {
    const [rows]: any = await pool.query(
      "SELECT email FROM account WHERE account_id = ?",
      [accountId]
    );
    return rows?.[0]?.email || null;
  }

  // up date provider info khi link tài khoản Google
  async updateProviderInfo(
    accountId: string,
    provider: string,
    providerId: string,
    isVerified: boolean
  ) {
    await pool.query(
      "UPDATE account SET provider=?, provider_id=?, is_verified=? WHERE account_id=?",
      [provider, providerId, isVerified, accountId]
    );
  }

  // Tìm tài khoản theo account_id
  async findById(account_id: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
        "SELECT * FROM account WHERE account_id = ? LIMIT 1",
        [account_id]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
    }
}
