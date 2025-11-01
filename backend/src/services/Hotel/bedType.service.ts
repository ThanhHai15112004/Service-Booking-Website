import { BedTypeRepository } from "../../Repository/Hotel/bedType.repository";

export class BedTypeService {
  private repo = new BedTypeRepository();

  // Hàm lấy tất cả bed types
  async getAllBedTypes() {
    try {
      const rawData = await this.repo.getAll();
      const data = (rawData as any[]).map(item => ({
        key: item.bed_type_key,
        label: item.name_vi,
        labelEn: item.name_en,
        description: item.description,
        icon: item.icon || null,
        displayOrder: item.display_order
      }));
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error("[BedTypeService] getAllBedTypes error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}
