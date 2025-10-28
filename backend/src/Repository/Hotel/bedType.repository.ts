import pool from "../../config/db";

export interface BedTypeMetadata {
  bed_type_key: string;
  name_vi: string;
  name_en: string | null;
  description: string | null;
  display_order: number;
}

export class BedTypeRepository {
  // Lấy metadata của tất cả các loại giường từ DB
  async getBedTypeMetadata(): Promise<BedTypeMetadata[]> {
    const [rows] = await pool.query(`
      SELECT 
        bed_type_key,
        name_vi,
        name_en,
        description,
        display_order
      FROM bed_type_metadata
      ORDER BY display_order ASC
    `);
    return rows as BedTypeMetadata[];
  }

  // Lấy danh sách bed types đang được sử dụng trong room_type
  async getActiveBedTypes(): Promise<string[]> {
    const [rows] = await pool.query(`
      SELECT DISTINCT bed_type 
      FROM room_type 
      WHERE bed_type IS NOT NULL
    `);
    return (rows as { bed_type: string }[]).map(r => r.bed_type);
  }
}
