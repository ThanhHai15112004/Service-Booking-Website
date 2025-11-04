import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAccountBookings,
} from "../../../controllers/Admin/AccountManager/booking.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/:accountId/bookings", requireAdmin, asyncHandler(getAccountBookings));

export default router;

