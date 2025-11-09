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
    accountId?: string,
    hotelId?: string,
    roomId?: string,
    nights?: number,
    checkInDate?: string
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
        created_at as start_date,
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

      // Auto-expire: Check if expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < now) {
        // Auto-update status to EXPIRED
        await conn.query(
          `UPDATE discount_code SET status = 'EXPIRED', updated_at = NOW() WHERE discount_id = ?`,
          [data.discount_id]
        );
        return {
          valid: false,
          message: "Mã giảm giá đã hết hạn"
        };
      }

      // Check start_date
      if (data.start_date) {
        const startDate = new Date(data.start_date);
        if (startDate > now) {
          return {
            valid: false,
            message: `Mã giảm giá chưa có hiệu lực. Có hiệu lực từ ${startDate.toLocaleDateString('vi-VN')}`
          };
        }
      }

      // Check usage limit
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        return {
          valid: false,
          message: "Mã giảm giá đã hết lượt sử dụng"
        };
      }

      // Parse conditions
      let conditions: any = {};
      try {
        if (data.conditions) {
          conditions = typeof data.conditions === 'string' 
            ? JSON.parse(data.conditions) 
            : data.conditions;
        }
      } catch (e) {
        // conditions không phải JSON, bỏ qua
      }

      // Check min_purchase
      if (conditions.min_purchase && subtotal < conditions.min_purchase) {
        return {
          valid: false,
          message: `Mã giảm giá yêu cầu đơn hàng tối thiểu ${conditions.min_purchase.toLocaleString('vi-VN')} VND`
        };
      }

      // Check per_user_limit
      if (conditions.per_user_limit && accountId) {
        const [userUsage]: any = await conn.query(
          `SELECT COUNT(*) as count 
           FROM booking_discount bd
           JOIN booking b ON b.booking_id = bd.booking_id
           WHERE bd.discount_id = ? AND b.account_id = ?`,
          [data.discount_id, accountId]
        );
        const userUsageCount = userUsage[0]?.count || 0;
        if (userUsageCount >= conditions.per_user_limit) {
          return {
            valid: false,
            message: `Bạn đã sử dụng mã giảm giá này ${userUsageCount} lần (tối đa ${conditions.per_user_limit} lần)`
          };
        }
      }

      // Check applicable_hotels
      if (data.applicable_hotels && hotelId) {
        try {
          const hotels = typeof data.applicable_hotels === 'string' 
            ? JSON.parse(data.applicable_hotels) 
            : data.applicable_hotels;
          if (Array.isArray(hotels) && hotels.length > 0 && !hotels.includes(hotelId)) {
            return {
              valid: false,
              message: "Mã giảm giá không áp dụng cho khách sạn này"
            };
          }
        } catch (error) {
          console.error("[DiscountRepository] Error parsing applicable_hotels:", error);
        }
      }

      // Check applicable_rooms
      if (data.applicable_rooms && roomId) {
        try {
          const rooms = typeof data.applicable_rooms === 'string'
            ? JSON.parse(data.applicable_rooms)
            : data.applicable_rooms;
          if (Array.isArray(rooms) && rooms.length > 0 && !rooms.includes(roomId)) {
            return {
              valid: false,
              message: "Mã giảm giá không áp dụng cho phòng này"
            };
          }
        } catch (error) {
          console.error("[DiscountRepository] Error parsing applicable_rooms:", error);
        }
      }

      // Check applicable_categories (if hotel has category and code has applicable_categories)
      if ((conditions as any).applicable_categories && hotelId) {
        try {
          const applicableCategories = Array.isArray((conditions as any).applicable_categories)
            ? (conditions as any).applicable_categories
            : [];
          
          if (applicableCategories.length > 0) {
            // Get hotel's category
            const [hotelCategory]: any = await conn.query(
              `SELECT category_id FROM hotel WHERE hotel_id = ?`,
              [hotelId]
            );
            
            if (hotelCategory && hotelCategory.length > 0) {
              const hotelCategoryId = hotelCategory[0].category_id;
              if (!applicableCategories.includes(hotelCategoryId)) {
                return {
                  valid: false,
                  message: "Mã giảm giá không áp dụng cho category khách sạn này"
                };
              }
            }
          }
        } catch (error) {
          console.error("[DiscountRepository] Error checking applicable_categories:", error);
          // Nếu lỗi, bỏ qua check này
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

      // Check applicable dates (if specified in conditions)
      if ((conditions as any).applicable_start_date && (conditions as any).applicable_end_date && checkInDate) {
        const applicableStart = new Date((conditions as any).applicable_start_date);
        const applicableEnd = new Date((conditions as any).applicable_end_date);
        const checkIn = new Date(checkInDate);
        
        // Set time to 00:00:00 for date comparison
        applicableStart.setHours(0, 0, 0, 0);
        applicableEnd.setHours(23, 59, 59, 999);
        checkIn.setHours(0, 0, 0, 0);

        if (checkIn < applicableStart || checkIn > applicableEnd) {
          return {
            valid: false,
            message: `Mã giảm giá này chỉ áp dụng từ ${applicableStart.toLocaleDateString('vi-VN')} đến ${applicableEnd.toLocaleDateString('vi-VN')}`
          };
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      
      // Check if PERCENT or FIXED
      if (data.percentage_off && data.percentage_off > 0) {
        // PERCENT type
        discountAmount = subtotal * (Number(data.percentage_off) / 100);
        // Apply max_discount limit
        if (data.max_discount && discountAmount > Number(data.max_discount)) {
          discountAmount = Number(data.max_discount);
        }
      } else if (conditions.fixed_amount) {
        // FIXED type
        discountAmount = Number(conditions.fixed_amount);
        // Don't allow discount more than subtotal
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
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

  /**
   * Lấy danh sách mã giảm giá available (public API)
   * Chỉ lấy các mã ACTIVE, chưa hết hạn, chưa hết lượt sử dụng
   */
  async getAvailableDiscountCodes(params?: {
    hotelId?: string;
    checkInDate?: string;
    nights?: number;
    limit?: number;
  }): Promise<any[]> {
    const { hotelId, checkInDate, nights, limit = 50 } = params || {};
    
    const sql = `
      SELECT 
        discount_id,
        code,
        percentage_off,
        max_discount,
        expires_at,
        created_at as start_date,
        status,
        conditions,
        applicable_hotels,
        applicable_rooms,
        min_nights,
        max_nights,
        usage_limit,
        usage_count
      FROM discount_code
      WHERE status = 'ACTIVE'
        AND expires_at > NOW()
        AND (usage_limit IS NULL OR usage_count < usage_limit)
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const conn = await pool.getConnection();
    try {
      // Auto-update expired status
      await conn.query(
        `UPDATE discount_code SET status = 'EXPIRED', updated_at = NOW() 
         WHERE expires_at < NOW() AND status = 'ACTIVE'`
      );

      const [rows] = await conn.query(sql, [limit]);
      const allCodes = rows as RowDataPacket[];

      // Filter codes based on optional params
      const availableCodes = allCodes.filter((code: any) => {
        // Check start_date
        if (code.start_date) {
          const startDate = new Date(code.start_date);
          const now = new Date();
          if (startDate > now) {
            return false;
          }
        }

        // Check applicable_hotels
        if (code.applicable_hotels && hotelId) {
          try {
            const hotels = typeof code.applicable_hotels === 'string'
              ? JSON.parse(code.applicable_hotels)
              : code.applicable_hotels;
            if (Array.isArray(hotels) && hotels.length > 0 && !hotels.includes(hotelId)) {
              return false;
            }
          } catch (error) {
            // Skip if parse error
          }
        }

        // Check min_nights
        if (code.min_nights !== null && nights !== undefined && nights < code.min_nights) {
          return false;
        }

        // Check max_nights
        if (code.max_nights !== null && nights !== undefined && nights > code.max_nights) {
          return false;
        }

        // Check applicable dates (if specified in conditions)
        if (checkInDate) {
          try {
            let conditions: any = {};
            if (code.conditions) {
              conditions = typeof code.conditions === 'string'
                ? JSON.parse(code.conditions)
                : code.conditions;
            }

            if (conditions.applicable_start_date && conditions.applicable_end_date) {
              const applicableStart = new Date(conditions.applicable_start_date);
              const applicableEnd = new Date(conditions.applicable_end_date);
              const checkIn = new Date(checkInDate);
              
              applicableStart.setHours(0, 0, 0, 0);
              applicableEnd.setHours(23, 59, 59, 999);
              checkIn.setHours(0, 0, 0, 0);

              if (checkIn < applicableStart || checkIn > applicableEnd) {
                return false;
              }
            }
          } catch (error) {
            // Skip if parse error
          }
        }

        return true;
      });

      // Format response
      return availableCodes.map((code: any) => {
        let conditions: any = {};
        try {
          if (code.conditions) {
            conditions = typeof code.conditions === 'string'
              ? JSON.parse(code.conditions)
              : code.conditions;
          }
        } catch (e) {
          // Skip if parse error
        }

        return {
          discount_id: code.discount_id,
          code: code.code,
          discount_type: code.percentage_off && code.percentage_off > 0 ? 'PERCENT' : 'FIXED',
          discount_value: code.percentage_off || conditions.fixed_amount || 0,
          max_discount: code.max_discount || null,
          description: conditions.description || null,
          expires_at: code.expires_at,
          min_purchase: conditions.min_purchase || null,
          min_nights: code.min_nights,
          max_nights: code.max_nights,
          usage_limit: code.usage_limit,
          usage_count: code.usage_count
        };
      });
    } finally {
      conn.release();
    }
  }
}

