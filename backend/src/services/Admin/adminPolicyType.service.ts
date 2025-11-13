import { AdminPolicyTypeRepository } from "../../Repository/Admin/adminPolicyType.repository";

export class AdminPolicyTypeService {
  private repo: AdminPolicyTypeRepository;

  constructor() {
    this.repo = new AdminPolicyTypeRepository();
  }

  async getAllPolicyTypes() {
    return await this.repo.getAllPolicyTypes();
  }

  async getPolicyTypeById(policyKey: string) {
    const policyType = await this.repo.getPolicyTypeById(policyKey);
    if (!policyType) {
      throw new Error("Không tìm thấy loại chính sách");
    }
    return policyType;
  }

  async createPolicyType(data: {
    policy_key: string;
    name_vi: string;
    name_en?: string;
    description?: string;
    data_type?: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT";
    applicable_to?: "HOTEL" | "ROOM" | "BOTH";
    icon?: string;
    display_order?: number;
    is_active?: boolean;
  }) {
    const existing = await this.repo.getPolicyTypeById(data.policy_key);
    if (existing) {
      throw new Error("Loại chính sách đã tồn tại");
    }

    await this.repo.createPolicyType(data);
    return await this.repo.getPolicyTypeById(data.policy_key);
  }

  async updatePolicyType(policyKey: string, data: {
    name_vi?: string;
    name_en?: string;
    description?: string;
    data_type?: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT";
    applicable_to?: "HOTEL" | "ROOM" | "BOTH";
    icon?: string;
    display_order?: number;
    is_active?: boolean;
  }) {
    const existing = await this.repo.getPolicyTypeById(policyKey);
    if (!existing) {
      throw new Error("Không tìm thấy loại chính sách");
    }

    await this.repo.updatePolicyType(policyKey, data);
    return await this.repo.getPolicyTypeById(policyKey);
  }

  async deletePolicyType(policyKey: string) {
    const existing = await this.repo.getPolicyTypeById(policyKey);
    if (!existing) {
      throw new Error("Không tìm thấy loại chính sách");
    }

    const inUse = await this.repo.checkPolicyTypeInUse(policyKey);
    if (inUse) {
      throw new Error("Không thể xóa loại chính sách đang được sử dụng");
    }

    await this.repo.deletePolicyType(policyKey);
  }
}

