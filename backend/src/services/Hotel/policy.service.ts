import { Policy, PolicyFlags } from "../../models/Hotel/policy.model";
import { PolicyRepository } from "../../Repository/Hotel/policy.repository";

export class PolicyService {
  private repo = new PolicyRepository();

  async getAllPolicies() {
    try {
      const data: PolicyFlags = await this.repo.getAllPolicies();

      const map: Record<keyof PolicyFlags, { label: string }> = {
        free_cancellation: { label: "Miễn phí hủy" },
        pay_later: { label: "Thanh toán sau" },
        no_credit_card: { label: "Không cần thẻ tín dụng" },
        children_allowed: { label: "Cho phép trẻ em" },
        pets_allowed: { label: "Cho phép thú cưng" },
      };

      const items: Policy[] = (Object.keys(map) as (keyof PolicyFlags)[]).map(
        (key) => ({
          key,
          label: map[key].label,
          available: !!data[key],
        })
      );

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
