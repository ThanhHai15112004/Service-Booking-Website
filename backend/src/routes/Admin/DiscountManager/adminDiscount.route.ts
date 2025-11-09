import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getDashboardStats,
  getAllDiscountCodes,
  getDiscountCodeDetail,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  toggleDiscountCodeStatus,
  extendDiscountCodeExpiry,
  getDiscountUsageAnalytics,
  getDiscountReports,
  getDiscountUsers,
  getApplicableHotels,
  getApplicableCategories,
  exportDiscountReport,
} from "../../../controllers/Admin/DiscountManager/adminDiscount.controller";

const router = Router();

// Tất cả routes đều yêu cầu admin authentication
router.use(authenticateJWT);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", asyncHandler(getDashboardStats));

// Usage Analytics (phải đặt trước /:discountId)
router.get("/usage-analytics", asyncHandler(getDiscountUsageAnalytics));

// Reports (phải đặt trước /:discountId)
router.get("/reports", asyncHandler(getDiscountReports));

// Users (phải đặt trước /:discountId)
router.get("/users", asyncHandler(getDiscountUsers));

// Applicable data (phải đặt trước /:discountId)
router.get("/applicable-hotels", asyncHandler(getApplicableHotels));
router.get("/applicable-categories", asyncHandler(getApplicableCategories));

// Export (phải đặt trước /:discountId)
router.post("/export-report", asyncHandler(exportDiscountReport));

// Discount Codes List (phải đặt trước /:discountId)
router.get("/list", asyncHandler(getAllDiscountCodes));

// Discount Code Detail (route có parameter phải đặt SAU các routes cụ thể)
router.get("/:discountId", asyncHandler(getDiscountCodeDetail));

// Discount Code Actions
router.post("/create", asyncHandler(createDiscountCode));
router.put("/:discountId", asyncHandler(updateDiscountCode));
router.delete("/:discountId", asyncHandler(deleteDiscountCode));
router.put("/:discountId/toggle-status", asyncHandler(toggleDiscountCodeStatus));
router.put("/:discountId/extend", asyncHandler(extendDiscountCodeExpiry));

export default router;
