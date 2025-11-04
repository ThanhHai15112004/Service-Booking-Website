import { PromotionRepository, CreatePromotionData, Promotion } from "../../Repository/Promotion/promotion.repository";
import pool from "../../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Promotion Service
 * Handles promotion business logic
 */
export class PromotionService {
  private promotionRepo = new PromotionRepository();

  /**
   * Tạo promotion mới
   */
  async createPromotion(
    data: CreatePromotionData,
    createdBy: string
  ): Promise<ServiceResponse<Promotion>> {
    try {
      // Validate data
      if (!data.name || !data.type || !data.discount_type || !data.discount_value || !data.start_date || !data.end_date) {
        return {
          success: false,
          message: "Thiếu thông tin bắt buộc"
        };
      }

      // Validate dates
      if (new Date(data.start_date) > new Date(data.end_date)) {
        return {
          success: false,
          message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
        };
      }

      // Set created_by
      const promotionData: CreatePromotionData = {
        ...data,
        created_by: createdBy
      };

      const created = await this.promotionRepo.createPromotion(promotionData);
      
      if (!created) {
        return {
          success: false,
          message: "Không thể tạo promotion"
        };
      }

      // Get created promotion
      const promotions = await this.promotionRepo.getPromotions({ created_by: createdBy, limit: 1 });
      const newPromotion = promotions[0];

      return {
        success: true,
        data: newPromotion,
        message: "Tạo promotion thành công"
      };
    } catch (error: any) {
      console.error("[PromotionService] createPromotion error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo promotion"
      };
    }
  }

  /**
   * Lấy danh sách promotions
   */
  async getPromotions(filters?: {
    type?: 'PROVIDER' | 'SYSTEM' | 'BOTH';
    status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
    created_by?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<ServiceResponse<Promotion[]>> {
    try {
      const promotions = await this.promotionRepo.getPromotions(filters);
      
      return {
        success: true,
        data: promotions
      };
    } catch (error: any) {
      console.error("[PromotionService] getPromotions error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách promotion"
      };
    }
  }

  /**
   * Lấy promotion theo ID
   */
  async getPromotionById(promotionId: string): Promise<ServiceResponse<Promotion>> {
    try {
      const promotion = await this.promotionRepo.getPromotionById(promotionId);
      
      if (!promotion) {
        return {
          success: false,
          message: "Không tìm thấy promotion"
        };
      }

      return {
        success: true,
        data: promotion
      };
    } catch (error: any) {
      console.error("[PromotionService] getPromotionById error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thông tin promotion"
      };
    }
  }

  /**
   * Cập nhật promotion
   */
  async updatePromotion(
    promotionId: string,
    data: Partial<CreatePromotionData>,
    updatedBy: string
  ): Promise<ServiceResponse<Promotion>> {
    try {
      // Check if promotion exists
      const existing = await this.promotionRepo.getPromotionById(promotionId);
      if (!existing) {
        return {
          success: false,
          message: "Không tìm thấy promotion"
        };
      }

      // Validate dates if provided
      if (data.start_date && data.end_date) {
        if (new Date(data.start_date) > new Date(data.end_date)) {
          return {
            success: false,
            message: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
          };
        }
      }

      const updated = await this.promotionRepo.updatePromotion(promotionId, data);
      
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật promotion"
        };
      }

      // Get updated promotion
      const updatedPromotion = await this.promotionRepo.getPromotionById(promotionId);

      return {
        success: true,
        data: updatedPromotion!,
        message: "Cập nhật promotion thành công"
      };
    } catch (error: any) {
      console.error("[PromotionService] updatePromotion error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật promotion"
      };
    }
  }

  /**
   * Xóa promotion (soft delete)
   */
  async deletePromotion(promotionId: string): Promise<ServiceResponse<null>> {
    try {
      // Check if promotion exists
      const existing = await this.promotionRepo.getPromotionById(promotionId);
      if (!existing) {
        return {
          success: false,
          message: "Không tìm thấy promotion"
        };
      }

      const deleted = await this.promotionRepo.deletePromotion(promotionId);
      
      if (!deleted) {
        return {
          success: false,
          message: "Không thể xóa promotion"
        };
      }

      return {
        success: true,
        message: "Xóa promotion thành công"
      };
    } catch (error: any) {
      console.error("[PromotionService] deletePromotion error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi xóa promotion"
      };
    }
  }

