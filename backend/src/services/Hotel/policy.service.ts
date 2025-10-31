import { PolicyRepository } from "../../Repository/Hotel/policy.repository";

export class PolicyService {
  private repo = new PolicyRepository();

  async getAllPolicies() {
    try {
      const rawData = await this.repo.getAll();
      // Format data từ snake_case sang camelCase
      const data = (rawData as any[]).map(item => ({
        key: item.policy_key,
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
      console.error("[PolicyService] getAllPolicies error:", error?.message || error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}
