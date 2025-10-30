import { PolicyType } from "../../models/Hotel/policy.model";
import sequelize from "../../config/sequelize";
import { QueryTypes } from "sequelize";

export class PolicyRepository {
  // Lấy tất cả loại chính sách
  async getAll() {
    return await PolicyType.findAll({
      order: [['display_order', 'ASC']],
      raw: true
    });
  }

  // Lấy các chính sách đang có
  async getAvailable() {
    const sql = `
      SELECT 
        MAX(free_cancellation) AS free_cancellation,
        MAX(pay_later) AS pay_later,
        MAX(no_credit_card) AS no_credit_card,
        MAX(children_allowed) AS children_allowed,
        MAX(pets_allowed) AS pets_allowed
      FROM room_policy
    `;

    const [result] = await sequelize.query<any>(sql, {
      type: QueryTypes.SELECT
    });

    return result;
  }
}
