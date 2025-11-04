import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAccountAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../../controllers/Admin/AccountManager/address.controller";

const router = Router();

router.use(authenticateJWT);

router.get("/:accountId/addresses", requireAdmin, asyncHandler(getAccountAddresses));
router.post("/:accountId/addresses", requireAdmin, asyncHandler(createAddress));
router.put("/:accountId/addresses/:addressId", requireAdmin, asyncHandler(updateAddress));
router.delete("/:accountId/addresses/:addressId", requireAdmin, asyncHandler(deleteAddress));
router.post("/:accountId/addresses/:addressId/set-default", requireAdmin, asyncHandler(setDefaultAddress));

export default router;

