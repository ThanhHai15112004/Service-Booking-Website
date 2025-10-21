import pool from "../../config/db";
import { removeVietnameseTones } from "../../utils/normalize.util";
import { mapLocationRow, Location } from "../../models/location.model";

export async function searchLocations(q: string, limit = 8) {
  const conn = await pool.getConnection();
  try {
    // Normalize query using the same util function
    const normalizedQ = removeVietnameseTones(q.toLowerCase());

    const [rows] = await conn.query(
      `
      SELECT 
        location_id, country, city, district, ward, area_name,
        latitude, longitude, distance_center, created_at,
        CONCAT_WS(' ', country, city, district, ward, area_name) as full_address
      FROM hotel_location
      WHERE 
        -- Search in original data (case-insensitive)
        LOWER(CONCAT_WS(' ', country, city, district, ward, area_name)) LIKE CONCAT('%', ?, '%')
      ORDER BY 
        -- Prioritize city matches first, then district, then other fields
        CASE 
          WHEN LOWER(city) LIKE CONCAT('%', ?, '%') THEN 1
          WHEN LOWER(district) LIKE CONCAT('%', ?, '%') THEN 2
          ELSE 3
        END,
        distance_center ASC
      LIMIT ?
      `,
      [q.toLowerCase(), q.toLowerCase(), q.toLowerCase(), limit]
    );

    // ép kiểu rows sang any[]
    const resultRows = rows as any[];

    if (resultRows.length > 0) {
      const items: Location[] = resultRows.map(mapLocationRow);
      return { items };
    }

    return { items: [], message: "Không tìm thấy địa điểm trong cơ sở dữ liệu." };
  } catch (err) {
    console.error("❌ searchLocations error:", err);
    return { items: [], message: "Lỗi server khi tìm kiếm" };
  } finally {
    conn.release();
  }
}

