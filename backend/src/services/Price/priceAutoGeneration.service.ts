import pool from "../../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Service để tự động tạo giá cho các ngày chưa có trong room_price_schedule
 */
export class PriceAutoGenerationService {
  
  /**
   * Đảm bảo có schedule cho tất cả các ngày trong range cho một phòng
   */
  async ensurePriceSchedulesForRoom(
    roomId: string,
    startDate: string,
    endDate: string
  ): Promise<{ generated: number; skipped: number; errors: number }> {
    let generated = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Lấy base_price từ room
      const basePrice = await this.getRoomBasePrice(roomId);
      if (!basePrice || basePrice <= 0) {
        console.log(`[PriceAutoGeneration] Room ${roomId} không có price_base hoặc price_base = 0`);
        return { generated: 0, skipped: 0, errors: 1 };
      }

      // Tạo danh sách các ngày cần tạo
      const dates: string[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
      }

      const conn = await pool.getConnection();
      try {
        for (const dateStr of dates) {
          try {
            // Kiểm tra xem đã có schedule chưa
            const existing = await this.getSchedule(roomId, dateStr);
            
            if (existing) {
              // Nếu đã có nhưng base_price = 0 hoặc final_price = 0, cần update
              // ⚠️ QUAN TRỌNG: KHÔNG reset available_rooms về 1 nếu nó đã < 1 (phòng đã bị lock)
              if (existing.base_price <= 0 || existing.final_price <= 0) {
                await this.updateSchedule(roomId, dateStr, basePrice);
                generated++;
              } else {
                skipped++;
              }
            } else {
              // Tạo schedule mới
              await this.createSchedule(roomId, dateStr, basePrice);
              generated++;
            }
          } catch (dateError: any) {
            console.error(`[PriceAutoGeneration] Error processing date ${dateStr} for room ${roomId}:`, dateError.message);
            errors++;
          }
        }
      } finally {
        conn.release();
      }

      return { generated, skipped, errors };
    } catch (error: any) {
      console.error(`[PriceAutoGeneration] Error ensuring schedules for room ${roomId}:`, error.message);
      return { generated: 0, skipped: 0, errors: 1 };
    }
  }

  /**
   * Đảm bảo có schedule cho tất cả các ngày trong range cho tất cả phòng active
   */
  async ensurePriceSchedulesForSearch(
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      console.log(`[PriceAutoGeneration] Ensuring schedules for date range: ${startDate} to ${endDate}`);

      // Lấy tất cả active rooms
      const sql = `
        SELECT DISTINCT r.room_id
        FROM room r
        WHERE r.status = 'ACTIVE'
      `;

      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.query(sql);
        const rooms = rows as RowDataPacket[];

        console.log(`[PriceAutoGeneration] Found ${rooms.length} active rooms`);

        // Với mỗi room, ensure schedules
        for (const room of rooms) {
          try {
            await this.ensurePriceSchedulesForRoom(room.room_id, startDate, endDate);
          } catch (roomError: any) {
            console.error(`[PriceAutoGeneration] Error processing room ${room.room_id}:`, roomError.message);
          }
        }
      } finally {
        conn.release();
      }

      console.log(`[PriceAutoGeneration] Completed ensuring schedules for date range`);
    } catch (error: any) {
      console.error(`[PriceAutoGeneration] Error ensuring schedules for search:`, error.message);
      throw error;
    }
  }

  /**
   * Lấy base_price từ room
   */
  private async getRoomBasePrice(roomId: string): Promise<number | null> {
    const sql = `
      SELECT price_base
      FROM room
      WHERE room_id = ?
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [roomId]);
      const data = (rows as RowDataPacket[])[0];
      return data ? Number(data.price_base) : null;
    } finally {
      conn.release();
    }
  }

  /**
   * Lấy schedule hiện tại (nếu có)
   */
  private async getSchedule(roomId: string, date: string): Promise<any | null> {
    const sql = `
      SELECT 
        schedule_id,
        base_price,
        final_price,
        available_rooms
      FROM room_price_schedule
      WHERE room_id = ? AND date = ?
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [roomId, date]);
      const data = (rows as RowDataPacket[])[0];
      return data || null;
    } finally {
      conn.release();
    }
  }

  /**
   * Tạo schedule mới
   */
  private async createSchedule(roomId: string, date: string, basePrice: number): Promise<void> {
    const scheduleId = `SCH${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    const sql = `
      INSERT INTO room_price_schedule (
        schedule_id,
        room_id,
        date,
        base_price,
        discount_percent,
        provider_discount_percent,
        system_discount_percent,
        provider_discount_amount,
        system_discount_amount,
        final_price,
        available_rooms,
        is_auto_generated,
        auto_generated_at
      ) VALUES (?, ?, ?, ?, 0, 0, 0, 0, 0, ?, 1, 1, NOW())
    `;

    const conn = await pool.getConnection();
    try {
      await conn.query(sql, [scheduleId, roomId, date, basePrice, basePrice]);
    } finally {
      conn.release();
    }
  }

  /**
   * Update schedule nếu base_price = 0 hoặc final_price = 0
   * ⚠️ QUAN TRỌNG: KHÔNG reset available_rooms về 1 nếu nó đã < 1 (phòng đã bị lock)
   */
  private async updateSchedule(roomId: string, date: string, basePrice: number): Promise<void> {
    // ✅ Kiểm tra available_rooms hiện tại trước khi update
    const currentSchedule = await this.getSchedule(roomId, date);
    
    // Chỉ update available_rooms về 1 nếu:
    // - Schedule chưa tồn tại (sẽ được tạo mới với available_rooms = 1)
    // - available_rooms > 0 (phòng còn trống, có thể reset về 1 khi fix giá)
    // KHÔNG update available_rooms nếu available_rooms <= 0 (phòng đã bị lock)
    
    const shouldUpdateAvailableRooms = !currentSchedule || (currentSchedule.available_rooms > 0);
    
    const sql = shouldUpdateAvailableRooms
      ? `
        UPDATE room_price_schedule
        SET 
          base_price = ?,
          final_price = ?,
          available_rooms = 1,
          is_auto_generated = 1,
          auto_generated_at = NOW()
        WHERE room_id = ? AND date = ?
      `
      : `
        UPDATE room_price_schedule
        SET 
          base_price = ?,
          final_price = ?,
          is_auto_generated = 1,
          auto_generated_at = NOW()
        WHERE room_id = ? AND date = ?
      `;

    const conn = await pool.getConnection();
    try {
      await conn.query(sql, [basePrice, basePrice, roomId, date]);
    } finally {
      conn.release();
    }
  }
}

