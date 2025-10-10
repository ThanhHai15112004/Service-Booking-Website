import pool from "../config/db";
import crypto from "crypto";
import { sendVerificationEmail } from "../services/email.service";

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
        INSERT INTO account (account_id, full_name, email, password_hash, phone_number, verify_token, status, verify_expires_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', DATE_ADD(NOW(), INTERVAL 3 MINUTE))
    `;
    await pool.execute(query, [account_Id, full_name, email, password_hash, phone_number || null, verify_token]);
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
        `SELECT account_id, verify_expires_at 
        FROM account 
        WHERE verify_token = ? 
            AND (is_verified = FALSE OR is_verified IS NULL)
            AND status = 'PENDING'`,
        [token]
    );


    if (rows.length === 0) return false;


    const user = rows[0];

    const expiresAt = new Date(user.verify_expires_at);
    const now = new Date();

    if (now > expiresAt) {
        console.log("⚠️ Token hết hạn:", token);
        return false;
    }

    await pool.query(
        `UPDATE account 
        SET is_verified = TRUE, 
            verify_token = NULL, 
            verify_expires_at = NULL,
            status = 'ACTIVE'
        WHERE account_id = ?`,
        [user.account_id]
    );

    return true;
}

// hàm gửi lại email xác thực
export async function resendVerificationEmail(email: string): Promise<boolean> {
    const [rows]: any = await pool.query(
        `SELECT account_id, full_name, is_verified, status FROM account WHERE email = ?`,
        [email]
    );

    if (rows.length === 0) {
        throw new Error("Email không tồn tại.");
    }

    const user = rows[0];

    if (user.is_verified) {
        throw new Error("Tài khoản đã được xác thực.");
    }

    const newToken  = crypto.randomBytes(32).toString('hex');

    await pool.query(
        `UPDATE account 
         SET verify_token = ?, verify_expires_at = DATE_ADD(NOW(), INTERVAL 3 MINUTE), status = 'PENDING'
         WHERE account_id = ?`,
        [newToken, user.account_id]
    );

    await sendVerificationEmail(email, newToken);

    return true;
}