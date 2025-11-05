import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../controllers/Admin/CategoryManager/category.controller";

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get("/", asyncHandler(getCategories));
router.get("/:categoryId", asyncHandler(getCategoryById));
router.post("/", asyncHandler(createCategory));
router.put("/:categoryId", asyncHandler(updateCategory));
router.delete("/:categoryId", asyncHandler(deleteCategory));

export default router;

