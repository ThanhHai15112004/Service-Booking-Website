import { Router } from "express";
import {
  createPromotion,
  getPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  applyPromotion
} from "../../controllers/Promotion/promotion.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

// ✅ Tạo promotion (yêu cầu đăng nhập và ADMIN)
router.post("/", authenticateJWT, createPromotion);

// ✅ Lấy danh sách promotions (không cần đăng nhập)
router.get("/", getPromotions);

// ✅ Lấy promotion theo ID (không cần đăng nhập)
router.get("/:promotionId", getPromotionById);

// ✅ Cập nhật promotion (yêu cầu đăng nhập và ADMIN)
router.put("/:promotionId", authenticateJWT, updatePromotion);

// ✅ Xóa promotion (yêu cầu đăng nhập và ADMIN)
router.delete("/:promotionId", authenticateJWT, deletePromotion);

// ✅ Áp dụng promotion vào schedules (yêu cầu đăng nhập và ADMIN)
router.post("/:promotionId/apply", authenticateJWT, applyPromotion);

export default router;

