import { Request, Response } from "express";
import { BedTypeService } from "../../services/Hotel/bedType.service";

const bedTypeService = new BedTypeService();

export const getAllBedTypesController = async (req: Request, res: Response) => {
  try {
    const result = await bedTypeService.getAllBedTypes();
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Lỗi API /api/bed-types:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách loại giường.",
      items: [],
    });
  }
};
