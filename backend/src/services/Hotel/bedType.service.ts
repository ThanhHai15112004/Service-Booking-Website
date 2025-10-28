
import { BedType } from "../../models/Hotel/bedType.model";
import { BedTypeRepository } from "../../Repository/Hotel/bedType.repository";

export class BedTypeService {
  private repo = new BedTypeRepository();

  async getAllBedTypes() {
    try {
      // Lấy TẤT CẢ metadata từ DB - có bao nhiêu hiện bấy nhiêu
      const bedTypeMetadata = await this.repo.getBedTypeMetadata();

      // Map metadata thành format cho frontend
      const items: BedType[] = bedTypeMetadata.map((meta) => ({
        key: meta.bed_type_key,
        label: meta.name_vi, // Lấy từ DB
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
