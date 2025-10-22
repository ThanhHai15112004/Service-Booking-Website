
import { BedType } from "../../models/Hotel/bedType.model";
import { BedTypeRepository } from "../../Repository/Hotel/bedType.repository";

export class BedTypeService {
  private repo = new BedTypeRepository();

  async getAllBedTypes() {
    try {
      const data = await this.repo.getAllBedTypes();

      const map: Record<string, string> = {
        Single: "Giường đơn",
        Double: "Giường đôi",
        Queen: "Giường Queen",
        King: "Giường King",
        Twin: "Giường đôi nhỏ (Twin)",
        Bunk: "Giường tầng",
      };

      const items: BedType[] = data.map((key) => ({
        key,
        label: map[key] || key,
      }));

      return {
        success: true,
        message: "Danh sách loại giường.",
        count: items.length,
        items,
      };
    } catch (error) {
      console.error("❌ [BedTypeService] getAllBedTypes error:", error);
      return {
        success: false,
        message: "Lỗi server khi lấy danh sách loại giường.",
        items: [],
      };
    }
  }
}
