import { Location } from "../../models/Hotel/location.model";
import sequelize from "../../config/sequelize";
import { QueryTypes, Op } from "sequelize";
import { removeVietnameseTones } from "../../utils/stringHelper";

export class LocationRepository {
  // Tìm kiếm địa điểm (hỗ trợ tìm cả có dấu và không dấu)
  async search(q: string, limit: number) {
    // Normalize query để tìm được cả "da nang" và "đà nẵng"
    const normalizedQuery = removeVietnameseTones(q);

    const sql = `
      SELECT 
        location_id, country, city, district, ward, area_name,
        latitude, longitude, distance_center, description, created_at, is_hot
      FROM hotel_location
      WHERE LOWER(CONCAT_WS(' ', 
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            LOWER(country), 'đ', 'd'), 'á', 'a'), 'à', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
          'ă', 'a'), 'ắ', 'a'), 'ằ', 'a'), 'ẳ', 'a'), 'ẵ', 'a'), 'ặ', 'a'),
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            LOWER(city), 'đ', 'd'), 'á', 'a'), 'à', 'a'), 'ả', 'a'), 'ã', 'a'), 'ạ', 'a'),
          'ă', 'a'), 'ắ', 'a'), 'ằ', 'a'), 'ẳ', 'a'), 'ẵ', 'a'), 'ặ', 'a'),
        COALESCE(district, ''), 
        COALESCE(ward, ''), 
        COALESCE(area_name, '')
      )) LIKE ?
      ORDER BY 
        CASE 
          WHEN LOWER(city) LIKE ? THEN 1
          WHEN COALESCE(LOWER(district), '') LIKE ? THEN 2
          ELSE 3
        END,
        distance_center ASC
      LIMIT ?
    `;

    return await sequelize.query(sql, {
      replacements: [`%${normalizedQuery}%`, `%${normalizedQuery}%`, `%${normalizedQuery}%`, limit],
      type: QueryTypes.SELECT
    });
  }

  // Lấy địa điểm nổi bật
  async getHotLocations(limit: number) {
    const whereCondition = { is_hot: 1 };

    return await Location.findAll({
      where: whereCondition,
      order: [['distance_center', 'ASC']],
      limit,
      raw: true
    });
  }

  // Đếm số khách sạn theo quốc gia
  async countHotelsByCountry(country: string): Promise<number> {
    const sql = `
      SELECT COUNT(DISTINCT h.hotel_id) as total
      FROM hotel h
      INNER JOIN hotel_location hl ON hl.location_id = h.location_id
      WHERE hl.country = ?
    `;
    const replacements = [country];

    const [result] = await sequelize.query<{ total: number }>(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    return result?.total || 0;
  }

  // Đếm số khách sạn theo thành phố
  async countHotelsByCity(city: string, country?: string): Promise<number> {
    let sql = `
      SELECT COUNT(DISTINCT h.hotel_id) as total
      FROM hotel h
      INNER JOIN hotel_location hl ON hl.location_id = h.location_id
      WHERE hl.city = ?
    `;
    const replacements: any[] = [city];

    if (country) {
      sql += ` AND hl.country = ?`;
      replacements.push(country);
    }

    const [result] = await sequelize.query<{ total: number }>(sql, {
      replacements,
      type: QueryTypes.SELECT
    });

    return result?.total || 0;
  }

  // Lấy số lượng khách sạn cho breadcrumb
  async getHotelCounts(country: string, city?: string): Promise<{
    countryCount: number;
    cityCount: number;
  }> {
    const countryCount = await this.countHotelsByCountry(country);
    const cityCount = city ? await this.countHotelsByCity(city, country) : 0;

    return {
      countryCount,
      cityCount
    };
  }
}
