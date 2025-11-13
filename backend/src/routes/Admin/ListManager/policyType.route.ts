import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAllPolicyTypes,
  getPolicyTypeById,
  createPolicyType,
  updatePolicyType,
  deletePolicyType,
} from "../../../controllers/Admin/ListManager/policyType.controller";

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get("/", asyncHandler(getAllPolicyTypes));
router.get("/:policyKey", asyncHandler(getPolicyTypeById));
router.post("/", asyncHandler(createPolicyType));
router.put("/:policyKey", asyncHandler(updatePolicyType));
router.delete("/:policyKey", asyncHandler(deletePolicyType));

export default router;

