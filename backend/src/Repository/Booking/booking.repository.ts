import pool from "../../config/db";
import { 
  Booking, 
  BookingDetail, 
  BookingPriceCalculation,
  BookingStatus
} from "../../models/Booking/booking.model";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { BOOKING_EXPIRATION_MINUTES, BOOKING_TAX_RATE } from "../../config/booking.constants";

export class BookingRepository {
  // Hàm generate booking ID
  generateBookingId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BK${timestamp.slice(-9)}${random}`;
  }

  // Hàm generate booking detail ID
  generateBookingDetailId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BD${timestamp.slice(-9)}${random}`;
  }

  // Lấy booking CREATED còn hiệu lực (< BOOKING_EXPIRATION_MINUTES phút) theo account
  async getActiveTemporaryBookingByAccount(accountId: string): Promise<any | null> {
    const sql = `
      SELECT b.*, MIN(bd.checkin_date) AS checkin_date, MAX(bd.checkout_date) AS checkout_date
      FROM booking b
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      WHERE b.account_id = ?
        AND b.status IN ('CREATED','PAID')
        AND TIMESTAMPDIFF(MINUTE, b.created_at, NOW()) <= ?
      GROUP BY b.booking_id
      ORDER BY b.created_at DESC
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [accountId, BOOKING_EXPIRATION_MINUTES]);
      const list = rows as RowDataPacket[];
      return list.length > 0 ? list[0] : null;
    } finally {
      conn.release();
    }
  }

  // Hàm generate booking code cho khách hàng
  generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AGD-${code}`;
  }

  // Hàm lấy thông tin hotel
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

  // Hàm lấy thông tin room
  async getRoomById(roomId: string) {
    const sql = `
      SELECT 
        r.room_id,
        r.room_type_id,
        r.room_number,
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

  // Hàm tính giá booking từ room_price_schedule
  async calculateBookingPrice(
    roomId: string,
    checkIn: string,
    checkOut: string,
    roomsCount: number
  ): Promise<BookingPriceCalculation | null> {
    // ✅ Auto-detect dayuse
    const isDayuse = checkIn === checkOut;
    
    // ✅ Build SQL query based on stay type
    const dateCondition = isDayuse
      ? 'AND CAST(rps.date AS DATE) = ?'
      : 'AND CAST(rps.date AS DATE) >= ? AND CAST(rps.date AS DATE) < ?';
    
    const sql = `
      SELECT
        DATE_FORMAT(rps.date, '%Y-%m-%d') as date,
        rps.base_price as basePrice,
        rps.discount_percent as discountPercent,
        COALESCE(rps.provider_discount_amount, 0) as providerDiscount,
        COALESCE(rps.system_discount_amount, 0) as systemDiscount,
        COALESCE(rps.final_price, rps.base_price - COALESCE(rps.provider_discount_amount, 0) - COALESCE(rps.system_discount_amount, 0), rps.base_price * (1 - rps.discount_percent / 100)) as finalPrice
      FROM room_price_schedule rps
      WHERE rps.room_id = ?
        ${dateCondition}
      ORDER BY rps.date ASC
    `;

    const conn = await pool.getConnection();
    try {
      // ✅ Build query params based on stay type
      const queryParams = isDayuse
        ? [roomId, checkIn]
        : [roomId, checkIn, checkOut];
        
      const [rows] = await conn.query(sql, queryParams);
      const priceData = rows as RowDataPacket[];
      
      if (priceData.length === 0) {
        return null;
      }

      const dailyPrices = priceData.map((row: any) => ({
        date: row.date,
        basePrice: Number(row.basePrice),
        discountPercent: Number(row.discountPercent || 0),
        providerDiscount: Number(row.providerDiscount || 0),
        systemDiscount: Number(row.systemDiscount || 0),
        finalPrice: Number(row.finalPrice)
      }));

      const subtotalPerRoom = dailyPrices.reduce((sum: number, day: any) => sum + day.finalPrice, 0);
      const subtotal = subtotalPerRoom * roomsCount;
      const packageDiscount = 0; // TODO: Implement package discount logic
      const subtotalAfterPackage = subtotal - packageDiscount;
      // ✅ Sử dụng tax rate từ constant (10% VAT theo quy định Việt Nam)
      const taxAmount = subtotalAfterPackage * BOOKING_TAX_RATE;
      const codeDiscount = 0; // TODO: Implement discount code logic
      const discountAmount = packageDiscount + codeDiscount;
      const totalAmount = subtotalAfterPackage + taxAmount - codeDiscount;

      return {
        dailyPrices,
        subtotal,
        packageDiscount,
        subtotalAfterPackage,
        taxAmount,
        codeDiscount,
        discountAmount,
        totalAmount,
        nightsCount: dailyPrices.length
      };
    } finally {
      conn.release();
    }
  }

  // Hàm tạo booking record
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

  // Hàm tạo booking discount record
  async createBookingDiscount(
    bookingId: string,
    discountId: string,
    discountAmount: number
  ): Promise<boolean> {
    const sql = `
      INSERT INTO booking_discount (booking_id, discount_id, discount_amount)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE discount_amount = VALUES(discount_amount)
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [bookingId, discountId, discountAmount]);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Hàm tạo booking detail record
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

  // Hàm lấy booking by ID
  async getBookingById(bookingId: string): Promise<any | null> {
    const sql = `
      SELECT
        b.*,
        h.name as hotel_name,
        h.address as hotel_address,
        h.phone_number as hotel_phone,
        h.email as hotel_email,
        h.main_image as hotel_main_image,
        bd.room_id,
        bd.checkin_date,
        bd.checkout_date,
        bd.guests_count,
        bd.nights_count,
        r.room_number,
        r.capacity as room_capacity,
        r.image_url as room_image_url,
        rt.name as room_type_name,
        rt.room_type_id,
        rt.bed_type,
        rt.area as room_area,
        p.method as payment_method,
        p.status as payment_status,
        p.amount_paid,
        CONCAT('BK', LPAD(b.booking_id, 8, '0')) as booking_code
      FROM booking b
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      LEFT JOIN room r ON r.room_id = bd.room_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      LEFT JOIN payment p ON p.booking_id = b.booking_id
        AND p.created_at = (
          SELECT MAX(p2.created_at)
          FROM payment p2
          WHERE p2.booking_id = b.booking_id
        )
      WHERE b.booking_id = ?
      LIMIT 1
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

  // Hàm lấy tất cả booking details của một booking
  async getBookingDetailsByBookingId(bookingId: string): Promise<BookingDetail[]> {
    const sql = `
      SELECT
        bd.*
      FROM booking_detail bd
      WHERE bd.booking_id = ?
      ORDER BY bd.booking_detail_id ASC
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [bookingId]);
      return rows as BookingDetail[];
    } finally {
      conn.release();
    }
  }

  // Hàm cancel booking và unlock phòng trong cùng transaction (atomic)
  async cancelBookingAndUnlockRooms(
    bookingId: string
  ): Promise<{ success: boolean; unlockedRooms: number }> {
    const conn = await pool.getConnection();
    let unlockedRooms = 0;
    
    try {
      await conn.beginTransaction();
      
      // 1. Cancel booking
      const cancelSql = `
        UPDATE booking
        SET status = 'CANCELLED', updated_at = NOW()
        WHERE booking_id = ? AND status = 'CREATED'
      `;
      const [cancelResult] = await conn.query(cancelSql, [bookingId]);
      
      if ((cancelResult as ResultSetHeader).affectedRows === 0) {
        await conn.rollback();
        return { success: false, unlockedRooms: 0 };
      }
      
      // 2. Lấy booking details để unlock phòng
      const [details]: any = await conn.query(`
        SELECT room_id, checkin_date, checkout_date
        FROM booking_detail
        WHERE booking_id = ?
      `, [bookingId]);
      
      // 3. Unlock từng phòng trong cùng transaction
      const normalizeDate = (date: Date | string): string => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      for (const detail of details) {
        const checkInDate = normalizeDate(detail.checkin_date);
        const checkOutDate = normalizeDate(detail.checkout_date);
        const isDayuse = checkInDate === checkOutDate;
        
        // Unlock phòng bằng cách tăng available_rooms trong room_price_schedule
        let unlockSql: string;
        if (isDayuse) {
          unlockSql = `
            UPDATE room_price_schedule
            SET available_rooms = available_rooms + 1
            WHERE room_id = ? AND date = ?
          `;
          const [unlockResult]: any = await conn.query(unlockSql, [detail.room_id, checkInDate]);
          if ((unlockResult as ResultSetHeader).affectedRows > 0) {
            unlockedRooms++;
          }
        } else {
          unlockSql = `
            UPDATE room_price_schedule
            SET available_rooms = available_rooms + 1
            WHERE room_id = ? AND date >= ? AND date < ?
          `;
          const [unlockResult]: any = await conn.query(unlockSql, [detail.room_id, checkInDate, checkOutDate]);
          if ((unlockResult as ResultSetHeader).affectedRows > 0) {
            unlockedRooms += (unlockResult as ResultSetHeader).affectedRows;
          }
        }
      }
      
      // 4. Commit transaction
      await conn.commit();
      return { success: true, unlockedRooms };
      
    } catch (error: any) {
      await conn.rollback();
      console.error(`[BookingRepository] Error canceling booking ${bookingId} and unlocking rooms:`, error.message);
      throw error;
    } finally {
      conn.release();
    }
  }

  // Hàm cancel booking
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

  // Hàm update booking status and info
  async updateBooking(bookingId: string, updates: {
    status?: BookingStatus;
    special_requests?: string | null;
    subtotal?: number;
    tax_amount?: number;
    discount_amount?: number;
    total_amount?: number;
  }): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      values.push(updates.status);
    }

    if (updates.special_requests !== undefined) {
      updateFields.push('special_requests = ?');
      values.push(updates.special_requests);
    }

    if (updates.subtotal !== undefined) {
      updateFields.push('subtotal = ?');
      values.push(updates.subtotal);
    }

    if (updates.tax_amount !== undefined) {
      updateFields.push('tax_amount = ?');
      values.push(updates.tax_amount);
    }

    if (updates.discount_amount !== undefined) {
      updateFields.push('discount_amount = ?');
      values.push(updates.discount_amount);
    }

    if (updates.total_amount !== undefined) {
      updateFields.push('total_amount = ?');
      values.push(updates.total_amount);
    }

    if (updateFields.length === 0) {
      return false;
    }

    updateFields.push('updated_at = NOW()');
    values.push(bookingId);

    const sql = `
      UPDATE booking
      SET ${updateFields.join(', ')}
      WHERE booking_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, values);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Hàm update booking detail theo booking_detail_id
  async updateBookingDetailById(bookingDetailId: string, updates: {
    checkin_date?: string;
    checkout_date?: string;
    guests_count?: number;
    price_per_night?: number;
    nights_count?: number;
    total_price?: number;
  }): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.checkin_date !== undefined) {
      updateFields.push('checkin_date = ?');
      values.push(updates.checkin_date);
    }

    if (updates.checkout_date !== undefined) {
      updateFields.push('checkout_date = ?');
      values.push(updates.checkout_date);
    }

    if (updates.guests_count !== undefined) {
      updateFields.push('guests_count = ?');
      values.push(updates.guests_count);
    }

    if (updates.price_per_night !== undefined) {
      updateFields.push('price_per_night = ?');
      values.push(updates.price_per_night);
    }

    if (updates.nights_count !== undefined) {
      updateFields.push('nights_count = ?');
      values.push(updates.nights_count);
    }

    if (updates.total_price !== undefined) {
      updateFields.push('total_price = ?');
      values.push(updates.total_price);
    }

    if (updateFields.length === 0) {
      return true;
    }

    values.push(bookingDetailId);

    const sql = `
      UPDATE booking_detail
      SET ${updateFields.join(', ')}
      WHERE booking_detail_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, values);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Hàm update booking detail (dates, price, etc.) - cập nhật tất cả details của một booking
  async updateBookingDetail(bookingId: string, updates: {
    checkin_date?: string;
    checkout_date?: string;
    guests_count?: number;
    price_per_night?: number;
    nights_count?: number;
    total_price?: number;
  }): Promise<boolean> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.checkin_date !== undefined) {
      updateFields.push('checkin_date = ?');
      values.push(updates.checkin_date);
    }

    if (updates.checkout_date !== undefined) {
      updateFields.push('checkout_date = ?');
      values.push(updates.checkout_date);
    }

    if (updates.guests_count !== undefined) {
      updateFields.push('guests_count = ?');
      values.push(updates.guests_count);
    }

    if (updates.price_per_night !== undefined) {
      updateFields.push('price_per_night = ?');
      values.push(updates.price_per_night);
    }

    if (updates.nights_count !== undefined) {
      updateFields.push('nights_count = ?');
      values.push(updates.nights_count);
    }

    if (updates.total_price !== undefined) {
      updateFields.push('total_price = ?');
      values.push(updates.total_price);
    }

    if (updateFields.length === 0) {
      return false;
    }

    values.push(bookingId);

    const sql = `
      UPDATE booking_detail
      SET ${updateFields.join(', ')}
      WHERE booking_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, values);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }

  // Hàm lấy bookings của user
  async getBookingsByAccountId(accountId: string): Promise<any[]> {
    const sql = `
      SELECT
        b.booking_id,
        CONCAT('BK', LPAD(b.booking_id, 8, '0')) as booking_code,
        b.status,
        b.total_amount,
        b.subtotal,
        b.tax_amount,
        b.discount_amount,
        b.created_at,
        b.updated_at,
        b.special_requests,
        h.hotel_id,
        h.name as hotel_name,
        h.main_image as hotel_image,
        h.address as hotel_address,
        h.phone_number as hotel_phone,
        MIN(bd.checkin_date) as checkin_date,
        MIN(bd.checkout_date) as checkout_date,
        MIN(bd.nights_count) as nights_count,
        SUM(bd.guests_count) as guests_count,
        COUNT(DISTINCT bd.room_id) as rooms_count,
        GROUP_CONCAT(DISTINCT rt.name ORDER BY rt.name SEPARATOR ', ') as room_type_names,
        MIN(rt.name) as room_type_name
      FROM booking b
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      LEFT JOIN room r ON r.room_id = bd.room_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE b.account_id = ?
      GROUP BY b.booking_id, b.status, b.total_amount, b.subtotal, b.tax_amount, 
               b.discount_amount, b.created_at, b.updated_at, b.special_requests,
               h.hotel_id, h.name, h.main_image, h.address, h.phone_number
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

