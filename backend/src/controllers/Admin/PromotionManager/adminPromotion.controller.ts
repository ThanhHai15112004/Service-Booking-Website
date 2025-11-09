import { Request, Response } from "express";
import { AdminPromotionService } from "../../../services/Admin/adminPromotion.service";
import { CreatePromotionData } from "../../../Repository/Promotion/promotion.repository";

const adminPromotionService = new AdminPromotionService();

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await adminPromotionService.getDashboardStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getDashboardStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dashboard stats",
    });
  }
};

// Get all promotions
export const getAllPromotions = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      status,
      type,
      discountType,
      startDate,
      endDate,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const result = await adminPromotionService.getAllPromotions({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      status: status as string,
      type: type as string,
      discountType: discountType as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "ASC" | "DESC",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getAllPromotions error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách promotion",
    });
  }
};

// Get promotion detail
export const getPromotionDetail = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;

    const result = await adminPromotionService.getPromotionDetail(promotionId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getPromotionDetail error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết promotion",
    });
  }
};

// Create promotion
export const createPromotion = async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).user?.account_id;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const data: CreatePromotionData = req.body;

    const result = await adminPromotionService.createPromotion(data, accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] createPromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo promotion",
    });
  }
};

// Update promotion
export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;
    const data: Partial<CreatePromotionData> = req.body;

    const result = await adminPromotionService.updatePromotion(promotionId, data);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] updatePromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật promotion",
    });
  }
};

// Delete promotion
export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;

    const result = await adminPromotionService.deletePromotion(promotionId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] deletePromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa promotion",
    });
  }
};

// Toggle promotion status
export const togglePromotionStatus = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;

    const result = await adminPromotionService.togglePromotionStatus(promotionId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] togglePromotionStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thay đổi trạng thái promotion",
    });
  }
};

// Apply promotion to schedules
export const applyPromotionToSchedules = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;

    if (!promotionId) {
      return res.status(400).json({
        success: false,
        message: "promotionId là bắt buộc",
      });
    }

    console.log(`[AdminPromotionController] Applying promotion ${promotionId} to schedules`);
    const result = await adminPromotionService.applyPromotionToSchedules(promotionId);

    if (!result.success) {
      console.error(`[AdminPromotionController] Failed to apply promotion ${promotionId}:`, result.message);
      return res.status(400).json(result);
    }

    const affectedSchedules = (result as any).affectedSchedules || 0;
    console.log(`[AdminPromotionController] Successfully applied promotion ${promotionId} to ${affectedSchedules} schedules`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] applyPromotionToSchedules error:", error.message);
    console.error("[AdminPromotionController] applyPromotionToSchedules error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi áp dụng promotion vào schedules",
    });
  }
};

// Get promotion reports
export const getPromotionReports = async (req: Request, res: Response) => {
  try {
    const { period, startDate, endDate, type } = req.query;

    const result = await adminPromotionService.getPromotionReports({
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string,
      type: type as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getPromotionReports error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy báo cáo promotion",
    });
  }
};

// Get promotion activity logs
export const getPromotionActivityLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      promotionId,
      adminId,
      action,
      startDate,
      endDate,
    } = req.query;

    const result = await adminPromotionService.getPromotionActivityLogs({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      promotionId: promotionId as string,
      adminId: adminId as string,
      action: action as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getPromotionActivityLogs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy activity logs",
    });
  }
};

// Get applicable hotels
export const getApplicableHotels = async (req: Request, res: Response) => {
  try {
    const result = await adminPromotionService.getApplicableHotels();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getApplicableHotels error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách khách sạn",
    });
  }
};

// Get applicable rooms
export const getApplicableRooms = async (req: Request, res: Response) => {
  try {
    const { hotelIds } = req.query;

    let hotelIdsArray: string[] | undefined;
    if (hotelIds) {
      if (typeof hotelIds === 'string') {
        hotelIdsArray = hotelIds.split(',').filter(id => id.trim());
      } else if (Array.isArray(hotelIds)) {
        hotelIdsArray = hotelIds as string[];
      }
    }

    const result = await adminPromotionService.getApplicableRooms(hotelIdsArray);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPromotionController] getApplicableRooms error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng",
    });
  }
};

