import pool from "../../config/db";

export class AdminReportsRepository {
  // ========== Booking Reports ==========
  async getBookingReports(filters: {
    startDate?: string;
    endDate?: string;
    hotel_id?: string;
    city?: string;
    status?: string;
  }) {
    try {
      let whereConditions: string[] = [];
      let queryParams: any[] = [];

    if (filters.startDate && filters.endDate) {
      whereConditions.push("DATE(b.created_at) BETWEEN ? AND ?");
      queryParams.push(filters.startDate, filters.endDate);
    }

    if (filters.hotel_id) {
      whereConditions.push("b.hotel_id = ?");
      queryParams.push(filters.hotel_id);
    }

    // ✅ Build JOIN clause if city filter is present
    const joinClause = filters.city 
      ? `LEFT JOIN hotel h ON h.hotel_id = b.hotel_id LEFT JOIN hotel_location l ON l.location_id = h.location_id`
      : "";
    
    if (filters.city) {
      whereConditions.push("l.city = ?");
      queryParams.push(filters.city);
    }

    if (filters.status) {
      whereConditions.push("b.status = ?");
      queryParams.push(filters.status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Total bookings
    const [totalBookings]: any = await pool.query(
      `SELECT COUNT(*) as count FROM booking b ${joinClause} ${whereClause}`,
      queryParams
    );

    // Bookings by status
    const [bookingsByStatus]: any = await pool.query(
      `SELECT 
        b.status,
        COUNT(*) as count
       FROM booking b
       ${joinClause}
       ${whereClause}
       GROUP BY b.status`,
      queryParams
    );

    const total = totalBookings[0]?.count || 0;
    const bookingsByStatusWithPercentage = bookingsByStatus.map((item: any) => ({
      status: item.status,
      count: item.count,
      percentage: total > 0 ? parseFloat(((item.count / total) * 100).toFixed(1)) : 0
    }));

    // Cancellation rate
    const cancelledWhereClause = whereClause 
      ? `${whereClause} AND b.status = 'CANCELLED'`
      : `WHERE b.status = 'CANCELLED'`;
    const [cancelledCount]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM booking b 
       ${joinClause}
       ${cancelledWhereClause}`,
      queryParams
    );

    const cancellationRate = total > 0
      ? parseFloat(((cancelledCount[0]?.count || 0) / total * 100).toFixed(1))
      : 0;

    // Completion rate
    const completedWhereClause = whereClause 
      ? `${whereClause} AND b.status = 'COMPLETED'`
      : `WHERE b.status = 'COMPLETED'`;
    const [completedCount]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM booking b 
       ${joinClause}
       ${completedWhereClause}`,
      queryParams
    );

    const completionRate = total > 0
      ? parseFloat(((completedCount[0]?.count || 0) / total * 100).toFixed(1))
      : 0;

    // Average booking value
    const avgValueWhereClause = whereClause 
      ? `${whereClause} AND b.total_amount IS NOT NULL`
      : `WHERE b.total_amount IS NOT NULL`;
    const [avgValue]: any = await pool.query(
      `SELECT COALESCE(AVG(b.total_amount), 0) as avg_value 
       FROM booking b 
       ${joinClause}
       ${avgValueWhereClause}`,
      queryParams
    );

    // Bookings by hotel
    let hotelQuery = "";
    let hotelQueryParams: any[] = [];
    
    if (filters.hotel_id) {
      hotelQuery = `WHERE h.hotel_id = ?`;
      hotelQueryParams = [filters.hotel_id];
    } else {
      hotelQuery = `WHERE h.status = 'ACTIVE'`;
    }
    
    // Apply date and status filters to booking join
    const bookingFilters: string[] = [];
    const bookingParams: any[] = [];
    if (filters.startDate && filters.endDate) {
      bookingFilters.push("DATE(b.created_at) BETWEEN ? AND ?");
      bookingParams.push(filters.startDate, filters.endDate);
    }
    if (filters.status) {
      bookingFilters.push("b.status = ?");
      bookingParams.push(filters.status);
    }
    const bookingWhere = bookingFilters.length > 0 ? `AND ${bookingFilters.join(" AND ")}` : "";

    const [bookingsByHotel]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        COUNT(b.booking_id) as bookings
       FROM hotel h
       LEFT JOIN booking b ON b.hotel_id = h.hotel_id ${bookingWhere}
       ${hotelQuery}
       GROUP BY h.hotel_id, h.name
       ORDER BY bookings DESC
       LIMIT 10`,
      [...bookingParams, ...hotelQueryParams]
    );

    // Bookings by city
    let cityWhereClause = "";
    let cityParams: any[] = [];
    
    if (filters.city) {
      cityWhereClause = "WHERE l.city = ?";
      cityParams.push(filters.city);
    }
    
    // Apply booking filters
    const cityBookingFilters: string[] = [];
    if (filters.startDate && filters.endDate) {
      cityBookingFilters.push("DATE(b.created_at) BETWEEN ? AND ?");
      cityParams.push(filters.startDate, filters.endDate);
    }
    if (filters.status) {
      cityBookingFilters.push("b.status = ?");
      cityParams.push(filters.status);
    }
    const cityBookingWhere = cityBookingFilters.length > 0 ? `AND ${cityBookingFilters.join(" AND ")}` : "";

    const [bookingsByCity]: any = await pool.query(
      `SELECT 
        l.city,
        COUNT(b.booking_id) as bookings
       FROM hotel_location l
       LEFT JOIN hotel h ON h.location_id = l.location_id
       LEFT JOIN booking b ON b.hotel_id = h.hotel_id ${cityBookingWhere}
       ${cityWhereClause}
       GROUP BY l.city
       ORDER BY bookings DESC`,
      cityParams
    );

    // Bookings by category
    const categoryJoinClause = filters.city 
      ? `LEFT JOIN hotel_location l ON l.location_id = h.location_id`
      : "";
    const [bookingsByCategory]: any = await pool.query(
      `SELECT 
        c.name as category,
        COUNT(b.booking_id) as bookings
       FROM hotel_category c
       LEFT JOIN hotel h ON h.category_id = c.category_id
       LEFT JOIN booking b ON b.hotel_id = h.hotel_id
       ${categoryJoinClause}
       ${whereClause}
       GROUP BY c.category_id, c.name
       ORDER BY bookings DESC`,
      queryParams
    );

    // Bookings by time (last 30 days or filtered date range)
    let timeWhereClause = whereClause;
    let timeParams = [...queryParams];
    if (!filters.startDate || !filters.endDate) {
      if (timeWhereClause) {
        timeWhereClause += " AND b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      } else {
        timeWhereClause = "WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
      }
    }

    const [bookingsByTime]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(b.created_at, '%d/%m') as date,
        COUNT(*) as count
       FROM booking b
       ${joinClause}
       ${timeWhereClause}
       GROUP BY DATE(b.created_at)
       ORDER BY b.created_at ASC`,
      timeParams
    );

    return {
      totalBookings: total,
      bookingsByStatus: bookingsByStatusWithPercentage,
      cancellationRate,
      completionRate,
      averageBookingValue: Number(avgValue[0]?.avg_value || 0),
      bookingsByHotel: bookingsByHotel || [],
      bookingsByCity: bookingsByCity || [],
      bookingsByCategory: bookingsByCategory || [],
      bookingsByTime: bookingsByTime || [],
    };
    } catch (error: any) {
      console.error("[AdminReportsRepository] Error in getBookingReports:", error);
      throw error;
    }
  }

