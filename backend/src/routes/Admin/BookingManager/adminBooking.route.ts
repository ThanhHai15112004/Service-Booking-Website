import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAllBookings,
  getBookingDetail,
  updateBookingStatus,
  updateBooking,
  addInternalNote,
  getDashboardStats,
  getReportStats,
  getPayments,
  getDiscountUsage,
  getActivityLogs,
  createManualBooking,
  sendConfirmationEmail,
  updatePaymentStatus,
} from "../../../controllers/Admin/BookingManager/adminBooking.controller";

const router = Router();

// Tất cả routes đều yêu cầu admin authentication
router.use(authenticateJWT);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard", asyncHandler(getDashboardStats));

// Reports
router.get("/reports", asyncHandler(getReportStats));

// Bookings
router.get("/", asyncHandler(getAllBookings));
router.post("/", asyncHandler(createManualBooking));
router.get("/:bookingId", asyncHandler(getBookingDetail));
router.put("/:bookingId", asyncHandler(updateBooking));
router.put("/:bookingId/status", asyncHandler(updateBookingStatus));
router.post("/:bookingId/notes", asyncHandler(addInternalNote));
router.post("/:bookingId/send-email", asyncHandler(sendConfirmationEmail));

// Payments
router.get("/payments/list", asyncHandler(getPayments));
router.put("/payments/:paymentId/status", asyncHandler(updatePaymentStatus));

// Discounts
router.get("/discounts/list", asyncHandler(getDiscountUsage));

// Activity Logs
router.get("/activity/list", asyncHandler(getActivityLogs));

export default router;

