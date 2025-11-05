import pool from "../../config/db";

export interface Category {
  category_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export class AdminCategoryRepository {
  async getAllCategories(): Promise<Category[]> {
    const [rows]: any = await pool.query(
      `SELECT category_id, name, description, icon, created_at 
       FROM hotel_category 
       ORDER BY created_at DESC`
    );
    return rows;
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    const [rows]: any = await pool.query(
      `SELECT category_id, name, description, icon, created_at 
       FROM hotel_category 
       WHERE category_id = ?`,
      [categoryId]
    );
    return rows[0] || null;
  }

  async createCategory(data: {
    category_id: string;
    name: string;
    description?: string;
    icon?: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO hotel_category (category_id, name, description, icon) 
       VALUES (?, ?, ?, ?)`,
      [data.category_id, data.name, data.description || null, data.icon || null]
    );
  }

  async updateCategory(categoryId: string, data: {
    name?: string;
    description?: string;
    icon?: string;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.icon !== undefined) {
      updates.push("icon = ?");
      values.push(data.icon);
    }

    if (updates.length === 0) return;

    values.push(categoryId);
    await pool.query(
      `UPDATE hotel_category SET ${updates.join(", ")} WHERE category_id = ?`,
      values
    );
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await pool.query(`DELETE FROM hotel_category WHERE category_id = ?`, [categoryId]);
  }

  async checkCategoryInUse(categoryId: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel WHERE category_id = ?`,
      [categoryId]
    );
    return rows[0].count > 0;
  }
}

