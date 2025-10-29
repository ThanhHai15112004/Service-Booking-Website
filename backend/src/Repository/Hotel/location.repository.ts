import pool from "../../config/db";
import { Location, mapLocationRow } from "../../models/Hotel/location.model";

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

   async getHotLocations(limit: number): Promise<Location[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `
        SELECT 
          location_id, country, city, district, ward, area_name,
          latitude, longitude, distance_center, created_at,
          CONCAT_WS(' ', country, city, district, ward, area_name) AS full_address
        FROM hotel_location
        WHERE is_hot = 1
        ORDER BY distance_center ASC
        LIMIT ?
        `,
        [limit]
      );
      return (rows as any[]).map(mapLocationRow);
    } finally {
      conn.release();
    }
  }

  /**
   * Count hotels by country
   */
  async countHotelsByCountry(country: string): Promise<number> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(
        `
        SELECT COUNT(DISTINCT h.hotel_id) as total
        FROM hotel h
        INNER JOIN hotel_location hl ON hl.location_id = h.location_id
        WHERE hl.country = ?
        `,
        [country]
      );
      return (rows as any[])[0]?.total || 0;
    } finally {
      conn.release();
    }
  }

  /**
   * Count hotels by city
   */
  async countHotelsByCity(city: string, country?: string): Promise<number> {
    const conn = await pool.getConnection();
    try {
      let sql = `
        SELECT COUNT(DISTINCT h.hotel_id) as total
        FROM hotel h
        INNER JOIN hotel_location hl ON hl.location_id = h.location_id
        WHERE hl.city = ?
      `;
      const params: any[] = [city];

      if (country) {
        sql += ` AND hl.country = ?`;
        params.push(country);
      }

      const [rows] = await conn.query(sql, params);
      return (rows as any[])[0]?.total || 0;
    } finally {
      conn.release();
    }
  }

  /**
   * Get hotel counts for breadcrumb
   */
  async getHotelCounts(country: string, city?: string): Promise<{
    countryCount: number;
    cityCount: number;
  }> {
    const conn = await pool.getConnection();
    try {
      const countryCount = await this.countHotelsByCountry(country);
      const cityCount = city ? await this.countHotelsByCity(city, country) : 0;

      return {
        countryCount,
        cityCount
      };
    } finally {
      conn.release();
    }
  }
}
