import pool from "../../config/db";

export class MainDashboardRepository {
  // Get comprehensive dashboard statistics
  async getMainDashboardStats() {
    // 1. Bookings statistics
    const [bookingsToday]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM booking 
       WHERE DATE(created_at) = CURDATE()`
    );

    const [bookingsWeek]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM booking 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const [bookingsMonth]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM booking 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    const [bookingsTotal]: any = await pool.query(
      `SELECT COUNT(*) as count FROM booking`
    );

    // 2. Revenue statistics (from payments with SUCCESS status)
    const [revenueToday]: any = await pool.query(
      `SELECT COALESCE(SUM(p.amount_paid), 0) as total
       FROM payment p
       WHERE p.status = 'SUCCESS' 
         AND DATE(p.created_at) = CURDATE()`
    );

    const [revenueWeek]: any = await pool.query(
      `SELECT COALESCE(SUM(p.amount_paid), 0) as total
       FROM payment p
       WHERE p.status = 'SUCCESS' 
         AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const [revenueMonth]: any = await pool.query(
      `SELECT COALESCE(SUM(p.amount_paid), 0) as total
       FROM payment p
       WHERE p.status = 'SUCCESS' 
         AND p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    const [revenueTotal]: any = await pool.query(
      `SELECT COALESCE(SUM(p.amount_paid), 0) as total
       FROM payment p
       WHERE p.status = 'SUCCESS'`
    );

    // 3. New users (last 30 days)
    const [newUsers]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM account 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND status != 'DELETED'`
    );

    // 4. Total hotels
    const [totalHotels]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM hotel 
       WHERE status = 'ACTIVE'`
    );

    // 5. Active rooms
    const [activeRooms]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM room 
       WHERE status = 'ACTIVE'`
    );

    // 6. Occupancy rate (rooms currently occupied / total active rooms)
    const [occupancyData]: any = await pool.query(
      `SELECT 
        COUNT(DISTINCT bd.room_id) as occupied_rooms,
        (SELECT COUNT(*) FROM room WHERE status = 'ACTIVE') as total_rooms
       FROM booking b
       JOIN booking_detail bd ON bd.booking_id = b.booking_id
       WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
         AND CURDATE() BETWEEN bd.checkin_date AND DATE_SUB(bd.checkout_date, INTERVAL 1 DAY)`
    );

    const totalRooms = occupancyData[0]?.total_rooms || 0;
    const occupiedRooms = occupancyData[0]?.occupied_rooms || 0;
    const occupancyRate = totalRooms > 0
      ? parseFloat(((occupiedRooms / totalRooms) * 100).toFixed(1))
      : 0;

