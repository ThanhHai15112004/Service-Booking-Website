import { LocationRepository } from "../../Repository/Hotel/location.repository";

export class LocationService {
  private repo = new LocationRepository();

  // Hàm tìm kiếm địa điểm
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
    } catch (error: any) {
      console.error("[LocationService] searchLocations error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server khi tìm kiếm địa điểm",
        items: [],
      };
    }
  }

  // Hàm lấy địa điểm nổi bật
  async getHotLocations(limit: number = 10) {
    try {
      const items = await this.repo.getHotLocations(limit);

      return {
        success: true,
        message: `Tìm thấy ${items.length} địa điểm nổi bật`,
        count: items.length,
        items,
      };
    } catch (error: any) {
      console.error("[LocationService] getHotLocations error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server khi lấy địa điểm nổi bật",
        items: [],
      };
    }
  }

  // Hàm lấy số lượng khách sạn theo country/city
  async getHotelCounts(country: string, city?: string) {
    try {
      const data = await this.repo.getHotelCounts(country, city);

      return {
        success: true,
        data,
        message: "Lấy số lượng khách sạn thành công"
      };
    } catch (error: any) {
      console.error("[LocationService] getHotelCounts error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server khi đếm khách sạn",
        data: { countryCount: 0, cityCount: 0 }
      };
    }
  }

  // Hàm lấy điểm đến phổ biến với số lượng khách sạn
  async getPopularDestinations(limit: number = 6) {
    try {
      const items = await this.repo.getPopularDestinations(limit);

      return {
        success: true,
        message: `Tìm thấy ${items.length} điểm đến phổ biến`,
        count: items.length,
        items
      };
    } catch (error: any) {
      console.error("[LocationService] getPopularDestinations error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server khi lấy điểm đến phổ biến",
        items: []
      };
    }
  }
}
