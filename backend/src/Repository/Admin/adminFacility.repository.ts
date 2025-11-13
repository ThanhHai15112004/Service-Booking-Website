import pool from "../../config/db";

export interface Facility {
  facility_id: string;
  name: string;
  category: "HOTEL" | "ROOM";
  icon?: string;
  created_at: string;
}

export class AdminFacilityRepository {
  async getAllFacilities(): Promise<Facility[]> {
    const [rows]: any = await pool.query(
      `SELECT facility_id, name, category, icon, created_at 
       FROM facility 
       ORDER BY category, name ASC`
    );
    return rows;
  }

  async getFacilityById(facilityId: string): Promise<Facility | null> {
    const [rows]: any = await pool.query(
      `SELECT facility_id, name, category, icon, created_at 
       FROM facility 
       WHERE facility_id = ?`,
      [facilityId]
    );
    return rows[0] || null;
  }

  async createFacility(data: {
    facility_id: string;
    name: string;
    category: "HOTEL" | "ROOM";
    icon?: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO facility (facility_id, name, category, icon) 
       VALUES (?, ?, ?, ?)`,
      [data.facility_id, data.name, data.category, data.icon || null]
    );
  }

  async updateFacility(facilityId: string, data: {
    name?: string;
    category?: "HOTEL" | "ROOM";
    icon?: string;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      values.push(data.category);
    }
    if (data.icon !== undefined) {
      updates.push("icon = ?");
      values.push(data.icon);
    }

    if (updates.length === 0) return;

    values.push(facilityId);
    await pool.query(
      `UPDATE facility SET ${updates.join(", ")} WHERE facility_id = ?`,
      values
    );
  }

  async deleteFacility(facilityId: string): Promise<void> {
    await pool.query(`DELETE FROM facility WHERE facility_id = ?`, [facilityId]);
  }

  async checkFacilityInUse(facilityId: string): Promise<boolean> {
    const [hotelRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel_facility WHERE facility_id = ?`,
      [facilityId]
    );
    const [roomRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM room_amenity WHERE facility_id = ?`,
      [facilityId]
    );
    return hotelRows[0].count > 0 || roomRows[0].count > 0;
  }
}

