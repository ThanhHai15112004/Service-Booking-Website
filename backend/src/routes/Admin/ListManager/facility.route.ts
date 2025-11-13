import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAllFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
} from "../../../controllers/Admin/ListManager/facility.controller";

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get("/", asyncHandler(getAllFacilities));
router.get("/:facilityId", asyncHandler(getFacilityById));
router.post("/", asyncHandler(createFacility));
router.put("/:facilityId", asyncHandler(updateFacility));
router.delete("/:facilityId", asyncHandler(deleteFacility));

export default router;

