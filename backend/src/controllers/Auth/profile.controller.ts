import { Request, Response } from "express";
import { ProfileService } from "../../services/Auth/profile.service";

const profileService = new ProfileService();

// Hàm lấy thông tin người dùng
export const getProfile = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."
      });
    }
    
    const user = await profileService.getUserProfile(accountId);
    res.json({ success: true, data: user });
  } catch (err: any) {
    console.error('[ProfileController] Error in getProfile:', err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi server khi lấy thông tin người dùng.",
    });
  }
};

// Hàm cập nhật thông tin cá nhân
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    await profileService.updateUserProfile(accountId, req.body);
    res.json({ success: true, message: "Cập nhật thông tin thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Không thể cập nhật thông tin.",
    });
  }
};

// Hàm đổi mật khẩu
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { old_password, new_password } = req.body;
    await profileService.changePassword(accountId, old_password, new_password);
    res.json({
      success: true,
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Không thể đổi mật khẩu.",
    });
  }
};
