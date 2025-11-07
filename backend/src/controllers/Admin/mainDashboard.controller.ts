import { Request, Response } from "express";
import { MainDashboardService } from "../../services/Admin/mainDashboard.service";

const dashboardService = new MainDashboardService();

export const getMainDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await dashboardService.getMainDashboardStats();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy dashboard stats",
    });
  }
};

