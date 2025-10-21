import pool from "../../config/db";
import { HotelSearchParams } from "../../models/hotel.model";
import { mapSortToSQL } from "../../helpers/sortMapping.helper";

export class HotelRepository {
  // Tìm khách sạn qua đêm
  async searchOvernight(params: HotelSearchParams, sql: string, values: any[]) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, values);
      return rows as any[];
    } finally {
      conn.release();
    }
  }

  // Tìm khách sạn theo giờ
  async searchDayuse(params: HotelSearchParams, sql: string, values: any[]) {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, values);
      return rows as any[];
    } finally {
      conn.release();
    }
  }
}
