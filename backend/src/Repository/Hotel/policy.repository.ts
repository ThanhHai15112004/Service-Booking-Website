import pool from "../../config/db";
import { PolicyFlags } from "../../models/Hotel/policy.model";

export class PolicyRepository {
  async getAllPolicies(): Promise<PolicyFlags> {
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
