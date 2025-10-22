import { LocationRepository } from "../../Repository/Hotel/location.repository";
import { normalizeString } from "../../utils/normalize.util";

export class LocationService {
  private repo = new LocationRepository();

  async search(q: string, limit = 8) {
    try {
      if (!q?.trim()) {
        return { success: false, items: [], message: "Thiếu từ khóa tìm kiếm." };
      }

      const normalizedQ = normalizeString(q);

      const items = await this.repo.search(normalizedQ, limit);

      if (!items.length) {
        return { success: false, items: [], message: "Không tìm thấy địa điểm phù hợp." };
      }

      return { success: true, items };
    } catch (err) {
      console.error("❌ [LocationService] search error:", err);
      return { success: false, items: [], message: "Lỗi server khi tìm kiếm địa điểm." };
    }
  }
}
