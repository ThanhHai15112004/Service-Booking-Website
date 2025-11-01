import { Request, Response } from "express";
import { BedTypeService } from "../../services/Hotel/bedType.service";

const bedTypeService = new BedTypeService();

// Hàm lấy tất cả bed types
export const getAllBedTypesController = async (req: Request, res: Response) => {
  try {
    const result = await bedTypeService.getAllBedTypes();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[BedTypeController] getAllBedTypes error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách loại giường.",
      items: [],
    });
  }
};
