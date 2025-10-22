import { Request, Response } from "express";
import { HotelService } from "../../services/Hotel/Hotel.service";

const hotelService = new HotelService();

export const searchHotelsController = async (req: Request, res: Response) => {
  try {
    const params = req.query as any;
    const result = await hotelService.searchWithFilters(params);
    res.status(200).json(result);
  } catch (err: any) {
    console.error("❌ Error searchHotels:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi tìm kiếm khách sạn.",
    });
  }
};
