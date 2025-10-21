import pool from "../../config/db";

export class PasswordRepository {
  // Lấy account_id theo email
  async getAccountIdByEmail(email: string): Promise<string | null> {
    const [rows]: any = await pool.execute(
      "SELECT account_id FROM account WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? rows[0].account_id : null;
  }

  // Cập nhật token reset và thời hạn
  async setResetToken(
    accountId: string,
    token: string,
    minutes: number
  ): Promise<void> {
    await pool.execute(
      `UPDATE account 
       SET reset_token = ?, reset_expires_at = DATE_ADD(NOW(), INTERVAL ? MINUTE)
       WHERE account_id = ?`,
      [token, minutes, accountId]
    );
  }

  // Kiểm tra token hợp lệ
  async isResetTokenValid(
    token: string
  ): Promise<{ account_id: string } | null> {
    const [rows]: any = await pool.query(
      `SELECT account_id FROM account 
       WHERE reset_token = ? AND reset_expires_at > NOW()`,
      [token]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Cập nhật mật khẩu mới + reset token
  async updatePassword(accountId: string, passwordHash: string): Promise<void> {
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
        [passwordHash, accountId]
      );

      await conn.execute(`DELETE FROM refresh_tokens WHERE account_id = ?`, [
        accountId,
      ]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }


  
}
