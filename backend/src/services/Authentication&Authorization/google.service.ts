import { OAuth2Client } from "google-auth-library";
import pool from "../../config/db";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.utils";
import { saveRefreshToken } from "./token.service";
import { Account } from "../../models/account.model";
import { generateAccountId } from "./user.service";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function loginWithGoogle(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Không thể xác thực người dùng Google.");

    const { sub, email, name, picture } = payload;
    if (!email) throw new Error("Không lấy được email từ Google.");

    const [rows]: any = await pool.query("SELECT * FROM account WHERE email = ?", [email]);
    let user: Account;

    if (rows.length > 0) {
      user = rows[0];

      if (user.provider !== 'GOOGLE') {
        await pool.query(
          "UPDATE account SET provider='GOOGLE', provider_id=?, is_verified=TRUE WHERE account_id=?",
          [sub, user.account_id]
        );
        user.provider = "GOOGLE";
        user.provider_id = sub;
        user.is_verified = true;
      }
    } else {
      const accountId = await generateAccountId();

      await pool.query(
        `INSERT INTO account 
          (account_id, full_name, email, password_hash, is_verified, provider, provider_id, avatar_url, status, role)
         VALUES (?, ?, ?, '', TRUE, 'GOOGLE', ?, ?, 'ACTIVE', 'USER')`,
        [accountId, name, email, sub, picture]
      );

      // Lấy tài khoản vừa tạo
      const [createdRows]: any = await pool.query("SELECT * FROM account WHERE account_id = ?", [accountId]);
      if (createdRows.length === 0) {
        throw new Error("Không thể tạo tài khoản mới.");
      }
      user = createdRows[0];
    }

    const payloadJWT = {
      account_id: user.account_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payloadJWT);
    const refreshToken = generateRefreshToken(payloadJWT);

    await saveRefreshToken(user.account_id, refreshToken);

    return {
      user,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  } catch (error: any) {
    console.error("❌ Lỗi loginWithGoogle:", error.message);
    throw error;
  }
}
