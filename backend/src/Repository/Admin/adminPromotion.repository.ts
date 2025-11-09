import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PromotionRepository, Promotion, CreatePromotionData } from "../Promotion/promotion.repository";

export class AdminPromotionRepository extends PromotionRepository {
  
  // Get all promotions with filters, pagination, and sorting
  async getAllPromotions(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    discountType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      discountType,
      startDate,
      endDate,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Auto-update expired promotions
    await pool.query(
      `UPDATE promotion SET status = 'EXPIRED', updated_at = NOW() 
       WHERE end_date < CURDATE() AND status = 'ACTIVE'`
    );

    // Build WHERE conditions
    if (search) {
      whereConditions.push(`(p.name LIKE ? OR p.promotion_id LIKE ? OR p.description LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereConditions.push(`p.status = ?`);
      queryParams.push(status);
    }

    if (type) {
      whereConditions.push(`p.type = ?`);
      queryParams.push(type);
    }

    if (discountType) {
      whereConditions.push(`p.discount_type = ?`);
      queryParams.push(discountType);
    }

    if (startDate) {
      whereConditions.push(`p.start_date >= ?`);
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push(`p.end_date <= ?`);
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM promotion p ${whereClause}`;
    const [countRows]: any = await pool.query(countSql, queryParams);
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Get promotions
    const sql = `
      SELECT 
        p.promotion_id,
        p.name,
        p.description,
        p.type,
        p.discount_type,
        p.discount_value,
        p.min_purchase,
        p.max_discount,
        p.start_date,
        p.end_date,
        p.applicable_hotels,
        p.applicable_rooms,
        p.applicable_dates,
        p.day_of_week,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at,
        a.full_name as created_by_name
      FROM promotion p
      LEFT JOIN account a ON p.created_by = a.account_id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const [rows]: any = await pool.query(sql, [...queryParams, limit, offset]);
    const promotions = (rows as RowDataPacket[]).map((row: any) => {
      // Parse JSON fields
      let applicable_hotels: string[] | undefined;
      let applicable_rooms: string[] | undefined;
      let applicable_dates: string[] | undefined;
      let day_of_week: number[] | undefined;

      try {
        applicable_hotels = row.applicable_hotels ? JSON.parse(row.applicable_hotels) : undefined;
      } catch (e) {
        applicable_hotels = undefined;
      }

      try {
        applicable_rooms = row.applicable_rooms ? JSON.parse(row.applicable_rooms) : undefined;
      } catch (e) {
        applicable_rooms = undefined;
      }

      try {
        applicable_dates = row.applicable_dates ? JSON.parse(row.applicable_dates) : undefined;
      } catch (e) {
        applicable_dates = undefined;
      }

      try {
        day_of_week = row.day_of_week ? JSON.parse(row.day_of_week) : undefined;
      } catch (e) {
        day_of_week = undefined;
      }

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
        applicable_hotels,
        applicable_rooms,
        applicable_dates,
        day_of_week,
        status: row.status,
        created_by: row.created_by,
        created_by_name: row.created_by_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return {
      promotions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // Get promotion detail with statistics
  async getPromotionDetail(promotionId: string) {
    const conn = await pool.getConnection();
    try {
      // Get promotion
      const promotion = await this.getPromotionById(promotionId);
      if (!promotion) {
        return null;
      }

      // Get statistics: affected schedules count
      const [scheduleStats]: any = await conn.query(
        `SELECT COUNT(*) as total_schedules, SUM(discount_amount) as total_discount_amount
         FROM room_price_schedule_promotion
         WHERE promotion_id = ?`,
        [promotionId]
      );

      // Get applicable hotels names
      let hotelNames: Array<{ hotel_id: string; name: string }> = [];
      if (promotion.applicable_hotels && promotion.applicable_hotels.length > 0) {
        const placeholders = promotion.applicable_hotels.map(() => "?").join(",");
        const [hotels]: any = await conn.query(
          `SELECT hotel_id, name FROM hotel WHERE hotel_id IN (${placeholders})`,
          promotion.applicable_hotels
        );
        hotelNames = (hotels as RowDataPacket[]).map((h: any) => ({
          hotel_id: h.hotel_id,
          name: h.name,
        }));
      }

      // Get applicable rooms info
      let roomInfo: Array<{ room_id: string; room_number: string; room_type_name: string }> = [];
      if (promotion.applicable_rooms && promotion.applicable_rooms.length > 0) {
        const placeholders = promotion.applicable_rooms.map(() => "?").join(",");
        const [rooms]: any = await conn.query(
          `SELECT r.room_id, r.room_number, rt.name as room_type_name
           FROM room r
           JOIN room_type rt ON r.room_type_id = rt.room_type_id
           WHERE r.room_id IN (${placeholders})`,
          promotion.applicable_rooms
        );
        roomInfo = (rooms as RowDataPacket[]).map((r: any) => ({
          room_id: r.room_id,
          room_number: r.room_number,
          room_type_name: r.room_type_name,
        }));
      }

      // Get created by admin name
      let createdByName = null;
      if (promotion.created_by) {
        const [admins]: any = await conn.query(
          `SELECT full_name FROM account WHERE account_id = ?`,
          [promotion.created_by]
        );
        createdByName = admins[0]?.full_name || null;
      }

      return {
        ...promotion,
        created_by_name: createdByName,
        total_schedules: Number(scheduleStats[0]?.total_schedules || 0),
        total_discount_amount: Number(scheduleStats[0]?.total_discount_amount || 0),
        applicable_hotels: hotelNames,
        applicable_rooms: roomInfo,
      };
    } finally {
      conn.release();
    }
  }


  // Delete promotion (override to use soft delete or hard delete)
  async deletePromotion(promotionId: string): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
      // Check if promotion is used in schedules
      const [usage]: any = await conn.query(
        `SELECT COUNT(*) as count FROM room_price_schedule_promotion WHERE promotion_id = ?`,
        [promotionId]
      );

      if (usage[0]?.count > 0) {
        // Soft delete: set status to INACTIVE
        await conn.query(
          `UPDATE promotion SET status = 'INACTIVE', updated_at = NOW() WHERE promotion_id = ?`,
          [promotionId]
        );
        return true;
      } else {
        // Hard delete: remove from database
        await conn.query(`DELETE FROM promotion WHERE promotion_id = ?`, [promotionId]);
        return true;
      }
    } finally {
      conn.release();
    }
  }

  // Toggle promotion status
  async togglePromotionStatus(promotionId: string) {
    const conn = await pool.getConnection();
    try {
      // Get current status
      const [current]: any = await conn.query(
        `SELECT status, end_date FROM promotion WHERE promotion_id = ?`,
        [promotionId]
      );

      if (!current || current.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy promotion",
        };
      }

      let newStatus: string;
      if (current[0].status === "ACTIVE") {
        newStatus = "INACTIVE";
      } else if (current[0].status === "INACTIVE") {
        newStatus = "ACTIVE";
      } else {
        // EXPIRED - check if can reactivate
        const endDate = new Date(current[0].end_date);
        const today = new Date();
        if (endDate < today) {
          return {
            success: false,
            message: "Không thể kích hoạt promotion đã hết hạn",
          };
        }
        newStatus = "ACTIVE";
      }

      // Update status
      await conn.query(
        `UPDATE promotion SET status = ?, updated_at = NOW() WHERE promotion_id = ?`,
        [newStatus, promotionId]
      );

      return {
        success: true,
        status: newStatus,
        message: `Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} promotion`,
      };
    } finally {
      conn.release();
    }
  }

  // Apply promotion to schedules (reuse from PromotionService logic)
  async applyPromotionToSchedules(promotionId: string) {
    let conn;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();

      // Get promotion (need to use connection for consistency with transaction)
      const [promoRows]: any = await conn.query(
        `SELECT * FROM promotion WHERE promotion_id = ?`,
        [promotionId]
      );
      
      if (!promoRows || promoRows.length === 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Không tìm thấy promotion",
        };
      }

      const promoRow = promoRows[0];
      
      // Parse JSON fields
      let applicable_hotels: string[] | undefined;
      let applicable_rooms: string[] | undefined;
      let applicable_dates: string[] | undefined;
      let day_of_week: number[] | undefined;

      try {
        applicable_hotels = promoRow.applicable_hotels ? JSON.parse(promoRow.applicable_hotels) : undefined;
      } catch (e) {
        applicable_hotels = undefined;
      }

      try {
        applicable_rooms = promoRow.applicable_rooms ? JSON.parse(promoRow.applicable_rooms) : undefined;
      } catch (e) {
        applicable_rooms = undefined;
      }

      try {
        applicable_dates = promoRow.applicable_dates ? JSON.parse(promoRow.applicable_dates) : undefined;
      } catch (e) {
        applicable_dates = undefined;
      }

      try {
        day_of_week = promoRow.day_of_week ? JSON.parse(promoRow.day_of_week) : undefined;
      } catch (e) {
        day_of_week = undefined;
      }

      const promotion = {
        promotion_id: promoRow.promotion_id,
        name: promoRow.name,
        description: promoRow.description,
        type: promoRow.type,
        discount_type: promoRow.discount_type,
        discount_value: Number(promoRow.discount_value),
        min_purchase: promoRow.min_purchase ? Number(promoRow.min_purchase) : undefined,
        max_discount: promoRow.max_discount ? Number(promoRow.max_discount) : undefined,
        start_date: promoRow.start_date,
        end_date: promoRow.end_date,
        applicable_hotels,
        applicable_rooms,
        applicable_dates,
        day_of_week,
        status: promoRow.status,
        created_by: promoRow.created_by,
      };

      if (promotion.status !== "ACTIVE") {
        await conn.rollback();
        return {
          success: false,
          message: "Promotion không ở trạng thái ACTIVE",
        };
      }

      // Get all rooms that match the promotion criteria
      // Note: hotel_id is in room_type table, not room table
      let roomsSql = `
        SELECT DISTINCT r.room_id, rt.hotel_id, r.price_base
        FROM room r
        JOIN room_type rt ON r.room_type_id = rt.room_type_id
        WHERE r.status = 'ACTIVE'
      `;
      const roomParams: any[] = [];

      // Filter by applicable_hotels
      if (promotion.applicable_hotels && promotion.applicable_hotels.length > 0) {
        roomsSql += ` AND rt.hotel_id IN (${promotion.applicable_hotels.map(() => "?").join(",")})`;
        roomParams.push(...promotion.applicable_hotels);
      }

      // Filter by applicable_rooms
      if (promotion.applicable_rooms && promotion.applicable_rooms.length > 0) {
        roomsSql += ` AND r.room_id IN (${promotion.applicable_rooms.map(() => "?").join(",")})`;
        roomParams.push(...promotion.applicable_rooms);
      }

      const [roomRows] = await conn.query(roomsSql, roomParams);
      const rooms = roomRows as RowDataPacket[];

      if (rooms.length === 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Không tìm thấy phòng nào phù hợp với promotion",
        };
      }

      // Generate date range
      const startDate = new Date(promotion.start_date);
      const endDate = new Date(promotion.end_date);
      const dates: string[] = [];
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split("T")[0]);
      }

      // Filter dates by applicable_dates and day_of_week
      const filteredDates = dates.filter((dateStr) => {
        // Check applicable_dates
        if (promotion.applicable_dates && promotion.applicable_dates.length > 0) {
          if (!promotion.applicable_dates.includes(dateStr)) {
            return false;
          }
        }

        // Check day_of_week
        if (promotion.day_of_week && promotion.day_of_week.length > 0) {
          const dateObj = new Date(dateStr);
          const dayOfWeek = dateObj.getDay();
          if (!promotion.day_of_week.includes(dayOfWeek)) {
            return false;
          }
        }

        return true;
      });

      if (filteredDates.length === 0) {
        await conn.rollback();
        return {
          success: false,
          message: "Không có ngày nào phù hợp với promotion",
        };
      }

      // Apply promotion to schedules
      let affectedSchedules = 0;

      for (const room of rooms) {
        for (const dateStr of filteredDates) {
          // Check if schedule already exists
          const [existingScheduleRows]: any = await conn.query(
            `SELECT schedule_id, base_price, provider_discount_amount, system_discount_amount
             FROM room_price_schedule
             WHERE room_id = ? AND date = ?
             LIMIT 1`,
            [room.room_id, dateStr]
          );
          
          let scheduleId: string;
          let actualBasePrice: number;
          let currentProviderDiscount: number;
          let currentSystemDiscount: number;
          
          if (existingScheduleRows && existingScheduleRows.length > 0) {
            // Schedule exists, use it
            const schedule = existingScheduleRows[0];
            scheduleId = schedule.schedule_id;
            actualBasePrice = Number(schedule.base_price) || Number(room.price_base) || 0;
            currentProviderDiscount = Number(schedule.provider_discount_amount || 0);
            currentSystemDiscount = Number(schedule.system_discount_amount || 0);
          } else {
            // Schedule doesn't exist, create new one
            const basePrice = Number(room.price_base) || 0;
            
            // Generate unique scheduleId (max 20 chars)
            const timestamp = Date.now().toString();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const roomPrefix = room.room_id.substring(0, Math.min(3, room.room_id.length));
            scheduleId = `SCH${timestamp.slice(-8)}${random}${roomPrefix}`.substring(0, 20);

            const createScheduleSql = `
              INSERT INTO room_price_schedule (
                schedule_id, room_id, date, base_price, 
                provider_discount_percent, system_discount_percent,
                provider_discount_amount, system_discount_amount,
                final_price, available_rooms, is_auto_generated
              ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, ?, 1, 1)
            `;
            
            try {
              await conn.query(createScheduleSql, [scheduleId, room.room_id, dateStr, basePrice, basePrice]);
              actualBasePrice = basePrice;
              currentProviderDiscount = 0;
              currentSystemDiscount = 0;
            } catch (insertError: any) {
              // If duplicate key error (shouldn't happen but handle it), fetch existing
              if (insertError.code === 'ER_DUP_ENTRY' || insertError.errno === 1062) {
                const [fetchRows]: any = await conn.query(
                  `SELECT schedule_id, base_price, provider_discount_amount, system_discount_amount
                   FROM room_price_schedule
                   WHERE room_id = ? AND date = ?
                   LIMIT 1`,
                  [room.room_id, dateStr]
                );
                if (fetchRows && fetchRows.length > 0) {
                  const schedule = fetchRows[0];
                  scheduleId = schedule.schedule_id;
                  actualBasePrice = Number(schedule.base_price) || basePrice;
                  currentProviderDiscount = Number(schedule.provider_discount_amount || 0);
                  currentSystemDiscount = Number(schedule.system_discount_amount || 0);
                } else {
                  console.error(`[AdminPromotionRepository] Failed to create schedule and no existing schedule found for room ${room.room_id} date ${dateStr}`);
                  continue; // Skip this date
                }
              } else {
                console.error(`[AdminPromotionRepository] Error creating schedule:`, insertError.message);
                throw insertError;
              }
            }
          }

          // Calculate discount amount based on actual base price
          let discountAmount = 0;
          if (promotion.discount_type === "PERCENTAGE") {
            discountAmount = actualBasePrice * (promotion.discount_value / 100);
            if (promotion.max_discount && discountAmount > promotion.max_discount) {
              discountAmount = promotion.max_discount;
            }
          } else {
            discountAmount = promotion.discount_value;
          }

          // Check if promotion was already applied to this schedule
          const [existingTrack]: any = await conn.query(
            `SELECT discount_amount FROM room_price_schedule_promotion 
             WHERE schedule_id = ? AND promotion_id = ?`,
            [scheduleId, promotionId]
          );
          
          const previousDiscountAmount = Number(existingTrack[0]?.discount_amount || 0);

          // Calculate new discount values based on promotion type
          let newProviderDiscount = currentProviderDiscount;
          let newSystemDiscount = currentSystemDiscount;

          if (promotion.type === "PROVIDER") {
            // Remove previous discount if exists, then add new discount
            if (existingTrack.length > 0) {
              newProviderDiscount = Math.max(0, currentProviderDiscount - previousDiscountAmount + discountAmount);
            } else {
              newProviderDiscount = currentProviderDiscount + discountAmount;
            }
          } else if (promotion.type === "SYSTEM") {
            // Remove previous discount if exists, then add new discount
            if (existingTrack.length > 0) {
              newSystemDiscount = Math.max(0, currentSystemDiscount - previousDiscountAmount + discountAmount);
            } else {
              newSystemDiscount = currentSystemDiscount + discountAmount;
            }
          } else if (promotion.type === "BOTH") {
            // For BOTH, split the discount equally between provider and system
            const providerDiscount = discountAmount / 2;
            const systemDiscount = discountAmount / 2;
            const previousProviderDiscount = previousDiscountAmount / 2;
            const previousSystemDiscount = previousDiscountAmount / 2;

            if (existingTrack.length > 0) {
              newProviderDiscount = Math.max(0, currentProviderDiscount - previousProviderDiscount + providerDiscount);
              newSystemDiscount = Math.max(0, currentSystemDiscount - previousSystemDiscount + systemDiscount);
            } else {
              newProviderDiscount = currentProviderDiscount + providerDiscount;
              newSystemDiscount = currentSystemDiscount + systemDiscount;
            }
          }

          // Calculate final price using actual base price
          const newFinalPrice = Math.max(0, actualBasePrice - newProviderDiscount - newSystemDiscount);

          // Update schedule
          if (promotion.type === "PROVIDER") {
            const updateSql = `
              UPDATE room_price_schedule
              SET provider_discount_amount = ?,
                  final_price = ?
              WHERE schedule_id = ?
            `;
            const [updateResult] = await conn.query(updateSql, [newProviderDiscount, newFinalPrice, scheduleId]);
            if ((updateResult as ResultSetHeader).affectedRows > 0) {
              affectedSchedules++;
            }
          } else if (promotion.type === "SYSTEM") {
            const updateSql = `
              UPDATE room_price_schedule
              SET system_discount_amount = ?,
                  final_price = ?
              WHERE schedule_id = ?
            `;
            const [updateResult] = await conn.query(updateSql, [newSystemDiscount, newFinalPrice, scheduleId]);
            if ((updateResult as ResultSetHeader).affectedRows > 0) {
              affectedSchedules++;
            }
          } else if (promotion.type === "BOTH") {
            const updateSql = `
              UPDATE room_price_schedule
              SET provider_discount_amount = ?,
                  system_discount_amount = ?,
                  final_price = ?
              WHERE schedule_id = ?
            `;
            const [updateResult] = await conn.query(updateSql, [newProviderDiscount, newSystemDiscount, newFinalPrice, scheduleId]);
            if ((updateResult as ResultSetHeader).affectedRows > 0) {
              affectedSchedules++;
            }
          }

          // Track promotion application
          if (existingTrack.length === 0) {
            // Insert new tracking record
            const trackSql = `
              INSERT INTO room_price_schedule_promotion (schedule_id, promotion_id, discount_amount)
              VALUES (?, ?, ?)
            `;
            await conn.query(trackSql, [scheduleId, promotionId, discountAmount]);
          } else {
            // Update existing tracking record
            const trackSql = `
              UPDATE room_price_schedule_promotion 
              SET discount_amount = ?
              WHERE schedule_id = ? AND promotion_id = ?
            `;
            await conn.query(trackSql, [discountAmount, scheduleId, promotionId]);
          }
        }
      }

      await conn.commit();

      return {
        success: true,
        affectedSchedules,
        message: `Đã áp dụng promotion vào ${affectedSchedules} schedules`,
      };
    } catch (error: any) {
      if (conn) {
        await conn.rollback();
      }
      console.error("[AdminPromotionRepository] applyPromotionToSchedules error:", error.message);
      console.error("[AdminPromotionRepository] applyPromotionToSchedules error stack:", error.stack);
      throw error;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }

  // Get dashboard statistics
  async getDashboardStats() {
    const conn = await pool.getConnection();
    try {
      // Auto-update expired promotions
      await conn.query(
        `UPDATE promotion SET status = 'EXPIRED', updated_at = NOW() 
         WHERE end_date < CURDATE() AND status = 'ACTIVE'`
      );

      // Get statistics
      const [stats]: any = await conn.query(`
        SELECT 
          COUNT(*) as total_promotions,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_promotions,
          SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive_promotions,
          SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired_promotions,
          SUM(CASE WHEN type = 'PROVIDER' THEN 1 ELSE 0 END) as provider_promotions,
          SUM(CASE WHEN type = 'SYSTEM' THEN 1 ELSE 0 END) as system_promotions
        FROM promotion
      `);

      // Get total discount amount applied
      const [discountStats]: any = await conn.query(`
        SELECT COALESCE(SUM(discount_amount), 0) as total_discount_amount
        FROM room_price_schedule_promotion
      `);

      // Get recent promotions
      const [recent]: any = await conn.query(`
        SELECT promotion_id, name, status, created_at
        FROM promotion
        ORDER BY created_at DESC
        LIMIT 5
      `);

      return {
        total_promotions: Number(stats[0]?.total_promotions || 0),
        active_promotions: Number(stats[0]?.active_promotions || 0),
        inactive_promotions: Number(stats[0]?.inactive_promotions || 0),
        expired_promotions: Number(stats[0]?.expired_promotions || 0),
        provider_promotions: Number(stats[0]?.provider_promotions || 0),
        system_promotions: Number(stats[0]?.system_promotions || 0),
        total_discount_amount: Number(discountStats[0]?.total_discount_amount || 0),
        recent_promotions: (recent as RowDataPacket[]).map((r: any) => ({
          promotion_id: r.promotion_id,
          name: r.name,
          status: r.status,
          created_at: r.created_at,
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Get promotion activity logs (generated dynamically)
  async getPromotionActivityLogs(filters: {
    page?: number;
    limit?: number;
    promotionId?: string;
    adminId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      promotionId,
      adminId,
      action,
      startDate,
      endDate,
    } = filters;

    const offset = (page - 1) * limit;
    const conn = await pool.getConnection();
    try {
      const logs: Array<{
        id: number;
        date: string;
        admin_id?: string;
        admin_name: string;
        action: string;
        note?: string;
      }> = [];

      // Get promotions to generate logs from
      let sql = `SELECT promotion_id, name, status, created_by, created_at, updated_at FROM promotion WHERE 1=1`;
      const params: any[] = [];

      if (promotionId) {
        sql += ` AND promotion_id = ?`;
        params.push(promotionId);
      }

      if (startDate) {
        sql += ` AND created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND updated_at <= ?`;
        params.push(endDate);
      }

      const [promotions]: any = await conn.query(sql, params);

      for (const promo of promotions as RowDataPacket[]) {
        // Skip if admin filter doesn't match
        if (adminId && promo.created_by !== adminId) {
          continue;
        }

        // Creation log
        if (!action || action.toLowerCase() === "create") {
          const [admins]: any = await conn.query(
            `SELECT full_name FROM account WHERE account_id = ?`,
            [promo.created_by]
          );
          const adminName = admins[0]?.full_name || "System";

          logs.push({
            id: logs.length + 1,
            date: promo.created_at,
            admin_id: promo.created_by || undefined,
            admin_name: adminName,
            action: "Tạo promotion",
            note: `Promotion "${promo.name}" được tạo`,
          });
        }

        // Status change log (if updated_at != created_at)
        if (promo.updated_at && promo.updated_at !== promo.created_at) {
          if (!action || action.toLowerCase() === "update" || action.toLowerCase() === "status_change") {
            const [admins]: any = await conn.query(
              `SELECT full_name FROM account WHERE account_id = ?`,
              [promo.created_by]
            );
            const adminName = admins[0]?.full_name || "System";

            logs.push({
              id: logs.length + 1,
              date: promo.updated_at,
              admin_id: promo.created_by || undefined,
              admin_name: adminName,
              action: "Cập nhật promotion",
              note: `Promotion "${promo.name}" - Trạng thái: ${promo.status}`,
            });
          }
        }
      }

      // Filter by action
      if (action) {
        const actionLower = action.toLowerCase();
        const filteredLogs = logs.filter((log) => {
          const logAction = log.action.toLowerCase();
          return logAction.includes(actionLower);
        });
        logs.length = 0;
        logs.push(...filteredLogs);
      }

      // Sort by date descending
      logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Pagination
      const total = logs.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedLogs = logs.slice(offset, offset + limit);

      return {
        logs: paginatedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } finally {
      conn.release();
    }
  }

  // Get promotion reports
  async getPromotionReports(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }) {
    const { period, startDate, endDate, type } = filters;
    const conn = await pool.getConnection();
    try {
      // Build date filter
      let dateCondition = "";
      const params: any[] = [];

      if (period === "today") {
        dateCondition = "AND DATE(p.created_at) = CURDATE()";
      } else if (period === "week") {
        dateCondition = "AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
      } else if (period === "month") {
        dateCondition = "AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      } else if (period === "year") {
        dateCondition = "AND p.created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
      } else if (startDate && endDate) {
        dateCondition = "AND p.created_at BETWEEN ? AND ?";
        params.push(startDate, endDate);
      }

      let typeCondition = "";
      if (type) {
        typeCondition = ` AND p.type = ?`;
        params.push(type);
      }

      // Build base params (without type for count queries)
      const baseParams = period === "today" || period === "week" || period === "month" || period === "year"
        ? []
        : startDate && endDate
        ? [startDate, endDate]
        : [];

      // Get promotion statistics
      const [promoStats]: any = await conn.query(`
        SELECT 
          COUNT(*) as total_promotions,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_count,
          SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactive_count,
          SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END) as expired_count
        FROM promotion p
        WHERE 1=1 ${dateCondition} ${typeCondition}
      `, params);

      // Get discount amount by promotion
      const [discountByPromo]: any = await conn.query(`
        SELECT 
          p.promotion_id,
          p.name,
          COALESCE(SUM(psp.discount_amount), 0) as total_discount_amount,
          COUNT(DISTINCT psp.schedule_id) as affected_schedules
        FROM promotion p
        LEFT JOIN room_price_schedule_promotion psp ON p.promotion_id = psp.promotion_id
        WHERE 1=1 ${dateCondition} ${typeCondition}
        GROUP BY p.promotion_id, p.name
        ORDER BY total_discount_amount DESC
        LIMIT 10
      `, params);

      // Get promotions by type (without type filter to show breakdown)
      const [byType]: any = await conn.query(`
        SELECT 
          type,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_count
        FROM promotion p
        WHERE 1=1 ${dateCondition}
        GROUP BY type
      `, baseParams);

      return {
        total_promotions: Number(promoStats[0]?.total_promotions || 0),
        active_count: Number(promoStats[0]?.active_count || 0),
        inactive_count: Number(promoStats[0]?.inactive_count || 0),
        expired_count: Number(promoStats[0]?.expired_count || 0),
        top_promotions: (discountByPromo as RowDataPacket[]).map((item: any) => ({
          promotion_id: item.promotion_id,
          name: item.name,
          total_discount_amount: Number(item.total_discount_amount),
          affected_schedules: Number(item.affected_schedules),
        })),
        by_type: (byType as RowDataPacket[]).map((item: any) => ({
          type: item.type,
          count: Number(item.count),
          active_count: Number(item.active_count),
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Get applicable hotels for filters
  async getApplicableHotels() {
    const conn = await pool.getConnection();
    try {
      const [hotels]: any = await conn.query(
        `SELECT hotel_id, name FROM hotel WHERE status = 'ACTIVE' ORDER BY name ASC`
      );
      return hotels || [];
    } catch (error: any) {
      console.error("[AdminPromotionRepository] getApplicableHotels error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Get applicable rooms by hotel_id
  async getApplicableRooms(hotelIds?: string[]) {
    const conn = await pool.getConnection();
    try {
      let sql = `
        SELECT 
          r.room_id,
          r.room_number,
          rt.name as room_type_name,
          rt.hotel_id,
          h.name as hotel_name
        FROM room r
        JOIN room_type rt ON r.room_type_id = rt.room_type_id
        JOIN hotel h ON rt.hotel_id = h.hotel_id
        WHERE r.status = 'ACTIVE'
      `;
      const params: any[] = [];

      if (hotelIds && hotelIds.length > 0) {
        sql += ` AND rt.hotel_id IN (${hotelIds.map(() => '?').join(',')})`;
        params.push(...hotelIds);
      }

      sql += ` ORDER BY h.name ASC, rt.name ASC, r.room_number ASC`;

      const [rooms]: any = await conn.query(sql, params);
      return rooms || [];
    } catch (error: any) {
      console.error("[AdminPromotionRepository] getApplicableRooms error:", error.message);
      throw error;
    } finally {
      conn.release();
    }
  }
}
