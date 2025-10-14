import pool from "../../config/db";
import bcrypt from "bcrypt";

export async function getUserProfile(accountId: string) {
    const [rows]: any = await pool.query(
        `SELECT account_id, full_name, email, phone_number, status, created_at
            FROM account WHERE account_id = ?`,
        [accountId]
    );
    return rows[0] || null;
}

export async function updateUserProfile(accountId: string, data: any) {
    const { full_name, phone_number} = data;
    await pool.query(
        `UPDATE account SET full_name = ?, phone_number = ?, updated_at = NOW()
            WHERE account_id = ?`,
        [full_name, phone_number, accountId]
    );
}

export async function changePassword(accountId: string, oldPass: string, newPass: string) {
    const [rows]: any = await pool.query(
        `SELECT password_hash FROM account WHERE account_id = ?`,
        [accountId]
    );
    const account = rows[0];
    if(!account) throw new Error("Không tìm thấy tài khoản.");
    
    const match = await bcrypt.compare(oldPass, account.password_hash);
  if (!match) throw new Error("Mật khẩu cũ không chính xác.");

  const newHash = await bcrypt.hash(newPass, 10);
  await pool.query(`UPDATE account SET password_hash = ? WHERE account_id = ?`, [newHash, accountId]);

  // Xóa refresh token để buộc login lại
  await pool.query(`DELETE FROM refresh_tokens WHERE account_id = ?`, [accountId]);
    
}