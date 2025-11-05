import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../../controllers/Admin/CategoryManager/location.controller";

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get("/", asyncHandler(getLocations));
router.get("/:locationId", asyncHandler(getLocationById));
router.post("/", asyncHandler(createLocation));
router.put("/:locationId", asyncHandler(updateLocation));
router.delete("/:locationId", asyncHandler(deleteLocation));

export default router;

