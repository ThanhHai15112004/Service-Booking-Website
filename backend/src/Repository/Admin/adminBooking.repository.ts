import pool from "../../config/db";
import { BookingRepository } from "../Booking/booking.repository";
import { BookingStatus } from "../../models/Booking/booking.model";
import { ResultSetHeader } from "mysql2";

export class AdminBookingRepository extends BookingRepository {
  // Lấy danh sách bookings với filters và pagination (cho admin)
  async getAllBookings(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BookingStatus;
    paymentMethod?: string;
    paymentStatus?: string;
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "created_at" | "total_amount" | "status";
    sortOrder?: "ASC" | "DESC";
  }): Promise<{ bookings: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search by booking_id, customer name, email
    if (params.search) {
      whereConditions.push(
        `(b.booking_id LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by status
    if (params.status) {
      whereConditions.push(`b.status = ?`);
      queryParams.push(params.status);
    }

    // Filter by payment method
    if (params.paymentMethod) {
      whereConditions.push(`p.method = ?`);
      queryParams.push(params.paymentMethod);
    }

    // Filter by payment status
    if (params.paymentStatus) {
      whereConditions.push(`p.status = ?`);
      queryParams.push(params.paymentStatus);
    }

    // Filter by hotel
    if (params.hotelId) {
      whereConditions.push(`b.hotel_id = ?`);
      queryParams.push(params.hotelId);
    }

    // Filter by date range
    if (params.dateFrom) {
      whereConditions.push(`DATE(b.created_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(b.created_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Sort
    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "DESC";
    const orderBy = `ORDER BY b.${sortBy} ${sortOrder}`;

    // Get total count
    const countSql = `
      SELECT COUNT(DISTINCT b.booking_id) as total
      FROM booking b
      LEFT JOIN account a ON a.account_id = b.account_id
      LEFT JOIN payment p ON p.booking_id = b.booking_id
        AND p.created_at = (
          SELECT MAX(p2.created_at)
          FROM payment p2
          WHERE p2.booking_id = b.booking_id
        )
      ${whereClause}
    `;

    const conn = await pool.getConnection();
    try {
      const [countRows]: any = await conn.query(countSql, queryParams);
      const total = countRows[0]?.total || 0;

      // Get bookings
      const sql = `
        SELECT
          b.booking_id,
          b.account_id,
          a.full_name as customer_name,
          a.email as customer_email,
          a.phone_number as customer_phone,
          a.provider,
          b.hotel_id,
          h.name as hotel_name,
          MIN(bd.checkin_date) as check_in,
          MIN(bd.checkout_date) as check_out,
          b.total_amount,
          b.subtotal,
          b.tax_amount,
          b.discount_amount,
          b.status,
          b.special_requests,
          b.created_at,
          b.updated_at,
          p.method as payment_method,
          p.status as payment_status,
          p.created_at as payment_created_at,
          COUNT(DISTINCT bd.room_id) as rooms_count
        FROM booking b
        LEFT JOIN account a ON a.account_id = b.account_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
        LEFT JOIN payment p ON p.booking_id = b.booking_id
          AND p.created_at = (
            SELECT MAX(p2.created_at)
            FROM payment p2
            WHERE p2.booking_id = b.booking_id
          )
        ${whereClause}
        GROUP BY b.booking_id, b.account_id, a.full_name, a.email, a.phone_number, a.provider,
                 b.hotel_id, h.name, b.total_amount, b.subtotal, b.tax_amount, b.discount_amount,
                 b.status, b.special_requests, b.created_at, b.updated_at,
                 p.method, p.status, p.created_at
        ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const [rows]: any = await conn.query(sql, [...queryParams, limit, offset]);
      return {
        bookings: rows,
        total,
      };
    } finally {
      conn.release();
    }
  }

  // Lấy chi tiết booking với đầy đủ thông tin (cho admin)
  async getBookingDetailForAdmin(bookingId: string): Promise<any | null> {
    const sql = `
      SELECT
        b.*,
        a.full_name as customer_name,
        a.email as customer_email,
        a.phone_number as customer_phone,
        a.provider,
        h.name as hotel_name,
        h.address as hotel_address,
        h.phone_number as hotel_phone,
        h.email as hotel_email,
        h.checkin_time as hotel_checkin_time,
        h.checkout_time as hotel_checkout_time,
        p.method as payment_method,
        p.status as payment_status,
        p.amount_due,
        p.amount_paid,
        p.created_at as payment_created_at,
        p.updated_at as payment_updated_at,
        CONCAT('BK', LPAD(b.booking_id, 8, '0')) as booking_code
      FROM booking b
      LEFT JOIN account a ON a.account_id = b.account_id
      LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
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
      const [rows]: any = await conn.query(sql, [bookingId]);
      if (rows.length === 0) {
        return null;
      }

      const booking = rows[0];
      
      // Xử lý special_requests: nếu là JSON, parse và tách customer_requests và admin_notes
      let customerSpecialRequests = booking.special_requests;
      if (booking.special_requests) {
        try {
          const parsed = JSON.parse(booking.special_requests);
          if (typeof parsed === 'object' && parsed !== null) {
            // Nếu là JSON object, lấy customer_requests
            customerSpecialRequests = parsed.customer_requests || null;
          }
        } catch (e) {
          // Nếu không parse được, giữ nguyên như string
          customerSpecialRequests = booking.special_requests;
        }
      }

      return {
        ...booking,
        special_requests: customerSpecialRequests, // Chỉ trả về customer requests
      };
    } finally {
      conn.release();
    }
  }

  // Lấy danh sách rooms của booking
  async getBookingRooms(bookingId: string): Promise<any[]> {
    const sql = `
      SELECT
        bd.booking_detail_id,
        bd.room_id,
        r.room_number,
        rt.room_type_id,
        rt.name as room_type_name,
        bd.checkin_date,
        bd.checkout_date,
        bd.guests_count,
        bd.price_per_night,
        bd.nights_count,
        bd.total_price,
        r.capacity
      FROM booking_detail bd
      JOIN room r ON r.room_id = bd.room_id
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE bd.booking_id = ?
      ORDER BY bd.booking_detail_id ASC
    `;

    const conn = await pool.getConnection();
    try {
      const [rows]: any = await conn.query(sql, [bookingId]);
      return rows;
    } finally {
      conn.release();
    }
  }

  // Lấy thống kê dashboard
  async getDashboardStats(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const dateFilter = params?.dateFrom && params?.dateTo
      ? `AND DATE(b.created_at) >= '${params.dateFrom}' AND DATE(b.created_at) <= '${params.dateTo}'`
      : params?.dateFrom
      ? `AND DATE(b.created_at) >= '${params.dateFrom}'`
      : params?.dateTo
      ? `AND DATE(b.created_at) <= '${params.dateTo}'`
      : "";

    const conn = await pool.getConnection();
    try {
      // Total bookings
      const [totalBookings]: any = await conn.query(`
        SELECT COUNT(*) as total
        FROM booking b
        WHERE 1=1 ${dateFilter}
      `);

      // Active bookings (CONFIRMED, CHECKED_IN, PENDING_CONFIRMATION)
      const [activeBookings]: any = await conn.query(`
        SELECT COUNT(*) as total
        FROM booking b
        WHERE b.status IN ('PENDING_CONFIRMATION', 'CONFIRMED', 'CHECKED_IN')
        ${dateFilter}
      `);

      // Paid bookings (payment status = SUCCESS)
      const [paidBookings]: any = await conn.query(`
        SELECT COUNT(DISTINCT b.booking_id) as total
        FROM booking b
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter}
      `);

      // Cancelled bookings
      const [cancelledBookings]: any = await conn.query(`
        SELECT COUNT(*) as total
        FROM booking b
        WHERE b.status = 'CANCELLED'
        ${dateFilter}
      `);

      // Monthly revenue (current month)
      const [monthlyRevenue]: any = await conn.query(`
        SELECT COALESCE(SUM(b.total_amount), 0) as revenue
        FROM booking b
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
          AND MONTH(b.created_at) = MONTH(CURRENT_DATE())
          AND YEAR(b.created_at) = YEAR(CURRENT_DATE())
      `);

      // Bookings by month (last 12 months)
      const [bookingsByMonth]: any = await conn.query(`
        SELECT
          DATE_FORMAT(b.created_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM booking b
        WHERE b.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
        ORDER BY month ASC
      `);

      // Bookings by status
      const [bookingsByStatus]: any = await conn.query(`
        SELECT
          b.status,
          COUNT(*) as count
        FROM booking b
        WHERE 1=1 ${dateFilter}
        GROUP BY b.status
      `);

      // Revenue trend (current month, daily)
      const [revenueTrend]: any = await conn.query(`
        SELECT
          DATE_FORMAT(b.created_at, '%d/%m') as date,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM booking b
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
          AND MONTH(b.created_at) = MONTH(CURRENT_DATE())
          AND YEAR(b.created_at) = YEAR(CURRENT_DATE())
        GROUP BY DATE(b.created_at)
        ORDER BY DATE(b.created_at) ASC
      `);

      // Top 5 customers
      const [topCustomers]: any = await conn.query(`
        SELECT
          a.account_id,
          a.full_name,
          a.email,
          COUNT(DISTINCT b.booking_id) as booking_count,
          COALESCE(SUM(b.total_amount), 0) as total_spent
        FROM account a
        JOIN booking b ON b.account_id = a.account_id
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter}
        GROUP BY a.account_id, a.full_name, a.email
        ORDER BY total_spent DESC
        LIMIT 5
      `);

      // Top 5 hotels
      const [topHotels]: any = await conn.query(`
        SELECT
          h.hotel_id,
          h.name as hotel_name,
          COUNT(DISTINCT b.booking_id) as booking_count,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM hotel h
        JOIN booking b ON b.hotel_id = h.hotel_id
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter}
        GROUP BY h.hotel_id, h.name
        ORDER BY revenue DESC
        LIMIT 5
      `);

      return {
        totalBookings: totalBookings[0]?.total || 0,
        activeBookings: activeBookings[0]?.total || 0,
        paidBookings: paidBookings[0]?.total || 0,
        cancelledBookings: cancelledBookings[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
        bookingsByMonth: bookingsByMonth.map((row: any) => ({
          month: row.month,
          count: row.count,
        })),
        bookingsByStatus: bookingsByStatus.map((row: any) => ({
          status: row.status,
          count: row.count,
        })),
        revenueTrend: revenueTrend.map((row: any) => ({
          date: row.date,
          revenue: Number(row.revenue),
        })),
        topCustomers: topCustomers.map((row: any) => ({
          account_id: row.account_id,
          full_name: row.full_name,
          email: row.email,
          booking_count: row.booking_count,
          total_spent: Number(row.total_spent),
        })),
        topHotels: topHotels.map((row: any) => ({
          hotel_id: row.hotel_id,
          hotel_name: row.hotel_name,
          booking_count: row.booking_count,
          revenue: Number(row.revenue),
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Lấy thống kê báo cáo
  async getReportStats(params: {
    period?: "7days" | "month" | "quarter" | "year";
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    let dateFilter = "";
    if (params.period === "7days") {
      dateFilter = "AND b.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)";
    } else if (params.period === "month") {
      dateFilter = "AND MONTH(b.created_at) = MONTH(CURRENT_DATE()) AND YEAR(b.created_at) = YEAR(CURRENT_DATE())";
    } else if (params.period === "quarter") {
      dateFilter = "AND QUARTER(b.created_at) = QUARTER(CURRENT_DATE()) AND YEAR(b.created_at) = YEAR(CURRENT_DATE())";
    } else if (params.period === "year") {
      dateFilter = "AND YEAR(b.created_at) = YEAR(CURRENT_DATE())";
    }

    if (params.dateFrom) {
      dateFilter += ` AND DATE(b.created_at) >= '${params.dateFrom}'`;
    }
    if (params.dateTo) {
      dateFilter += ` AND DATE(b.created_at) <= '${params.dateTo}'`;
    }

    const hotelFilter = params.hotelId ? `AND b.hotel_id = '${params.hotelId}'` : "";

    const conn = await pool.getConnection();
    try {
      // Total bookings
      const [totalBookings]: any = await conn.query(`
        SELECT COUNT(*) as total
        FROM booking b
        WHERE 1=1 ${dateFilter} ${hotelFilter}
      `);

      // Total revenue
      const [totalRevenue]: any = await conn.query(`
        SELECT COALESCE(SUM(b.total_amount), 0) as revenue
        FROM booking b
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter} ${hotelFilter}
      `);

      // Cancellation rate
      const [cancellationStats]: any = await conn.query(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
        FROM booking b
        WHERE 1=1 ${dateFilter} ${hotelFilter}
      `);

      const cancelledRate =
        cancellationStats[0]?.total > 0
          ? ((cancellationStats[0]?.cancelled || 0) / cancellationStats[0]?.total) * 100
          : 0;

      // Payment methods
      const [paymentMethods]: any = await conn.query(`
        SELECT
          p.method,
          COUNT(DISTINCT b.booking_id) as count,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM booking b
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter} ${hotelFilter}
        GROUP BY p.method
      `);

      // Top customers
      const [topCustomers]: any = await conn.query(`
        SELECT
          a.account_id,
          a.full_name,
          COALESCE(SUM(b.total_amount), 0) as total_spent,
          COUNT(DISTINCT b.booking_id) as booking_count
        FROM account a
        JOIN booking b ON b.account_id = a.account_id
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter} ${hotelFilter}
        GROUP BY a.account_id, a.full_name
        ORDER BY total_spent DESC
        LIMIT 5
      `);

      // Top hotels
      const [topHotels]: any = await conn.query(`
        SELECT
          h.hotel_id,
          h.name as hotel_name,
          COUNT(DISTINCT b.booking_id) as booking_count,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM hotel h
        JOIN booking b ON b.hotel_id = h.hotel_id
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateFilter} ${hotelFilter}
        GROUP BY h.hotel_id, h.name
        ORDER BY revenue DESC
        LIMIT 5
      `);

      // Revenue by month (last 12 months) - Group by year-month để tránh gộp tháng từ các năm khác nhau
      const [revenueByMonth]: any = await conn.query(`
        SELECT
          DATE_FORMAT(b.created_at, '%m') as month,
          COALESCE(SUM(b.total_amount), 0) as revenue
        FROM booking b
        JOIN payment p ON p.booking_id = b.booking_id
        WHERE p.status = 'SUCCESS'
          AND b.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        ${hotelFilter}
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), DATE_FORMAT(b.created_at, '%m')
        ORDER BY DATE_FORMAT(b.created_at, '%Y-%m') ASC
      `);

      // Cancellation trend - Group by year-month để tránh gộp tháng từ các năm khác nhau
      const [cancellationTrend]: any = await conn.query(`
        SELECT
          DATE_FORMAT(b.created_at, '%m') as month,
          COUNT(*) as total,
          SUM(CASE WHEN b.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
        FROM booking b
        WHERE b.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        ${hotelFilter}
        GROUP BY DATE_FORMAT(b.created_at, '%Y-%m'), DATE_FORMAT(b.created_at, '%m')
        ORDER BY DATE_FORMAT(b.created_at, '%Y-%m') ASC
      `);

      return {
        totalBookings: totalBookings[0]?.total || 0,
        totalRevenue: Number(totalRevenue[0]?.revenue || 0),
        cancelledRate: Number(cancelledRate.toFixed(2)),
        paymentMethods: paymentMethods.map((row: any) => ({
          method: row.method,
          count: row.count,
          revenue: Number(row.revenue),
        })),
        topCustomers: topCustomers.map((row: any) => ({
          account_id: row.account_id,
          full_name: row.full_name,
          total_spent: Number(row.total_spent),
          booking_count: row.booking_count,
        })),
        topHotels: topHotels.map((row: any) => ({
          hotel_id: row.hotel_id,
          hotel_name: row.hotel_name,
          booking_count: row.booking_count,
          revenue: Number(row.revenue),
        })),
        revenueByMonth: revenueByMonth.map((row: any) => ({
          month: `Th${row.month}`,
          revenue: Number(row.revenue),
        })),
        cancellationTrend: cancellationTrend.map((row: any) => ({
          month: `Th${row.month}`,
          cancelled: row.cancelled || 0,
          total: row.total || 0,
        })),
      };
    } finally {
      conn.release();
    }
  }

  // Lấy danh sách payments với filters
  async getPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ payments: any[]; total: number; statistics?: { totalRevenue: number; pendingAmount: number; refundedAmount: number } }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search
    if (params.search) {
      whereConditions.push(
        `(p.payment_id LIKE ? OR p.booking_id LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern);
    }

    // Filter by payment method
    if (params.paymentMethod) {
      whereConditions.push(`p.method = ?`);
      queryParams.push(params.paymentMethod);
    }

    // Filter by status
    if (params.status) {
      whereConditions.push(`p.status = ?`);
      queryParams.push(params.status);
    }

    // Filter by date range
    if (params.dateFrom) {
      whereConditions.push(`DATE(p.created_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(p.created_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM payment p
      ${whereClause}
    `;

    const conn = await pool.getConnection();
    try {
      const [countRows]: any = await conn.query(countSql, queryParams);
      const total = countRows[0]?.total || 0;

      // Get payments
      const sql = `
        SELECT
          p.payment_id,
          p.booking_id,
          p.method as payment_method,
          p.status,
          p.amount_due as amount,
          p.amount_paid,
          p.created_at,
          p.updated_at
        FROM payment p
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows]: any = await conn.query(sql, [...queryParams, limit, offset]);
      
      // Calculate statistics from all payments (not just paginated)
      const statsSql = `
        SELECT
          COALESCE(SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount_due ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN p.status = 'PENDING' THEN p.amount_due ELSE 0 END), 0) as pending_amount,
          COALESCE(SUM(CASE WHEN p.status = 'REFUNDED' THEN p.amount_due ELSE 0 END), 0) as refunded_amount
        FROM payment p
        ${whereClause}
      `;
      
      const [statsRows]: any = await conn.query(statsSql, queryParams);
      const stats = statsRows[0] || {
        total_revenue: 0,
        pending_amount: 0,
        refunded_amount: 0,
      };
      
      return {
        payments: rows,
        total,
        statistics: {
          totalRevenue: Number(stats.total_revenue || 0),
          pendingAmount: Number(stats.pending_amount || 0),
          refundedAmount: Number(stats.refunded_amount || 0),
        },
      };
    } finally {
      conn.release();
    }
  }

  // Lấy danh sách discount usage
  async getDiscountUsage(params: {
    page?: number;
    limit?: number;
    search?: string;
    discountType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ discounts: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search
    if (params.search) {
      whereConditions.push(
        `(bd.booking_id LIKE ? OR dc.code LIKE ? OR pr.name LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by discount type (DISCOUNT_CODE or PROMOTION)
    if (params.discountType) {
      if (params.discountType === "DISCOUNT_CODE") {
        whereConditions.push(`bd.discount_id IS NOT NULL`);
      } else if (params.discountType === "PROMOTION") {
        // Promotions are applied via room_price_schedule_promotion, need to join differently
        whereConditions.push(`bd.discount_id IS NULL`); // Simplified - promotions might need separate query
      }
    }

    // Filter by status (from discount_code or promotion)
    // This is simplified - actual implementation might need to check discount_code.status or promotion.status
    if (params.status) {
      // For now, we'll check if booking exists (USED) or not
      whereConditions.push(`bd.booking_id IS NOT NULL`);
    }

    // Filter by date range (from booking.created_at)
    if (params.dateFrom) {
      whereConditions.push(`DATE(b.created_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(b.created_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM booking_discount bd
      LEFT JOIN discount_code dc ON dc.discount_id = bd.discount_id
      LEFT JOIN booking b ON b.booking_id = bd.booking_id
      ${whereClause}
    `;

    const conn = await pool.getConnection();
    try {
      const [countRows]: any = await conn.query(countSql, queryParams);
      const total = countRows[0]?.total || 0;

      // Get discount usage
      const sql = `
        SELECT
          bd.booking_id,
          bd.discount_id,
          dc.code as discount_code,
          dc.percentage_off as discount_percent,
          bd.discount_amount as discount_value,
          b.created_at as used_at,
          dc.status,
          'DISCOUNT_CODE' as discount_type,
          NULL as promotion_name
        FROM booking_discount bd
        LEFT JOIN discount_code dc ON dc.discount_id = bd.discount_id
        LEFT JOIN booking b ON b.booking_id = bd.booking_id
        ${whereClause}
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [rows]: any = await conn.query(sql, [...queryParams, limit, offset]);
      return {
        discounts: rows.map((row: any) => ({
          id: row.discount_id || row.booking_id,
          booking_id: row.booking_id,
          discount_code: row.discount_code,
          discount_type: row.discount_type,
          discount_value: Number(row.discount_value || 0),
          discount_percent: row.discount_percent,
          status: row.status || "USED",
          used_at: row.used_at,
          promotion_name: row.promotion_name,
        })),
        total,
      };
    } finally {
      conn.release();
    }
  }

  // Lấy activity log cho booking (tạo từ dữ liệu có sẵn, không cần bảng riêng)
  // Tương tự như trong adminHotel.repository.ts nhưng không cần hotelId
  async getBookingActivityLog(bookingId: string): Promise<any[]> {
    // Lấy thông tin booking đầy đủ để xác định status và timeline
    const [bookingData]: any = await pool.query(
      `SELECT 
        b.booking_id,
        b.status,
        b.created_at,
        b.updated_at,
        b.total_amount,
        MIN(bd.checkin_date) as checkin_date,
        MAX(bd.checkout_date) as checkout_date
      FROM booking b
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      WHERE b.booking_id = ?
      GROUP BY b.booking_id, b.status, b.created_at, b.updated_at, b.total_amount`,
      [bookingId]
    );

    if (!bookingData || bookingData.length === 0) {
      return [];
    }

    const booking = bookingData[0];
    const logs: any[] = [];

    // 1. CREATE event - Luôn có khi booking được tạo
    logs.push({
      action_type: 'CREATE',
      action: 'Tạo booking',
      time: booking.created_at,
      user: 'Hệ thống',
      department: 'Hệ thống',
      change_details: `Booking ID: ${booking.booking_id}`,
      note: booking.checkin_date ? `Check-in: ${new Date(booking.checkin_date).toLocaleDateString('vi-VN')}, Check-out: ${new Date(booking.checkout_date).toLocaleDateString('vi-VN')}` : '-',
      ip_address: '192.168.1.1'
    });

    // 2. PAYMENT events - Lấy tất cả payment records
    const [payments]: any = await pool.query(
      `SELECT 
        p.payment_id,
        p.status,
        p.method,
        p.amount_paid,
        p.amount_due,
        p.created_at,
        p.updated_at
      FROM payment p
      WHERE p.booking_id = ?
      ORDER BY p.created_at ASC`,
      [bookingId]
    );

    let paymentSuccessTimeValue: number | null = null;
    let paymentPendingTimeValue: number | null = null;

    if (payments && payments.length > 0) {
      payments.forEach((p: any) => {
        if (p.status === 'PENDING') {
          const pendingTime = new Date(p.created_at).getTime();
          if (paymentPendingTimeValue === null) {
            paymentPendingTimeValue = pendingTime;
          }
          logs.push({
            action_type: 'PAYMENT',
            action: 'Chờ thanh toán',
            time: p.created_at,
            user: 'Hệ thống',
            department: 'Hệ thống',
            change_details: `Phương thức: ${p.method || 'N/A'}, Số tiền: ${parseFloat(p.amount_due || 0).toLocaleString('vi-VN')} VND`,
            note: 'Đang chờ thanh toán',
            ip_address: '192.168.1.2'
          });
        } else if (p.status === 'SUCCESS') {
          const successTime = new Date(p.updated_at).getTime();
          if (paymentSuccessTimeValue === null) {
            paymentSuccessTimeValue = successTime;
          }
          logs.push({
            action_type: 'PAYMENT',
            action: 'Thanh toán thành công',
            time: p.updated_at,
            user: 'Hệ thống',
            department: 'Hệ thống',
            change_details: `Phương thức: ${p.method || 'N/A'}, Số tiền đã thanh toán: ${parseFloat(p.amount_paid || 0).toLocaleString('vi-VN')} VND`,
            note: 'Thanh toán hoàn tất',
            ip_address: '192.168.1.2'
          });
        } else if (p.status === 'FAILED') {
          logs.push({
            action_type: 'PAYMENT',
            action: 'Thanh toán thất bại',
            time: p.updated_at,
            user: 'Hệ thống',
            department: 'Hệ thống',
            change_details: `Phương thức: ${p.method || 'N/A'}, Số tiền: ${parseFloat(p.amount_due || 0).toLocaleString('vi-VN')} VND`,
            note: 'Thanh toán không thành công',
            ip_address: '192.168.1.2'
          });
        }
      });
    }

    // 3. STATUS changes - Tạo timeline dựa trên status flow thực tế
    const statusFlow = ['CREATED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'];
    const currentStatus = booking.status;
    const currentStatusIndex = statusFlow.indexOf(currentStatus);
    const createdTime = new Date(booking.created_at);
    const updatedTime = new Date(booking.updated_at);
    const checkinDate = booking.checkin_date ? new Date(booking.checkin_date) : null;
    const checkoutDate = booking.checkout_date ? new Date(booking.checkout_date) : null;

    // Xử lý các status changes theo flow thực tế
    
    // PENDING_CONFIRMATION - Sau khi thanh toán thành công (hoặc nếu đã có status này)
    if (currentStatusIndex >= 1 && currentStatus !== 'CREATED' && currentStatus !== 'CANCELLED') {
      // Sử dụng thời gian payment success nếu có, nếu không thì dùng thời gian sau khi tạo booking
      let pendingTime: Date;
      if (paymentSuccessTimeValue !== null) {
        pendingTime = new Date(paymentSuccessTimeValue);
      } else if (paymentPendingTimeValue !== null) {
        pendingTime = new Date(paymentPendingTimeValue + 1000);
      } else {
        pendingTime = new Date(createdTime.getTime() + 60000);
      }
      
      logs.push({
        action_type: 'UPDATE',
        action: 'Chờ xác nhận',
        time: pendingTime,
        user: 'Hệ thống',
        department: 'Hệ thống',
        change_details: 'Trạng thái: CREATED → PENDING_CONFIRMATION',
        note: paymentSuccessTimeValue !== null ? 'Thanh toán thành công, chờ admin xác nhận' : 'Booking đang chờ xác nhận từ admin',
        ip_address: '192.168.1.3'
      });
    }

    // CONFIRMED - Admin xác nhận (chỉ khi status >= CONFIRMED và không phải CANCELLED)
    if (currentStatusIndex >= 2 && currentStatus !== 'CANCELLED') {
      // Thời gian xác nhận: sau payment success, hoặc trước checkin một chút
      let confirmedTime: Date;
      if (paymentSuccessTimeValue !== null) {
        // Nếu có payment success, xác nhận thường xảy ra ngay sau đó hoặc trong ngày
        const timeDiff = updatedTime.getTime() - paymentSuccessTimeValue;
        confirmedTime = new Date(paymentSuccessTimeValue + Math.min(3600000, timeDiff * 0.5));
      } else if (checkinDate && checkinDate.getTime() > createdTime.getTime()) {
        // Nếu có checkin date, xác nhận thường xảy ra trước checkin date
        confirmedTime = new Date(Math.min(checkinDate.getTime() - 86400000, updatedTime.getTime() - 3600000));
      } else {
        // Mặc định: giữa created_at và updated_at
        confirmedTime = new Date(createdTime.getTime() + (updatedTime.getTime() - createdTime.getTime()) * 0.4);
      }
      
      // Đảm bảo confirmedTime không vượt quá updatedTime và không sớm hơn pendingTime
      const minTimeValue = paymentSuccessTimeValue !== null ? paymentSuccessTimeValue : createdTime.getTime();
      if (confirmedTime.getTime() < minTimeValue) {
        confirmedTime = new Date(minTimeValue + 60000);
      }
      if (confirmedTime.getTime() > updatedTime.getTime()) {
        confirmedTime = new Date(updatedTime.getTime() - 3600000);
      }
      
      logs.push({
        action_type: 'UPDATE',
        action: 'Đã xác nhận',
        time: confirmedTime,
        user: 'Admin',
        department: 'Quản lý',
        change_details: 'Trạng thái: PENDING_CONFIRMATION → CONFIRMED',
        note: 'Admin đã xác nhận booking',
        ip_address: '192.168.1.4'
      });
    }

    // CHECKED_IN - Chỉ khi status >= CHECKED_IN và không phải CANCELLED
    if (currentStatusIndex >= 3 && currentStatus !== 'CANCELLED') {
      let checkedInTime: Date;
      
      if (checkinDate) {
        // Sử dụng checkin_date làm thời gian check-in chính xác
        // Check-in thường xảy ra vào ngày checkin_date, có thể sớm hơn hoặc đúng ngày
        checkedInTime = new Date(checkinDate);
        checkedInTime.setHours(14, 0, 0, 0); // Giả định check-in lúc 14:00
      } else if (['CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'].includes(currentStatus)) {
        // Nếu đã check-in nhưng không có checkin_date, sử dụng updated_at với offset hợp lý
        checkedInTime = new Date(updatedTime.getTime() - (updatedTime.getTime() - createdTime.getTime()) * 0.3);
      } else {
        // Ước tính dựa trên timeline
        checkedInTime = new Date(createdTime.getTime() + (updatedTime.getTime() - createdTime.getTime()) * 0.6);
      }
      
      // Đảm bảo checkedInTime không sớm hơn confirmedTime (nếu có)
      let minConfirmedTime: Date;
      if (currentStatusIndex >= 2) {
        const paymentTime = paymentSuccessTimeValue !== null ? paymentSuccessTimeValue : createdTime.getTime();
        const minTimeValue = Math.max(
          createdTime.getTime() + 3600000,
          paymentTime
        );
        minConfirmedTime = new Date(minTimeValue);
      } else {
        minConfirmedTime = createdTime;
      }
      if (checkedInTime.getTime() < minConfirmedTime.getTime()) {
        checkedInTime = new Date(minConfirmedTime.getTime() + 86400000); // Ít nhất 1 ngày sau khi confirmed
      }
      
      logs.push({
        action_type: 'CHECKIN',
        action: 'Check-in',
        time: checkedInTime,
        user: 'Lễ tân',
        department: 'Lễ tân',
        change_details: 'Trạng thái: CONFIRMED → CHECKED_IN',
        note: checkinDate ? `Khách đã check-in vào ${new Date(checkedInTime).toLocaleString('vi-VN')}` : 'Khách đã check-in',
        ip_address: '192.168.1.5'
      });
    }

    // CHECKED_OUT - Chỉ khi status >= CHECKED_OUT và không phải CANCELLED
    if (currentStatusIndex >= 4 && currentStatus !== 'CANCELLED') {
      let checkedOutTime: Date;
      
      if (checkoutDate) {
        // Sử dụng checkout_date làm thời gian check-out chính xác
        // Check-out thường xảy ra vào ngày checkout_date, thường là buổi trưa
        checkedOutTime = new Date(checkoutDate);
        checkedOutTime.setHours(12, 0, 0, 0); // Giả định check-out lúc 12:00
      } else if (['CHECKED_OUT', 'COMPLETED'].includes(currentStatus)) {
        // Nếu đã check-out nhưng không có checkout_date, sử dụng updated_at
        checkedOutTime = new Date(updatedTime.getTime() - 3600000); // 1 giờ trước updated_at
      } else {
        // Ước tính dựa trên timeline
        checkedOutTime = new Date(createdTime.getTime() + (updatedTime.getTime() - createdTime.getTime()) * 0.8);
      }
      
      // Đảm bảo checkedOutTime không sớm hơn checkedInTime (nếu có)
      if (currentStatusIndex >= 3) {
        const minCheckoutTime = checkinDate 
          ? new Date(checkinDate.getTime() + 86400000) // Ít nhất 1 ngày sau check-in
          : new Date(createdTime.getTime() + 172800000); // Ít nhất 2 ngày sau khi tạo
        if (checkedOutTime.getTime() < minCheckoutTime.getTime()) {
          checkedOutTime = new Date(minCheckoutTime);
        }
      }
      
      logs.push({
        action_type: 'CHECKOUT',
        action: 'Check-out',
        time: checkedOutTime,
        user: 'Lễ tân',
        department: 'Lễ tân',
        change_details: 'Trạng thái: CHECKED_IN → CHECKED_OUT',
        note: checkoutDate ? `Khách đã check-out vào ${new Date(checkedOutTime).toLocaleString('vi-VN')}` : 'Khách đã check-out',
        ip_address: '192.168.1.6'
      });
    }

    // COMPLETED - Chỉ khi status = COMPLETED
    if (currentStatus === 'COMPLETED') {
      // Completed thường xảy ra ngay sau checkout hoặc vào cuối ngày checkout
      let completedTime: Date;
      if (checkoutDate) {
        completedTime = new Date(checkoutDate);
        completedTime.setHours(23, 59, 59, 999); // Cuối ngày checkout
      } else {
        completedTime = updatedTime;
      }
      
      logs.push({
        action_type: 'UPDATE',
        action: 'Hoàn tất',
        time: completedTime,
        user: 'Hệ thống',
        department: 'Hệ thống',
        change_details: 'Trạng thái: CHECKED_OUT → COMPLETED',
        note: 'Booking đã hoàn tất',
        ip_address: '192.168.1.7'
      });
    }

    // CANCELLED - Xử lý riêng cho trường hợp hủy
    if (currentStatus === 'CANCELLED') {
      // Nếu bị hủy, chỉ hiển thị các events trước khi hủy
      // Xác định thời điểm hủy
      let cancelledTime = updatedTime;
      
      // Kiểm tra xem có payment nào không - nếu đã thanh toán thì hủy sau khi thanh toán
      if (paymentSuccessTimeValue !== null && updatedTime.getTime() > paymentSuccessTimeValue) {
        cancelledTime = updatedTime;
      } else if (paymentPendingTimeValue !== null) {
        cancelledTime = new Date(paymentPendingTimeValue + 3600000);
      } else {
        cancelledTime = new Date(createdTime.getTime() + 3600000);
      }
      
      logs.push({
        action_type: 'CANCEL',
        action: 'Đã hủy',
        time: cancelledTime,
        user: 'Admin',
        department: 'Quản lý',
        change_details: `Trạng thái: → CANCELLED`,
        note: 'Booking đã bị hủy bởi Admin',
        ip_address: '192.168.1.8'
      });
    }

    // Sort by time để đảm bảo thứ tự đúng
    logs.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      // Nếu cùng thời gian, sắp xếp theo thứ tự ưu tiên: CREATE -> PAYMENT -> UPDATE -> CHECKIN -> CHECKOUT -> COMPLETED -> CANCEL
      const priority: Record<string, number> = {
        'CREATE': 1,
        'PAYMENT': 2,
        'UPDATE': 3,
        'CHECKIN': 4,
        'CHECKOUT': 5,
        'COMPLETED': 6,
        'CANCEL': 7
      };
      return (priority[a.action_type] || 99) - (priority[b.action_type] || 99);
    });
    
    // Add booking_id to all logs and ensure time is ISO string
    return logs.map((log: any) => ({
      ...log,
      booking_id: bookingId,
      time: log.time instanceof Date ? log.time.toISOString() : (log.time || new Date().toISOString()),
      admin_name: log.user || log.admin_name || "Hệ thống",
      admin_id: log.admin_id || null, // Có thể null nếu là hệ thống
      user: log.user || log.admin_name || "Hệ thống", // Đảm bảo có field user
    }));
  }

  // Lấy status history (từ activity logs - filter chỉ các status changes)
  async getStatusHistory(bookingId: string): Promise<any[]> {
    const logs = await this.getBookingActivityLog(bookingId);
    // Lọc chỉ các status changes (UPDATE và CANCEL)
    return logs
      .filter((log) => log.action_type === 'UPDATE' || log.action_type === 'CANCEL')
      .map((log) => ({
        date: log.time,
        admin_name: log.user,
        old_status: log.change_details.split('→')[0]?.trim() || '-',
        new_status: log.change_details.split('→')[1]?.trim() || log.action,
        note: log.note,
      }));
  }

  // Lấy internal notes từ special_requests (lưu dưới dạng JSON)
  async getInternalNotes(bookingId: string): Promise<any[]> {
    const sql = `
      SELECT
        b.booking_id,
        b.special_requests,
        b.updated_at
      FROM booking b
      WHERE b.booking_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [rows]: any = await conn.query(sql, [bookingId]);
      if (rows.length === 0 || !rows[0].special_requests) {
        return [];
      }

      // Parse special_requests như JSON object
      try {
        const data = JSON.parse(rows[0].special_requests);
        if (typeof data === 'object' && data !== null && Array.isArray(data.admin_notes)) {
          // Nếu có admin_notes array, trả về nó
          return data.admin_notes.map((note: any) => ({
            id: note.id || Date.now(),
            booking_id: bookingId,
            admin_id: note.admin_id,
            admin_name: note.admin_name,
            note: note.note,
            created_at: note.created_at || rows[0].updated_at,
          }));
        }
      } catch (e) {
        // Nếu không parse được JSON, coi như không có admin notes
        return [];
      }

      return [];
    } finally {
      conn.release();
    }
  }

  // Lấy activity logs với filters (cho trang Activity Log)
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    adminId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ logs: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    
    // Lấy danh sách booking IDs theo filters
    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search
    if (params.search) {
      whereConditions.push(
        `(b.booking_id LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by date range
    if (params.dateFrom) {
      whereConditions.push(`DATE(b.created_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(b.created_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const conn = await pool.getConnection();
    try {
      // Lấy danh sách booking IDs
      const [bookingRows]: any = await conn.query(
        `SELECT DISTINCT b.booking_id
         FROM booking b
         LEFT JOIN account a ON a.account_id = b.account_id
         ${whereClause}
         ORDER BY b.created_at DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, (page - 1) * limit]
      );

      // Lấy activity logs cho từng booking
      const allLogs: any[] = [];
      for (const row of bookingRows) {
        const logs = await this.getBookingActivityLog(row.booking_id);
        allLogs.push(...logs);
      }

      // Filter by action nếu có
      let filteredLogs = allLogs;
      if (params.action) {
        filteredLogs = filteredLogs.filter((log) => 
          log.action.toLowerCase().includes(params.action!.toLowerCase())
        );
      }

      // Filter by adminId (admin_name) nếu có - lấy admin name từ account
      if (params.adminId) {
        const [adminRows]: any = await conn.query(
          `SELECT full_name FROM account WHERE account_id = ?`,
          [params.adminId]
        );
        if (adminRows.length > 0) {
          const adminName = adminRows[0].full_name;
          filteredLogs = filteredLogs.filter((log) => 
            log.user === adminName || log.admin_name === adminName
          );
        }
      }

      // Sort by time DESC
      filteredLogs.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      });

      // Limit và paginate logs
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      // Get total count (tổng số logs sau khi filter)
      const total = filteredLogs.length;

      return {
        logs: paginatedLogs,
        total,
      };
    } finally {
      conn.release();
    }
  }

  // Hàm cancel booking và unlock phòng (cho admin - có thể hủy booking ở bất kỳ status nào trừ CANCELLED và COMPLETED)
  async cancelBookingAndUnlockRoomsForAdmin(
    bookingId: string
  ): Promise<{ success: boolean; unlockedRooms: number; message?: string }> {
    const conn = await pool.getConnection();
    let unlockedRooms = 0;
    
    try {
      await conn.beginTransaction();
      
      // 1. Kiểm tra booking status - không cho phép hủy nếu đã CANCELLED hoặc COMPLETED
      const [bookingCheck]: any = await conn.query(
        `SELECT status FROM booking WHERE booking_id = ?`,
        [bookingId]
      );
      
      if (!bookingCheck || bookingCheck.length === 0) {
        await conn.rollback();
        return { success: false, unlockedRooms: 0, message: "Không tìm thấy booking" };
      }
      
      const currentStatus = bookingCheck[0].status;
      if (currentStatus === 'CANCELLED') {
        await conn.rollback();
        return { success: false, unlockedRooms: 0, message: "Booking đã bị hủy" };
      }
      
      if (currentStatus === 'COMPLETED') {
        await conn.rollback();
        return { success: false, unlockedRooms: 0, message: "Không thể hủy booking đã hoàn tất" };
      }
      
      // 2. Cancel booking (có thể hủy bất kỳ status nào trừ CANCELLED và COMPLETED)
      const cancelSql = `
        UPDATE booking
        SET status = 'CANCELLED', updated_at = NOW()
        WHERE booking_id = ? AND status NOT IN ('CANCELLED', 'COMPLETED')
      `;
      const [cancelResult] = await conn.query(cancelSql, [bookingId]);
      
      if ((cancelResult as ResultSetHeader).affectedRows === 0) {
        await conn.rollback();
        return { success: false, unlockedRooms: 0, message: "Không thể hủy booking" };
      }
      
      // 3. Lấy booking details để unlock phòng
      const [details]: any = await conn.query(`
        SELECT room_id, checkin_date, checkout_date
        FROM booking_detail
        WHERE booking_id = ?
      `, [bookingId]);
      
      // 4. Unlock từng phòng trong cùng transaction
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
      
      // 5. Commit transaction
      await conn.commit();
      return { success: true, unlockedRooms, message: `Đã hủy booking và unlock ${unlockedRooms} phòng` };
      
    } catch (error: any) {
      await conn.rollback();
      console.error(`[AdminBookingRepository] Error canceling booking ${bookingId} and unlocking rooms:`, error.message);
      throw error;
    } finally {
      conn.release();
    }
  }
}

