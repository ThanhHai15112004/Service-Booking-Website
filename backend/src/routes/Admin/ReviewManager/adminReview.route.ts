import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getDashboardStats,
  getReviews,
  getReviewDetail,
  updateReviewStatus,
  deleteReview,
  createReply,
  getReviewActivityLog,
  getReviewReports,
  getAllActivityLogs
} from "../../../controllers/Admin/ReviewManager/adminReview.controller";

const router = Router();

// All routes require admin authentication
router.use(authenticateJWT);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", asyncHandler(getDashboardStats));

// List reviews
router.get("/", asyncHandler(getReviews));

// Review detail
router.get("/:reviewId", asyncHandler(getReviewDetail));

// Update review status (hide/show)
router.put("/:reviewId/status", asyncHandler(updateReviewStatus));

// Delete review
router.delete("/:reviewId", asyncHandler(deleteReview));

// Create/Update reply
router.post("/:reviewId/reply", asyncHandler(createReply));

// Get review activity log
router.get("/:reviewId/activity-log", asyncHandler(getReviewActivityLog));

// Reports
router.get("/reports/stats", asyncHandler(getReviewReports));

// All activity logs
router.get("/activity-logs/all", asyncHandler(getAllActivityLogs));

export default router;

