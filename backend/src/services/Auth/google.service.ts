// src/services/Auth/google.service.ts
import { OAuth2Client } from "google-auth-library";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";
import { Account } from "../../models/account.model";
import { AccountRepository } from "../../Repository/Auth/account.repository";

export class GoogleAuthService {
  private client: OAuth2Client;
  private tokenService = new TokenService();
  private authService = new AuthService();
  private accountRepo = new AccountRepository

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async loginWithGoogle(idToken: string) {
    //Xác thực token với Google
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Không thể xác thực người dùng Google.");

    const { sub: googleId, email, name, picture } = payload;
    if (!email) throw new Error("Không lấy được email từ Google.");

    // Kiểm tra tài khoản đã tồn tại chưa
    const existing = await this.accountRepo.findByEmail(email);
    let user: Account;

    if (existing) {
      user = existing;
      // Nếu tài khoản cũ chưa link Google thì update
      if (user.provider !== "GOOGLE") {
        await this.accountRepo.updateProviderInfo(
          user.account_id,
          "GOOGLE",
          googleId,
          true
        );
        user.provider = "GOOGLE";
        user.provider_id = googleId;
        user.is_verified = true;
      }
    } else {
      // Nếu chưa có → tạo mới
      const account_id = await this.authService["generateAccountId"]();
      await this.accountRepo.create({
        account_id,
        full_name: name,
        email,
        password_hash: "", // không cần vì Google
        is_verified: true,
        provider: "GOOGLE",
        provider_id: googleId,
        avatar_url: picture,
        status: "ACTIVE",
        role: "USER",
      });
      user = (await this.accountRepo.findById(account_id)) as Account;
    }

    // Sinh token đăng nhập
    const payloadJWT = {
      account_id: user.account_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.tokenService.generateAccessToken(payloadJWT);
    const refreshToken = await this.tokenService.generateRefreshToken(payloadJWT);
    await this.tokenService.saveRefreshToken(user.account_id, refreshToken);

    // Trả dữ liệu
    return {
      user,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }
}
