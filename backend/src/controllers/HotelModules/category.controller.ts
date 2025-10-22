import { Request, Response } from "express";
import { CategoryService } from "../../services/HotelModules/category.service";

const categoryService = new CategoryService();


export const getAllCategoriesController = async(req: Request, res: Response) => {
    try {
    const result = await categoryService.getAllCategories();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi API /api/categories:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy danh sách loại hình." });
  }
}