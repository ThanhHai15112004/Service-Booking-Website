import pool from "../../config/db";

export interface BedType {
  bed_type_key: string;
  name_vi: string;
  name_en?: string;
  description?: string;
  icon?: string;
  display_order: number;
}

export class AdminBedTypeRepository {
  async getAllBedTypes(): Promise<BedType[]> {
    const [rows]: any = await pool.query(
      `SELECT bed_type_key, name_vi, name_en, description, icon, display_order 
       FROM bed_type_metadata 
       ORDER BY display_order, name_vi ASC`
    );
    return rows;
  }

  async getBedTypeById(bedTypeKey: string): Promise<BedType | null> {
    const [rows]: any = await pool.query(
      `SELECT bed_type_key, name_vi, name_en, description, icon, display_order 
       FROM bed_type_metadata 
       WHERE bed_type_key = ?`,
      [bedTypeKey]
    );
    return rows[0] || null;
  }

  async createBedType(data: {
    bed_type_key: string;
    name_vi: string;
    name_en?: string;
    description?: string;
    icon?: string;
    display_order?: number;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO bed_type_metadata (bed_type_key, name_vi, name_en, description, icon, display_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.bed_type_key, data.name_vi, data.name_en || null, data.description || null, data.icon || null, data.display_order || 0]
    );
  }

  async updateBedType(bedTypeKey: string, data: {
    name_vi?: string;
    name_en?: string;
    description?: string;
    icon?: string;
    display_order?: number;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name_vi !== undefined) {
      updates.push("name_vi = ?");
      values.push(data.name_vi);
    }
    if (data.name_en !== undefined) {
      updates.push("name_en = ?");
      values.push(data.name_en);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.icon !== undefined) {
      updates.push("icon = ?");
      values.push(data.icon);
    }
    if (data.display_order !== undefined) {
      updates.push("display_order = ?");
      values.push(data.display_order);
    }

    if (updates.length === 0) return;

    values.push(bedTypeKey);
    await pool.query(
      `UPDATE bed_type_metadata SET ${updates.join(", ")} WHERE bed_type_key = ?`,
      values
    );
  }

  async deleteBedType(bedTypeKey: string): Promise<void> {
    await pool.query(`DELETE FROM bed_type_metadata WHERE bed_type_key = ?`, [bedTypeKey]);
  }

  async checkBedTypeInUse(bedTypeKey: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM room_type WHERE bed_type = ?`,
      [bedTypeKey]
    );
    return rows[0].count > 0;
  }
}

