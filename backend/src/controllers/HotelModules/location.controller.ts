import { Request, Response } from "express";
import { LocationService } from "../../services/Hotel/location.service";

const locationService = new LocationService();

export const getLocationController = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    const limit = parseInt(String(req.query.limit || "8"), 10);

    const result = await locationService.searchLocations(q, limit);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      count: result.items.length,
      items: result.items,
    });
  } catch (error: any) {
    console.error("[LocationController] getLocation error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tìm kiếm địa điểm.",
      items: [],
    });
  }
};

export const getHotelCountsController = async (req: Request, res: Response) => {
  try {
    const country = String(req.query.country || "Vietnam");
    const city = req.query.city ? String(req.query.city) : undefined;

    const result = await locationService.getHotelCounts(country, city);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[LocationController] getHotelCounts error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi đếm khách sạn.",
      data: { countryCount: 0, cityCount: 0 }
    });
  }
};
