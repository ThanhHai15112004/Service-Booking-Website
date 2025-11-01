import { FacilityRepository } from "../../Repository/Hotel/facility.repository";

export class FacilityService {
  private repo = new FacilityRepository();

  // Hàm lấy tất cả facilities
  async getAllFacilities() {
    try {
      const rawData = await this.repo.getAll();
      const data = (rawData as any[]).map(item => ({
        facilityId: item.facility_id,
        name: item.name,
        category: item.category,
        icon: item.icon,
        createdAt: item.created_at
      }));
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error("[FacilityService] getAllFacilities error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}