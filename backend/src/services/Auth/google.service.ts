import { OAuth2Client } from "google-auth-library";
import { TokenService } from "./token.service";
import { AuthService } from "./auth.service";
import { Account } from "../../models/Auth/account.model";
import { AccountRepository } from "../../Repository/Auth/account.repository";

export class GoogleAuthService {
  private client: OAuth2Client;
  private tokenService = new TokenService();
  private authService = new AuthService();
  private accountRepo = new AccountRepository();

  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // Hàm đăng nhập bằng Google
  async loginWithGoogle(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Không thể xác thực người dùng Google.");

    const { sub: googleId, email, name, picture } = payload;
    if (!email) throw new Error("Không lấy được email từ Google.");

    // ✅ Tìm account theo email (bao gồm cả DELETED accounts)
    const existing = await this.accountRepo.findByEmail(email);
    let user: Account;

    if (existing) {
      // ✅ Nếu account đã bị xóa (DELETED), restore nó thay vì tạo mới
      if (existing.status === "DELETED") {
        // Restore account và update thành Google provider
        await this.accountRepo.update(existing.account_id, {
          status: "ACTIVE",
          is_verified: true,
          provider: "GOOGLE",
          provider_id: googleId,
          avatar_url: picture || existing.avatar_url,
          full_name: name || existing.full_name
        });
        // Update provider info
        await this.accountRepo.updateProviderInfo(
          existing.account_id,
          "GOOGLE",
          googleId,
          true
        );
        // Refresh user data
        const restoredUser = await this.accountRepo.findById(existing.account_id);
        if (restoredUser) {
          user = restoredUser;
        } else {
          throw new Error("Không thể khôi phục tài khoản.");
        }
      } else {
        // Account tồn tại và chưa bị xóa
        user = existing;
        // ✅ Đảm bảo tài khoản Google luôn có is_verified = true và status = ACTIVE
        if (user.provider !== "GOOGLE") {
          // Nếu tài khoản chưa liên kết với Google, update provider và verify
          await this.accountRepo.updateProviderInfo(
            user.account_id,
            "GOOGLE",
            googleId,
            true
          );
          // ✅ Update status thành ACTIVE
          await this.accountRepo.update(user.account_id, { status: "ACTIVE" });
          user.provider = "GOOGLE";
          user.provider_id = googleId;
          user.is_verified = true;
          user.status = "ACTIVE";
        } else {
          // ✅ Nếu đã là Google provider, đảm bảo is_verified = true và status = ACTIVE
          // Login bằng Google = email đã được verify, nên luôn set is_verified = true và status = ACTIVE
          if (!user.is_verified || user.status !== "ACTIVE") {
            await this.accountRepo.updateProviderInfo(
              user.account_id,
              "GOOGLE",
              googleId,
              true
            );
            // ✅ Update status thành ACTIVE
            await this.accountRepo.update(user.account_id, { status: "ACTIVE" });
          }
          // ✅ Refresh user data từ database để đảm bảo có data mới nhất
          const updatedUser = await this.accountRepo.findById(user.account_id);
          if (updatedUser) {
            user = updatedUser;
            user.is_verified = true;
            user.status = "ACTIVE";
          } else {
            // Fallback: set manually
            user.is_verified = true;
            user.status = "ACTIVE";
          }
        }
      }
    } else {
      const account_id = await this.authService["generateAccountId"]();
      await this.accountRepo.create({
        account_id,
        full_name: name,
        email,
        password_hash: "",
        is_verified: true,
        provider: "GOOGLE",
        provider_id: googleId,
        avatar_url: picture,
        status: "ACTIVE",
        role: "USER",
      });
      user = (await this.accountRepo.findById(account_id)) as Account;
    }

    // Không revoke tokens cũ - cho phép nhiều session cùng lúc (user và admin có thể đăng nhập riêng)
    
    const payloadJWT = {
      account_id: user.account_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.tokenService.generateAccessToken(payloadJWT);
    const refreshToken = await this.tokenService.generateRefreshToken(payloadJWT, user.role);
    await this.tokenService.saveRefreshToken(user.account_id, refreshToken, user.role);

    return {
      user,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    };
  }
}
