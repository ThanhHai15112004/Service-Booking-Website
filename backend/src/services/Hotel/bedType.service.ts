import { BedTypeRepository } from "../../Repository/Hotel/bedType.repository";

export class BedTypeService {
  private repo = new BedTypeRepository();

  async getAllBedTypes() {
    try {
      const data = await this.repo.getAll();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("❌ [BedTypeService] getAllBedTypes error:", error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}
