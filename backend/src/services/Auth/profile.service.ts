import bcrypt from "bcrypt";
import { ProfileRepository } from "../../Repository/Auth/profile.repository";

export class ProfileService {
  private repo = new ProfileRepository();

  // Hàm lấy profile
  async getUserProfile(accountId: string) {
    const user = await this.repo.getProfile(accountId);
    if (!user) throw new Error("Không tìm thấy người dùng.");
    
    // Lấy booking statistics (có error handling)
    let statistics;
    try {
      statistics = await this.repo.getBookingStatistics(accountId);
    } catch (err: any) {
      console.error('[ProfileService] Error getting statistics:', err.message);
      statistics = {
        total_bookings: 0,
        created_count: 0,
        paid_count: 0,
        confirmed_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        total_spent: 0,
        last_booking_date: null
      };
    }
    
    // Lấy recent activity (có error handling)
    let recentActivity;
    try {
      recentActivity = await this.repo.getRecentActivity(accountId, 5);
    } catch (err: any) {
      console.error('[ProfileService] Error getting recent activity:', err.message);
      recentActivity = [];
    }
    
    return {
      ...user,
      statistics,
      recentActivity
    };
  }

  // Hàm cập nhật profile
  async updateUserProfile(accountId: string, data: any) {
    const { full_name, phone_number, avatar_url } = data;
    if (!full_name || !phone_number) {
      throw new Error("Thiếu thông tin cần cập nhật.");
    }
    const updateData: any = { full_name, phone_number };
    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }
    await this.repo.updateProfile(accountId, updateData);
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
