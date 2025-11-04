import { Request, Response } from "express";
import { AdminAccountActivityService } from "../../../services/Admin/AccountManager/accountActivity.service";

const activityService = new AdminAccountActivityService();

export const getAccountActivityStats = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await activityService.getAccountActivityStats(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy thống kê hoạt động",
    });
  }
};

export const getAccountActivityChart = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { period } = req.query;
    const result = await activityService.getAccountActivityChart(
      accountId,
      (period as "7" | "30" | "90") || "30"
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy biểu đồ hoạt động",
    });
  }
};

export const getAccountActivityHistory = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { type, dateFrom, dateTo, page, limit } = req.query;
    const result = await activityService.getAccountActivityHistory(accountId, {
      type: type as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy lịch sử hoạt động",
    });
  }
};

