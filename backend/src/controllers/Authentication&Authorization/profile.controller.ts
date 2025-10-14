import { Request, Response } from "express";
import {  changePassword,  getUserProfile,  updateUserProfile,} from "../../services/Authentication&Authorization/profile.service";

export const getProfile = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const user = await getUserProfile(accountId);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Lỗi server." });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId; 
    await updateUserProfile(accountId, req.body);
    res.json({ success: true, message: "Cập nhật thành công." });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Lỗi server." });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId; 
    const { old_password, new_password } = req.body;
    await changePassword(accountId, old_password, new_password);
    res.json({ success: true, message: "Đổi mật khẩu thành công." });
  } catch (err: any) {
    res
      .status(400)
      .json({ success: false, message: err.message || "Lỗi đổi mật khẩu." });
  }
};



