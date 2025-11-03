import { Request, Response } from "express";
import { SettingsService } from "../../services/Profile/settings.service";

const settingsService = new SettingsService();

export const getSettings = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const settings = await settingsService.getSettings(accountId);
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy cài đặt.",
    });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const settings = await settingsService.updateSettings(accountId, req.body);
    res.json({ success: true, data: settings, message: "Cập nhật cài đặt thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi cập nhật cài đặt.",
    });
  }
};