    // 7. Cancellation rate
    const [cancellationData]: any = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
        COUNT(*) as total
       FROM booking`
    );

    const cancellationRate = cancellationData[0]?.total > 0
      ? ((cancellationData[0].cancelled / cancellationData[0].total) * 100).toFixed(1)
      : 0;

    // 8. Revenue by date (last 7 days)
    const [revenueByDate]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(p.created_at, '%d/%m') as date,
        COALESCE(SUM(p.amount_paid), 0) as revenue
       FROM payment p
       WHERE p.status = 'SUCCESS' 
         AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(p.created_at)
       ORDER BY p.created_at ASC`
    );

    // 9. Bookings by status
    const [bookingsByStatusRaw]: any = await pool.query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM booking
       GROUP BY status`
    );

    const totalBookings = bookingsByStatusRaw.reduce((sum: number, item: any) => sum + item.count, 0);
    const bookingsByStatus = bookingsByStatusRaw.map((item: any) => ({
      status: item.status,
      count: item.count,
      percentage: totalBookings > 0 ? ((item.count / totalBookings) * 100).toFixed(1) : 0
    }));

    // 10. Top booked hotels
    const [topBookedHotels]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        COUNT(DISTINCT b.booking_id) as bookings
       FROM hotel h
       LEFT JOIN booking b ON b.hotel_id = h.hotel_id
       WHERE h.status = 'ACTIVE'
       GROUP BY h.hotel_id, h.name
       ORDER BY bookings DESC
       LIMIT 5`
    );

    // 11. New users trend (last 7 days)
    const [newUsersTrend]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%d/%m') as date,
        COUNT(*) as count
       FROM account
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         AND status != 'DELETED'
       GROUP BY DATE(created_at)
       ORDER BY created_at ASC`
    );

    // 12. Recent bookings (last 10)
    const [recentBookings]: any = await pool.query(
      `SELECT 
        b.booking_id,
        a.full_name as customer_name,
        h.name as hotel_name,
        b.status,
        b.created_at
       FROM booking b
       JOIN account a ON a.account_id = b.account_id
       JOIN hotel h ON h.hotel_id = b.hotel_id
       ORDER BY b.created_at DESC
       LIMIT 10`
    );

    // 13. Upcoming check-ins (next 7 days)
    const [upcomingCheckIns]: any = await pool.query(
      `SELECT 
        b.booking_id,
        a.full_name as customer_name,
        h.name as hotel_name,
        MIN(bd.checkin_date) as check_in_date
       FROM booking b
       JOIN account a ON a.account_id = b.account_id
       JOIN hotel h ON h.hotel_id = b.hotel_id
       JOIN booking_detail bd ON bd.booking_id = b.booking_id
       WHERE b.status IN ('CONFIRMED', 'PENDING_CONFIRMATION')
         AND bd.checkin_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
       GROUP BY b.booking_id, a.full_name, h.name
       ORDER BY bd.checkin_date ASC
       LIMIT 10`
    );

    // 14. Maintenance rooms
    const [maintenanceRooms]: any = await pool.query(
      `SELECT 
        r.room_id,
        r.room_number,
        h.name as hotel_name,
        rt.name as room_type,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d') as maintenance_start
       FROM room r
       JOIN room_type rt ON rt.room_type_id = r.room_type_id
       JOIN hotel h ON h.hotel_id = rt.hotel_id
       WHERE r.status = 'MAINTENANCE'
       ORDER BY r.updated_at DESC
       LIMIT 10`
    );

    // 15. Pending requests
    const [pendingReviews]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM review 
       WHERE is_visible = 0 OR is_visible IS NULL`
    );

    const [pendingRefunds]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM payment 
       WHERE status = 'REFUNDED' 
         AND updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    const [pendingEmailVerifications]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM account 
       WHERE is_verified = 0 
         AND status != 'DELETED'`
    );

    return {
      bookings: {
        today: bookingsToday[0]?.count || 0,
        week: bookingsWeek[0]?.count || 0,
        month: bookingsMonth[0]?.count || 0,
        total: bookingsTotal[0]?.count || 0,
      },
      revenue: {
        today: Number(revenueToday[0]?.total || 0),
        week: Number(revenueWeek[0]?.total || 0),
        month: Number(revenueMonth[0]?.total || 0),
        total: Number(revenueTotal[0]?.total || 0),
      },
      newUsers: newUsers[0]?.count || 0,
      totalHotels: totalHotels[0]?.count || 0,
      activeRooms: activeRooms[0]?.count || 0,
      occupancyRate: Number(occupancyRate),
      cancellationRate: Number(cancellationRate),
      revenueByDate: revenueByDate || [],
      bookingsByStatus: bookingsByStatus || [],
      topBookedHotels: topBookedHotels || [],
      newUsersTrend: newUsersTrend || [],
      recentBookings: recentBookings || [],
      upcomingCheckIns: upcomingCheckIns || [],
      maintenanceRooms: maintenanceRooms || [],
      pendingRequests: {
        newReviews: pendingReviews[0]?.count || 0,
        refunds: pendingRefunds[0]?.count || 0,
        emailVerifications: pendingEmailVerifications[0]?.count || 0,
      },
    };
  }
}

