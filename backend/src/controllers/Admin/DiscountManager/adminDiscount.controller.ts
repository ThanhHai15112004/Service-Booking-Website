import { Request, Response } from "express";
import { AdminDiscountService } from "../../../services/Admin/adminDiscount.service";

const adminDiscountService = new AdminDiscountService();

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await adminDiscountService.getDashboardStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getDashboardStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dashboard stats",
    });
  }
};

// Get all discount codes
export const getAllDiscountCodes = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      status,
      discountType,
      expiryDate,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const result = await adminDiscountService.getAllDiscountCodes({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      status: status as string,
      discountType: discountType as string,
      expiryDate: expiryDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "ASC" | "DESC",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getAllDiscountCodes error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách mã giảm giá",
    });
  }
};

// Get discount code detail
export const getDiscountCodeDetail = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;

    const result = await adminDiscountService.getDiscountCodeDetail(discountId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getDiscountCodeDetail error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết mã giảm giá",
    });
  }
};

// Create discount code
export const createDiscountCode = async (req: Request, res: Response) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      max_discount,
      min_purchase,
      usage_limit,
      per_user_limit,
      start_date,
      expiry_date,
      min_nights,
      max_nights,
      applicable_hotels,
      applicable_categories,
      status,
    } = req.body;

    const result = await adminDiscountService.createDiscountCode({
      code,
      discount_type,
      discount_value,
      max_discount,
      min_purchase,
      usage_limit,
      per_user_limit,
      start_date,
      expiry_date,
      min_nights,
      max_nights,
      applicable_hotels,
      applicable_categories,
      status: status || "ACTIVE",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] createDiscountCode error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo mã giảm giá",
    });
  }
};

// Update discount code
export const updateDiscountCode = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;
    const updateData = req.body;

    const result = await adminDiscountService.updateDiscountCode(discountId, updateData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] updateDiscountCode error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật mã giảm giá",
    });
  }
};

// Delete discount code
export const deleteDiscountCode = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;

    const result = await adminDiscountService.deleteDiscountCode(discountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] deleteDiscountCode error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa mã giảm giá",
    });
  }
};

// Toggle discount code status
export const toggleDiscountCodeStatus = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;

    const result = await adminDiscountService.toggleDiscountCodeStatus(discountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] toggleDiscountCodeStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thay đổi trạng thái mã giảm giá",
    });
  }
};

// Extend discount code expiry
export const extendDiscountCodeExpiry = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;
    const { days } = req.body;

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số ngày gia hạn phải lớn hơn 0",
      });
    }

    const result = await adminDiscountService.extendDiscountCodeExpiry(discountId, days);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] extendDiscountCodeExpiry error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi gia hạn mã giảm giá",
    });
  }
};

// Get discount usage analytics
export const getDiscountUsageAnalytics = async (req: Request, res: Response) => {
  try {
    const { period, startDate, endDate } = req.query;

    const result = await adminDiscountService.getDiscountUsageAnalytics({
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getDiscountUsageAnalytics error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thống kê sử dụng mã",
    });
  }
};

// Get discount reports
export const getDiscountReports = async (req: Request, res: Response) => {
  try {
    const { period, startDate, endDate, groupBy } = req.query;

    const result = await adminDiscountService.getDiscountReports({
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string,
      groupBy: groupBy as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getDiscountReports error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy báo cáo mã giảm giá",
    });
  }
};

// Get discount users
export const getDiscountUsers = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      discountCode,
      customerEmail,
      dateFrom,
      dateTo,
      bookingStatus,
    } = req.query;

    const result = await adminDiscountService.getDiscountUsers({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      discountCode: discountCode as string,
      customerEmail: customerEmail as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      bookingStatus: bookingStatus as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getDiscountUsers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách người dùng",
    });
  }
};

// Get applicable hotels
export const getApplicableHotels = async (req: Request, res: Response) => {
  try {
    const result = await adminDiscountService.getApplicableHotels();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getApplicableHotels error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách khách sạn",
    });
  }
};

// Get applicable categories
export const getApplicableCategories = async (req: Request, res: Response) => {
  try {
    const result = await adminDiscountService.getApplicableCategories();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] getApplicableCategories error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách category",
    });
  }
};

// Export discount report
export const exportDiscountReport = async (req: Request, res: Response) => {
  try {
    const { format, period, startDate, endDate, groupBy } = req.body;

    if (!format || !["CSV", "EXCEL", "PDF"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Format phải là CSV, EXCEL hoặc PDF",
      });
    }

    const result = await adminDiscountService.exportDiscountReport({
      format,
      period,
      startDate,
      endDate,
      groupBy,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // If CSV, send file directly
    if (format === "CSV" && result.data?.content) {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.data.filename}"`
      );
      res.send(Buffer.from(result.data.content, "base64"));
      return;
    }

    // For EXCEL and PDF, return JSON data
    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminDiscountController] exportDiscountReport error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xuất báo cáo",
    });
  }
};
