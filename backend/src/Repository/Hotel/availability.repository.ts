import pool from "../../config/db";
import { DailyRoomAvailability } from "../../models/Hotel/availability.model";

export class AvailabilityRepository {
  // Lấy thông tin phòng trống theo ngày cho một room cụ thể
  async getRoomDailyAvailability(
    roomId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyRoomAvailability[]> {
    const sql = `
      SELECT
        rps.room_id as roomId,
        rt.name as roomName,
        DATE_FORMAT(rps.date, '%Y-%m-%d') as date,
        rps.base_price as basePrice,
        rps.discount_percent as discountPercent,
        (rps.base_price * (1 - rps.discount_percent / 100)) as finalPrice,
        rps.available_rooms as availableRooms,
        rps.refundable,
        rps.pay_later as payLater
      FROM room_price_schedule rps
      JOIN room r ON r.room_id = rps.room_id
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE rps.room_id = ?
        AND CAST(rps.date AS DATE) >= ?
        AND CAST(rps.date AS DATE) < ?
      ORDER BY rps.date ASC
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [roomId, startDate, endDate]);
      return (rows as any[]).map(row => ({
        roomId: row.roomId,
        roomName: row.roomName,
        date: row.date,
        basePrice: Number(row.basePrice),
        discountPercent: Number(row.discountPercent),
        finalPrice: Number(row.finalPrice),
        availableRooms: Number(row.availableRooms),
        refundable: Boolean(row.refundable),
        payLater: Boolean(row.payLater)
      }));
    } finally {
      conn.release();
    }
  }

  // Lấy thông tin hotel
  async getHotelById(hotelId: string): Promise<{ hotel_id: string; name: string } | null> {
    const sql = `SELECT hotel_id, name FROM hotel WHERE hotel_id = ?`;
    const conn = await pool.getConnection();
    
    try {
      const [rows] = await conn.query(sql, [hotelId]);
      const hotels = rows as any[];
      return hotels.length > 0 ? hotels[0] : null;
    } finally {
      conn.release();
    }
  }

  // Lấy danh sách tất cả các phòng active của hotel
  async getActiveRoomsByHotel(hotelId: string): Promise<Array<{ room_id: string; room_name: string }>> {
    const sql = `
      SELECT DISTINCT r.room_id, rt.name as room_name
      FROM room r
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE rt.hotel_id = ? AND r.status = 'ACTIVE'
      ORDER BY rt.name ASC
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [hotelId]);
      return rows as any[];
    } finally {
      conn.release();
    }
  }

  // Giảm số lượng phòng trống (khi có booking)
  async reduceAvailableRooms(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsCount: number
  ): Promise<{ success: boolean; affectedRows: number }> {
    const sql = `
      UPDATE room_price_schedule
      SET available_rooms = available_rooms - ?
      WHERE room_id = ?
        AND CAST(date AS DATE) >= ?
        AND CAST(date AS DATE) < ?
        AND available_rooms >= ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [
        roomsCount,
        roomId,
        startDate,
        endDate,
        roomsCount
      ]);

      const affectedRows = (result as any).affectedRows || 0;
      return {
        success: affectedRows > 0,
        affectedRows
      };
    } finally {
      conn.release();
    }
  }

  // Tăng số lượng phòng trống (khi hủy booking)
  async increaseAvailableRooms(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsCount: number
  ): Promise<{ success: boolean; affectedRows: number }> {
    const sql = `
      UPDATE room_price_schedule
      SET available_rooms = available_rooms + ?
      WHERE room_id = ?
        AND CAST(date AS DATE) >= ?
        AND CAST(date AS DATE) < ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [
        roomsCount,
        roomId,
        startDate,
        endDate
      ]);

      const affectedRows = (result as any).affectedRows || 0;
      return {
        success: affectedRows > 0,
        affectedRows
      };
    } finally {
      conn.release();
    }
  }

  // Kiểm tra xem có đủ phòng trống không
  async hasEnoughAvailability(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsNeeded: number
  ): Promise<boolean> {
    const sql = `
      SELECT MIN(available_rooms) as minAvailable
      FROM room_price_schedule
      WHERE room_id = ?
        AND CAST(date AS DATE) >= ?
        AND CAST(date AS DATE) < ?
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [roomId, startDate, endDate]);
      const result = (rows as any[])[0];
      const minAvailable = result?.minAvailable || 0;
      
      return minAvailable >= roomsNeeded;
    } finally {
      conn.release();
    }
  }
}
