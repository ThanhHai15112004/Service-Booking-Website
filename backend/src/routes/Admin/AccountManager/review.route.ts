import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAccountReviews,
} from "../../../controllers/Admin/AccountManager/review.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/:accountId/reviews", requireAdmin, asyncHandler(getAccountReviews));

export default router;

