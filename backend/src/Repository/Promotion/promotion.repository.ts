import pool from "../../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

// =====================================================
// PROMOTION REPOSITORY
// =====================================================

export interface Promotion {
  promotion_id: string;
  name: string;
  description?: string;
  type: 'PROVIDER' | 'SYSTEM' | 'BOTH';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  applicable_hotels?: string[];
  applicable_rooms?: string[];
  applicable_dates?: string[];
  day_of_week?: number[];
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  created_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  type: 'PROVIDER' | 'SYSTEM' | 'BOTH';
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  applicable_hotels?: string[];
  applicable_rooms?: string[];
  applicable_dates?: string[];
  day_of_week?: number[];
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  created_by?: string;
}

export class PromotionRepository {

  /**
   * Tạo promotion mới
   */
  async createPromotion(data: CreatePromotionData): Promise<boolean> {
    const promotionId = this.generatePromotionId();
    
    const sql = `
      INSERT INTO promotion (
        promotion_id,
        name,
        description,
        type,
        discount_type,
        discount_value,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        applicable_hotels,
        applicable_rooms,
        applicable_dates,
        day_of_week,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [
        promotionId,
        data.name,
        data.description || null,
        data.type,
        data.discount_type,
        data.discount_value,
        data.min_purchase || 0,
        data.max_discount || null,
        data.start_date,
        data.end_date,
        data.applicable_hotels ? JSON.stringify(data.applicable_hotels) : null,
        data.applicable_rooms ? JSON.stringify(data.applicable_rooms) : null,
        data.applicable_dates ? JSON.stringify(data.applicable_dates) : null,
        data.day_of_week ? JSON.stringify(data.day_of_week) : null,
        data.status || 'ACTIVE',
        data.created_by || null
      ]);

      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy danh sách promotions với filter
   */
  async getPromotions(filters?: {
    type?: 'PROVIDER' | 'SYSTEM' | 'BOTH';
    status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    created_by?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<Promotion[]> {
    let sql = `
      SELECT 
        promotion_id,
        name,
        description,
        type,
        discount_type,
        discount_value,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        applicable_hotels,
        applicable_rooms,
        applicable_dates,
        day_of_week,
        status,
        created_by,
        created_at,
        updated_at
      FROM promotion
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.type) {
      sql += ` AND type = ?`;
      params.push(filters.type);
    }

    if (filters?.status) {
      sql += ` AND status = ?`;
      params.push(filters.status);
    }

    if (filters?.created_by) {
      sql += ` AND created_by = ?`;
      params.push(filters.created_by);
    }

    if (filters?.start_date) {
      sql += ` AND start_date <= ? AND end_date >= ?`;
      params.push(filters.start_date, filters.start_date);
    }

    sql += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      sql += ` LIMIT ?`;
      params.push(filters.limit);
      
