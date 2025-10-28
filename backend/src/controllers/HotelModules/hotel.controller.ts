// controllers/Hotel/hotel.controller.ts

import { Request, Response } from "express";
import { HotelService } from "../../services/Hotel/hotel.service";

const hotelService = new HotelService();

export const searchHotelsController = async (req: Request, res: Response) => {
  try {
    console.log('\n🔍 === HOTEL SEARCH REQUEST ===');
    console.log('📥 Query params:', req.query);
    
    const result = await hotelService.searchHotels(req.query);
    
    if (!result.success) {
      console.log('❌ Search failed:', result.message);
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    console.log(`✅ Search success: ${result.data?.length || 0} hotels found`);
    
    res.status(200).json({
      success: true,
      data: result.data,
      count: result.data?.length || 0
    });
  } catch (error: any) {
    console.error("❌ Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server"
    });
  }
};