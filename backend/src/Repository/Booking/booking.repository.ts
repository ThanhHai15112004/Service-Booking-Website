import pool from "../../config/db";
import { 
  Booking, 
  BookingDetail, 
  BookingPriceCalculation 
} from "../../models/Booking/booking.model";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class BookingRepository {
  // Generate booking ID
  generateBookingId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BK${timestamp.slice(-9)}${random}`;
  }

  // Generate booking detail ID
  generateBookingDetailId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BD${timestamp.slice(-9)}${random}`;
  }

  // Generate booking code cho khách hàng
  generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AGD-${code}`;
  }

  // Lấy thông tin hotel
  async getHotelById(hotelId: string) {
    const sql = `
      SELECT 
        h.hotel_id,
        h.name,
        h.address,
        h.phone_number,
        h.email,
        h.status
      FROM hotel h
      WHERE h.hotel_id = ? AND h.status = 'ACTIVE'
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [hotelId]);
      const hotels = rows as RowDataPacket[];
      return hotels.length > 0 ? hotels[0] : null;
    } finally {
      conn.release();
    }
  }

  // Lấy thông tin room
  async getRoomById(roomId: string) {
    const sql = `
      SELECT 
        r.room_id,
        r.room_type_id,
        rt.hotel_id,
        r.capacity,
        r.status,
        rt.name as room_type_name,
        rt.bed_type
      FROM room r
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE r.room_id = ? AND r.status = 'ACTIVE'
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [roomId]);
      const rooms = rows as RowDataPacket[];
      return rooms.length > 0 ? rooms[0] : null;
    } finally {
      conn.release();
    }
  }

  // Tính giá booking từ room_price_schedule
  async calculateBookingPrice(
    roomId: string,
    checkIn: string,
    checkOut: string,
    roomsCount: number
  ): Promise<BookingPriceCalculation | null> {
    const sql = `
      SELECT
        DATE_FORMAT(rps.date, '%Y-%m-%d') as date,
        rps.base_price as basePrice,
        rps.discount_percent as discountPercent,
        (rps.base_price * (1 - rps.discount_percent / 100)) as finalPrice
      FROM room_price_schedule rps
      WHERE rps.room_id = ?
        AND CAST(rps.date AS DATE) >= ?
        AND CAST(rps.date AS DATE) < ?
      ORDER BY rps.date ASC
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [roomId, checkIn, checkOut]);
      const priceData = rows as RowDataPacket[];
      
      if (priceData.length === 0) {
        return null;
      }

      const dailyPrices = priceData.map((row: any) => ({
        date: row.date,
        basePrice: Number(row.basePrice),
        discountPercent: Number(row.discountPercent),
        finalPrice: Number(row.finalPrice)
      }));

      // Tính subtotal (chưa nhân với số phòng)
      const subtotalPerRoom = dailyPrices.reduce((sum: number, day: any) => sum + day.finalPrice, 0);
      const subtotal = subtotalPerRoom * roomsCount;

      // Tính thuế (10% VAT)
      const taxAmount = subtotal * 0.1;

      // Discount amount (có thể bổ sung logic discount code sau)
      const discountAmount = 0;

      // Total amount
      const totalAmount = subtotal + taxAmount - discountAmount;

      return {
        dailyPrices,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        nightsCount: dailyPrices.length
      };
    } finally {
      conn.release();
    }
  }

  // Tạo booking record
  async createBooking(booking: Omit<Booking, 'created_at' | 'updated_at'>): Promise<boolean> {
    const sql = `
      INSERT INTO booking (
        booking_id,
        account_id,
        hotel_id,
        status,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [
        booking.booking_id,
        booking.account_id,
        booking.hotel_id,
        booking.status,
        booking.subtotal,
        booking.tax_amount,
        booking.discount_amount,
        booking.total_amount,
        booking.special_requests || null
      ]);

      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Tạo booking detail record
  async createBookingDetail(detail: BookingDetail): Promise<boolean> {
    const sql = `
      INSERT INTO booking_detail (
        booking_detail_id,
        booking_id,
        room_id,
        checkin_date,
        checkout_date,
        guests_count,
        price_per_night,
        nights_count,
        total_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [
        detail.booking_detail_id,
        detail.booking_id,
        detail.room_id,
        detail.checkin_date,
        detail.checkout_date,
        detail.guests_count,
        detail.price_per_night,
        detail.nights_count,
        detail.total_price
      ]);

      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Lấy booking by ID
  async getBookingById(bookingId: string): Promise<any | null> {
    const sql = `
      SELECT
        b.*,
        h.name as hotel_name,
        h.address as hotel_address,
        h.phone_number as hotel_phone,
        bd.room_id,
        bd.checkin_date,
        bd.checkout_date,
        bd.guests_count,
        bd.nights_count,
        rt.name as room_type_name
      FROM booking b
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      LEFT JOIN room r ON r.room_id = bd.room_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE b.booking_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [bookingId]);
      const bookings = rows as RowDataPacket[];
      return bookings.length > 0 ? bookings[0] : null;
    } finally {
      conn.release();
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<boolean> {
    const sql = `
      UPDATE booking
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE booking_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [bookingId]);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Lấy bookings của user
  async getBookingsByAccountId(accountId: string): Promise<any[]> {
    const sql = `
      SELECT
        b.booking_id,
        b.status,
        b.total_amount,
        b.created_at,
        h.name as hotel_name,
        h.main_image as hotel_image,
        bd.checkin_date,
        bd.checkout_date,
        bd.nights_count,
        rt.name as room_type_name
      FROM booking b
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      LEFT JOIN room r ON r.room_id = bd.room_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE b.account_id = ?
      ORDER BY b.created_at DESC
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [accountId]);
      return rows as RowDataPacket[];
    } finally {
      conn.release();
    }
  }
}