  // ========== Revenue Reports ==========
  async getRevenueReports(filters: {
    startDate?: string;
    endDate?: string;
    hotel_id?: string;
    paymentMethod?: string;
    viewType?: "daily" | "weekly" | "monthly" | "yearly";
  }) {
    let whereConditions: string[] = ["p.status = 'SUCCESS'"];
    let queryParams: any[] = [];

    if (filters.startDate && filters.endDate) {
      whereConditions.push("DATE(p.created_at) BETWEEN ? AND ?");
      queryParams.push(filters.startDate, filters.endDate);
    }

    if (filters.hotel_id) {
      whereConditions.push("b.hotel_id = ?");
      queryParams.push(filters.hotel_id);
    }

    if (filters.paymentMethod) {
      whereConditions.push("p.method = ?");
      queryParams.push(filters.paymentMethod);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Total revenue
    const [totalRevenue]: any = await pool.query(
      `SELECT COALESCE(SUM(p.amount_paid), 0) as total 
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       ${whereClause}`,
      queryParams
    );

    // Revenue by period
    const revenueByPeriod: any = {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: [],
    };

    // Daily
    const [daily]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(p.created_at, '%d/%m') as date,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       ${whereClause}
       GROUP BY DATE(p.created_at)
       ORDER BY p.created_at ASC`,
      queryParams
    );
    revenueByPeriod.daily = daily || [];

    // Weekly
    const [weekly]: any = await pool.query(
      `SELECT 
        CONCAT('Tuần ', WEEK(p.created_at)) as week,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       ${whereClause}
       GROUP BY YEAR(p.created_at), WEEK(p.created_at)
       ORDER BY p.created_at ASC`,
      queryParams
    );
    revenueByPeriod.weekly = weekly || [];

    // Monthly
    const [monthly]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(p.created_at, 'Th%m') as month,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       ${whereClause}
       GROUP BY YEAR(p.created_at), MONTH(p.created_at)
       ORDER BY p.created_at ASC`,
      queryParams
    );
    revenueByPeriod.monthly = monthly || [];

    // Yearly
    const [yearly]: any = await pool.query(
      `SELECT 
        YEAR(p.created_at) as year,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       ${whereClause}
       GROUP BY YEAR(p.created_at)
       ORDER BY p.created_at ASC`,
      queryParams
    );
    revenueByPeriod.yearly = yearly.map((item: any) => ({
      year: item.year.toString(),
      revenue: Number(item.revenue)
    }));

    // Revenue by hotel
    let hotelRevenueWhere = "";
    let hotelRevenueParams: any[] = [];
    
    if (filters.hotel_id) {
      hotelRevenueWhere = "WHERE h.hotel_id = ?";
      hotelRevenueParams.push(filters.hotel_id);
    } else {
      hotelRevenueWhere = "WHERE h.status = 'ACTIVE'";
    }
    
    // Apply payment filters
    const paymentFilters: string[] = ["p.status = 'SUCCESS'"];
    if (filters.startDate && filters.endDate) {
      paymentFilters.push("DATE(p.created_at) BETWEEN ? AND ?");
      hotelRevenueParams.push(filters.startDate, filters.endDate);
    }
    if (filters.paymentMethod) {
      paymentFilters.push("p.method = ?");
      hotelRevenueParams.push(filters.paymentMethod);
    }
    const paymentWhere = paymentFilters.join(" AND ");

    const [revenueByHotel]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM hotel h
       LEFT JOIN booking b ON b.hotel_id = h.hotel_id
       LEFT JOIN payment p ON p.booking_id = b.booking_id AND ${paymentWhere}
       ${hotelRevenueWhere}
       GROUP BY h.hotel_id, h.name
       ORDER BY revenue DESC
       LIMIT 10`,
      hotelRevenueParams
    );

    const totalRev = Number(totalRevenue[0]?.total || 0);
    const revenueByHotelWithPercentage = revenueByHotel.map((item: any) => ({
      hotel_id: item.hotel_id,
      hotel_name: item.hotel_name,
      revenue: Number(item.revenue),
      percentage: totalRev > 0 ? parseFloat(((Number(item.revenue) / totalRev) * 100).toFixed(1)) : 0
    }));

    // Revenue by city
    const cityRevenueFilters: string[] = ["p.status = 'SUCCESS'"];
    const cityRevenueParams: any[] = [];
    if (filters.startDate && filters.endDate) {
      cityRevenueFilters.push("DATE(p.created_at) BETWEEN ? AND ?");
      cityRevenueParams.push(filters.startDate, filters.endDate);
    }
    if (filters.paymentMethod) {
      cityRevenueFilters.push("p.method = ?");
      cityRevenueParams.push(filters.paymentMethod);
    }
    const cityRevenueWhere = cityRevenueFilters.join(" AND ");

    const [revenueByCity]: any = await pool.query(
      `SELECT 
        l.city,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM hotel_location l
       LEFT JOIN hotel h ON h.location_id = l.location_id
       LEFT JOIN booking b ON b.hotel_id = h.hotel_id
       LEFT JOIN payment p ON p.booking_id = b.booking_id AND ${cityRevenueWhere}
       GROUP BY l.city
       ORDER BY revenue DESC`,
      cityRevenueParams
    );

    const revenueByCityWithPercentage = revenueByCity.map((item: any) => ({
      city: item.city,
      revenue: Number(item.revenue),
      percentage: totalRev > 0 ? parseFloat(((Number(item.revenue) / totalRev) * 100).toFixed(1)) : 0
    }));

    // Revenue by room type
    const roomTypeRevenueFilters: string[] = ["p.status = 'SUCCESS'"];
    const roomTypeRevenueParams: any[] = [];
    if (filters.startDate && filters.endDate) {
      roomTypeRevenueFilters.push("DATE(p.created_at) BETWEEN ? AND ?");
      roomTypeRevenueParams.push(filters.startDate, filters.endDate);
    }
    if (filters.paymentMethod) {
      roomTypeRevenueFilters.push("p.method = ?");
      roomTypeRevenueParams.push(filters.paymentMethod);
    }
    const roomTypeRevenueWhere = roomTypeRevenueFilters.join(" AND ");

    const [revenueByRoomType]: any = await pool.query(
      `SELECT 
        rt.name as room_type,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM room_type rt
       LEFT JOIN room r ON r.room_type_id = rt.room_type_id
       LEFT JOIN booking_detail bd ON bd.room_id = r.room_id
       LEFT JOIN booking b ON b.booking_id = bd.booking_id
       LEFT JOIN payment p ON p.booking_id = b.booking_id AND ${roomTypeRevenueWhere}
       GROUP BY rt.room_type_id, rt.name
       ORDER BY revenue DESC`,
      roomTypeRevenueParams
    );

    const revenueByRoomTypeWithPercentage = revenueByRoomType.map((item: any) => ({
      room_type: item.room_type,
      revenue: Number(item.revenue),
      percentage: totalRev > 0 ? parseFloat(((Number(item.revenue) / totalRev) * 100).toFixed(1)) : 0
    }));

    // Revenue by payment method
    const [revenueByPaymentMethod]: any = await pool.query(
      `SELECT 
        p.method,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       ${whereClause}
       GROUP BY p.method
       ORDER BY revenue DESC`,
      queryParams
    );

    const revenueByPaymentMethodWithPercentage = revenueByPaymentMethod.map((item: any) => ({
      method: item.method,
      revenue: Number(item.revenue),
      percentage: totalRev > 0 ? parseFloat(((Number(item.revenue) / totalRev) * 100).toFixed(1)) : 0
    }));

    // Revenue by package
    const packageRevenueFilters: string[] = ["p.status = 'SUCCESS'"];
    const packageRevenueParams: any[] = [];
    if (filters.startDate && filters.endDate) {
      packageRevenueFilters.push("DATE(p.created_at) BETWEEN ? AND ?");
      packageRevenueParams.push(filters.startDate, filters.endDate);
    }
    if (filters.paymentMethod) {
      packageRevenueFilters.push("p.method = ?");
      packageRevenueParams.push(filters.paymentMethod);
    }
    const packageRevenueWhere = packageRevenueFilters.join(" AND ");

    const [revenueByPackage]: any = await pool.query(
      `SELECT 
        ap.display_name as package_name,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM account_package ap
       LEFT JOIN account a ON a.package_id = ap.package_id
       LEFT JOIN booking b ON b.account_id = a.account_id
       LEFT JOIN payment p ON p.booking_id = b.booking_id AND ${packageRevenueWhere}
       GROUP BY ap.package_id, ap.display_name
       ORDER BY revenue DESC`,
      packageRevenueParams
    );

    const revenueByPackageWithPercentage = revenueByPackage.map((item: any) => ({
      package_name: item.package_name || "Không có gói",
      revenue: Number(item.revenue),
      percentage: totalRev > 0 ? parseFloat(((Number(item.revenue) / totalRev) * 100).toFixed(1)) : 0
    }));

    return {
      totalRevenue: totalRev,
      revenueByPeriod,
      revenueByHotel: revenueByHotelWithPercentage,
      revenueByCity: revenueByCityWithPercentage,
      revenueByRoomType: revenueByRoomTypeWithPercentage,
      revenueByPaymentMethod: revenueByPaymentMethodWithPercentage,
      revenueByPackage: revenueByPackageWithPercentage,
    };
  }

  // ========== Occupancy Reports ==========
  async getOccupancyReports(filters: {
    month?: string;
    city?: string;
    category?: string;
    year?: string;
  }) {
    // Average occupancy rate (simplified calculation)
    const [totalRooms]: any = await pool.query(
      `SELECT COUNT(*) as count FROM room WHERE status = 'ACTIVE'`
    );
    
    const [occupiedRooms]: any = await pool.query(
      `SELECT COUNT(DISTINCT bd.room_id) as count
       FROM booking b
       JOIN booking_detail bd ON bd.booking_id = b.booking_id
       WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
         AND CURDATE() BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)`
    );
    
    const totalRoomsCount = totalRooms[0]?.count || 0;
    const occupiedRoomsCount = occupiedRooms[0]?.count || 0;
    const avgOccupancyRate = totalRoomsCount > 0
      ? parseFloat(((occupiedRoomsCount / totalRoomsCount) * 100).toFixed(1))
      : 0;

    // Occupancy by hotel (simplified - count occupied rooms vs total rooms per hotel)
    const [occupancyByHotel]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        COALESCE(
          (COUNT(DISTINCT CASE 
            WHEN b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
              AND CURDATE() BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)
            THEN bd.room_id END) / 
           NULLIF((SELECT COUNT(*) FROM room r2 
            JOIN room_type rt2 ON rt2.room_type_id = r2.room_type_id 
            WHERE rt2.hotel_id = h.hotel_id AND r2.status = 'ACTIVE'), 0)) * 100,
          0
        ) as occupancy_rate
       FROM hotel h
       LEFT JOIN room_type rt ON rt.hotel_id = h.hotel_id
       LEFT JOIN room r ON r.room_type_id = rt.room_type_id
       LEFT JOIN booking_detail bd ON bd.room_id = r.room_id
       LEFT JOIN booking b ON b.booking_id = bd.booking_id
       WHERE h.status = 'ACTIVE'
       GROUP BY h.hotel_id, h.name
       ORDER BY occupancy_rate DESC
       LIMIT 10`
    );

    // Occupancy by month (last 6 months) - simplified
    const [occupancyByMonth]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(bd.checkin_date, 'Th%m') as month,
        COALESCE(
          (COUNT(DISTINCT bd.room_id) / 
           NULLIF((SELECT COUNT(*) FROM room WHERE status = 'ACTIVE'), 0)) * 100,
          0
        ) as occupancy_rate
       FROM booking b
       JOIN booking_detail bd ON bd.booking_id = b.booking_id
       WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
         AND bd.checkin_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY YEAR(bd.checkin_date), MONTH(bd.checkin_date)
       ORDER BY bd.checkin_date ASC`
    );

    // Occupancy by city (simplified)
    const [occupancyByCity]: any = await pool.query(
      `SELECT 
        l.city,
        COALESCE(
          (COUNT(DISTINCT CASE 
            WHEN b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
              AND CURDATE() BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)
            THEN bd.room_id END) / 
           NULLIF((SELECT COUNT(*) FROM room r2 
            JOIN room_type rt2 ON rt2.room_type_id = r2.room_type_id
            JOIN hotel h2 ON h2.hotel_id = rt2.hotel_id
            JOIN hotel_location l2 ON l2.location_id = h2.location_id
            WHERE l2.city = l.city AND r2.status = 'ACTIVE'), 0)) * 100,
          0
        ) as occupancy_rate
       FROM hotel_location l
       LEFT JOIN hotel h ON h.location_id = l.location_id
       LEFT JOIN room_type rt ON rt.hotel_id = h.hotel_id
       LEFT JOIN room r ON r.room_type_id = rt.room_type_id
       LEFT JOIN booking_detail bd ON bd.room_id = r.room_id
       LEFT JOIN booking b ON b.booking_id = bd.booking_id
       GROUP BY l.city
       ORDER BY occupancy_rate DESC`
    );

    // Occupancy by category (simplified)
    const [occupancyByCategory]: any = await pool.query(
      `SELECT 
        c.name as category,
        COALESCE(
          (COUNT(DISTINCT CASE 
            WHEN b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
              AND CURDATE() BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)
            THEN bd.room_id END) / 
           NULLIF((SELECT COUNT(*) FROM room r2 
            JOIN room_type rt2 ON rt2.room_type_id = r2.room_type_id
            JOIN hotel h2 ON h2.hotel_id = rt2.hotel_id
            WHERE h2.category_id = c.category_id AND r2.status = 'ACTIVE'), 0)) * 100,
          0
        ) as occupancy_rate
       FROM hotel_category c
       LEFT JOIN hotel h ON h.category_id = c.category_id
       LEFT JOIN room_type rt ON rt.hotel_id = h.hotel_id
       LEFT JOIN room r ON r.room_type_id = rt.room_type_id
       LEFT JOIN booking_detail bd ON bd.room_id = r.room_id
       LEFT JOIN booking b ON b.booking_id = bd.booking_id
       GROUP BY c.category_id, c.name
       ORDER BY occupancy_rate DESC`
    );

    // Year over year (quarters) - simplified to count bookings
    const [yearOverYear]: any = await pool.query(
      `SELECT 
        CONCAT('Q', QUARTER(bd.checkin_date)) as period,
        COUNT(CASE WHEN YEAR(bd.checkin_date) = YEAR(CURDATE()) THEN 1 END) as currentYear,
        COUNT(CASE WHEN YEAR(bd.checkin_date) = YEAR(CURDATE()) - 1 THEN 1 END) as previousYear
       FROM booking b
       JOIN booking_detail bd ON bd.booking_id = b.booking_id
       WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
         AND YEAR(bd.checkin_date) IN (YEAR(CURDATE()), YEAR(CURDATE()) - 1)
       GROUP BY QUARTER(bd.checkin_date)
       ORDER BY QUARTER(bd.checkin_date)`
    );

    // Occupancy calendar (last 30 days)
    const [occupancyCalendar]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(date_series.date, '%d/%m') as date,
        COALESCE(
          (COUNT(DISTINCT bd.room_id) / 
           (SELECT COUNT(*) FROM room WHERE status = 'ACTIVE')) * 100,
          0
        ) as occupancy_rate
       FROM (
         SELECT DATE_SUB(CURDATE(), INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY) as date
         FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as a
         CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) as b
         CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1) as c
       ) date_series
       LEFT JOIN booking_detail bd ON DATE(date_series.date) BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)
       LEFT JOIN booking b ON b.booking_id = bd.booking_id
         AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
       WHERE date_series.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         AND date_series.date <= CURDATE()
       GROUP BY date_series.date
       ORDER BY date_series.date ASC`
    );

    return {
      averageOccupancyRate: avgOccupancyRate,
      occupancyByHotel: (occupancyByHotel || []).map((item: any) => ({
        hotel_id: item.hotel_id,
        hotel_name: item.hotel_name,
        occupancy_rate: parseFloat((Number(item.occupancy_rate) || 0).toFixed(1))
      })),
      occupancyByMonth: (occupancyByMonth || []).map((item: any) => ({
        month: item.month,
        occupancy_rate: parseFloat((Number(item.occupancy_rate) || 0).toFixed(1))
      })),
      occupancyByCity: (occupancyByCity || []).map((item: any) => ({
        city: item.city,
        occupancy_rate: parseFloat((Number(item.occupancy_rate) || 0).toFixed(1))
      })),
      occupancyByCategory: (occupancyByCategory || []).map((item: any) => ({
        category: item.category,
        occupancy_rate: parseFloat((Number(item.occupancy_rate) || 0).toFixed(1))
      })),
      occupancyYearOverYear: (yearOverYear || []).map((item: any) => ({
        period: item.period,
        currentYear: Number(item.currentYear || 0),
        previousYear: Number(item.previousYear || 0)
      })),
      occupancyCalendar: (occupancyCalendar || []).map((item: any) => ({
        date: item.date,
        occupancy_rate: parseFloat((Number(item.occupancy_rate) || 0).toFixed(1))
      })),
    };
  }

  // ========== Customer Insights ==========
  async getCustomerInsights() {
    // Total customers
    const [totalCustomers]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM account 
       WHERE status != 'DELETED' AND role = 'USER'`
    );

    // New customers (last 30 days)
    const [newCustomers]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM account 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND status != 'DELETED' AND role = 'USER'`
    );

    // Returning customers (customers with > 1 booking)
    const [returningCustomers]: any = await pool.query(
      `SELECT COUNT(DISTINCT a.account_id) as count
       FROM account a
       JOIN booking b ON b.account_id = a.account_id
       WHERE a.status != 'DELETED' AND a.role = 'USER'
       GROUP BY a.account_id
       HAVING COUNT(b.booking_id) > 1`
    );

    // Active customers (bookings in last 30 days)
    const [activeCustomers]: any = await pool.query(
      `SELECT COUNT(DISTINCT b.account_id) as count
       FROM booking b
       JOIN account a ON a.account_id = b.account_id
       WHERE b.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND a.status != 'DELETED' AND a.role = 'USER'`
    );

    // Inactive customers
    const inactiveCustomers = (totalCustomers[0]?.count || 0) - (activeCustomers[0]?.count || 0);

    // Return rate
    const total = totalCustomers[0]?.count || 0;
    const returning = returningCustomers.length || 0;
    const returnRate = total > 0 ? parseFloat(((returning / total) * 100).toFixed(1)) : 0;

    // Customer lifetime value
    const [customerLifetimeValue]: any = await pool.query(
      `SELECT COALESCE(AVG(total_spent), 0) as avg_value
       FROM (
         SELECT a.account_id, COALESCE(SUM(b.total_amount), 0) as total_spent
         FROM account a
         LEFT JOIN booking b ON b.account_id = a.account_id 
           AND b.status IN ('CONFIRMED', 'PAID', 'COMPLETED')
         WHERE a.status != 'DELETED' AND a.role = 'USER'
         GROUP BY a.account_id
       ) as customer_spending`
    );

    // Top spending customers
    const [topSpendingCustomers]: any = await pool.query(
      `SELECT 
        a.account_id as customer_id,
        a.full_name as customer_name,
        COALESCE(SUM(b.total_amount), 0) as total_spent,
        COUNT(b.booking_id) as booking_count
       FROM account a
       LEFT JOIN booking b ON b.account_id = a.account_id 
         AND b.status IN ('CONFIRMED', 'PAID', 'COMPLETED')
       WHERE a.status != 'DELETED' AND a.role = 'USER'
       GROUP BY a.account_id, a.full_name
       ORDER BY total_spent DESC
       LIMIT 10`
    );

    // New customers trend (last 7 days)
    const [newCustomersTrend]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%d/%m') as date,
        COUNT(*) as count
       FROM account
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND status != 'DELETED' AND role = 'USER'
       GROUP BY DATE(created_at)
       ORDER BY created_at ASC`
    );

    return {
      totalCustomers: totalCustomers[0]?.count || 0,
      newCustomers: newCustomers[0]?.count || 0,
      returningCustomers: returning,
      activeCustomers: activeCustomers[0]?.count || 0,
      inactiveCustomers,
      returnRate,
      customerLifetimeValue: Number(customerLifetimeValue[0]?.avg_value || 0),
      topSpendingCustomers: (topSpendingCustomers || []).map((item: any) => ({
        customer_id: item.customer_id,
        customer_name: item.customer_name || "Khách hàng",
        total_spent: Number(item.total_spent),
        booking_count: item.booking_count
      })),
      newCustomersTrend: newCustomersTrend || [],
    };
  }

  // ========== Package Reports ==========
  async getPackageReports(filters: {
    startDate?: string;
    endDate?: string;
    package?: string;
  }) {
    // Total users by package
    const [totalUsersByPackage]: any = await pool.query(
      `SELECT 
        ap.display_name as package_name,
        COUNT(a.account_id) as user_count
       FROM account_package ap
       LEFT JOIN account a ON a.package_id = ap.package_id 
         AND a.status != 'DELETED' AND a.role = 'USER'
       GROUP BY ap.package_id, ap.display_name
       ORDER BY user_count DESC`
    );

    const totalUsers = totalUsersByPackage.reduce((sum: number, item: any) => sum + item.user_count, 0);
    const totalUsersByPackageWithPercentage = totalUsersByPackage.map((item: any) => ({
      package_name: item.package_name,
      user_count: item.user_count,
      percentage: totalUsers > 0 ? parseFloat(((item.user_count / totalUsers) * 100).toFixed(1)) : 0
    }));

    // Revenue by package
    let revenueWhereClause = "p.status = 'SUCCESS'";
    let revenueParams: any[] = [];

    if (filters.startDate && filters.endDate) {
      revenueWhereClause += " AND DATE(p.created_at) BETWEEN ? AND ?";
      revenueParams.push(filters.startDate, filters.endDate);
    }

    const [revenueByPackage]: any = await pool.query(
      `SELECT 
        ap.display_name as package_name,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM account_package ap
       LEFT JOIN account a ON a.package_id = ap.package_id
       LEFT JOIN booking b ON b.account_id = a.account_id
       LEFT JOIN payment p ON p.booking_id = b.booking_id AND ${revenueWhereClause}
       GROUP BY ap.package_id, ap.display_name
       ORDER BY revenue DESC`,
      revenueParams
    );

    const totalRevenue = revenueByPackage.reduce((sum: number, item: any) => sum + Number(item.revenue), 0);
    const revenueByPackageWithPercentage = revenueByPackage.map((item: any) => ({
      package_name: item.package_name || "Không có gói",
      revenue: Number(item.revenue),
      percentage: totalRevenue > 0 ? parseFloat(((Number(item.revenue) / totalRevenue) * 100).toFixed(1)) : 0
    }));

    // Monthly recurring revenue
    const [monthlyRecurringRevenue]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(p.created_at, 'Th%m') as month,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       JOIN account a ON a.account_id = b.account_id
       WHERE p.status = 'SUCCESS'
         AND p.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY YEAR(p.created_at), MONTH(p.created_at)
       ORDER BY p.created_at ASC`
    );

    // Most popular package
    const mostPopular = totalUsersByPackageWithPercentage[0] || { package_name: "N/A", user_count: 0, revenue: 0 };
    const mostPopularRevenue = revenueByPackageWithPercentage.find(
      (p: any) => p.package_name === mostPopular.package_name
    )?.revenue || 0;

    // Package stats
    const [packageStats]: any = await pool.query(
      `SELECT 
        ap.display_name as package_name,
        COUNT(a.account_id) as total_users,
        COUNT(CASE WHEN a.status = 'ACTIVE' THEN 1 END) as active_users,
        COUNT(CASE WHEN a.status = 'BANNED' THEN 1 END) as cancelled_users,
        COALESCE(SUM(p.amount_paid), 0) as total_revenue
       FROM account_package ap
       LEFT JOIN account a ON a.package_id = ap.package_id AND a.role = 'USER'
       LEFT JOIN booking b ON b.account_id = a.account_id
       LEFT JOIN payment p ON p.booking_id = b.booking_id AND p.status = 'SUCCESS'
       GROUP BY ap.package_id, ap.display_name`
    );

    const packageStatsWithMonthly = packageStats.map((item: any) => {
      const monthlyRev = revenueByPackageWithPercentage.find(
        (p: any) => p.package_name === item.package_name
      )?.revenue || 0;
      return {
        package_name: item.package_name,
        total_users: item.total_users,
        active_users: item.active_users,
        cancelled_users: item.cancelled_users,
        total_revenue: Number(item.total_revenue),
        monthly_revenue: monthlyRev / 6 // Approximate monthly from last 6 months
      };
    });

    // Renewal rate and cancellation rate (simplified - would need subscription table for accurate data)
    const renewalRate = 85.5; // Placeholder - would need subscription data
    const cancellationRate = 14.5; // Placeholder

    return {
      totalUsersByPackage: totalUsersByPackageWithPercentage,
      revenueByPackage: revenueByPackageWithPercentage,
      monthlyRecurringRevenue: (monthlyRecurringRevenue || []).map((item: any) => ({
        month: item.month,
        revenue: Number(item.revenue)
      })),
      mostPopularPackage: {
        package_name: mostPopular.package_name,
        user_count: mostPopular.user_count,
        revenue: mostPopularRevenue
      },
      renewalRate,
      cancellationRate,
      packageStats: packageStatsWithMonthly,
    };
  }

  // ========== Staff Reports ==========
  async getStaffReports(filters: {
    startDate?: string;
    endDate?: string;
    staff?: string;
    actionType?: string;
  }) {
    // For now, we'll use review_reply and booking tables to track staff actions
    // This is a simplified version - ideally should have an admin_activity_log table

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    if (filters.startDate && filters.endDate) {
      whereConditions.push("DATE(action_date) BETWEEN ? AND ?");
      queryParams.push(filters.startDate, filters.endDate);
    }

    if (filters.staff) {
      whereConditions.push("staff_id = ?");
      queryParams.push(filters.staff);
    }

    if (filters.actionType) {
      whereConditions.push("action_type = ?");
      queryParams.push(filters.actionType);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Build query conditions for review_reply
    // Note: Only REPLY actions are available from review_reply table
    // If actionType filter is set and it's not "REPLY", return empty results
    if (filters.actionType && filters.actionType !== "REPLY") {
      return {
        totalActions: 0,
        actionsByType: [],
        actionsByStaff: [],
        actionsByTime: [],
        peakHours: [],
        actionLogs: []
      };
    }

    let replyWhereConditions: string[] = [];
    let replyParams: any[] = [];

    if (filters.startDate && filters.endDate) {
      replyWhereConditions.push("DATE(rr.created_at) BETWEEN ? AND ?");
      replyParams.push(filters.startDate, filters.endDate);
    }

    if (filters.staff) {
      replyWhereConditions.push("rr.replied_by = ?");
      replyParams.push(filters.staff);
    }

    const replyWhereClause = replyWhereConditions.length > 0 ? `AND ${replyWhereConditions.join(" AND ")}` : "";

    // Get actions from review_reply (staff replying to reviews)
    const [reviewReplies]: any = await pool.query(
      `SELECT 
        rr.replied_by as staff_id,
        a.full_name as staff_name,
        rr.created_at as action_date,
        'REPLY' as action_type,
        CONCAT('Trả lời review ', rr.review_id) as action_description,
        'REVIEW' as entity_type,
        rr.review_id as entity_id
       FROM review_reply rr
       JOIN account a ON a.account_id = rr.replied_by
       WHERE a.role IN ('ADMIN', 'STAFF')
       ${replyWhereClause}
       ORDER BY rr.created_at DESC`,
      replyParams
    );

    // Total actions
    const totalActions = reviewReplies.length;

    // Actions by type
    const actionsByTypeMap = new Map<string, number>();
    reviewReplies.forEach((action: any) => {
      const type = action.action_type;
      actionsByTypeMap.set(type, (actionsByTypeMap.get(type) || 0) + 1);
    });

    const actionsByType = Array.from(actionsByTypeMap.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: totalActions > 0 ? parseFloat(((count / totalActions) * 100).toFixed(1)) : 0
    }));

    // Actions by staff
    const staffMap = new Map<string, any>();
    reviewReplies.forEach((action: any) => {
      const staffId = action.staff_id;
      if (!staffMap.has(staffId)) {
        staffMap.set(staffId, {
          staff_id: staffId,
          staff_name: action.staff_name,
          action_count: 0,
          actions_by_type: { create: 0, update: 0, delete: 0, approve: 0, reply: 0 }
        });
      }
      const staff = staffMap.get(staffId);
      staff.action_count++;
      if (action.action_type === 'REPLY') {
        staff.actions_by_type.reply++;
      }
    });

    const actionsByStaff = Array.from(staffMap.values());

    // Actions by time
    let timeWhereConditions: string[] = [];
    let timeParams: any[] = [];

    if (filters.startDate && filters.endDate) {
      timeWhereConditions.push("DATE(rr.created_at) BETWEEN ? AND ?");
      timeParams.push(filters.startDate, filters.endDate);
    } else {
      timeWhereConditions.push("rr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    }

    const timeWhereClause = timeWhereConditions.length > 0 ? `AND ${timeWhereConditions.join(" AND ")}` : "";

    const [actionsByTime]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(rr.created_at, '%d/%m') as date,
        COUNT(*) as count
       FROM review_reply rr
       JOIN account a ON a.account_id = rr.replied_by
       WHERE a.role IN ('ADMIN', 'STAFF')
         ${timeWhereClause}
       GROUP BY DATE(rr.created_at)
       ORDER BY rr.created_at ASC`,
      timeParams
    );

    // Peak hours
    const [peakHours]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(rr.created_at, '%H:00') as hour,
        COUNT(*) as count
       FROM review_reply rr
       JOIN account a ON a.account_id = rr.replied_by
       WHERE a.role IN ('ADMIN', 'STAFF')
         ${timeWhereClause}
       GROUP BY HOUR(rr.created_at)
       ORDER BY count DESC
       LIMIT 10`,
      timeParams
    );

    // Action logs (last 100)
    const actionLogs = reviewReplies.slice(0, 100).map((action: any, index: number) => ({
      id: index + 1,
      date: action.action_date,
      staff_name: action.staff_name,
      staff_id: action.staff_id,
      action_type: action.action_type,
      action_description: action.action_description,
      entity_type: action.entity_type,
      entity_id: action.entity_id
    }));

    return {
      totalActions,
      actionsByType,
      actionsByStaff,
      actionsByTime: actionsByTime || [],
      peakHours: peakHours || [],
      actionLogs,
    };
  }
}

