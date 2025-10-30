import { LocationRepository } from "../../Repository/Hotel/location.repository";

export class LocationService {
  private repo = new LocationRepository();

  async searchLocations(q: string, limit: number = 10) {
    try {
      const lowerQ = q.toLowerCase().trim();

      if (!lowerQ || lowerQ.length < 2) {
        return {
          success: false,
          message: "Từ khóa tìm kiếm phải có ít nhất 2 ký tự",
          items: [],
        };
      }

      const items = await this.repo.search(lowerQ, limit);

      return {
        success: true,
        message: `Tìm thấy ${items.length} địa điểm`,
        count: items.length,
        items,
      };
    } catch (error) {
      console.error("❌ [LocationService] searchLocations error:", error);
      return {
        success: false,
        message: "Lỗi server khi tìm kiếm địa điểm",
        items: [],
      };
    }
  }

  async getHotLocations(limit: number = 10) {
    try {
      const items = await this.repo.getHotLocations(limit);

      return {
        success: true,
        message: `Tìm thấy ${items.length} địa điểm nổi bật`,
        count: items.length,
        items,
      };
    } catch (error) {
      console.error("❌ [LocationService] getHotLocations error:", error);
      return {
        success: false,
        message: "Lỗi server khi lấy địa điểm nổi bật",
        items: [],
      };
    }
  }

  async getHotelCounts(country: string, city?: string) {
    try {
      const data = await this.repo.getHotelCounts(country, city);

      return {
        success: true,
        data,
        message: "Lấy số lượng khách sạn thành công"
      };
    } catch (error) {
      console.error("❌ [LocationService] getHotelCounts error:", error);
      return {
        success: false,
        message: "Lỗi server khi đếm khách sạn",
        data: { countryCount: 0, cityCount: 0 }
      };
    }
  }
}
