import pool from "../../config/db";
import crypto from "crypto";
import { Account } from "../../models/account.model";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "./email.service";

// 🟢 Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu hay chưa
export async function isEmailExisting(email: string): Promise<boolean> {
  const query = "SELECT COUNT(*) as count FROM account WHERE email = ?";
  const [rows]: any = await pool.execute(query, [email]);
  return rows[0].count > 0;
}

// Tạo tài khoản người dùng mới
export async function createAccountforUser(  full_name: string,  
  email: string,  password_hash: string,  verify_token: string,  phone_number?: string): Promise<string> {
  const account_Id = await generateAccountId();
  const query = `
    INSERT INTO account (account_id, full_name, email, password_hash, phone_number, verify_token, status, verify_expires_at)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', DATE_ADD(NOW(), INTERVAL 3 MINUTE))
  `;
  await pool.execute(query, [
    account_Id,
    full_name,
    email,
    password_hash,
    phone_number || null,
    verify_token,
  ]);
  return account_Id;
}

// Tạo id account
export async function generateAccountId(): Promise<string> {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");

  const [rows]: any = await pool.query(
    `SELECT COUNT(*) as count FROM account WHERE DATE(created_at) = CURDATE()`
  );
  const countToday = rows[0].count || 0;
  const nextNum = countToday + 1;

  return `AC${datePart}${String(nextNum).padStart(4, "0")}`;
}

// Sinh token ngẫu nhiên
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Xác thực email qua token
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

  const user = rows[0] as Account;
  const expiresAt = new Date(user.verify_expires_at!);
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


/**
 * Gửi lại email xác thực (giới hạn 2 phút giữa mỗi lần + tối đa 5 lần/24h)
 */
export async function resendVerificationEmail(email: string): Promise<boolean> {
  const [rows]: any = await pool.query(
    `SELECT account_id, full_name, is_verified, status, 
            last_verification_email_at, resend_count, last_resend_reset_at
     FROM account WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) throw new Error("Email không tồn tại.");
  const user = rows[0] as Account;

  if (user.is_verified) throw new Error("Tài khoản đã được xác thực.");

  const now = new Date();

  const lastReset = user.last_resend_reset_at ? new Date(user.last_resend_reset_at) : null;
  const isNewDay = !lastReset || now.getTime() - lastReset.getTime() > 24 * 60 * 60 * 1000;

  if (isNewDay) {
    await pool.query(
      `UPDATE account 
       SET resend_count = 0, last_resend_reset_at = NOW() 
       WHERE account_id = ?`,
      [user.account_id]
    );
    user.resend_count = 0;
  }

  if (user.resend_count >= 5) {
    throw new Error("Bạn đã đạt giới hạn 5 lần gửi lại trong 24 giờ. Vui lòng thử lại sau.");
  }

  const lastSent = user.last_verification_email_at ? new Date(user.last_verification_email_at) : null;
  if (lastSent && now.getTime() - lastSent.getTime() < 2 * 60 * 1000) {
    const wait = Math.ceil((2 * 60 * 1000 - (now.getTime() - lastSent.getTime())) / 1000);
    throw new Error(`Vui lòng đợi ${wait} giây trước khi gửi lại email xác thực.`);
  }

  const newToken = crypto.randomBytes(32).toString("hex");

  await pool.query(
    `UPDATE account 
     SET verify_token = ?, 
         verify_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
         last_verification_email_at = NOW(),
         resend_count = resend_count + 1,
         status = 'PENDING'
     WHERE account_id = ?`,
    [newToken, user.account_id]
  );

  await sendVerificationEmail(email, newToken);

  return true;
}


// Hàm lấy tài khoản theo email (dùng cho login)
export async function findAccountByEmail(  email: string): Promise<Account | null> {
  const [rows]: any = await pool.execute("SELECT * FROM account WHERE email = ?", [email]);
  return rows.length > 0 ? (rows[0] as Account) : null;
}

// xác thực email và mật khẩu
export async function verifyLoginCredentials(email:string, password: string): Promise<Account> {

    const account = await findAccountByEmail(email);
    
    if(!account) throw new Error("Email không tồn tại trong hệ thống.");

    if(account.status == "BANNED") throw new Error("Tài khoản của bạn đã bị khóa");
    if(account.status == "DELETED") throw new Error("Tài khoản của bạn đã bị xóa");
    if(!account.is_verified || account.status == "PENDING") throw new Error("Vui lòng xác thực trước khi đăng nhập");

    const isMatch = await bcrypt.compare(password, account.password_hash);
    if(!isMatch) throw new Error("Mật khẩu không chính xác.")

    const{password_hash, verify_token, verify_expires_at, ...safeAccount} = account;
    return safeAccount as Account;
    
}