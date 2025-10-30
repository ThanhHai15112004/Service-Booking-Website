import { PolicyRepository } from "../../Repository/Hotel/policy.repository";

export class PolicyService {
  private repo = new PolicyRepository();

  async getAllPolicies() {
    try {
      const data = await this.repo.getAll();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error("❌ [PolicyService] getAllPolicies error:", error);
      return {
        success: false,
        message: "Lỗi server",
        data: []
      };
    }
  }
}
