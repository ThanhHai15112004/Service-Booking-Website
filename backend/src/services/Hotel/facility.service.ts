import { FacilityRepository } from "../../Repository/Hotel/facility.repository";

export class FacilityService {
  private repo = new FacilityRepository();

  async getAllFacilities() {
    try {
      const data = await this.repo.getAll();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("❌ [FacilityService] getAllFacilities error:", error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}