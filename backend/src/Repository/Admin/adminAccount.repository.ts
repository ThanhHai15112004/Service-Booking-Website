import pool from "../../config/db";

export class AdminAccountRepository {
  // Dashboard Stats
  async getDashboardStats() {
    const [totalAccounts]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE status != 'DELETED'"
    );
    const [staffAdmin]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE role IN ('ADMIN', 'STAFF') AND status != 'DELETED'"
    );
    const [verified]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE is_verified = 1 AND status != 'DELETED'"
    );
    const [banned]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE status = 'BANNED'"
    );

    const [monthlyRegistrations]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM account 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND status != 'DELETED'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC`
    );

    const [roleDistribution]: any = await pool.query(
      `SELECT role, COUNT(*) as count 
       FROM account 
       WHERE status != 'DELETED'
       GROUP BY role`
    );

    const [recentRegistrations]: any = await pool.query(
      `SELECT account_id, full_name, email, created_at, avatar_url
       FROM account
       WHERE status != 'DELETED'
       ORDER BY created_at DESC
       LIMIT 5`
    );

    const [recentLogins]: any = await pool.query(
      `SELECT DISTINCT a.account_id, a.full_name, a.email, a.avatar_url, 
              MAX(rt.created_at) as last_login
       FROM account a
       JOIN refresh_tokens rt ON rt.account_id = a.account_id
       WHERE a.status != 'DELETED'
       GROUP BY a.account_id, a.full_name, a.email, a.avatar_url
       ORDER BY last_login DESC
       LIMIT 5`
    );

    return {
      stats: {
        totalAccounts: totalAccounts[0]?.count || 0,
        totalStaffAdmin: staffAdmin[0]?.count || 0,
        verifiedEmails: verified[0]?.count || 0,
        bannedAccounts: banned[0]?.count || 0,
      },
      monthlyRegistrations: monthlyRegistrations || [],
      roleDistribution: roleDistribution || [],
      recentRegistrations: recentRegistrations || [],
      recentLogins: recentLogins || [],
    };
  }

  // Account Bookings
  async getAccountBookings(accountId: string, filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    hotelName?: string;
    page?: number;
    limit?: number;
  }) {
    let whereConditions = ["b.account_id = ?"];
    let queryParams: any[] = [accountId];

    if (filters.status) {
      whereConditions.push("b.status = ?");
      queryParams.push(filters.status);
    }
    if (filters.dateFrom) {
      whereConditions.push("DATE(b.created_at) >= ?");
      queryParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      whereConditions.push("DATE(b.created_at) <= ?");
      queryParams.push(filters.dateTo);
    }
    if (filters.hotelName) {
      whereConditions.push("h.name LIKE ?");
      queryParams.push(`%${filters.hotelName}%`);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const whereClause = whereConditions.join(" AND ");

    const [bookings]: any = await pool.query(
      `SELECT 
        b.booking_id,
        b.status,
        b.subtotal,
        b.tax_amount,
        b.discount_amount,
        b.total_amount,
        b.special_requests,
        b.created_at,
        b.updated_at,
        h.hotel_id,
        h.name as hotel_name,
        p.payment_id,
        p.method as payment_method,
        p.status as payment_status
      FROM booking b
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN payment p ON p.booking_id = b.booking_id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [total]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM booking b
       JOIN hotel h ON h.hotel_id = b.hotel_id
       WHERE ${whereClause}`,
      queryParams
    );

    return {
      bookings: bookings || [],
      total: total[0]?.count || 0,
    };
  }

  async getBookingDetailForAdmin(bookingId: string) {
    const [booking]: any = await pool.query(
      `SELECT 
        b.booking_id,
        b.account_id,
        b.hotel_id,
        b.status,
        b.subtotal,
        b.tax_amount,
        b.discount_amount,
        b.total_amount,
        b.special_requests,
        b.created_at,
        b.updated_at,
        h.name as hotel_name,
        p.payment_id,
        p.method as payment_method,
        p.status as payment_status,
        p.amount_due,
        p.amount_paid,
        p.created_at as payment_created_at,
        p.updated_at as payment_updated_at
      FROM booking b
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN payment p ON p.booking_id = b.booking_id
      WHERE b.booking_id = ?`,
      [bookingId]
    );

    if (!booking || booking.length === 0) {
      return null;
    }

    const [bookingDetails]: any = await pool.query(
      `SELECT 
        bd.booking_detail_id,
        bd.booking_id,
        bd.room_id,
        bd.checkin_date,
        bd.checkout_date,
        bd.guests_count,
        bd.price_per_night,
        bd.nights_count,
        bd.total_price,
        r.room_number,
        rt.name as room_name,
        rt.room_type_id,
        rt.name as room_type
      FROM booking_detail bd
      JOIN room r ON r.room_id = bd.room_id
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE bd.booking_id = ?`,
      [bookingId]
    );

    const [discountCode]: any = await pool.query(
      `SELECT dc.code, dc.percentage_off, dc.max_discount
       FROM booking_discount bd
       JOIN discount_code dc ON dc.discount_id = bd.discount_id
       WHERE bd.booking_id = ?`,
      [bookingId]
    );

    return {
      ...booking[0],
      booking_details: bookingDetails || [],
      discount_code: discountCode[0]?.code || null,
    };
  }

  // Account Reviews
  async getAccountReviews(accountId: string, filters: {
    hotelName?: string;
    rating?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let whereConditions = ["r.account_id = ?"];
    let queryParams: any[] = [accountId];

    if (filters.hotelName) {
      whereConditions.push("h.name LIKE ?");
      queryParams.push(`%${filters.hotelName}%`);
    }
    if (filters.rating) {
      whereConditions.push("r.rating = ?");
      queryParams.push(Number(filters.rating));
    }
    if (filters.status) {
      whereConditions.push("r.status = ?");
      queryParams.push(filters.status);
    } else {
      whereConditions.push("r.status != 'DELETED'");
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const whereClause = whereConditions.join(" AND ");

    const [reviews]: any = await pool.query(
      `SELECT 
        r.review_id,
        r.hotel_id,
        r.booking_id,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        r.location_rating,
        r.facilities_rating,
        r.service_rating,
        r.cleanliness_rating,
        r.value_rating,
        h.name as hotel_name
      FROM review r
      JOIN hotel h ON h.hotel_id = r.hotel_id
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [total]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM review r
       JOIN hotel h ON h.hotel_id = r.hotel_id
       WHERE ${whereClause}`,
      queryParams
    );

    return {
      reviews: reviews || [],
      total: total[0]?.count || 0,
    };
  }

  async updateReviewStatus(reviewId: string, status: "ACTIVE" | "HIDDEN" | "DELETED") {
    await pool.query(
      "UPDATE review SET status = ? WHERE review_id = ?",
      [status, reviewId]
    );
    return true;
  }

  // Account Packages & Payments
  async getAccountPackages(accountId: string) {
    const [currentPackage]: any = await pool.query(
      `SELECT ap.*
       FROM account_package ap
       JOIN account a ON a.package_id = ap.package_id
       WHERE a.account_id = ?`,
      [accountId]
    );

    const [currentSubscription]: any = await pool.query(
      `SELECT 
        s.subscription_id,
        s.package_id,
        s.status,
        s.start_date,
        s.end_date,
        s.payment_method,
        s.auto_renew,
        s.created_at,
        ap.name as package_name,
        ap.display_name
      FROM account_subscription s
      JOIN account_package ap ON ap.package_id = s.package_id
      WHERE s.account_id = ? AND s.status = 'ACTIVE'
      ORDER BY s.created_at DESC
      LIMIT 1`,
      [accountId]
    );

    return {
      currentPackage: currentPackage[0] || null,
      currentSubscription: currentSubscription[0] || null,
    };
  }

  async getAccountSubscriptions(accountId: string) {
    const [subscriptions]: any = await pool.query(
      `SELECT 
        s.subscription_id,
        s.package_id,
        s.status,
        s.start_date,
        s.end_date,
        s.payment_method,
        s.auto_renew,
        s.created_at,
        ap.name as package_name,
        ap.display_name
      FROM account_subscription s
      JOIN account_package ap ON ap.package_id = s.package_id
      WHERE s.account_id = ?
      ORDER BY s.created_at DESC`,
      [accountId]
    );

    return subscriptions || [];
  }

  async getAccountPayments(accountId: string, filters: {
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    let whereConditions = ["b.account_id = ?"];
    let queryParams: any[] = [accountId];

    if (filters.status) {
      whereConditions.push("p.status = ?");
      queryParams.push(filters.status);
    }
    if (filters.method) {
      whereConditions.push("p.method = ?");
      queryParams.push(filters.method);
    }
    if (filters.dateFrom) {
      whereConditions.push("DATE(p.created_at) >= ?");
      queryParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      whereConditions.push("DATE(p.created_at) <= ?");
      queryParams.push(filters.dateTo);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const whereClause = whereConditions.join(" AND ");

    const [payments]: any = await pool.query(
      `SELECT 
        p.payment_id,
        p.booking_id,
        p.method,
        p.status,
        p.amount_due,
        p.amount_paid,
        p.created_at,
        p.updated_at,
        h.name as booking_hotel_name
      FROM payment p
      JOIN booking b ON b.booking_id = p.booking_id
      LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [total]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM payment p
       JOIN booking b ON b.booking_id = p.booking_id
       WHERE ${whereClause}`,
      queryParams
    );

    return {
      payments: payments || [],
      total: total[0]?.count || 0,
    };
  }

  // Account Activity
  async getAccountActivityStats(accountId: string) {
    const [bookingStats]: any = await pool.query(
      `SELECT 
        COUNT(*) as totalBookings,
        COALESCE(SUM(total_amount), 0) as totalSpent,
        COALESCE(AVG(total_amount), 0) as averageBookingValue
      FROM booking
      WHERE account_id = ? AND status IN ('CONFIRMED', 'PAID')`,
      [accountId]
    );

    const [reviewStats]: any = await pool.query(
      `SELECT COUNT(*) as totalReviews
       FROM review
       WHERE account_id = ? AND status = 'ACTIVE'`,
      [accountId]
    );

    const [lastLogin]: any = await pool.query(
      `SELECT MAX(created_at) as lastLogin
       FROM refresh_tokens
       WHERE account_id = ?`,
      [accountId]
    );

    const [totalAccounts]: any = await pool.query(
      "SELECT COUNT(*) as total FROM account WHERE status != 'DELETED'"
    );
    const [accountsWithBookings]: any = await pool.query(
      `SELECT COUNT(DISTINCT account_id) as count
       FROM booking
       WHERE status IN ('CONFIRMED', 'PAID')`
    );

    const bookingRateValue = totalAccounts[0]?.total > 0
      ? Math.round((accountsWithBookings[0]?.count / totalAccounts[0]?.total) * 100)
      : 0;

    return {
      totalBookings: bookingStats[0]?.totalBookings || 0,
      totalSpent: Number(bookingStats[0]?.totalSpent) || 0,
      totalReviews: reviewStats[0]?.totalReviews || 0,
      averageBookingValue: Number(bookingStats[0]?.averageBookingValue) || 0,
      lastLogin: lastLogin[0]?.lastLogin || null,
      loginIP: "",
      loginDevice: "",
      bookingRate: bookingRateValue,
    };
  }

  async getAccountActivityChart(accountId: string, period: "7" | "30" | "90") {
    const days = period === "7" ? 7 : period === "30" ? 30 : 90;
    
    const [chartData]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(date_range.date, '%d/%m') as date,
        COALESCE(booking_counts.count, 0) as bookings,
        COALESCE(review_counts.count, 0) as reviews,
        COALESCE(login_counts.count, 0) as logins,
        COALESCE(payment_counts.count, 0) as payments
      FROM (
        SELECT DATE_SUB(CURDATE(), INTERVAL seq.seq DAY) as date
        FROM (
          SELECT @row := @row + 1 as seq
          FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
               (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
               (SELECT @row := -1) t3
          LIMIT ${days}
        ) seq
      ) date_range
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM booking
        WHERE account_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY DATE(created_at)
      ) booking_counts ON booking_counts.date = date_range.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM review
        WHERE account_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY DATE(created_at)
      ) review_counts ON review_counts.date = date_range.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM refresh_tokens
        WHERE account_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY DATE(created_at)
      ) login_counts ON login_counts.date = date_range.date
      LEFT JOIN (
        SELECT DATE(p.created_at) as date, COUNT(*) as count
        FROM payment p
        JOIN booking b ON b.booking_id = p.booking_id
        WHERE b.account_id = ? AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY DATE(p.created_at)
      ) payment_counts ON payment_counts.date = date_range.date
      ORDER BY date_range.date ASC`,
      [accountId, accountId, accountId, accountId]
    );

    return chartData || [];
  }

  async getAccountActivityHistory(accountId: string, filters: {
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const activities: any[] = [];
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Get booking activities
    if (!filters.type || filters.type === "booking") {
      let whereConditions = ["b.account_id = ?"];
      let queryParams: any[] = [accountId];

      if (filters.dateFrom) {
        whereConditions.push("DATE(b.created_at) >= ?");
        queryParams.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereConditions.push("DATE(b.created_at) <= ?");
        queryParams.push(filters.dateTo);
      }

      const [bookings]: any = await pool.query(
        `SELECT 
          b.booking_id as id,
          'booking' as type,
          'Đặt phòng' as action,
          CONCAT('Đặt phòng thành công tại ', h.name) as description,
          b.created_at as date,
          JSON_OBJECT(
            'booking_id', b.booking_id,
            'hotel_name', h.name,
            'amount', b.total_amount
          ) as metadata
        FROM booking b
        JOIN hotel h ON h.hotel_id = b.hotel_id
        WHERE ${whereConditions.join(" AND ")}
        ORDER BY b.created_at DESC`,
        queryParams
      );

      bookings.forEach((b: any) => {
        activities.push({
          ...b,
          metadata: JSON.parse(b.metadata),
        });
      });
    }

    // Get review activities
    if (!filters.type || filters.type === "review") {
      let whereConditions = ["r.account_id = ?"];
      let queryParams: any[] = [accountId];

      if (filters.dateFrom) {
        whereConditions.push("DATE(r.created_at) >= ?");
        queryParams.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereConditions.push("DATE(r.created_at) <= ?");
        queryParams.push(filters.dateTo);
      }

      const [reviews]: any = await pool.query(
        `SELECT 
          r.review_id as id,
          'review' as type,
          'Viết review' as action,
          CONCAT('Đánh giá khách sạn ', h.name) as description,
          r.created_at as date,
          JSON_OBJECT(
            'review_id', r.review_id,
            'hotel_name', h.name
          ) as metadata
        FROM review r
        JOIN hotel h ON h.hotel_id = r.hotel_id
        WHERE ${whereConditions.join(" AND ")}
        ORDER BY r.created_at DESC`,
        queryParams
      );

      reviews.forEach((r: any) => {
        activities.push({
          ...r,
          metadata: JSON.parse(r.metadata),
        });
      });
    }

    // Get payment activities
    if (!filters.type || filters.type === "payment") {
      let whereConditions = ["b.account_id = ?"];
      let queryParams: any[] = [accountId];

      if (filters.dateFrom) {
        whereConditions.push("DATE(p.created_at) >= ?");
        queryParams.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereConditions.push("DATE(p.created_at) <= ?");
        queryParams.push(filters.dateTo);
      }

      const [payments]: any = await pool.query(
        `SELECT 
          p.payment_id as id,
          'payment' as type,
          'Thanh toán' as action,
          CONCAT('Thanh toán thành công cho booking ', p.booking_id) as description,
          p.created_at as date,
          JSON_OBJECT(
            'payment_id', p.payment_id,
            'booking_id', p.booking_id,
            'amount', p.amount_paid
          ) as metadata
        FROM payment p
        JOIN booking b ON b.booking_id = p.booking_id
        WHERE ${whereConditions.join(" AND ")} AND p.status = 'SUCCESS'
        ORDER BY p.created_at DESC`,
        queryParams
      );

      payments.forEach((p: any) => {
        activities.push({
          ...p,
          metadata: JSON.parse(p.metadata),
        });
      });
    }

    // Get login activities
    if (!filters.type || filters.type === "login") {
      let whereConditions = ["rt.account_id = ?"];
      let queryParams: any[] = [accountId];

      if (filters.dateFrom) {
        whereConditions.push("DATE(rt.created_at) >= ?");
        queryParams.push(filters.dateFrom);
      }
      if (filters.dateTo) {
        whereConditions.push("DATE(rt.created_at) <= ?");
        queryParams.push(filters.dateTo);
      }

      const [logins]: any = await pool.query(
        `SELECT 
          CONCAT('LOGIN_', rt.id) as id,
          'login' as type,
          'Đăng nhập' as action,
          'Đăng nhập thành công' as description,
          rt.created_at as date,
          JSON_OBJECT(
            'ip', '',
            'device', ''
          ) as metadata
        FROM refresh_tokens rt
        WHERE ${whereConditions.join(" AND ")}
        ORDER BY rt.created_at DESC`,
        queryParams
      );

      logins.forEach((l: any) => {
        activities.push({
          ...l,
          metadata: JSON.parse(l.metadata),
        });
      });
    }

    // Sort by date descending and paginate
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const paginatedActivities = activities.slice(offset, offset + limit);

    return {
      activities: paginatedActivities,
      total: activities.length,
    };
  }
}

