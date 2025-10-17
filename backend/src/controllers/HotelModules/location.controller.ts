import { Request, Response } from "express";
import { searchLocations } from "../../services/HotelModules/location.service";

export const getLocationController = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const limit = parseInt(req.query.limit as string) || 8;

    const result = await searchLocations(q.trim(), limit);

    if (result.items.length > 0) {
      return res.status(200).json({
        success: true,
        message: result.message || "Tìm thấy dữ liệu phù hợp.",
        count: result.items.length,
        items: result.items,
      });
    }

    // Khi không có kết quả
    return res.status(200).json({
      success: false,
      message: result.message || "Không tìm thấy dữ liệu phù hợp.",
      items: [],
    });
  } catch (error) {
    console.error("❌ Lỗi API /api/locations:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi tìm kiếm địa điểm" });
  }
};
