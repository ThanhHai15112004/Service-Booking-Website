import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export class AdminDiscountRepository {
  // Generate discount ID
  generateDiscountId(): string {
    const timestamp = Date.now().toString();
    return `DC${timestamp.slice(-8)}`;
  }

  // Get all discount codes with filters and pagination
  async getAllDiscountCodes(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    discountType?: string;
    expiryDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      discountType,
      expiryDate,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(dc.code LIKE ? OR dc.discount_id LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      whereConditions.push(`dc.status = ?`);
      queryParams.push(status);
    }

    // Check expiry date filter
    if (expiryDate === "expiring_soon") {
      whereConditions.push(`dc.expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)`);
    } else if (expiryDate === "expired") {
      whereConditions.push(`dc.expires_at < NOW()`);
    }

    // Auto-set EXPIRED status for expired codes
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM discount_code dc ${whereClause}`;
    const [countResult]: any = await pool.query(countSql, queryParams);
    const total = countResult[0]?.total || 0;

    // Auto-update expired status (run this check on every query)
    await pool.query(
      `UPDATE discount_code SET status = 'EXPIRED', updated_at = NOW() 
       WHERE expires_at < NOW() AND status IN ('ACTIVE', 'DISABLED')`
    );

    // Get discount codes
    // Note: Schema hiện tại chỉ có percentage_off, chưa có discount_type riêng
    // Tạm thời coi percentage_off > 0 là PERCENT, có thể thêm fixed_amount sau
    const sql = `
      SELECT 
        dc.discount_id,
        dc.code,
        CASE 
          WHEN dc.percentage_off IS NOT NULL AND dc.percentage_off > 0 THEN 'PERCENT'
          ELSE 'FIXED'
        END as discount_type,
        COALESCE(dc.percentage_off, 0) as discount_value,
        dc.max_discount,
        dc.expires_at as expiry_date,
        DATE(dc.created_at) as start_date,
        dc.usage_count,
        dc.usage_limit,
        dc.min_nights,
        dc.max_nights,
        dc.applicable_hotels,
        dc.status,
        dc.created_at,
        dc.updated_at,
        dc.conditions
      FROM discount_code dc
      ${whereClause}
      ORDER BY dc.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [codes]: any = await pool.query(sql, [...queryParams, limit, offset]);

    // Parse JSON fields
    const parsedCodes = codes.map((code: any) => {
      let applicable_hotels = [];
      let conditions = {};

      try {
        if (code.applicable_hotels) {
          applicable_hotels = typeof code.applicable_hotels === 'string' 
            ? JSON.parse(code.applicable_hotels) 
            : code.applicable_hotels;
        }
      } catch (e) {
        applicable_hotels = [];
      }

      try {
        if (code.conditions) {
          conditions = typeof code.conditions === 'string' 
            ? JSON.parse(code.conditions) 
            : code.conditions;
        }
      } catch (e) {
        conditions = {};
      }

      // Determine discount_type and discount_value
      let discount_type = code.discount_type;
      let discount_value = code.discount_value;

      // If percentage_off is null but has fixed_amount in conditions, it's FIXED
      if (!code.discount_value || code.discount_value === 0) {
        if ((conditions as any).fixed_amount) {
          discount_type = 'FIXED';
          discount_value = (conditions as any).fixed_amount;
        }
      }

      // Get applicable_categories from conditions
      let applicable_categories: string[] = [];
      if ((conditions as any).applicable_categories) {
        applicable_categories = Array.isArray((conditions as any).applicable_categories)
          ? (conditions as any).applicable_categories
          : [];
      }

      return {
        ...code,
        discount_type,
        discount_value,
        applicable_hotels: Array.isArray(applicable_hotels) ? applicable_hotels : [],
        applicable_categories: applicable_categories,
        min_purchase: (conditions as any).min_purchase || null,
        per_user_limit: (conditions as any).per_user_limit || null,
      };
    });

    return {
      codes: parsedCodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get discount code detail
  async getDiscountCodeDetail(discountId: string) {
    const conn = await pool.getConnection();
    try {
      // Get discount code
      const [codes]: any = await conn.query(
        `SELECT 
          dc.discount_id,
          dc.code,
          CASE 
            WHEN dc.percentage_off IS NOT NULL AND dc.percentage_off > 0 THEN 'PERCENT'
            ELSE 'FIXED'
          END as discount_type,
          COALESCE(dc.percentage_off, 0) as discount_value,
          dc.max_discount,
          dc.expires_at as expiry_date,
          DATE(dc.created_at) as start_date,
          dc.usage_count,
          dc.usage_limit,
          dc.min_nights,
          dc.max_nights,
          dc.applicable_hotels,
          dc.status,
          dc.created_at,
          dc.updated_at,
          dc.conditions
        FROM discount_code dc
        WHERE dc.discount_id = ?`,
        [discountId]
      );

      if (!codes || codes.length === 0) {
        return null;
      }

      const code = codes[0];

      // Parse JSON fields
      let applicable_hotels = [];
      let conditions = {};

      try {
        if (code.applicable_hotels) {
          applicable_hotels = typeof code.applicable_hotels === 'string' 
            ? JSON.parse(code.applicable_hotels) 
            : code.applicable_hotels;
        }
      } catch (e) {
        applicable_hotels = [];
      }

      try {
        if (code.conditions) {
          conditions = typeof code.conditions === 'string' 
            ? JSON.parse(code.conditions) 
            : code.conditions;
        }
      } catch (e) {
        conditions = {};
      }

      // Determine discount_type and discount_value
      let discount_type = code.discount_type;
      let discount_value = code.discount_value;

      // If percentage_off is null but has fixed_amount in conditions, it's FIXED
      if (!code.discount_value || code.discount_value === 0) {
        if ((conditions as any).fixed_amount) {
          discount_type = 'FIXED';
          discount_value = (conditions as any).fixed_amount;
        }
      }

      // Get applicable_categories from conditions
      let applicable_categories: string[] = [];
      if ((conditions as any).applicable_categories) {
        applicable_categories = Array.isArray((conditions as any).applicable_categories)
          ? (conditions as any).applicable_categories
          : [];
      }

      // Get hotel names for applicable_hotels
      const hotelIds = Array.isArray(applicable_hotels) ? applicable_hotels : [];
      let hotels: any[] = [];
      if (hotelIds.length > 0) {
        const placeholders = hotelIds.map(() => '?').join(',');
        const [hotelRows]: any = await conn.query(
          `SELECT hotel_id, name FROM hotel WHERE hotel_id IN (${placeholders})`,
          hotelIds
        );
        hotels = hotelRows || [];
      }

      // Get category names for applicable_categories
      let categories: any[] = [];
      if (applicable_categories.length > 0) {
        const categoryPlaceholders = applicable_categories.map(() => '?').join(',');
        const [categoryRows]: any = await conn.query(
          `SELECT category_id, name FROM hotel_category WHERE category_id IN (${categoryPlaceholders})`,
          applicable_categories
        );
        categories = categoryRows || [];
      }

      // Get total discount amount from bookings
      const [discountStats]: any = await conn.query(
        `SELECT 
          COALESCE(SUM(bd.discount_amount), 0) as total_discount_amount,
          COUNT(DISTINCT bd.booking_id) as usage_count
        FROM booking_discount bd
        WHERE bd.discount_id = ?`,
        [discountId]
      );

      // Get top customers who used this code
      const [topCustomers]: any = await conn.query(
        `SELECT 
          a.account_id,
          a.full_name,
          COUNT(DISTINCT bd.booking_id) as usage_count,
          SUM(bd.discount_amount) as total_saved
        FROM booking_discount bd
        JOIN booking b ON b.booking_id = bd.booking_id
        JOIN account a ON a.account_id = b.account_id
        WHERE bd.discount_id = ?
        GROUP BY a.account_id, a.full_name
        ORDER BY usage_count DESC, total_saved DESC
        LIMIT 10`,
        [discountId]
      );

      // Get applicable dates from conditions
      const applicable_start_date = (conditions as any).applicable_start_date || null;
      const applicable_end_date = (conditions as any).applicable_end_date || null;

      return {
        ...code,
        discount_type,
        discount_value,
        applicable_hotels: hotels,
        applicable_categories: categories,
        min_purchase: (conditions as any).min_purchase || null,
        per_user_limit: (conditions as any).per_user_limit || null,
        applicable_start_date,
        applicable_end_date,
        total_discount_amount: Number(discountStats[0]?.total_discount_amount || 0),
        top_customers: topCustomers || [],
        history: await this.getDiscountCodeHistory(discountId), // Generate history dynamically
      };
    } finally {
      conn.release();
    }
  }

  // Create discount code
  async createDiscountCode(data: {
    code: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
    max_discount?: number;
    min_purchase?: number;
    usage_limit?: number;
    per_user_limit?: number;
    start_date: string;
    expiry_date: string;
    min_nights?: number;
    max_nights?: number;
    applicable_hotels?: string[];
    applicable_categories?: string[];
    status: "ACTIVE" | "INACTIVE";
  }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Check if code already exists
      const [existing]: any = await conn.query(
        `SELECT discount_id FROM discount_code WHERE code = ?`,
        [data.code]
      );

      if (existing && existing.length > 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Mã giảm giá đã tồn tại",
        };
      }

      const discountId = this.generateDiscountId();

      // Prepare conditions JSON
      const conditions: any = {};
      if (data.min_purchase) conditions.min_purchase = data.min_purchase;
      if (data.per_user_limit) conditions.per_user_limit = data.per_user_limit;
      
      // Add applicable dates to conditions
      if ((data as any).applicable_start_date) {
        conditions.applicable_start_date = (data as any).applicable_start_date;
      }
      if ((data as any).applicable_end_date) {
        conditions.applicable_end_date = (data as any).applicable_end_date;
      }

      // Map discount_type to percentage_off
      // Note: Schema hiện tại chỉ hỗ trợ percentage_off, nếu FIXED thì cần lưu vào conditions
      const percentage_off = data.discount_type === "PERCENT" ? data.discount_value : null;
      if (data.discount_type === "FIXED") {
        conditions.fixed_amount = data.discount_value;
      }

      // Prepare applicable_hotels JSON
      const applicable_hotels = data.applicable_hotels && data.applicable_hotels.length > 0
        ? JSON.stringify(data.applicable_hotels)
        : null;

      // Prepare applicable_categories JSON (store in conditions for now, as schema doesn't have this field)
      if (data.applicable_categories && data.applicable_categories.length > 0) {
        conditions.applicable_categories = data.applicable_categories;
      }

      // Map status: INACTIVE -> DISABLED (vì schema chỉ có DISABLED)
      const status = data.status === "INACTIVE" ? "DISABLED" : data.status;

      // Insert discount code
      // Note: Schema không có start_date riêng, dùng created_at làm start_date
      const insertSql = `
        INSERT INTO discount_code (
          discount_id,
          code,
          percentage_off,
          max_discount,
          expires_at,
          conditions,
          applicable_hotels,
          min_nights,
          max_nights,
          usage_limit,
          usage_count,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `;

      // Use start_date if provided, otherwise use current date
      const startDate = data.start_date ? new Date(data.start_date) : new Date();
      
      await conn.query(insertSql, [
        discountId,
        data.code.toUpperCase().trim(),
        percentage_off,
        data.max_discount || null,
        data.expiry_date,
        Object.keys(conditions).length > 0 ? JSON.stringify(conditions) : null,
        applicable_hotels,
        data.min_nights || null,
        data.max_nights || null,
        data.usage_limit || null,
        status,
        startDate,
      ]);

      await conn.commit();

      return {
        success: true,
        discountId,
        message: "Tạo mã giảm giá thành công",
      };
    } catch (error: any) {
      await conn.rollback();
      console.error("[AdminDiscountRepository] createDiscountCode error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Update discount code
  async updateDiscountCode(
    discountId: string,
    data: Partial<{
      code: string;
      discount_type: "PERCENT" | "FIXED";
      discount_value: number;
      max_discount?: number;
      min_purchase?: number;
      usage_limit?: number;
      per_user_limit?: number;
      start_date: string;
      expiry_date: string;
      min_nights?: number;
      max_nights?: number;
      applicable_hotels?: string[];
      applicable_categories?: string[];
      status: "ACTIVE" | "INACTIVE" | "EXPIRED";
    }>
  ) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Get current discount code
      const [current]: any = await conn.query(
        `SELECT conditions, percentage_off FROM discount_code WHERE discount_id = ?`,
        [discountId]
      );

      if (!current || current.length === 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Không tìm thấy mã giảm giá",
        };
      }

      // Check code uniqueness if code is being updated
      if (data.code) {
        const [existing]: any = await conn.query(
          `SELECT discount_id FROM discount_code WHERE code = ? AND discount_id != ?`,
          [data.code, discountId]
        );

        if (existing && existing.length > 0) {
          await conn.rollback();
          return {
            success: false,
            message: "Mã giảm giá đã tồn tại",
          };
        }
      }

      // Parse current conditions
      let conditions: any = {};
      try {
        if (current[0].conditions) {
          conditions = typeof current[0].conditions === 'string'
            ? JSON.parse(current[0].conditions)
            : current[0].conditions;
        }
      } catch (e) {
        conditions = {};
      }

      // Update conditions - preserve existing conditions first
      // Update conditions fields
      if (data.min_purchase !== undefined) {
        if (data.min_purchase !== null && data.min_purchase > 0) {
          conditions.min_purchase = data.min_purchase;
        } else {
          delete conditions.min_purchase;
        }
      }

      if (data.per_user_limit !== undefined) {
        if (data.per_user_limit !== null && data.per_user_limit > 0) {
          conditions.per_user_limit = data.per_user_limit;
        } else {
          delete conditions.per_user_limit;
        }
      }

      // Handle applicable_categories
      if (data.applicable_categories !== undefined) {
        if (data.applicable_categories && data.applicable_categories.length > 0) {
          conditions.applicable_categories = data.applicable_categories;
        } else {
          delete conditions.applicable_categories;
        }
      }

      // Handle applicable dates
      if ((data as any).applicable_start_date !== undefined) {
        if ((data as any).applicable_start_date) {
          conditions.applicable_start_date = (data as any).applicable_start_date;
        } else {
          delete conditions.applicable_start_date;
        }
      }
      if ((data as any).applicable_end_date !== undefined) {
        if ((data as any).applicable_end_date) {
          conditions.applicable_end_date = (data as any).applicable_end_date;
        } else {
          delete conditions.applicable_end_date;
        }
      }

      // Update discount type and value
      let percentage_off = current[0].percentage_off;
      
      // If discount_type is being changed
      if (data.discount_type === "PERCENT") {
        if (data.discount_value !== undefined) {
          percentage_off = data.discount_value;
        }
        // Remove fixed_amount from conditions if switching to PERCENT
        if (conditions.fixed_amount) delete conditions.fixed_amount;
      } else if (data.discount_type === "FIXED") {
        percentage_off = null;
        if (data.discount_value !== undefined) {
          conditions.fixed_amount = data.discount_value;
        }
      } else if (data.discount_value !== undefined) {
        // If only discount_value is being updated (not discount_type)
        // Check current type: if percentage_off exists, it's PERCENT, otherwise it's FIXED
        if (percentage_off !== null && percentage_off > 0) {
          // Currently PERCENT, update percentage_off
          percentage_off = data.discount_value;
        } else {
          // Currently FIXED, update fixed_amount in conditions
          conditions.fixed_amount = data.discount_value;
        }
      }

      // Prepare applicable_hotels
      let applicable_hotels = null;
      if (data.applicable_hotels !== undefined) {
        applicable_hotels = data.applicable_hotels && data.applicable_hotels.length > 0
          ? JSON.stringify(data.applicable_hotels)
          : null;
      }

      // Map status: INACTIVE -> DISABLED (vì schema chỉ có DISABLED)
      const status = data.status === "INACTIVE" ? ("DISABLED" as "ACTIVE" | "EXPIRED" | "DISABLED") : data.status;

      // Build UPDATE query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.code) {
        updateFields.push("code = ?");
        updateValues.push(data.code);
      }

      if (percentage_off !== undefined) {
        updateFields.push("percentage_off = ?");
        updateValues.push(percentage_off);
      }

      if (data.max_discount !== undefined) {
        updateFields.push("max_discount = ?");
        updateValues.push(data.max_discount || null);
      }

      if (data.expiry_date) {
        updateFields.push("expires_at = ?");
        updateValues.push(data.expiry_date);
      }

      // Update conditions if any condition-related field is being updated
      // Always update conditions to ensure consistency
      if (data.min_purchase !== undefined || 
          data.per_user_limit !== undefined || 
          data.applicable_categories !== undefined ||
          data.discount_type === "FIXED" ||
          (data.discount_type === undefined && data.discount_value !== undefined && percentage_off === null)) {
        updateFields.push("conditions = ?");
        updateValues.push(Object.keys(conditions).length > 0 ? JSON.stringify(conditions) : null);
      }

      if (applicable_hotels !== undefined) {
        updateFields.push("applicable_hotels = ?");
        updateValues.push(applicable_hotels);
      }

      if (data.min_nights !== undefined) {
        updateFields.push("min_nights = ?");
        updateValues.push(data.min_nights || null);
      }

      if (data.max_nights !== undefined) {
        updateFields.push("max_nights = ?");
        updateValues.push(data.max_nights || null);
      }

      if (data.usage_limit !== undefined) {
        updateFields.push("usage_limit = ?");
        updateValues.push(data.usage_limit || null);
      }

      if (status) {
        updateFields.push("status = ?");
        updateValues.push(status);
      }

      updateFields.push("updated_at = NOW()");
      updateValues.push(discountId);

      const updateSql = `UPDATE discount_code SET ${updateFields.join(", ")} WHERE discount_id = ?`;
      await conn.query(updateSql, updateValues);

      await conn.commit();

      return {
        success: true,
        message: "Cập nhật mã giảm giá thành công",
      };
    } catch (error: any) {
      await conn.rollback();
      console.error("[AdminDiscountRepository] updateDiscountCode error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Delete discount code
  async deleteDiscountCode(discountId: string) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Check if code has been used
      const [usage]: any = await conn.query(
        `SELECT COUNT(*) as count FROM booking_discount WHERE discount_id = ?`,
        [discountId]
      );

      if (usage[0]?.count > 0) {
        // Soft delete: set status to DISABLED
        await conn.query(
          `UPDATE discount_code SET status = 'DISABLED', updated_at = NOW() WHERE discount_id = ?`,
          [discountId]
        );
        await conn.commit();
        return {
          success: true,
          message: "Đã vô hiệu hóa mã giảm giá (mã đã được sử dụng)",
          softDelete: true,
        };
      } else {
        // Hard delete: remove from database
        await conn.query(`DELETE FROM discount_code WHERE discount_id = ?`, [discountId]);
        await conn.commit();
        return {
          success: true,
          message: "Đã xóa mã giảm giá",
          softDelete: false,
        };
      }
    } catch (error: any) {
      await conn.rollback();
      console.error("[AdminDiscountRepository] deleteDiscountCode error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Toggle discount code status
  async toggleDiscountCodeStatus(discountId: string) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Get current status
      const [current]: any = await conn.query(
        `SELECT status, expires_at FROM discount_code WHERE discount_id = ?`,
        [discountId]
      );

      if (!current || current.length === 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Không tìm thấy mã giảm giá",
        };
      }

      let newStatus = current[0].status;

      // Auto-expire if expired
      if (new Date(current[0].expires_at) < new Date()) {
        newStatus = "EXPIRED";
      } else {
        // Toggle between ACTIVE and DISABLED
        if (current[0].status === "ACTIVE") {
          newStatus = "DISABLED";
        } else if (current[0].status === "DISABLED" || current[0].status === "EXPIRED") {
          newStatus = "ACTIVE";
        }
      }

      await conn.query(
        `UPDATE discount_code SET status = ?, updated_at = NOW() WHERE discount_id = ?`,
        [newStatus, discountId]
      );

      await conn.commit();

      return {
        success: true,
        status: newStatus,
        message: `Đã ${newStatus === "ACTIVE" ? "kích hoạt" : newStatus === "DISABLED" ? "vô hiệu hóa" : "đánh dấu hết hạn"} mã giảm giá`,
      };
    } catch (error: any) {
      await conn.rollback();
      console.error("[AdminDiscountRepository] toggleDiscountCodeStatus error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Extend discount code expiry
  async extendDiscountCodeExpiry(discountId: string, days: number) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [current]: any = await conn.query(
        `SELECT expires_at, status FROM discount_code WHERE discount_id = ?`,
        [discountId]
      );

      if (!current || current.length === 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Không tìm thấy mã giảm giá",
        };
      }

      const currentExpiry = new Date(current[0].expires_at);
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + days);

      // If status was EXPIRED and new expiry is in future, set to ACTIVE
      let newStatus = current[0].status;
      if (current[0].status === "EXPIRED" && newExpiry > new Date()) {
        newStatus = "ACTIVE";
      }

      await conn.query(
        `UPDATE discount_code SET expires_at = ?, status = ?, updated_at = NOW() WHERE discount_id = ?`,
        [newExpiry, newStatus, discountId]
      );

      await conn.commit();

      return {
        success: true,
        newExpiry: newExpiry.toISOString(),
        message: `Đã gia hạn mã giảm giá thêm ${days} ngày`,
      };
    } catch (error: any) {
      await conn.rollback();
      console.error("[AdminDiscountRepository] extendDiscountCodeExpiry error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    const conn = await pool.getConnection();
    try {
      // Auto-update expired status
      await conn.query(
        `UPDATE discount_code SET status = 'EXPIRED', updated_at = NOW() 
         WHERE expires_at < NOW() AND status IN ('ACTIVE', 'DISABLED')`
      );

      // Total active codes
      const [totalActive]: any = await conn.query(
        `SELECT COUNT(*) as count FROM discount_code WHERE status = 'ACTIVE'`
      );

      // Expiring soon (within 7 days)
      const [expiringSoon]: any = await conn.query(
        `SELECT COUNT(*) as count FROM discount_code 
         WHERE expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY) 
         AND status = 'ACTIVE'`
      );

      // Expired/Disabled
      const [expiredDisabled]: any = await conn.query(
        `SELECT COUNT(*) as count FROM discount_code 
         WHERE status IN ('EXPIRED', 'DISABLED')`
      );

      // Monthly usage (current month)
      const [monthlyUsage]: any = await conn.query(
        `SELECT COUNT(*) as count FROM booking_discount bd
         JOIN booking b ON b.booking_id = bd.booking_id
         WHERE MONTH(b.created_at) = MONTH(NOW()) 
         AND YEAR(b.created_at) = YEAR(NOW())`
      );

      // Total discount amount (all time)
      const [totalDiscount]: any = await conn.query(
        `SELECT COALESCE(SUM(discount_amount), 0) as total FROM booking_discount`
      );

      // Codes created by month (last 12 months)
      const [codesByMonth]: any = await conn.query(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          DATE_FORMAT(created_at, '%m') as month_num,
          COUNT(*) as count
        FROM discount_code
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%m')
        ORDER BY month ASC`
      );

      // Discount type distribution
      const [typeDistribution]: any = await conn.query(
        `SELECT 
          CASE 
            WHEN percentage_off IS NOT NULL AND percentage_off > 0 THEN 'Percent'
            ELSE 'Fixed'
          END as type,
          COUNT(*) as count
        FROM discount_code
        GROUP BY type`
      );

      const totalCodes = typeDistribution.reduce((sum: number, item: any) => sum + item.count, 0);
      const typeDistributionWithPercentage = typeDistribution.map((item: any) => ({
        type: item.type,
        count: item.count,
        percentage: totalCodes > 0 ? (item.count / totalCodes) * 100 : 0,
      }));

      // Discount revenue trend (last 30 days)
      const [revenueTrend]: any = await conn.query(
        `SELECT 
          DATE_FORMAT(b.created_at, '%d/%m') as date,
          COALESCE(SUM(bd.discount_amount), 0) as amount
        FROM booking_discount bd
        JOIN booking b ON b.booking_id = bd.booking_id
        WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m-%d'), DATE_FORMAT(b.created_at, '%d/%m')
        ORDER BY DATE_FORMAT(b.created_at, '%Y-%m-%d') ASC`
      );

      // Top 5 codes by usage
      const [topCodes]: any = await conn.query(
        `SELECT 
          dc.code,
          COUNT(DISTINCT bd.booking_id) as usage_count,
          COALESCE(SUM(bd.discount_amount), 0) as discount_amount
        FROM discount_code dc
        LEFT JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        GROUP BY dc.discount_id, dc.code
        ORDER BY usage_count DESC
        LIMIT 5`
      );

      // Top 5 users by discount usage
      const [topUsers]: any = await conn.query(
        `SELECT 
          a.account_id,
          a.full_name,
          COUNT(DISTINCT bd.booking_id) as usage_count,
          COALESCE(SUM(bd.discount_amount), 0) as total_saved
        FROM booking_discount bd
        JOIN booking b ON b.booking_id = bd.booking_id
        JOIN account a ON a.account_id = b.account_id
        GROUP BY a.account_id, a.full_name
        ORDER BY usage_count DESC, total_saved DESC
        LIMIT 5`
      );

      return {
        totalActive: totalActive[0]?.count || 0,
        expiringSoon: expiringSoon[0]?.count || 0,
        expiredDisabled: expiredDisabled[0]?.count || 0,
        monthlyUsage: monthlyUsage[0]?.count || 0,
        totalDiscountAmount: Number(totalDiscount[0]?.total || 0),
        codesCreatedByMonth: codesByMonth.map((item: any) => ({
          month: `Th${item.month_num}`,
          count: item.count,
        })),
        discountTypeDistribution: typeDistributionWithPercentage,
        discountRevenueTrend: revenueTrend.map((item: any) => ({
          date: item.date,
          amount: Number(item.amount),
        })),
        topCodes: topCodes.map((item: any) => ({
          code: item.code,
          usage_count: item.usage_count,
          discount_amount: Number(item.discount_amount),
        })),
        topUsers: topUsers.map((item: any) => ({
          account_id: item.account_id,
          full_name: item.full_name,
          usage_count: item.usage_count,
          total_saved: Number(item.total_saved),
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Get discount usage analytics
  async getDiscountUsageAnalytics(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { period = "month", startDate, endDate } = filters;

    let dateCondition = "";
    let dateParams: any[] = [];

    if (period === "custom" && startDate && endDate) {
      dateCondition = "WHERE b.created_at BETWEEN ? AND ?";
      dateParams = [startDate, endDate];
    } else if (period === "7days") {
      dateCondition = "WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === "month") {
      dateCondition = "WHERE MONTH(b.created_at) = MONTH(NOW()) AND YEAR(b.created_at) = YEAR(NOW())";
    } else if (period === "quarter") {
      dateCondition = "WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    } else if (period === "year") {
      dateCondition = "WHERE YEAR(b.created_at) = YEAR(NOW())";
    }

    const conn = await pool.getConnection();
    try {
      // Total usage
      const [totalUsage]: any = await conn.query(
        `SELECT COUNT(*) as count FROM booking_discount bd
         JOIN booking b ON b.booking_id = bd.booking_id
         ${dateCondition}`,
        dateParams
      );

      // Total discount amount
      const [totalDiscount]: any = await conn.query(
        `SELECT COALESCE(SUM(bd.discount_amount), 0) as total FROM booking_discount bd
         JOIN booking b ON b.booking_id = bd.booking_id
         ${dateCondition}`,
        dateParams
      );

      // Usage rate (percentage of bookings that used discount codes)
      const [totalBookings]: any = await conn.query(
        `SELECT COUNT(*) as count FROM booking b ${dateCondition.replace('b.created_at', 'b.created_at')}`,
        dateCondition ? dateParams : []
      );

      const usageRate = totalBookings[0]?.count > 0
        ? (totalUsage[0]?.count / totalBookings[0].count) * 100
        : 0;

      // Top codes by usage
      const [topCodesByUsage]: any = await conn.query(
        `SELECT 
          dc.code,
          COUNT(DISTINCT bd.booking_id) as usage_count,
          COALESCE(SUM(bd.discount_amount), 0) as discount_amount
        FROM discount_code dc
        JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}
        GROUP BY dc.discount_id, dc.code
        ORDER BY usage_count DESC
        LIMIT 5`,
        dateParams
      );

      // Top codes by revenue (discount amount)
      const [topCodesByRevenue]: any = await conn.query(
        `SELECT 
          dc.code,
          COUNT(DISTINCT bd.booking_id) as usage_count,
          COALESCE(SUM(bd.discount_amount), 0) as discount_amount
        FROM discount_code dc
        JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}
        GROUP BY dc.discount_id, dc.code
        ORDER BY discount_amount DESC
        LIMIT 5`,
        dateParams
      );

      // Usage by type
      const [usageByType]: any = await conn.query(
        `SELECT 
          CASE 
            WHEN dc.percentage_off IS NOT NULL AND dc.percentage_off > 0 THEN 'Percent'
            ELSE 'Fixed'
          END as type,
          COUNT(DISTINCT bd.booking_id) as usage_count
        FROM discount_code dc
        JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}
        GROUP BY type`,
        dateParams
      );

      const totalUsageCount = usageByType.reduce((sum: number, item: any) => sum + item.usage_count, 0);
      const usageByTypeWithPercentage = usageByType.map((item: any) => ({
        type: item.type,
        usage_count: item.usage_count,
        percentage: totalUsageCount > 0 ? (item.usage_count / totalUsageCount) * 100 : 0,
      }));

      // Usage by day
      const [usageByDay]: any = await conn.query(
        `SELECT 
          DATE_FORMAT(b.created_at, '%d/%m') as date,
          COUNT(DISTINCT bd.booking_id) as usage_count
        FROM booking_discount bd
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m-%d'), DATE_FORMAT(b.created_at, '%d/%m')
        ORDER BY DATE_FORMAT(b.created_at, '%Y-%m-%d') ASC`,
        dateParams
      );

      // Discount by code
      const [discountByCode]: any = await conn.query(
        `SELECT 
          dc.code,
          COALESCE(SUM(bd.discount_amount), 0) as discount_amount
        FROM discount_code dc
        JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}
        GROUP BY dc.discount_id, dc.code
        ORDER BY discount_amount DESC
        LIMIT 10`,
        dateParams
      );

      return {
        totalUsage: totalUsage[0]?.count || 0,
        totalDiscountAmount: Number(totalDiscount[0]?.total || 0),
        usageRate: Number(usageRate.toFixed(2)),
        topCodesByUsage: topCodesByUsage.map((item: any) => ({
          code: item.code,
          usage_count: item.usage_count,
          discount_amount: Number(item.discount_amount),
        })),
        topCodesByRevenue: topCodesByRevenue.map((item: any) => ({
          code: item.code,
          usage_count: item.usage_count,
          discount_amount: Number(item.discount_amount),
        })),
        usageByType: usageByTypeWithPercentage,
        usageByDay: usageByDay.map((item: any) => ({
          date: item.date,
          usage_count: item.usage_count,
        })),
        discountByCode: discountByCode.map((item: any) => ({
          code: item.code,
          discount_amount: Number(item.discount_amount),
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Get discount reports
  async getDiscountReports(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }) {
    const { period = "month", startDate, endDate, groupBy = "code" } = filters;

    let dateCondition = "";
    let dateParams: any[] = [];

    if (period === "custom" && startDate && endDate) {
      dateCondition = "WHERE b.created_at BETWEEN ? AND ?";
      dateParams = [startDate, endDate];
    } else if (period === "7days") {
      dateCondition = "WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === "month") {
      dateCondition = "WHERE MONTH(b.created_at) = MONTH(NOW()) AND YEAR(b.created_at) = YEAR(NOW())";
    } else if (period === "quarter") {
      dateCondition = "WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)";
    } else if (period === "year") {
      dateCondition = "WHERE YEAR(b.created_at) = YEAR(NOW())";
    }

    const conn = await pool.getConnection();
    try {
      // Total usage by code
      const [totalUsageByCode]: any = await conn.query(
        `SELECT 
          dc.code,
          COUNT(DISTINCT bd.booking_id) as usage_count,
          COALESCE(SUM(bd.discount_amount), 0) as discount_amount
        FROM discount_code dc
        LEFT JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        LEFT JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition || "WHERE 1=1"}
        GROUP BY dc.discount_id, dc.code
        ORDER BY usage_count DESC
        LIMIT 10`,
        dateCondition ? dateParams : []
      );

      // Total discount revenue
      const [totalDiscountRevenue]: any = await conn.query(
        `SELECT COALESCE(SUM(bd.discount_amount), 0) as total FROM booking_discount bd
         JOIN booking b ON b.booking_id = bd.booking_id
         ${dateCondition}`,
        dateParams
      );

      // Top code by booking count
      const [topCodeByBooking]: any = await conn.query(
        `SELECT 
          dc.code,
          COUNT(DISTINCT bd.booking_id) as booking_count
        FROM discount_code dc
        JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}
        GROUP BY dc.discount_id, dc.code
        ORDER BY booking_count DESC
        LIMIT 10`,
        dateParams
      );

      // Expired unused codes
      const [expiredUnusedCodes]: any = await conn.query(
        `SELECT 
          dc.code,
          dc.expires_at as expiry_date,
          dc.usage_count
        FROM discount_code dc
        LEFT JOIN booking_discount bd ON bd.discount_id = dc.discount_id
        WHERE dc.expires_at < NOW() 
        AND (dc.usage_count = 0 OR bd.booking_id IS NULL)
        ORDER BY dc.expires_at DESC
        LIMIT 20`
      );

      // Refund rate with code (bookings with discount that were cancelled)
      const [refundRate]: any = await conn.query(
        `SELECT 
          COUNT(DISTINCT CASE WHEN b.status = 'CANCELLED' THEN bd.booking_id END) as cancelled_with_code,
          COUNT(DISTINCT bd.booking_id) as total_with_code
        FROM booking_discount bd
        JOIN booking b ON b.booking_id = bd.booking_id
        ${dateCondition}`,
        dateParams
      );

      const refundRateWithCode = refundRate[0]?.total_with_code > 0
        ? (refundRate[0].cancelled_with_code / refundRate[0].total_with_code) * 100
        : 0;

      // Usage by customer (if groupBy = "customer")
      let usageByCustomer: any[] = [];
      if (groupBy === "customer") {
        const [customerUsage]: any = await conn.query(
          `SELECT 
            a.full_name as customer_name,
            COUNT(DISTINCT bd.booking_id) as usage_count,
            COALESCE(SUM(bd.discount_amount), 0) as total_saved
          FROM booking_discount bd
          JOIN booking b ON b.booking_id = bd.booking_id
          JOIN account a ON a.account_id = b.account_id
          ${dateCondition}
          GROUP BY a.account_id, a.full_name
          ORDER BY usage_count DESC
          LIMIT 20`,
          dateParams
        );
        usageByCustomer = customerUsage;
      }

      // Usage by hotel (if groupBy = "hotel")
      let usageByHotel: any[] = [];
      if (groupBy === "hotel") {
        const [hotelUsage]: any = await conn.query(
          `SELECT 
            h.name as hotel_name,
            COUNT(DISTINCT bd.booking_id) as usage_count,
            COALESCE(SUM(bd.discount_amount), 0) as discount_amount
          FROM booking_discount bd
          JOIN booking b ON b.booking_id = bd.booking_id
          JOIN hotel h ON h.hotel_id = b.hotel_id
          ${dateCondition}
          GROUP BY h.hotel_id, h.name
          ORDER BY usage_count DESC
          LIMIT 20`,
          dateParams
        );
        usageByHotel = hotelUsage;
      }

      return {
        totalUsageByCode: totalUsageByCode.map((item: any) => ({
          code: item.code,
          usage_count: item.usage_count,
          discount_amount: Number(item.discount_amount),
        })),
        totalDiscountRevenue: Number(totalDiscountRevenue[0]?.total || 0),
        topCodeByBooking: topCodeByBooking.map((item: any) => ({
          code: item.code,
          booking_count: item.booking_count,
        })),
        expiredUnusedCodes: expiredUnusedCodes.map((item: any) => ({
          code: item.code,
          expiry_date: item.expiry_date,
          usage_count: item.usage_count || 0,
        })),
        refundRateWithCode: Number(refundRateWithCode.toFixed(2)),
        usageByCustomer: usageByCustomer.map((item: any) => ({
          customer_name: item.customer_name,
          usage_count: item.usage_count,
          total_saved: Number(item.total_saved),
        })),
        usageByHotel: usageByHotel.map((item: any) => ({
          hotel_name: item.hotel_name,
          usage_count: item.usage_count,
          discount_amount: Number(item.discount_amount),
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Get discount users (users who used discount codes)
  async getDiscountUsers(filters: {
    page?: number;
    limit?: number;
    search?: string;
    discountCode?: string;
    customerEmail?: string;
    dateFrom?: string;
    dateTo?: string;
    bookingStatus?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      discountCode,
      customerEmail,
      dateFrom,
      dateTo,
      bookingStatus,
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(dc.code LIKE ? OR a.full_name LIKE ? OR a.email LIKE ? OR b.booking_id LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (discountCode) {
      whereConditions.push(`dc.code = ?`);
      queryParams.push(discountCode);
    }

    if (customerEmail) {
      whereConditions.push(`a.email LIKE ?`);
      queryParams.push(`%${customerEmail}%`);
    }

    if (dateFrom) {
      whereConditions.push(`b.created_at >= ?`);
      queryParams.push(dateFrom);
    }

    if (dateTo) {
      whereConditions.push(`b.created_at <= ?`);
      queryParams.push(dateTo);
    }

    if (bookingStatus) {
      whereConditions.push(`b.status = ?`);
      queryParams.push(bookingStatus);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM booking_discount bd
      JOIN booking b ON b.booking_id = bd.booking_id
      JOIN account a ON a.account_id = b.account_id
      JOIN discount_code dc ON dc.discount_id = bd.discount_id
      ${whereClause}
    `;
    const [countResult]: any = await pool.query(countSql, queryParams);
    const total = countResult[0]?.total || 0;

    // Get discount users
    const sql = `
      SELECT 
        bd.booking_id,
        dc.code as discount_code,
        a.account_id,
        a.full_name as customer_name,
        a.email as customer_email,
        bd.discount_amount,
        b.created_at as used_at,
        b.status as booking_status
      FROM booking_discount bd
      JOIN booking b ON b.booking_id = bd.booking_id
      JOIN account a ON a.account_id = b.account_id
      JOIN discount_code dc ON dc.discount_id = bd.discount_id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [users]: any = await pool.query(sql, [...queryParams, limit, offset]);

    return {
      users: users.map((user: any) => ({
        id: user.booking_id, // Use booking_id as unique identifier
        discount_code: user.discount_code,
        customer_name: user.customer_name,
        customer_email: user.customer_email,
        account_id: user.account_id,
        booking_id: user.booking_id,
        discount_amount: Number(user.discount_amount),
        used_at: user.used_at,
        booking_status: user.booking_status,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get applicable hotels
  async getApplicableHotels() {
    const [hotels]: any = await pool.query(
      `SELECT hotel_id, name FROM hotel WHERE status = 'ACTIVE' ORDER BY name ASC`
    );
    return hotels || [];
  }

  // Get applicable categories
  async getApplicableCategories() {
    const [categories]: any = await pool.query(
      `SELECT category_id, name FROM hotel_category ORDER BY name ASC`
    );
    return categories || [];
  }

  // Get discount code history (generate dynamically from existing data)
  async getDiscountCodeHistory(discountId: string): Promise<any[]> {
    const conn = await pool.getConnection();
    try {
      const logs: any[] = [];

      // Get discount code creation
      const [codeData]: any = await conn.query(
        `SELECT 
          discount_id,
          code,
          created_at,
          updated_at,
          status,
          expires_at
        FROM discount_code
        WHERE discount_id = ?`,
        [discountId]
      );

      if (!codeData || codeData.length === 0) {
        return [];
      }

      const code = codeData[0];

      // Log: Code creation
      logs.push({
        id: 1,
        date: code.created_at,
        admin_name: 'Hệ thống',
        action: 'Tạo mã giảm giá',
        note: `Mã ${code.code} được tạo`,
      });

      // Get usage history from booking_discount
      const [usageHistory]: any = await conn.query(
        `SELECT 
          bd.booking_id,
          b.created_at,
          a.full_name as customer_name,
          bd.discount_amount,
          b.status as booking_status
        FROM booking_discount bd
        JOIN booking b ON b.booking_id = bd.booking_id
        JOIN account a ON a.account_id = b.account_id
        WHERE bd.discount_id = ?
        ORDER BY b.created_at DESC
        LIMIT 20`,
        [discountId]
      );

      // Log: Each usage
      usageHistory.forEach((usage: any, index: number) => {
        logs.push({
          id: index + 2,
          date: usage.created_at,
          admin_name: usage.customer_name || 'Khách hàng',
          action: 'Sử dụng mã',
          note: `Booking ${usage.booking_id}: Giảm ${usage.discount_amount.toLocaleString('vi-VN')} VND`,
        });
      });

      // Get status changes from updated_at (if status changed)
      // Note: Since we don't have a status_history table, we infer from updated_at
      // If updated_at is different from created_at and status is not ACTIVE, it was changed
      if (code.updated_at && code.updated_at !== code.created_at) {
        if (code.status === 'EXPIRED') {
          logs.push({
            id: logs.length + 1,
            date: code.expires_at || code.updated_at,
            admin_name: 'Hệ thống',
            action: 'Mã hết hạn',
            note: `Mã ${code.code} đã hết hạn`,
          });
        } else if (code.status === 'DISABLED') {
          logs.push({
            id: logs.length + 1,
            date: code.updated_at,
            admin_name: 'Admin',
            action: 'Vô hiệu hóa mã',
            note: `Mã ${code.code} đã bị vô hiệu hóa`,
          });
        }
      }

      // Sort by date descending
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return logs;
    } finally {
      conn.release();
    }
  }
}
