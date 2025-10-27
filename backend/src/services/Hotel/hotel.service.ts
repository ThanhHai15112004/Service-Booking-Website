// services/Hotel/hotel.service.ts

import { HotelSearchRepository } from "../../Repository/Hotel/hotel.repository";
import { HotelSearchResult } from "../../models/Hotel/hotel.model";
import { HotelSearchValidator } from "../../utils/hotelSearch.validator";

export class HotelService {
  private repository = new HotelSearchRepository();

  // Tìm kiếm khách sạn
  async searchHotels(params: any): Promise<{
    success: boolean;
    data?: HotelSearchResult[];
    message?: string;
  }> {
    // Validate
    const validation = HotelSearchValidator.validate(params);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Search
    try {
      const results = await this.repository.search(validation.data!);
      return { success: true, data: results };
    } catch (error: any) {
      console.error("❌ Hotel search error:", error);
      return { success: false, message: "Lỗi khi tìm kiếm khách sạn" };
    }
  }
}