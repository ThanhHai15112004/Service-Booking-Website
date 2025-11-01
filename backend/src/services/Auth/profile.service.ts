import bcrypt from "bcrypt";
import { ProfileRepository } from "../../Repository/Auth/profile.repository";

export class ProfileService {
  private repo = new ProfileRepository();

  // Hàm lấy profile
  async getUserProfile(accountId: string) {
    const user = await this.repo.getProfile(accountId);
    if (!user) throw new Error("Không tìm thấy người dùng.");
    return user;
  }

  // Hàm cập nhật profile
  async updateUserProfile(accountId: string, data: any) {
    const { full_name, phone_number } = data;
    if (!full_name || !phone_number) {
      throw new Error("Thiếu thông tin cần cập nhật.");
    }
    await this.repo.updateProfile(accountId, { full_name, phone_number });
  }

  // Hàm đổi mật khẩu
  async changePassword(accountId: string, oldPass: string, newPass: string) {
    if (!oldPass || !newPass) throw new Error("Thiếu mật khẩu cũ hoặc mới.");
    if (newPass.length < 6)
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");

    const hash = await this.repo.getPasswordHash(accountId);
    if (!hash) throw new Error("Không tìm thấy tài khoản.");

    const isMatch = await bcrypt.compare(oldPass, hash);
    if (!isMatch) throw new Error("Mật khẩu cũ không chính xác.");

    const newHash = await bcrypt.hash(newPass, 10);
    await this.repo.updatePassword(accountId, newHash);
    await this.repo.revokeRefreshTokens(accountId);
  }
}
