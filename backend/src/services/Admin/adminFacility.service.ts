import { AdminFacilityRepository } from "../../Repository/Admin/adminFacility.repository";

export class AdminFacilityService {
  private repo: AdminFacilityRepository;

  constructor() {
    this.repo = new AdminFacilityRepository();
  }

  async getAllFacilities() {
    return await this.repo.getAllFacilities();
  }

  async getFacilityById(facilityId: string) {
    const facility = await this.repo.getFacilityById(facilityId);
    if (!facility) {
      throw new Error("Không tìm thấy tiện ích");
    }
    return facility;
  }

  async createFacility(data: {
    facility_id: string;
    name: string;
    category: "HOTEL" | "ROOM";
    icon?: string;
  }) {
    const existing = await this.repo.getFacilityById(data.facility_id);
    if (existing) {
      throw new Error("Tiện ích đã tồn tại");
    }

    await this.repo.createFacility(data);
    return await this.repo.getFacilityById(data.facility_id);
  }

  async updateFacility(facilityId: string, data: {
    name?: string;
    category?: "HOTEL" | "ROOM";
    icon?: string;
  }) {
    const existing = await this.repo.getFacilityById(facilityId);
    if (!existing) {
      throw new Error("Không tìm thấy tiện ích");
    }

    await this.repo.updateFacility(facilityId, data);
    return await this.repo.getFacilityById(facilityId);
  }

  async deleteFacility(facilityId: string) {
    const existing = await this.repo.getFacilityById(facilityId);
    if (!existing) {
      throw new Error("Không tìm thấy tiện ích");
    }

    const inUse = await this.repo.checkFacilityInUse(facilityId);
    if (inUse) {
      throw new Error("Không thể xóa tiện ích đang được sử dụng");
    }

    await this.repo.deleteFacility(facilityId);
  }
}

