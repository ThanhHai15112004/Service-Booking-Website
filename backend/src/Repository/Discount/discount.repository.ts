import pool from "../../config/db";
import { RowDataPacket } from "mysql2";

// =====================================================
// DISCOUNT REPOSITORY
// =====================================================

export class DiscountRepository {

  /**
   * Lấy account package discount percent
   */
  async getAccountPackageDiscount(accountId: string): Promise<number> {
    const sql = `
      SELECT ap.discount_percent
      FROM account a
      JOIN account_package ap ON a.package_id = ap.package_id
      WHERE a.account_id = ?
        AND ap.status = 'ACTIVE'
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [accountId]);
      const data = (rows as RowDataPacket[])[0];
      return data ? Number(data.discount_percent || 0) : 0;
    } finally {
      conn.release();
    }
  }

  /**
   * Validate discount code
   */
  async validateDiscountCode(
    code: string,
    subtotal: number,
    hotelId?: string,
    roomId?: string,
    nights?: number
  ): Promise<{
    valid: boolean;
    discountId?: string;
    discountAmount?: number;
    message?: string;
  }> {
    const sql = `
      SELECT 
        discount_id,
        code,
        percentage_off,
        max_discount,
        expires_at,
        status,
        conditions,
        applicable_hotels,
        applicable_rooms,
        min_nights,
        max_nights,
        usage_limit,
        usage_count
      FROM discount_code
      WHERE code = ?
        AND status = 'ACTIVE'
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [code]);
      const data = (rows as RowDataPacket[])[0];

      if (!data) {
        return {
          valid: false,
          message: "Mã giảm giá không tồn tại"
        };
      }

      // Check expires_at
      if (new Date(data.expires_at) < new Date()) {
        return {
          valid: false,
          message: "Mã giảm giá đã hết hạn"
        };
      }

      // Check usage limit
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        return {
          valid: false,
          message: "Mã giảm giá đã hết lượt sử dụng"
        };
      }

      // Check applicable_hotels
      if (data.applicable_hotels && hotelId) {
        try {
          const hotels = typeof data.applicable_hotels === 'string' 
            ? JSON.parse(data.applicable_hotels) 
            : data.applicable_hotels;
          if (Array.isArray(hotels) && !hotels.includes(hotelId)) {
            return {
              valid: false,
              message: "Mã giảm giá không áp dụng cho khách sạn này"
            };
          }
        } catch (error) {
          console.error("[DiscountRepository] Error parsing applicable_hotels:", error);
          // Nếu parse lỗi, bỏ qua check này
        }
      }

      // Check applicable_rooms
      if (data.applicable_rooms && roomId) {
        try {
          const rooms = typeof data.applicable_rooms === 'string'
            ? JSON.parse(data.applicable_rooms)
            : data.applicable_rooms;
          if (Array.isArray(rooms) && !rooms.includes(roomId)) {
            return {
              valid: false,
              message: "Mã giảm giá không áp dụng cho phòng này"
            };
          }
        } catch (error) {
          console.error("[DiscountRepository] Error parsing applicable_rooms:", error);
          // Nếu parse lỗi, bỏ qua check này
        }
      }

      // Check min_nights
      if (data.min_nights !== null && nights !== undefined && nights < data.min_nights) {
        return {
          valid: false,
          message: `Mã giảm giá yêu cầu tối thiểu ${data.min_nights} đêm`
        };
      }

      // Check max_nights
      if (data.max_nights !== null && nights !== undefined && nights > data.max_nights) {
        return {
          valid: false,
          message: `Mã giảm giá chỉ áp dụng tối đa ${data.max_nights} đêm`
        };
      }

      // Check min_purchase (nếu có trong conditions)
      // conditions có thể là JSON string hoặc plain text
      if (data.conditions) {
        try {
          const conditions = JSON.parse(data.conditions);
          if (conditions.min_purchase && subtotal < conditions.min_purchase) {
            return {
              valid: false,
              message: `Mã giảm giá yêu cầu đơn hàng tối thiểu ${conditions.min_purchase.toLocaleString('vi-VN')} VND`
            };
          }
        } catch {
          // conditions không phải JSON, bỏ qua
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (data.percentage_off) {
        discountAmount = subtotal * (Number(data.percentage_off) / 100);
        // Apply max_discount limit
        if (data.max_discount && discountAmount > Number(data.max_discount)) {
          discountAmount = Number(data.max_discount);
        }
      }

      return {
        valid: true,
        discountId: data.discount_id,
        discountAmount: Math.max(0, discountAmount)
      };

    } catch (error: any) {
      console.error("[DiscountRepository] validateDiscountCode error:", error.message);
      return {
        valid: false,
        message: "Lỗi khi validate mã giảm giá"
      };
    } finally {
      conn.release();
    }
  }

  /**
   * Tăng usage_count của discount code
   */
  async incrementDiscountCodeUsage(discountId: string): Promise<boolean> {
    const sql = `
      UPDATE discount_code
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE discount_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [discountId]);
      return (result as any).affectedRows > 0;
    } finally {
      conn.release();
    }
  }
}

