// src/services/Auth/token.service.ts
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

  // Lưu refresh token
  async saveRefreshToken(accountId: string, token: string) {
    await this.repo.saveRefreshToken(accountId, token);
  }

  // Thu hồi refresh token
  async revokeRefreshToken(token: string) {
    await this.repo.revokeRefreshToken(token);
  }

  // Kiểm tra tính hợp lệ của refresh token
  async isValid(token: string): Promise<boolean> {
    return this.repo.isRefreshTokenValid(token);
  }

  // Tạo access token
  async generateAccessToken(payload: object): Promise<string> {
    return sign(payload, this.ACCESS_SECRET, { expiresIn: this.ACCESS_EXPIRES });
  }

  // Tạo refresh token
  async generateRefreshToken(payload: object): Promise<string> {
    return sign(payload, this.REFRESH_SECRET, { expiresIn: this.REFRESH_EXPIRES });
  }

  // Tạo access token mới từ refresh token
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
