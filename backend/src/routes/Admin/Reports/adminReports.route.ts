import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getBookingReports,
  getRevenueReports,
  getOccupancyReports,
  getCustomerInsights,
  getPackageReports,
  getStaffReports,
} from "../../../controllers/Admin/Reports/adminReports.controller";

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);

router.get("/bookings", asyncHandler(getBookingReports));
router.get("/revenue", asyncHandler(getRevenueReports));
router.get("/occupancy", asyncHandler(getOccupancyReports));
router.get("/customers", asyncHandler(getCustomerInsights));
router.get("/packages", asyncHandler(getPackageReports));
router.get("/staff", asyncHandler(getStaffReports));

export default router;

