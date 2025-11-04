import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAccountPackages,
  getAccountSubscriptions,
  getAccountPaymentCards,
  getAccountPayments,
} from "../../../controllers/Admin/AccountManager/package.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/:accountId/packages", requireAdmin, asyncHandler(getAccountPackages));
router.get("/:accountId/subscriptions", requireAdmin, asyncHandler(getAccountSubscriptions));
router.get("/:accountId/payment-cards", requireAdmin, asyncHandler(getAccountPaymentCards));
router.get("/:accountId/payments", requireAdmin, asyncHandler(getAccountPayments));

export default router;

