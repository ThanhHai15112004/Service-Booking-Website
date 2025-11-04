import { Request, Response } from "express";
import { PromotionService } from "../../services/Promotion/promotion.service";
import { CreatePromotionData } from "../../Repository/Promotion/promotion.repository";

const promotionService = new PromotionService();

// ✅ Tạo promotion mới
export const createPromotion = async (req: Request, res: Response) => {
  try {
    const accountId = (req as any).user?.account_id;
    const role = (req as any).user?.role;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    // Chỉ ADMIN mới được tạo promotion (ADMIN có quyền tạo tất cả loại promotion)
    // STAFF có thể được thêm quyền sau nếu cần
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Chỉ ADMIN mới có quyền tạo promotion"
      });
    }

    const data: CreatePromotionData = req.body;
    const result = await promotionService.createPromotion(data, accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[PromotionController] createPromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo promotion"
    });
  }
};

// ✅ Lấy danh sách promotions
export const getPromotions = async (req: Request, res: Response) => {
  try {
    const filters = {
      type: req.query.type as 'PROVIDER' | 'SYSTEM' | 'BOTH' | undefined,
      status: req.query.status as 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | undefined,
      created_by: req.query.created_by as string | undefined,
      start_date: req.query.start_date as string | undefined,
      end_date: req.query.end_date as string | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await promotionService.getPromotions(filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PromotionController] getPromotions error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách promotion"
    });
  }
};

// ✅ Lấy promotion theo ID
export const getPromotionById = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;
    const result = await promotionService.getPromotionById(promotionId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PromotionController] getPromotionById error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin promotion"
    });
  }
};

// ✅ Cập nhật promotion
export const updatePromotion = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;
    const accountId = (req as any).user?.account_id;
    const role = (req as any).user?.role;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    // Chỉ ADMIN mới được cập nhật promotion
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Chỉ ADMIN mới có quyền cập nhật promotion"
      });
    }

    const data: Partial<CreatePromotionData> = req.body;
    const result = await promotionService.updatePromotion(promotionId, data, accountId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PromotionController] updatePromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật promotion"
    });
  }
};

// ✅ Xóa promotion
export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;
    const accountId = (req as any).user?.account_id;
    const role = (req as any).user?.role;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    // Chỉ ADMIN mới được xóa promotion
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Chỉ ADMIN mới có quyền xóa promotion"
      });
    }

    const result = await promotionService.deletePromotion(promotionId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PromotionController] deletePromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa promotion"
    });
  }
};

// ✅ Áp dụng promotion vào schedules
export const applyPromotion = async (req: Request, res: Response) => {
  try {
    const { promotionId } = req.params;
    const accountId = (req as any).user?.account_id;
    const role = (req as any).user?.role;

    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }

    // Chỉ ADMIN mới được áp dụng promotion vào schedules
    if (role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: "Chỉ ADMIN mới có quyền áp dụng promotion"
      });
    }

    const result = await promotionService.applyPromotionToSchedules(promotionId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[PromotionController] applyPromotion error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi áp dụng promotion"
    });
  }
};

