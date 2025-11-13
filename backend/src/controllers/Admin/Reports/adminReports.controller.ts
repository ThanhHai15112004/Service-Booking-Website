import { Request, Response } from "express";
import { AdminReportsService } from "../../../services/Admin/Reports/adminReports.service";

const reportsService = new AdminReportsService();

export const getBookingReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, hotel_id, city, status } = req.query;
    const result = await reportsService.getBookingReports({
      startDate: startDate as string,
      endDate: endDate as string,
      hotel_id: hotel_id as string,
      city: city as string,
      status: status as string,
    });
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error("[AdminReportsController] getBookingReports error:", error);
    console.error("[AdminReportsController] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy báo cáo booking",
    });
  }
};

export const getRevenueReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, hotel_id, paymentMethod, viewType } = req.query;
    const result = await reportsService.getRevenueReports({
      startDate: startDate as string,
      endDate: endDate as string,
      hotel_id: hotel_id as string,
      paymentMethod: paymentMethod as string,
      viewType: viewType as "daily" | "weekly" | "monthly" | "yearly",
    });
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy báo cáo doanh thu",
    });
  }
};

export const getOccupancyReports = async (req: Request, res: Response) => {
  try {
    const { month, city, category, year } = req.query;
    const result = await reportsService.getOccupancyReports({
      month: month as string,
      city: city as string,
      category: category as string,
      year: year as string,
    });
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    console.error("[AdminReportsController] getOccupancyReports error:", error);
    console.error("[AdminReportsController] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy báo cáo tỷ lệ lấp đầy",
    });
  }
};

export const getCustomerInsights = async (req: Request, res: Response) => {
  try {
    const result = await reportsService.getCustomerInsights();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy thông tin khách hàng",
    });
  }
};

export const getPackageReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, package: packageName } = req.query;
    const result = await reportsService.getPackageReports({
      startDate: startDate as string,
      endDate: endDate as string,
      package: packageName as string,
    });
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy báo cáo gói tài khoản",
    });
  }
};

export const getStaffReports = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, staff, actionType } = req.query;
    const result = await reportsService.getStaffReports({
      startDate: startDate as string,
      endDate: endDate as string,
      staff: staff as string,
      actionType: actionType as string,
    });
    res.status(result.success ? 200 : 500).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy báo cáo nhân viên",
    });
  }
};

