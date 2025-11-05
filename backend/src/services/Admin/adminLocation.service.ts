import { AdminLocationRepository } from "../../Repository/Admin/adminLocation.repository";

export class AdminLocationService {
  private repo: AdminLocationRepository;

  constructor() {
    this.repo = new AdminLocationRepository();
  }

  async getAllLocations() {
    return await this.repo.getAllLocations();
  }

  async getLocationById(locationId: string) {
    const location = await this.repo.getLocationById(locationId);
    if (!location) {
      throw new Error("Không tìm thấy vị trí");
    }
    return location;
  }

  async createLocation(data: {
    location_id: string;
    country: string;
    city: string;
    district?: string;
    ward?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
    distance_center?: number;
    description?: string;
    is_hot?: boolean;
  }) {
    const existing = await this.repo.getLocationById(data.location_id);
    if (existing) {
      throw new Error("Vị trí đã tồn tại");
    }

    await this.repo.createLocation(data);
    return await this.repo.getLocationById(data.location_id);
  }

  async updateLocation(locationId: string, data: {
    country?: string;
    city?: string;
    district?: string;
    ward?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
    distance_center?: number;
    description?: string;
    is_hot?: boolean;
  }) {
    const existing = await this.repo.getLocationById(locationId);
    if (!existing) {
      throw new Error("Không tìm thấy vị trí");
    }

    await this.repo.updateLocation(locationId, data);
    return await this.repo.getLocationById(locationId);
  }

  async deleteLocation(locationId: string) {
    const existing = await this.repo.getLocationById(locationId);
    if (!existing) {
      throw new Error("Không tìm thấy vị trí");
    }

    const inUse = await this.repo.checkLocationInUse(locationId);
    if (inUse) {
      throw new Error("Không thể xóa vị trí đang được sử dụng");
    }

    await this.repo.deleteLocation(locationId);
  }
}

