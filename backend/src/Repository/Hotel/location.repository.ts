import pool from "../../config/db";
import { Location, mapLocationRow } from "../../models/location.model";

export class LocationRepository {
  async search(q: string, limit: number): Promise<Location[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `
        SELECT 
          location_id, country, city, district, ward, area_name,
          latitude, longitude, distance_center, created_at,
          CONCAT_WS(' ', country, city, district, ward, area_name) AS full_address
        FROM hotel_location
        WHERE LOWER(CONCAT_WS(' ', country, city, district, ward, area_name)) LIKE CONCAT('%', ?, '%')
        ORDER BY 
          CASE 
            WHEN LOWER(city) LIKE CONCAT('%', ?, '%') THEN 1
            WHEN LOWER(district) LIKE CONCAT('%', ?, '%') THEN 2
            ELSE 3
          END,
          distance_center ASC
        LIMIT ?
        `,
        [q, q, q, limit]
      );

      return (rows as any[]).map(mapLocationRow);
    } finally {
      conn.release();
    }
  }
}
