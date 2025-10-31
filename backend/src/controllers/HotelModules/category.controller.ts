import { Request, Response } from "express";
import { CategoryService } from "../../services/Hotel/category.service";

const categoryService = new CategoryService();


export const getAllCategoriesController = async(req: Request, res: Response) => {
    try {
    const result = await categoryService.getAllCategories();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[CategoryController] getAllCategories error:", error.message || error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy danh sách loại hình." });
  }
}