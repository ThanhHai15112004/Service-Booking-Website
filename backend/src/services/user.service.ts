import pool from "../config/db";
import crypto from "crypto";

// Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
export async function isEmailExisting(email: string): Promise<boolean> {
    const query = "SELECT COUNT(*) as count FROM account WHERE email = ?";
    const [row]: any = await pool.execute(query, [email]);

    return row[0].count > 0;
}

// Tạo tài khoản người dùng mới
export async function createAccountforUser(
    full_name: string,
    email: string,
    password_hash: string,
    verify_token: string,
    phone_number?: string
) {
    const account_Id = await generateAccountId();
    const query = `
        INSERT INTO account (account_id, full_name, email, password_hash, phone_number, verify_token, status)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
    `;
    await pool.execute(query, [account_Id, full_name, email, password_hash, verify_token, phone_number || null]);
    return account_Id;
}

// Tạo id account
async function generateAccountId(): Promise<string> {
    // lấy ngày hiện tại
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, '');

    // truy vấn xem có bao nhiêu account 
    const [rows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM account WHERE DATE(created_at) = CURDATE()`
    );

    const countToday = rows[0].count || 0;
    const nextNum = countToday + 1;

    const id = `AC${datePart}${String(nextNum).padStart(4, '0')}`;

    return id;
}

//sinh token ngẫu nhiên
export function generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// xác thực email
export async function verifyEmailToken(token: string): Promise<boolean> {
    const [rows]: any = await pool.query(
        `SELECT account_id FROM account WHERE verify_token = ? AND is_verified = FALSE`,
        [token]
    );

    if (rows.length === 0) return false;

    await pool.query(
        `UPDATE account
            SET is_verified = TRUE,
                verify_token = NULL,
                status = 'ACTIVE'
            WHERE account_id = ?`,
        [rows[0].account_id]
    );

    return true;
}