      if (filters?.offset) {
        sql += ` OFFSET ?`;
        params.push(filters.offset);
      }
    }

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, params);
      const promotions = (rows as RowDataPacket[]).map((row: any) => ({
        promotion_id: row.promotion_id,
        name: row.name,
        description: row.description,
        type: row.type,
        discount_type: row.discount_type,
        discount_value: Number(row.discount_value),
        min_purchase: row.min_purchase ? Number(row.min_purchase) : undefined,
        max_discount: row.max_discount ? Number(row.max_discount) : undefined,
        start_date: row.start_date,
        end_date: row.end_date,
        applicable_hotels: row.applicable_hotels ? JSON.parse(row.applicable_hotels) : undefined,
        applicable_rooms: row.applicable_rooms ? JSON.parse(row.applicable_rooms) : undefined,
        applicable_dates: row.applicable_dates ? JSON.parse(row.applicable_dates) : undefined,
        day_of_week: row.day_of_week ? JSON.parse(row.day_of_week) : undefined,
        status: row.status,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return promotions;
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy promotion theo ID
   */
  async getPromotionById(promotionId: string): Promise<Promotion | null> {
    const sql = `
      SELECT 
        promotion_id,
        name,
        description,
        type,
        discount_type,
        discount_value,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        applicable_hotels,
        applicable_rooms,
        applicable_dates,
        day_of_week,
        status,
        created_by,
        created_at,
        updated_at
      FROM promotion
      WHERE promotion_id = ?
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [promotionId]);
      const row = (rows as RowDataPacket[])[0];

      if (!row) return null;

      return {
        promotion_id: row.promotion_id,
        name: row.name,
        description: row.description,
        type: row.type,
        discount_type: row.discount_type,
        discount_value: Number(row.discount_value),
        min_purchase: row.min_purchase ? Number(row.min_purchase) : undefined,
        max_discount: row.max_discount ? Number(row.max_discount) : undefined,
        start_date: row.start_date,
        end_date: row.end_date,
        applicable_hotels: row.applicable_hotels ? JSON.parse(row.applicable_hotels) : undefined,
        applicable_rooms: row.applicable_rooms ? JSON.parse(row.applicable_rooms) : undefined,
        applicable_dates: row.applicable_dates ? JSON.parse(row.applicable_dates) : undefined,
        day_of_week: row.day_of_week ? JSON.parse(row.day_of_week) : undefined,
        status: row.status,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } finally {
      conn.release();
    }
  }

  /**
   * Cập nhật promotion
   */
  async updatePromotion(
    promotionId: string,
    data: Partial<CreatePromotionData>
  ): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description || null);
    }

    if (data.type !== undefined) {
      updates.push('type = ?');
      params.push(data.type);
    }

    if (data.discount_type !== undefined) {
      updates.push('discount_type = ?');
      params.push(data.discount_type);
    }

    if (data.discount_value !== undefined) {
      updates.push('discount_value = ?');
      params.push(data.discount_value);
    }

    if (data.min_purchase !== undefined) {
      updates.push('min_purchase = ?');
      params.push(data.min_purchase || 0);
    }

    if (data.max_discount !== undefined) {
      updates.push('max_discount = ?');
      params.push(data.max_discount || null);
    }

    if (data.start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(data.start_date);
    }

    if (data.end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(data.end_date);
    }

    if (data.applicable_hotels !== undefined) {
      updates.push('applicable_hotels = ?');
      params.push(data.applicable_hotels ? JSON.stringify(data.applicable_hotels) : null);
    }

    if (data.applicable_rooms !== undefined) {
      updates.push('applicable_rooms = ?');
      params.push(data.applicable_rooms ? JSON.stringify(data.applicable_rooms) : null);
    }

    if (data.applicable_dates !== undefined) {
      updates.push('applicable_dates = ?');
      params.push(data.applicable_dates ? JSON.stringify(data.applicable_dates) : null);
    }

    if (data.day_of_week !== undefined) {
      updates.push('day_of_week = ?');
      params.push(data.day_of_week ? JSON.stringify(data.day_of_week) : null);
    }

    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length === 0) {
      return false;
    }

    const sql = `
      UPDATE promotion
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE promotion_id = ?
    `;
    params.push(promotionId);

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, params);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  /**
   * Xóa promotion (soft delete bằng cách set status = INACTIVE)
   */
  async deletePromotion(promotionId: string): Promise<boolean> {
    const sql = `
      UPDATE promotion
      SET status = 'INACTIVE'
      WHERE promotion_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [promotionId]);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  /**
   * Generate promotion ID (PRO20250104001)
   */
  private generatePromotionId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `PRO${year}${month}${day}${random}`;
  }

  /**
   * Lấy promotions áp dụng cho một schedule cụ thể
   */
  async getApplicablePromotions(params: {
    hotelId?: string;
    roomId?: string;
    date: string;
  }): Promise<Promotion[]> {
    const { hotelId, roomId, date } = params;
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ...

    let sql = `
      SELECT 
        promotion_id,
        name,
        description,
        type,
        discount_type,
        discount_value,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        applicable_hotels,
        applicable_rooms,
        applicable_dates,
        day_of_week,
        status,
        created_by
      FROM promotion
      WHERE status = 'ACTIVE'
        AND start_date <= ?
        AND end_date >= ?
    `;

    const sqlParams: any[] = [date, date];

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, sqlParams);
      const allPromotions = rows as RowDataPacket[];

      // Filter promotions dựa trên các điều kiện
      const applicablePromotions = allPromotions.filter((promo: any) => {
        // Check applicable_hotels
        if (promo.applicable_hotels && hotelId) {
          const hotels = JSON.parse(promo.applicable_hotels);
          if (!hotels.includes(hotelId)) return false;
        }

        // Check applicable_rooms
        if (promo.applicable_rooms && roomId) {
          const rooms = JSON.parse(promo.applicable_rooms);
          if (!rooms.includes(roomId)) return false;
        }

        // Check applicable_dates
        if (promo.applicable_dates) {
          const dates = JSON.parse(promo.applicable_dates);
          if (!dates.includes(date)) return false;
        }

        // Check day_of_week
        if (promo.day_of_week) {
          const days = JSON.parse(promo.day_of_week);
          if (!days.includes(dayOfWeek)) return false;
        }

        return true;
      });

      // Parse và return
      return applicablePromotions.map((row: any) => ({
        promotion_id: row.promotion_id,
        name: row.name,
        description: row.description,
        type: row.type,
        discount_type: row.discount_type,
        discount_value: Number(row.discount_value),
        min_purchase: row.min_purchase ? Number(row.min_purchase) : undefined,
        max_discount: row.max_discount ? Number(row.max_discount) : undefined,
        start_date: row.start_date,
        end_date: row.end_date,
        applicable_hotels: row.applicable_hotels ? JSON.parse(row.applicable_hotels) : undefined,
        applicable_rooms: row.applicable_rooms ? JSON.parse(row.applicable_rooms) : undefined,
        applicable_dates: row.applicable_dates ? JSON.parse(row.applicable_dates) : undefined,
        day_of_week: row.day_of_week ? JSON.parse(row.day_of_week) : undefined,
        status: row.status,
        created_by: row.created_by
      }));
    } finally {
      conn.release();
    }
  }
}

