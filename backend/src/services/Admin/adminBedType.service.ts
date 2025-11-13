import { AdminBedTypeRepository } from "../../Repository/Admin/adminBedType.repository";

export class AdminBedTypeService {
  private repo: AdminBedTypeRepository;

  constructor() {
    this.repo = new AdminBedTypeRepository();
  }

  async getAllBedTypes() {
    return await this.repo.getAllBedTypes();
  }

  async getBedTypeById(bedTypeKey: string) {
    const bedType = await this.repo.getBedTypeById(bedTypeKey);
    if (!bedType) {
      throw new Error("Không tìm thấy loại giường");
    }
    return bedType;
  }

  async createBedType(data: {
    bed_type_key: string;
    name_vi: string;
    name_en?: string;
    description?: string;
    icon?: string;
    display_order?: number;
  }) {
    const existing = await this.repo.getBedTypeById(data.bed_type_key);
    if (existing) {
      throw new Error("Loại giường đã tồn tại");
    }

    await this.repo.createBedType(data);
    return await this.repo.getBedTypeById(data.bed_type_key);
  }

  async updateBedType(bedTypeKey: string, data: {
    name_vi?: string;
    name_en?: string;
    description?: string;
    icon?: string;
    display_order?: number;
  }) {
    const existing = await this.repo.getBedTypeById(bedTypeKey);
    if (!existing) {
      throw new Error("Không tìm thấy loại giường");
    }

    await this.repo.updateBedType(bedTypeKey, data);
    return await this.repo.getBedTypeById(bedTypeKey);
  }

  async deleteBedType(bedTypeKey: string) {
    const existing = await this.repo.getBedTypeById(bedTypeKey);
    if (!existing) {
      throw new Error("Không tìm thấy loại giường");
    }

    const inUse = await this.repo.checkBedTypeInUse(bedTypeKey);
    if (inUse) {
      throw new Error("Không thể xóa loại giường đang được sử dụng");
    }

    await this.repo.deleteBedType(bedTypeKey);
  }
}

