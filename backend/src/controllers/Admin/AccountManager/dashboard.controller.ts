import { Request, Response } from "express";
import { AdminDashboardService } from "../../../services/Admin/AccountManager/dashboard.service";

const dashboardService = new AdminDashboardService();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await dashboardService.getDashboardStats();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy dashboard stats",
    });
  }
};

