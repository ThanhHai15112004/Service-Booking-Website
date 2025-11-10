import pool from "../../config/db";

export interface ReviewDashboardStats {
  totalReviews: number;
  monthlyNewReviews: number;
  averageRating: number;
  fiveStarRate: number;
  pendingReviews: number;
  reviewsByMonth: Array<{ month: string; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  averageRatingTrend: Array<{ date: string; rating: number }>;
  topRatedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    review_count: number;
  }>;
  topComplainedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    low_rating_count: number;
    average_rating: number;
  }>;
  recentReviews: Array<{
    review_id: string;
    customer_name: string;
    hotel_name: string;
    rating: number;
    title: string;
    created_at: string;
  }>;
}

export interface ReviewListFilters {
  search?: string;
  hotel_id?: string;
  rating?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  pendingOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface ReviewDetail {
  review_id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  provider: string;
  customer_total_reviews: number;
  hotel_id: string;
  hotel_name: string;
  hotel_address: string;
  hotel_average_rating: number;
  overall_rating: number;
  location_rating: number | null;
  service_rating: number | null;
  facilities_rating: number | null;
  cleanliness_rating: number | null;
  value_rating: number | null;
  title: string | null;
  comment: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  booking_id: string | null;
  reply?: {
    reply_id: string;
    reply_text: string;
    replied_by: string;
    replied_by_name: string;
    replied_at: string;
  };
}

export class AdminReviewRepository {
  // ========== Dashboard Stats ==========
  async getDashboardStats(): Promise<ReviewDashboardStats> {
    // Total reviews
    const [totalResult]: any = await pool.query(
      `SELECT COUNT(*) as count FROM review WHERE status != 'DELETED'`
    );
    const totalReviews = totalResult[0]?.count || 0;

    // Monthly new reviews (current month)
    const [monthlyResult]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM review 
       WHERE status != 'DELETED' 
         AND MONTH(created_at) = MONTH(CURRENT_DATE())
         AND YEAR(created_at) = YEAR(CURRENT_DATE())`
    );
    const monthlyNewReviews = monthlyResult[0]?.count || 0;

    // Average rating
    const [avgResult]: any = await pool.query(
      `SELECT AVG(rating) as avg_rating 
       FROM review 
       WHERE status != 'DELETED'`
    );
    const averageRating = parseFloat(avgResult[0]?.avg_rating || 0);

    // Five star rate
    const [fiveStarResult]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM review 
       WHERE status != 'DELETED' AND rating = 5`
    );
    const fiveStarCount = fiveStarResult[0]?.count || 0;
    const fiveStarRate = totalReviews > 0 ? (fiveStarCount / totalReviews) * 100 : 0;

    // Pending reviews (không có trong schema, luôn trả về 0 vì user yêu cầu bỏ chức năng duyệt)
    const pendingReviews = 0;

    // Reviews by month (last 12 months)
    const [reviewsByMonth]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%m/%Y') as month_key,
        MONTHNAME(created_at) as month_name,
        MONTH(created_at) as month_num,
        COUNT(*) as count
       FROM review 
       WHERE status != 'DELETED' 
         AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
       GROUP BY month_key, month_name, month_num
       ORDER BY YEAR(created_at), MONTH(created_at)`
    );

    const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const reviewsByMonthFormatted = monthNames.map((month, index) => {
      const found = reviewsByMonth.find((r: any) => r.month_num === index + 1);
      return {
        month: month,
        count: found ? found.count : 0
      };
    });

    // Rating distribution
    const [ratingDist]: any = await pool.query(
      `SELECT 
        rating,
        COUNT(*) as count
       FROM review 
       WHERE status != 'DELETED'
       GROUP BY rating
       ORDER BY rating DESC`
    );
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = ratingDist.find((r: any) => r.rating === rating);
      const count = found ? found.count : 0;
      return {
        rating,
        count,
        percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
      };
    });

    // Average rating trend (last 30 days)
    const [trendResult]: any = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        AVG(rating) as avg_rating
       FROM review 
       WHERE status != 'DELETED' 
         AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC
       LIMIT 30`
    );
    const averageRatingTrend = trendResult.map((r: any) => ({
      date: new Date(r.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      rating: parseFloat(r.avg_rating || 0)
    }));

    // Top rated hotels
    const [topRated]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        AVG(r.rating) as average_rating,
        COUNT(r.review_id) as review_count
       FROM hotel h
       INNER JOIN review r ON r.hotel_id = h.hotel_id
       WHERE r.status != 'DELETED'
       GROUP BY h.hotel_id, h.name
       HAVING review_count >= 10
       ORDER BY average_rating DESC, review_count DESC
       LIMIT 5`
    );
    const topRatedHotels = topRated.map((r: any) => ({
      hotel_id: r.hotel_id,
      hotel_name: r.hotel_name,
      average_rating: parseFloat(r.average_rating || 0),
      review_count: r.review_count
    }));

    // Top complained hotels (low rating count)
    const [topComplained]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        AVG(r.rating) as average_rating,
        COUNT(CASE WHEN r.rating <= 2 THEN 1 END) as low_rating_count
       FROM hotel h
       INNER JOIN review r ON r.hotel_id = h.hotel_id
       WHERE r.status != 'DELETED'
       GROUP BY h.hotel_id, h.name
       HAVING low_rating_count > 0
       ORDER BY low_rating_count DESC, average_rating ASC
       LIMIT 5`
    );
    const topComplainedHotels = topComplained.map((r: any) => ({
      hotel_id: r.hotel_id,
      hotel_name: r.hotel_name,
      low_rating_count: r.low_rating_count,
      average_rating: parseFloat(r.average_rating || 0)
    }));

