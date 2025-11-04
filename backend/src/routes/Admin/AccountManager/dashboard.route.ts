import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import { getDashboardStats } from "../../../controllers/Admin/AccountManager/dashboard.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/stats", requireAdmin, asyncHandler(getDashboardStats));

export default router;

