import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getAllHighlights,
  getHighlightById,
  createHighlight,
  updateHighlight,
  deleteHighlight,
} from "../../../controllers/Admin/ListManager/highlight.controller";

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get("/", asyncHandler(getAllHighlights));
router.get("/:highlightId", asyncHandler(getHighlightById));
router.post("/", asyncHandler(createHighlight));
router.put("/:highlightId", asyncHandler(updateHighlight));
router.delete("/:highlightId", asyncHandler(deleteHighlight));

export default router;

