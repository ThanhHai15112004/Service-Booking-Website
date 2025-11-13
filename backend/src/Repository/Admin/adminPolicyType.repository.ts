import pool from "../../config/db";

export interface PolicyType {
  policy_key: string;
  name_vi: string;
  name_en?: string;
  description?: string;
  data_type: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT";
  applicable_to: "HOTEL" | "ROOM" | "BOTH";
  icon?: string;
  display_order: number;
  is_active: boolean;
}

export class AdminPolicyTypeRepository {
  async getAllPolicyTypes(): Promise<PolicyType[]> {
    const [rows]: any = await pool.query(
      `SELECT policy_key, name_vi, name_en, description, data_type, applicable_to, icon, display_order, is_active 
       FROM policy_type 
       ORDER BY display_order, name_vi ASC`
    );
    return rows;
  }

  async getPolicyTypeById(policyKey: string): Promise<PolicyType | null> {
    const [rows]: any = await pool.query(
      `SELECT policy_key, name_vi, name_en, description, data_type, applicable_to, icon, display_order, is_active 
       FROM policy_type 
       WHERE policy_key = ?`,
      [policyKey]
    );
    return rows[0] || null;
  }

  async createPolicyType(data: {
    policy_key: string;
    name_vi: string;
    name_en?: string;
    description?: string;
    data_type?: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT";
    applicable_to?: "HOTEL" | "ROOM" | "BOTH";
    icon?: string;
    display_order?: number;
    is_active?: boolean;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO policy_type (policy_key, name_vi, name_en, description, data_type, applicable_to, icon, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.policy_key,
        data.name_vi,
        data.name_en || null,
        data.description || null,
        data.data_type || "BOOLEAN",
        data.applicable_to || "BOTH",
        data.icon || null,
        data.display_order || 0,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      ]
    );
  }

  async updatePolicyType(policyKey: string, data: {
    name_vi?: string;
    name_en?: string;
    description?: string;
    data_type?: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT";
    applicable_to?: "HOTEL" | "ROOM" | "BOTH";
    icon?: string;
    display_order?: number;
    is_active?: boolean;
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
    if (data.data_type !== undefined) {
      updates.push("data_type = ?");
      values.push(data.data_type);
    }
    if (data.applicable_to !== undefined) {
      updates.push("applicable_to = ?");
      values.push(data.applicable_to);
    }
    if (data.icon !== undefined) {
      updates.push("icon = ?");
      values.push(data.icon);
    }
    if (data.display_order !== undefined) {
      updates.push("display_order = ?");
      values.push(data.display_order);
    }
    if (data.is_active !== undefined) {
      updates.push("is_active = ?");
      values.push(data.is_active ? 1 : 0);
    }

    if (updates.length === 0) return;

    values.push(policyKey);
    await pool.query(
      `UPDATE policy_type SET ${updates.join(", ")} WHERE policy_key = ?`,
      values
    );
  }

  async deletePolicyType(policyKey: string): Promise<void> {
    await pool.query(`DELETE FROM policy_type WHERE policy_key = ?`, [policyKey]);
  }

  async checkPolicyTypeInUse(policyKey: string): Promise<boolean> {
    const [hotelRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel_policy WHERE policy_key = ?`,
      [policyKey]
    );
    const [roomRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM room_policy WHERE policy_key = ?`,
      [policyKey]
    );
    return hotelRows[0].count > 0 || roomRows[0].count > 0;
  }
}