    // Recent reviews
    const [recentReviews]: any = await pool.query(
      `SELECT 
        r.review_id,
        a.full_name as customer_name,
        h.name as hotel_name,
        r.rating,
        r.title,
        r.created_at
       FROM review r
       INNER JOIN account a ON a.account_id = r.account_id
       INNER JOIN hotel h ON h.hotel_id = r.hotel_id
       WHERE r.status != 'DELETED'
       ORDER BY r.created_at DESC
       LIMIT 5`
    );

    return {
      totalReviews,
      monthlyNewReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      fiveStarRate: Math.round(fiveStarRate * 10) / 10,
      pendingReviews,
      reviewsByMonth: reviewsByMonthFormatted,
      ratingDistribution,
      averageRatingTrend,
      topRatedHotels,
      topComplainedHotels,
      recentReviews: recentReviews.map((r: any) => ({
        review_id: r.review_id,
        customer_name: r.customer_name,
        hotel_name: r.hotel_name,
        rating: r.rating,
        title: r.title || '',
        created_at: r.created_at
      }))
    };
  }

  // ========== List Reviews ==========
  async getReviews(filters: ReviewListFilters): Promise<{ reviews: any[]; total: number }> {
    let whereConditions: string[] = ["r.status != 'DELETED'"];
    let queryParams: any[] = [];

    // Search
    if (filters.search) {
      whereConditions.push(`(
        r.review_id LIKE ? OR
        a.full_name LIKE ? OR
        a.email LIKE ? OR
        h.name LIKE ? OR
        r.title LIKE ?
      )`);
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Hotel filter
    if (filters.hotel_id) {
      whereConditions.push("r.hotel_id = ?");
      queryParams.push(filters.hotel_id);
    }

    // Rating filter
    if (filters.rating) {
      whereConditions.push("r.rating = ?");
      queryParams.push(Number(filters.rating));
    }

    // Status filter (không có PENDING trong schema)
    if (filters.status && filters.status !== 'PENDING') {
      whereConditions.push("r.status = ?");
      queryParams.push(filters.status);
    }

    // Pending only - bỏ qua vì không có PENDING status
    // if (filters.pendingOnly) {
    //   whereConditions.push("r.status = 'PENDING'");
    // }

    // Date range
    if (filters.dateFrom) {
      whereConditions.push("DATE(r.created_at) >= ?");
      queryParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      whereConditions.push("DATE(r.created_at) <= ?");
      queryParams.push(filters.dateTo);
    }

    const whereClause = whereConditions.join(" AND ");
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Get reviews
    const [reviews]: any = await pool.query(
      `SELECT 
        r.review_id,
        r.account_id,
        a.full_name as customer_name,
        a.email as customer_email,
        r.hotel_id,
        h.name as hotel_name,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        CASE WHEN rr.reply_id IS NOT NULL THEN 1 ELSE 0 END as has_reply
       FROM review r
       INNER JOIN account a ON a.account_id = r.account_id
       INNER JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN review_reply rr ON rr.review_id = r.review_id
       WHERE ${whereClause}
       GROUP BY r.review_id, r.account_id, a.full_name, a.email, r.hotel_id, h.name, 
                r.rating, r.title, r.comment, r.status, r.created_at
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Get total count
    const [totalResult]: any = await pool.query(
      `SELECT COUNT(DISTINCT r.review_id) as count
       FROM review r
       INNER JOIN account a ON a.account_id = r.account_id
       INNER JOIN hotel h ON h.hotel_id = r.hotel_id
       WHERE ${whereClause}`,
      queryParams
    );

    return {
      reviews: reviews || [],
      total: totalResult[0]?.count || 0
    };
  }

  // ========== Get Review Detail ==========
  async getReviewDetail(reviewId: string): Promise<ReviewDetail | null> {
    const [reviews]: any = await pool.query(
      `SELECT 
        r.review_id,
        r.account_id,
        a.full_name as customer_name,
        a.email as customer_email,
        a.provider,
        r.hotel_id,
        h.name as hotel_name,
        h.address as hotel_address,
        h.avg_rating as hotel_average_rating,
        r.rating as overall_rating,
        r.location_rating,
        r.service_rating,
        r.facilities_rating,
        r.cleanliness_rating,
        r.value_rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        r.booking_id,
        (SELECT COUNT(*) FROM review r2 WHERE r2.account_id = r.account_id AND r2.status != 'DELETED') as customer_total_reviews
       FROM review r
       INNER JOIN account a ON a.account_id = r.account_id
       INNER JOIN hotel h ON h.hotel_id = r.hotel_id
       WHERE r.review_id = ?`,
      [reviewId]
    );

    if (!reviews || reviews.length === 0) {
      return null;
    }

    const review = reviews[0];

    // Get reply if exists
    const [replies]: any = await pool.query(
      `SELECT 
        rr.reply_id,
        rr.reply_text,
        rr.replied_by,
        a2.full_name as replied_by_name,
        rr.created_at as replied_at
       FROM review_reply rr
       INNER JOIN account a2 ON a2.account_id = rr.replied_by
       WHERE rr.review_id = ?
       ORDER BY rr.created_at DESC
       LIMIT 1`,
      [reviewId]
    );

    return {
      review_id: review.review_id,
      account_id: review.account_id,
      customer_name: review.customer_name,
      customer_email: review.customer_email,
      provider: review.provider || 'LOCAL',
      customer_total_reviews: review.customer_total_reviews || 0,
      hotel_id: review.hotel_id,
      hotel_name: review.hotel_name,
      hotel_address: review.hotel_address || '',
      hotel_average_rating: parseFloat(review.hotel_average_rating || 0),
      overall_rating: review.overall_rating,
      location_rating: review.location_rating,
      service_rating: review.service_rating,
      facilities_rating: review.facilities_rating,
      cleanliness_rating: review.cleanliness_rating,
      value_rating: review.value_rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      created_at: review.created_at,
      updated_at: review.updated_at,
      booking_id: review.booking_id,
      reply: replies && replies.length > 0 ? {
        reply_id: replies[0].reply_id,
        reply_text: replies[0].reply_text,
        replied_by: replies[0].replied_by,
        replied_by_name: replies[0].replied_by_name,
        replied_at: replies[0].replied_at
      } : undefined
    };
  }

  // ========== Update Review Status ==========
  async updateReviewStatus(reviewId: string, status: "ACTIVE" | "HIDDEN" | "DELETED"): Promise<void> {
    await pool.query(
      `UPDATE review 
       SET status = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE review_id = ?`,
      [status, reviewId]
    );
  }

  // ========== Delete Review ==========
  async deleteReview(reviewId: string): Promise<void> {
    // Soft delete: set status to DELETED
    await this.updateReviewStatus(reviewId, "DELETED");
  }

  // ========== Create/Update Reply ==========
  async createReply(reviewId: string, repliedBy: string, replyText: string): Promise<string> {
    // Generate reply_id
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const replyId = `RPL${timestamp.slice(-9)}${random}`;

    // Check if reply exists
    const [existing]: any = await pool.query(
      `SELECT reply_id FROM review_reply WHERE review_id = ? ORDER BY created_at DESC LIMIT 1`,
      [reviewId]
    );

    if (existing && existing.length > 0) {
      // Update existing reply
      await pool.query(
        `UPDATE review_reply 
         SET reply_text = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE reply_id = ?`,
        [replyText, existing[0].reply_id]
      );
      return existing[0].reply_id;
    } else {
      // Create new reply
      await pool.query(
        `INSERT INTO review_reply (reply_id, review_id, replied_by, reply_text) 
         VALUES (?, ?, ?, ?)`,
        [replyId, reviewId, repliedBy, replyText]
      );
      return replyId;
    }
  }

  // ========== Get Activity Log ==========
  async getReviewActivityLog(reviewId: string): Promise<any[]> {
    const logs: any[] = [];

    // Get review creation
    const [reviewData]: any = await pool.query(
      `SELECT 
        r.review_id,
        r.status,
        r.created_at,
        r.updated_at,
        a.full_name as customer_name
       FROM review r
       INNER JOIN account a ON a.account_id = r.account_id
       WHERE r.review_id = ?`,
      [reviewId]
    );

    if (!reviewData || reviewData.length === 0) {
      return [];
    }

    const review = reviewData[0];

    // 1. CREATE event
    logs.push({
      id: 1,
      date: review.created_at,
      action: 'Tạo review',
      admin_name: review.customer_name,
      admin_id: 'USER',
      note: 'Khách hàng tạo review'
    });

    // 2. Status changes (from updated_at if status changed)
    // Chỉ log khi status là HIDDEN hoặc DELETED (vì ACTIVE là mặc định, không cần log)
    if (review.updated_at && review.updated_at !== review.created_at) {
      let actionText = '';
      if (review.status === 'HIDDEN') {
        actionText = 'Ẩn review';
      } else if (review.status === 'DELETED') {
        actionText = 'Xóa review';
      }

      if (actionText) {
        logs.push({
          id: 2,
          date: review.updated_at,
          action: actionText,
          admin_name: 'Admin',
          admin_id: 'ADMIN',
          note: `Trạng thái: ${review.status}`
        });
      }
    }

    // 3. Reply events
    const [replies]: any = await pool.query(
      `SELECT 
        rr.reply_id,
        rr.reply_text,
        rr.replied_by,
        a.full_name as replied_by_name,
        rr.created_at,
        rr.updated_at
       FROM review_reply rr
       INNER JOIN account a ON a.account_id = rr.replied_by
       WHERE rr.review_id = ?
       ORDER BY rr.created_at ASC`,
      [reviewId]
    );

    replies.forEach((reply: any, index: number) => {
      if (reply.created_at === reply.updated_at) {
        // New reply
        logs.push({
          id: 3 + index,
          date: reply.created_at,
          action: 'Trả lời review',
          admin_name: reply.replied_by_name,
          admin_id: reply.replied_by,
          note: 'Admin/Staff trả lời review'
        });
      } else {
        // Updated reply
        logs.push({
          id: 3 + index,
          date: reply.updated_at,
          action: 'Cập nhật phản hồi',
          admin_name: reply.replied_by_name,
          admin_id: reply.replied_by,
          note: 'Admin/Staff cập nhật phản hồi'
        });
      }
    });

    // 4. Report events (from review_report table)
    const [reports]: any = await pool.query(
      `SELECT 
        rr.report_id,
        rr.report_reason,
        rr.violation_type,
        rr.status,
        rr.resolved_by,
        rr.resolved_at,
        rr.created_at,
        a.full_name as reported_by_name,
        a2.full_name as resolved_by_name
       FROM review_report rr
       LEFT JOIN account a ON a.account_id = rr.reported_by
       LEFT JOIN account a2 ON a2.account_id = rr.resolved_by
       WHERE rr.review_id = ?
       ORDER BY rr.created_at ASC`,
      [reviewId]
    );

    reports.forEach((report: any, index: number) => {
      // Report created
      logs.push({
        id: 10 + index * 2,
        date: report.created_at,
        action: 'Báo cáo vi phạm',
        admin_name: report.reported_by_name || 'Hệ thống',
        admin_id: report.reported_by || 'SYSTEM',
        note: `${report.report_reason} - ${report.violation_type || ''}`,
        violation_type: report.violation_type
      });

      // Report resolved
      if (report.resolved_at && report.status !== 'PENDING') {
        logs.push({
          id: 10 + index * 2 + 1,
          date: report.resolved_at,
          action: `Xử lý báo cáo: ${report.status}`,
          admin_name: report.resolved_by_name || 'Admin',
          admin_id: report.resolved_by || 'ADMIN',
          note: `Trạng thái: ${report.status}`,
          violation_type: report.violation_type
        });
      }
    });

    // Sort by date
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return logs;
  }

  // ========== Get Reports ==========
  async getReviewReports(filters: {
    period?: string;
    city?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    // Build date filter
    let dateFilter = '';
    const dateParams: any[] = [];

    if (filters.period) {
      switch (filters.period) {
        case '7days':
          dateFilter = 'AND r.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)';
          break;
        case 'month':
          dateFilter = 'AND MONTH(r.created_at) = MONTH(CURRENT_DATE()) AND YEAR(r.created_at) = YEAR(CURRENT_DATE())';
          break;
        case 'quarter':
          dateFilter = 'AND QUARTER(r.created_at) = QUARTER(CURRENT_DATE()) AND YEAR(r.created_at) = YEAR(CURRENT_DATE())';
          break;
        case 'year':
          dateFilter = 'AND YEAR(r.created_at) = YEAR(CURRENT_DATE())';
          break;
      }
    }

    if (filters.startDate && filters.endDate) {
      dateFilter = 'AND DATE(r.created_at) BETWEEN ? AND ?';
      dateParams.push(filters.startDate, filters.endDate);
    }

    // Build location filter
    let locationFilter = '';
    if (filters.city) {
      locationFilter = 'AND l.city = ?';
      dateParams.push(filters.city);
    }

    // Build category filter
    let categoryFilter = '';
    if (filters.category) {
      categoryFilter = 'AND h.category_id = ?';
      dateParams.push(filters.category);
    }

    // Average rating by hotel
    const [avgByHotel]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        AVG(r.rating) as average_rating,
        COUNT(r.review_id) as review_count
       FROM hotel h
       INNER JOIN review r ON r.hotel_id = h.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}
       GROUP BY h.hotel_id, h.name
       ORDER BY average_rating DESC
       LIMIT 20`,
      dateParams
    );

    // Rating distribution
    const [ratingDist]: any = await pool.query(
      `SELECT 
        rating,
        COUNT(*) as count
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}
       GROUP BY rating
       ORDER BY rating DESC`,
      dateParams
    );

    const totalReviews = ratingDist.reduce((sum: number, r: any) => sum + r.count, 0);
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = ratingDist.find((r: any) => r.rating === rating);
      const count = found ? found.count : 0;
      return {
        rating,
        count,
        percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
      };
    });

    // Reviews by month
    const [reviewsByMonth]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(r.created_at, '%m/%Y') as month_key,
        MONTHNAME(r.created_at) as month_name,
        MONTH(r.created_at) as month_num,
        COUNT(*) as count
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}
         AND r.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
       GROUP BY month_key, month_name, month_num
       ORDER BY YEAR(r.created_at), MONTH(r.created_at)`,
      dateParams
    );

    const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const reviewsByMonthFormatted = monthNames.map((month, index) => {
      const found = reviewsByMonth.find((r: any) => r.month_num === index + 1);
      return {
        month: month,
        count: found ? found.count : 0
      };
    });

    // Positive/negative rate
    const [positiveCount]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.rating >= 4 ${dateFilter} ${locationFilter} ${categoryFilter}`,
      dateParams
    );
    const [negativeCount]: any = await pool.query(
      `SELECT COUNT(*) as count 
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.rating <= 2 ${dateFilter} ${locationFilter} ${categoryFilter}`,
      dateParams
    );

    const positiveCountVal = positiveCount[0]?.count || 0;
    const negativeCountVal = negativeCount[0]?.count || 0;
    const positiveRate = totalReviews > 0 ? (positiveCountVal / totalReviews) * 100 : 0;
    const negativeRate = totalReviews > 0 ? (negativeCountVal / totalReviews) * 100 : 0;

    // Top rated hotels
    const [topRated]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        AVG(r.rating) as average_rating,
        COUNT(r.review_id) as review_count
       FROM hotel h
       INNER JOIN review r ON r.hotel_id = h.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}
       GROUP BY h.hotel_id, h.name
       HAVING review_count >= 5
       ORDER BY average_rating DESC, review_count DESC
       LIMIT 10`,
      dateParams
    );

    // Top complained hotels
    const [topComplained]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name as hotel_name,
        AVG(r.rating) as average_rating,
        COUNT(CASE WHEN r.rating <= 2 THEN 1 END) as low_rating_count
       FROM hotel h
       INNER JOIN review r ON r.hotel_id = h.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}
       GROUP BY h.hotel_id, h.name
       HAVING low_rating_count > 0
       ORDER BY low_rating_count DESC, average_rating ASC
       LIMIT 10`,
      dateParams
    );

    // Rating by criteria
    const [ratingByCriteria]: any = await pool.query(
      `SELECT 
        'Vị trí' as criteria,
        AVG(r.location_rating) as average_rating
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.location_rating IS NOT NULL ${dateFilter} ${locationFilter} ${categoryFilter}
       UNION ALL
       SELECT 
        'Dịch vụ' as criteria,
        AVG(r.service_rating) as average_rating
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.service_rating IS NOT NULL ${dateFilter} ${locationFilter} ${categoryFilter}
       UNION ALL
       SELECT 
        'Cơ sở vật chất' as criteria,
        AVG(r.facilities_rating) as average_rating
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.facilities_rating IS NOT NULL ${dateFilter} ${locationFilter} ${categoryFilter}
       UNION ALL
       SELECT 
        'Vệ sinh' as criteria,
        AVG(r.cleanliness_rating) as average_rating
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.cleanliness_rating IS NOT NULL ${dateFilter} ${locationFilter} ${categoryFilter}
       UNION ALL
       SELECT 
        'Giá trị' as criteria,
        AVG(r.value_rating) as average_rating
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' AND r.value_rating IS NOT NULL ${dateFilter} ${locationFilter} ${categoryFilter}`
    , dateParams);

    // Get total reviews and average rating
    const [totalReviewsData]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating
       FROM review r
       LEFT JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}`,
      dateParams
    );

    // Average rating by city
    const [avgByCity]: any = await pool.query(
      `SELECT 
        l.city,
        AVG(r.rating) as average_rating,
        COUNT(r.review_id) as review_count
       FROM review r
       INNER JOIN hotel h ON h.hotel_id = r.hotel_id
       LEFT JOIN hotel_location l ON l.location_id = h.location_id
       WHERE r.status != 'DELETED' ${dateFilter} ${locationFilter} ${categoryFilter}
       GROUP BY l.city
       ORDER BY average_rating DESC`,
      dateParams
    );

    return {
      totalReviews: totalReviewsData[0]?.total_reviews || 0,
      averageRating: parseFloat((totalReviewsData[0]?.average_rating || 0).toFixed(1)),
      averageRatingByHotel: avgByHotel.map((r: any) => ({
        hotel_id: r.hotel_id,
        hotel_name: r.hotel_name,
        average_rating: parseFloat((r.average_rating || 0).toFixed(1)),
        review_count: r.review_count
      })),
      averageRatingByCity: (avgByCity || []).map((r: any) => ({
        city: r.city,
        average_rating: parseFloat((r.average_rating || 0).toFixed(1)),
        review_count: r.review_count
      })),
      ratingDistribution,
      reviewsByMonth: reviewsByMonthFormatted,
      positiveRate: parseFloat(positiveRate.toFixed(1)),
      negativeRate: parseFloat(negativeRate.toFixed(1)),
      topRatedHotels: topRated.map((r: any) => ({
        hotel_id: r.hotel_id,
        hotel_name: r.hotel_name,
        average_rating: parseFloat((r.average_rating || 0).toFixed(1)),
        review_count: r.review_count
      })),
      topComplainedHotels: topComplained.map((r: any) => ({
        hotel_id: r.hotel_id,
        hotel_name: r.hotel_name,
        average_rating: parseFloat((r.average_rating || 0).toFixed(1)),
        low_rating_count: r.low_rating_count
      })),
      ratingByCriteria: ratingByCriteria.map((r: any) => ({
        criteria: r.criteria,
        average_rating: parseFloat((r.average_rating || 0).toFixed(1))
      }))
    };
  }

  // ========== Get All Activity Logs (for activity log page) ==========
  async getAllActivityLogs(filters: {
    search?: string;
    admin?: string;
    action?: string;
    violationType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: any[]; total: number }> {
    // This will combine logs from review status changes, replies, and reports
    // For simplicity, we'll get from review_report table and review_reply table
    const logs: any[] = [];

    // Get reports
    let reportWhere = '1=1';
    const reportParams: any[] = [];

    if (filters.search) {
      reportWhere += ' AND (rr.review_id LIKE ? OR a.full_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      reportParams.push(searchTerm, searchTerm);
    }

    if (filters.admin) {
      reportWhere += ' AND (rr.reported_by = ? OR rr.resolved_by = ?)';
      reportParams.push(filters.admin, filters.admin);
    }

    if (filters.violationType) {
      reportWhere += ' AND rr.violation_type = ?';
      reportParams.push(filters.violationType);
    }

    if (filters.dateFrom) {
      reportWhere += ' AND DATE(rr.created_at) >= ?';
      reportParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      reportWhere += ' AND DATE(rr.created_at) <= ?';
      reportParams.push(filters.dateTo);
    }

    const [reports]: any = await pool.query(
      `SELECT 
        rr.report_id,
        rr.review_id,
        rr.report_reason,
        rr.violation_type,
        rr.status,
        rr.reported_by,
        rr.resolved_by,
        rr.created_at,
        rr.resolved_at,
        a.full_name as reported_by_name,
        a2.full_name as resolved_by_name
       FROM review_report rr
       LEFT JOIN account a ON a.account_id = rr.reported_by
       LEFT JOIN account a2 ON a2.account_id = rr.resolved_by
       WHERE ${reportWhere}
       ORDER BY rr.created_at DESC`,
      reportParams
    );

    reports.forEach((report: any) => {
      logs.push({
        id: report.report_id,
        date: report.created_at,
        admin_name: report.reported_by_name || 'Hệ thống',
        admin_id: report.reported_by || 'SYSTEM',
        review_id: report.review_id,
        action: 'Đánh dấu vi phạm',
        note: report.report_reason,
        violation_type: report.violation_type
      });

      if (report.resolved_at) {
        logs.push({
          id: `${report.report_id}_resolved`,
          date: report.resolved_at,
          admin_name: report.resolved_by_name || 'Admin',
          admin_id: report.resolved_by || 'ADMIN',
          review_id: report.review_id,
          action: `Xử lý báo cáo: ${report.status}`,
          note: report.report_reason,
          violation_type: report.violation_type
        });
      }
    });

    // Get replies (as admin actions)
    let replyWhere = '1=1';
    const replyParams: any[] = [];

    if (filters.search) {
      replyWhere += ' AND (rr.review_id LIKE ? OR a.full_name LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      replyParams.push(searchTerm, searchTerm);
    }

    if (filters.admin) {
      replyWhere += ' AND rr.replied_by = ?';
      replyParams.push(filters.admin);
    }

    if (filters.dateFrom) {
      replyWhere += ' AND DATE(rr.created_at) >= ?';
      replyParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      replyWhere += ' AND DATE(rr.created_at) <= ?';
      replyParams.push(filters.dateTo);
    }

    const [replies]: any = await pool.query(
      `SELECT 
        rr.reply_id,
        rr.review_id,
        rr.replied_by,
        rr.reply_text,
        rr.created_at,
        rr.updated_at,
        a.full_name as replied_by_name
       FROM review_reply rr
       INNER JOIN account a ON a.account_id = rr.replied_by
       WHERE ${replyWhere}
       ORDER BY rr.created_at DESC`,
      replyParams
    );

    replies.forEach((reply: any) => {
      if (reply.created_at === reply.updated_at) {
        logs.push({
          id: reply.reply_id,
          date: reply.created_at,
          admin_name: reply.replied_by_name,
          admin_id: reply.replied_by,
          review_id: reply.review_id,
          action: 'Trả lời review',
          note: 'Admin/Staff trả lời review'
        });
      } else {
        logs.push({
          id: `${reply.reply_id}_updated`,
          date: reply.updated_at,
          admin_name: reply.replied_by_name,
          admin_id: reply.replied_by,
          review_id: reply.review_id,
          action: 'Cập nhật phản hồi',
          note: 'Admin/Staff cập nhật phản hồi'
        });
      }
    });

    // Filter by action if specified
    let filteredLogs = logs;
    if (filters.action) {
      filteredLogs = logs.filter(log => log.action === filters.action);
    }

    // Sort by date descending
    filteredLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total: filteredLogs.length
    };
  }
}

