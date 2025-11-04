import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAccounts,
  getAccountDetail,
  updateAccount,
  deleteAccount,
  forceVerifyEmail,
  resetPassword,
  createAdminAccount,
  createUserAccount,
} from "../../../controllers/Admin/AccountManager/account.controller";

const router = Router();

router.use(authenticateJWT);

router.post("/create", requireAdmin, asyncHandler(createAdminAccount));
router.get("/", requireAdmin, asyncHandler(getAccounts));
router.get("/:accountId", requireAdmin, asyncHandler(getAccountDetail));
router.put("/:accountId", requireAdmin, asyncHandler(updateAccount));
router.delete("/:accountId", requireAdmin, asyncHandler(deleteAccount));
router.post("/:accountId/verify", requireAdmin, asyncHandler(forceVerifyEmail));
router.post("/:accountId/reset-password", requireAdmin, asyncHandler(resetPassword));
router.post("/user/create", requireAdmin, asyncHandler(createUserAccount));

export default router;

