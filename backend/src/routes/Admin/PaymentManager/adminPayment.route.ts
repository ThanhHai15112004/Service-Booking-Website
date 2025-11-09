import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getDashboardStats,
  getAllPayments,
  getPaymentDetail,
  updatePaymentStatus,
  retryPayment,
  confirmManualPayment,
  getFailedPayments,
  getManualPayments,
  getPaymentReports,
  getRefunds,
  createRefund,
  getPaymentActivityLogs,
  exportInvoice,
} from "../../../controllers/Admin/PaymentManager/adminPayment.controller";

const router = Router();

// Tất cả routes đều yêu cầu admin authentication
router.use(authenticateJWT);
router.use(requireAdmin);

// IMPORTANT: Đặt các routes cụ thể TRƯỚC route có parameter :paymentId
// để tránh conflict (/:paymentId sẽ match bất kỳ string nào)

// Dashboard
router.get("/dashboard", asyncHandler(getDashboardStats));

// Reports (phải đặt trước /:paymentId)
router.get("/reports", asyncHandler(getPaymentReports));

// Activity Logs (phải đặt trước /:paymentId)
router.get("/activity-logs", asyncHandler(getPaymentActivityLogs));

// Payments List (phải đặt trước /:paymentId)
router.get("/list", asyncHandler(getAllPayments));
router.get("/failed/list", asyncHandler(getFailedPayments));
router.get("/manual/list", asyncHandler(getManualPayments));

// Refunds (phải đặt trước /:paymentId)
router.get("/refunds/list", asyncHandler(getRefunds));

// Payment Detail (route có parameter phải đặt SAU các routes cụ thể)
router.get("/:paymentId", asyncHandler(getPaymentDetail));

// Payment Actions
router.put("/:paymentId/status", asyncHandler(updatePaymentStatus));
router.post("/:paymentId/retry", asyncHandler(retryPayment));
router.post("/:paymentId/confirm-manual", asyncHandler(confirmManualPayment));
router.post("/:paymentId/refund", asyncHandler(createRefund));

// Export
router.post("/:paymentId/export-invoice", asyncHandler(exportInvoice));

export default router;

