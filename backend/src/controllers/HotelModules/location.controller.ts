import { Request, Response } from "express";
import { LocationService } from "../../services/HotelModules/location.service";

const locationService = new LocationService();

export const getLocationController = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = parseInt(String(req.query.limit || "8"), 10);

    const result = await locationService.search(q, limit);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      count: result.items.length,
      items: result.items,
    });
  } catch (error) {
    console.error("❌ Lỗi API /api/locations:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm địa điểm.",
      items: [],
    });
  }
};
