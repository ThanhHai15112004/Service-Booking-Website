import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { TokenRepository } from "../../Repository/Auth/token.repository";

export class TokenService {
  private repo = new TokenRepository();
  private ACCESS_SECRET: Secret = (process.env.JWT_ACCESS_SECRET ?? "") as Secret;
  private REFRESH_SECRET: Secret = (process.env.JWT_REFRESH_SECRET ?? "") as Secret;
  private ACCESS_EXPIRES: SignOptions["expiresIn"] =
    (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]) || "15m";
  private REFRESH_EXPIRES: SignOptions["expiresIn"] =
    (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) || "6h";

  // Hàm lưu refresh token với role để set expiration khác nhau
  async saveRefreshToken(accountId: string, token: string, role?: string) {
    // ADMIN/STAFF: 6 hours, USER: 3 days (72 hours)
    const hours = role === 'ADMIN' || role === 'STAFF' ? 6 : 72; // 3 days = 72 hours
    await this.repo.saveRefreshToken(accountId, token, hours);
  }

  // Hàm thu hồi refresh token
  async revokeRefreshToken(token: string) {
    await this.repo.revokeRefreshToken(token);
  }

  // Hàm thu hồi tất cả refresh tokens của một account (chỉ cho phép 1 session)
  async revokeAllRefreshTokens(accountId: string) {
    await this.repo.revokeAllRefreshTokens(accountId);
  }

  // Hàm kiểm tra tính hợp lệ của refresh token (public để controller có thể gọi)
  async checkRefreshTokenValidity(refreshToken: string): Promise<boolean> {
    return this.repo.isRefreshTokenValid(refreshToken);
  }

  // Hàm tạo access token
  async generateAccessToken(payload: object): Promise<string> {
    return sign(payload, this.ACCESS_SECRET, { expiresIn: this.ACCESS_EXPIRES });
  }

  // Hàm tạo refresh token với role để set expiration khác nhau
  async generateRefreshToken(payload: object, role?: string): Promise<string> {
    // ADMIN/STAFF: 6 hours, USER: 3 days (72 hours)
    const expiresIn = role === 'ADMIN' || role === 'STAFF' 
      ? '6h' 
      : '3d'; // 3 days for USER
    return sign(payload, this.REFRESH_SECRET, { expiresIn });
  }

  // Hàm tạo access token mới từ refresh token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const stillInStore = await this.repo.isRefreshTokenValid(refreshToken);
    if (!stillInStore) throw new Error("Refresh token không hợp lệ hoặc đã hết hạn.");

    const decoded = verify(refreshToken, this.REFRESH_SECRET) as JwtPayload;
    const newAccess = sign(
      { account_id: decoded.account_id },
      this.ACCESS_SECRET,
      { expiresIn: this.ACCESS_EXPIRES }
    );
    return newAccess;
  }
}
