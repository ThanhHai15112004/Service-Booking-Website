import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getDashboardStats,
  getAllPromotions,
  getPromotionDetail,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotionStatus,
  applyPromotionToSchedules,
  getPromotionReports,
  getPromotionActivityLogs,
  getApplicableHotels,
  getApplicableRooms,
} from "../../../controllers/Admin/PromotionManager/adminPromotion.controller";

const router = Router();

// Tất cả routes đều yêu cầu admin authentication
router.use(authenticateJWT);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", asyncHandler(getDashboardStats));

// Reports (phải đặt trước /:promotionId)
router.get("/reports", asyncHandler(getPromotionReports));

// Activity logs (phải đặt trước /:promotionId)
router.get("/activity-logs", asyncHandler(getPromotionActivityLogs));

// Applicable data (phải đặt trước /:promotionId)
router.get("/applicable-hotels", asyncHandler(getApplicableHotels));
router.get("/applicable-rooms", asyncHandler(getApplicableRooms));

// Promotions List (phải đặt trước /:promotionId)
router.get("/list", asyncHandler(getAllPromotions));

// Promotion Detail (route có parameter phải đặt SAU các routes cụ thể)
router.get("/:promotionId", asyncHandler(getPromotionDetail));

// Promotion Actions
router.post("/create", asyncHandler(createPromotion));
router.put("/:promotionId", asyncHandler(updatePromotion));
router.delete("/:promotionId", asyncHandler(deletePromotion));
router.put("/:promotionId/toggle-status", asyncHandler(togglePromotionStatus));
router.post("/:promotionId/apply-to-schedules", asyncHandler(applyPromotionToSchedules));

export default router;

