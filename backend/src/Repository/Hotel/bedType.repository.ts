import pool from "../../config/db";

export class BedTypeRepository {
  async getAllBedTypes(): Promise<string[]> {
    const [rows] = await pool.query(`
      SELECT DISTINCT bed_type 
      FROM room_type 
      WHERE bed_type IS NOT NULL
    `);
    return (rows as { bed_type: string }[]).map(r => r.bed_type);
  }
}
