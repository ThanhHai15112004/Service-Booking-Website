import { BedType } from "../../models/Hotel/bedType.model";
import sequelize from "../../config/sequelize";
import { QueryTypes } from "sequelize";

export class BedTypeRepository {
  // Hàm lấy tất cả loại giường
  async getAll() {
    return await BedType.findAll({
      order: [['display_order', 'ASC']],
      raw: true
    });
  }

  // Hàm lấy loại giường đang được sử dụng
  async getActive(): Promise<string[]> {
    const sql = `SELECT DISTINCT bed_type FROM room_type WHERE bed_type IS NOT NULL`;

    const results = await sequelize.query<{ bed_type: string }>(sql, {
      type: QueryTypes.SELECT
    });

    return results.map(r => r.bed_type);
  }
}
