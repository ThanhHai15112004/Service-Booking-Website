// controllers/Hotel/hotel.controller.ts

import { Request, Response } from "express";
import { HotelService } from "../../services/Hotel/hotel.service";

const hotelService = new HotelService();

export const searchHotelsController = async (req: Request, res: Response) => {
  try {
    const result = await hotelService.searchHotels(req.query);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Hotel Search Error:', error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};

export const getHotelDetailController = async (req: Request, res: Response) => {
  try {
    const result = await hotelService.getHotelDetail(req.params.hotelId, req.query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Hotel Detail Error:', error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};