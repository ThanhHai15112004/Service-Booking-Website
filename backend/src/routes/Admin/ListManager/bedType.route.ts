import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAllBedTypes,
  getBedTypeById,
  createBedType,
  updateBedType,
  deleteBedType,
} from "../../../controllers/Admin/ListManager/bedType.controller";

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get("/", asyncHandler(getAllBedTypes));
router.get("/:bedTypeKey", asyncHandler(getBedTypeById));
router.post("/", asyncHandler(createBedType));
router.put("/:bedTypeKey", asyncHandler(updateBedType));
router.delete("/:bedTypeKey", asyncHandler(deleteBedType));

export default router;

