import { Request, Response } from "express";
import { AdminCategoryService } from "../../../services/Admin/adminCategory.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const categoryService = new AdminCategoryService();

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.status(200).json({
    success: true,
    data: categories,
  });
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const category = await categoryService.getCategoryById(categoryId);
  res.status(200).json({
    success: true,
    data: category,
  });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo danh mục thành công",
    data: category,
  });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const category = await categoryService.updateCategory(categoryId, req.body);
  res.status(200).json({
    success: true,
    message: "Cập nhật danh mục thành công",
    data: category,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  await categoryService.deleteCategory(categoryId);
  res.status(200).json({
    success: true,
    message: "Xóa danh mục thành công",
  });
});

