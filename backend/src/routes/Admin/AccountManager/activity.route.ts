import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAccountActivityStats,
  getAccountActivityChart,
  getAccountActivityHistory,
} from "../../../controllers/Admin/AccountManager/activity.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/:accountId/activity/stats", requireAdmin, asyncHandler(getAccountActivityStats));
router.get("/:accountId/activity/chart", requireAdmin, asyncHandler(getAccountActivityChart));
router.get("/:accountId/activity/history", requireAdmin, asyncHandler(getAccountActivityHistory));

export default router;

