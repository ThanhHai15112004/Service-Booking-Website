import pool from "../../config/db";
import { PolicyFlags, PolicyMetadata } from "../../models/Hotel/policy.model";

export class PolicyRepository {
  // Lấy metadata của tất cả các loại policies từ DB
  async getPolicyMetadata(): Promise<PolicyMetadata[]> {
    const [rows] = await pool.query(
      `
      SELECT 
        policy_key,
        name_vi,
        name_en,
        description,
        display_order
      FROM policy_type
      ORDER BY display_order ASC
      `
    );

    return rows as PolicyMetadata[];
  }

  // Kiểm tra xem policy nào đang có sẵn trong room_policy
  async getAvailablePolicies(): Promise<PolicyFlags> {
    const [rows] = await pool.query(
      `
      SELECT 
        MAX(free_cancellation) AS free_cancellation,
        MAX(pay_later) AS pay_later,
        MAX(no_credit_card) AS no_credit_card,
        MAX(children_allowed) AS children_allowed,
        MAX(pets_allowed) AS pets_allowed
      FROM room_policy
      `
    );

    return (rows as PolicyFlags[])[0];
  }
}
