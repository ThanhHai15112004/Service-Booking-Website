import pool from "../../config/db";

export interface Highlight {
  highlight_id: string;
  name: string;
  icon_url?: string;
  description?: string;
  category: string;
  created_at: string;
}

export class AdminHighlightRepository {
  async getAllHighlights(): Promise<Highlight[]> {
    const [rows]: any = await pool.query(
      `SELECT highlight_id, name, icon_url, description, category, created_at 
       FROM highlight 
       ORDER BY category, name ASC`
    );
    return rows;
  }

  async getHighlightById(highlightId: string): Promise<Highlight | null> {
    const [rows]: any = await pool.query(
      `SELECT highlight_id, name, icon_url, description, category, created_at 
       FROM highlight 
       WHERE highlight_id = ?`,
      [highlightId]
    );
    return rows[0] || null;
  }

  async createHighlight(data: {
    highlight_id: string;
    name: string;
    icon_url?: string;
    description?: string;
    category?: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO highlight (highlight_id, name, icon_url, description, category) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.highlight_id, data.name, data.icon_url || null, data.description || null, data.category || "GENERAL"]
    );
  }

  async updateHighlight(highlightId: string, data: {
    name?: string;
    icon_url?: string;
    description?: string;
    category?: string;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.icon_url !== undefined) {
      updates.push("icon_url = ?");
      values.push(data.icon_url);
    }
    if (data.description !== undefined) {
      updates.push("description = ?");
      values.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push("category = ?");
      values.push(data.category);
    }

    if (updates.length === 0) return;

    values.push(highlightId);
    await pool.query(
      `UPDATE highlight SET ${updates.join(", ")} WHERE highlight_id = ?`,
      values
    );
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    await pool.query(`DELETE FROM highlight WHERE highlight_id = ?`, [highlightId]);
  }

  async checkHighlightInUse(highlightId: string): Promise<boolean> {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel_highlight WHERE highlight_id = ?`,
      [highlightId]
    );
    return rows[0].count > 0;
  }
}