  /**
   * Áp dụng promotion vào schedules
   */
  async applyPromotionToSchedules(promotionId: string): Promise<ServiceResponse<{ affectedSchedules: number }>> {
    try {
      // Get promotion
      const promotion = await this.promotionRepo.getPromotionById(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: "Không tìm thấy promotion"
        };
      }

      if (promotion.status !== 'ACTIVE') {
        return {
          success: false,
          message: "Promotion không ở trạng thái ACTIVE"
        };
      }

      // Get all rooms that match the promotion criteria
      let roomsSql = `
        SELECT DISTINCT r.room_id, r.price_base
        FROM room r
        WHERE r.status = 'ACTIVE'
      `;
      const roomParams: any[] = [];

      // Filter by applicable_hotels
      if (promotion.applicable_hotels && promotion.applicable_hotels.length > 0) {
        roomsSql += ` AND r.hotel_id IN (${promotion.applicable_hotels.map(() => '?').join(',')})`;
        roomParams.push(...promotion.applicable_hotels);
      }

      // Filter by applicable_rooms
      if (promotion.applicable_rooms && promotion.applicable_rooms.length > 0) {
        roomsSql += ` AND r.room_id IN (${promotion.applicable_rooms.map(() => '?').join(',')})`;
        roomParams.push(...promotion.applicable_rooms);
      }

      const conn = await pool.getConnection();
      try {
        const [roomRows] = await conn.query(roomsSql, roomParams);
        const rooms = roomRows as RowDataPacket[];

        if (rooms.length === 0) {
          return {
            success: false,
            message: "Không tìm thấy phòng nào phù hợp với promotion"
          };
        }

        // Generate date range
        const startDate = new Date(promotion.start_date);
        const endDate = new Date(promotion.end_date);
        const dates: string[] = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().split('T')[0]);
        }

        // Filter dates by applicable_dates and day_of_week
        const filteredDates = dates.filter(dateStr => {
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
          return {
            success: false,
            message: "Không có ngày nào phù hợp với promotion"
          };
        }

        // Apply promotion to schedules
        let affectedSchedules = 0;

        for (const room of rooms) {
          for (const dateStr of filteredDates) {
            // Get or create schedule
            let scheduleSql = `
              SELECT schedule_id, base_price, provider_discount_amount, system_discount_amount
              FROM room_price_schedule
              WHERE room_id = ? AND date = ?
              LIMIT 1
            `;
            const [scheduleRows] = await conn.query(scheduleSql, [room.room_id, dateStr]);
            const schedules = scheduleRows as RowDataPacket[];

            let scheduleId: string;
            let basePrice: number;

            if (schedules.length === 0) {
              // Create new schedule
              basePrice = room.price_base || 0;
              scheduleId = `SCH${Date.now()}${Math.floor(Math.random() * 1000)}`;
              
              const createScheduleSql = `
                INSERT INTO room_price_schedule (
                  schedule_id, room_id, date, base_price, 
                  provider_discount_percent, system_discount_percent,
                  provider_discount_amount, system_discount_amount,
                  final_price, available_rooms, is_auto_generated
                ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, ?, 1, 1)
              `;
              await conn.query(createScheduleSql, [scheduleId, room.room_id, dateStr, basePrice, basePrice]);
            } else {
              scheduleId = schedules[0].schedule_id;
              basePrice = Number(schedules[0].base_price) || room.price_base || 0;
            }

            // Calculate discount amount
            let discountAmount = 0;
            if (promotion.discount_type === 'PERCENTAGE') {
              discountAmount = basePrice * (promotion.discount_value / 100);
              if (promotion.max_discount && discountAmount > promotion.max_discount) {
                discountAmount = promotion.max_discount;
              }
            } else {
              discountAmount = promotion.discount_value;
            }

            // Update discount based on promotion type
            if (promotion.type === 'PROVIDER') {
              const updateSql = `
                UPDATE room_price_schedule
                SET provider_discount_amount = provider_discount_amount + ?,
                    final_price = base_price - (provider_discount_amount + ?) - system_discount_amount
                WHERE schedule_id = ?
              `;
              const [updateResult] = await conn.query(updateSql, [discountAmount, discountAmount, scheduleId]);
              if ((updateResult as ResultSetHeader).affectedRows > 0) {
                affectedSchedules++;
              }
            } else if (promotion.type === 'SYSTEM') {
              const updateSql = `
                UPDATE room_price_schedule
                SET system_discount_amount = system_discount_amount + ?,
                    final_price = base_price - provider_discount_amount - (system_discount_amount + ?)
                WHERE schedule_id = ?
              `;
              const [updateResult] = await conn.query(updateSql, [discountAmount, discountAmount, scheduleId]);
              if ((updateResult as ResultSetHeader).affectedRows > 0) {
                affectedSchedules++;
              }
            }

            // Track promotion application
            const trackSql = `
              INSERT INTO room_price_schedule_promotion (schedule_id, promotion_id, discount_amount)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE discount_amount = ?
            `;
            await conn.query(trackSql, [scheduleId, promotionId, discountAmount, discountAmount]);
          }
        }

        return {
          success: true,
          data: { affectedSchedules },
          message: `Đã áp dụng promotion vào ${affectedSchedules} schedules`
        };
      } finally {
        conn.release();
      }
    } catch (error: any) {
      console.error("[PromotionService] applyPromotionToSchedules error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi áp dụng promotion"
      };
    }
  }
}

