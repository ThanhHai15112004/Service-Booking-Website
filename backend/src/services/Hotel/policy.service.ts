import { Policy, PolicyFlags } from "../../models/Hotel/policy.model";
import { PolicyRepository } from "../../Repository/Hotel/policy.repository";

export class PolicyService {
  private repo = new PolicyRepository();

  async getAllPolicies() {
    try {
      // Lấy metadata từ DB (labels, descriptions)
      const policyMetadata = await this.repo.getPolicyMetadata();
      
      // Lấy thông tin policies nào đang available
      const availableFlags: PolicyFlags = await this.repo.getAvailablePolicies();

      // Map metadata với available flags
      const items: Policy[] = policyMetadata.map((meta) => ({
        key: meta.policy_key,
        label: meta.name_vi, // Lấy từ DB thay vì hardcoded
        available: !!availableFlags[meta.policy_key as keyof PolicyFlags],
      }));

      return {
        success: true,
        message: "Danh sách chính sách đặt phòng.",
        count: items.length,
        items,
      };
    } catch (error) {
      console.error("❌ [PolicyService] getAllPolicies error:", error);
      return {
        success: false,
        message: "Lỗi server khi lấy danh sách chính sách.",
        items: [],
      };
    }
  }
}
