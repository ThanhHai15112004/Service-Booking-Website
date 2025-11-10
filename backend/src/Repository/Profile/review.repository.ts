import pool from "../../config/db";

export interface Review {
  review_id: string;
  account_id: string;
  hotel_id: string;
  booking_id: string | null;
  rating: number;
  location_rating: number | null;
  facilities_rating: number | null;
  service_rating: number | null;
  cleanliness_rating: number | null;
  value_rating: number | null;
  title: string | null;
  comment: string | null;
  status: 'ACTIVE' | 'HIDDEN' | 'DELETED';
  created_at: Date;
  updated_at: Date;
}

export class ReviewRepository {
  // Lấy tất cả reviews của user
  async getReviewsByAccountId(accountId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        r.review_id,
        r.account_id,
        r.hotel_id,
        r.booking_id,
        r.rating,
        r.location_rating,
        r.facilities_rating,
        r.service_rating,
        r.cleanliness_rating,
        r.value_rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        h.name as hotel_name,
        h.main_image as hotel_image
       FROM review r
       JOIN hotel h ON h.hotel_id = r.hotel_id
       WHERE r.account_id = ? AND r.status != 'DELETED'
       ORDER BY r.created_at DESC`,
      [accountId]
    );
    
    // Fetch replies for each review
    const reviewsWithReplies = await Promise.all(rows.map(async (review: any) => {
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
        [review.review_id]
      );
      
      if (replies && replies.length > 0) {
        review.reply = {
          reply_id: replies[0].reply_id,
          reply_text: replies[0].reply_text,
          replied_by: replies[0].replied_by,
          replied_by_name: replies[0].replied_by_name,
          replied_at: replies[0].replied_at
        };
      }
      
      return review;
    }));
    
    return reviewsWithReplies;
  }

  // Lấy review theo ID
  async getReviewById(reviewId: string, accountId: string): Promise<Review | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        review_id, account_id, hotel_id, booking_id, rating,
        location_rating, facilities_rating, service_rating, cleanliness_rating, value_rating,
        title, comment, status, created_at, updated_at
       FROM review WHERE review_id = ? AND account_id = ?`,
      [reviewId, accountId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Tạo review mới
  async createReview(data: Omit<Review, 'review_id' | 'status' | 'created_at' | 'updated_at'>): Promise<string> {
    // Tạo review_id (format giống booking_id: RV + timestamp 9 chữ số + random 3 chữ số)
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const reviewId = `RV${timestamp.slice(-9)}${random}`;

    // Calculate overall rating as average of all category ratings if provided
    let overallRating = data.rating;
    if (data.location_rating || data.facilities_rating || data.service_rating || data.cleanliness_rating || data.value_rating) {
      const ratings = [
        data.location_rating,
        data.facilities_rating,
        data.service_rating,
        data.cleanliness_rating,
        data.value_rating
      ].filter(r => r !== null && r !== undefined) as number[];
      
      if (ratings.length > 0) {
        overallRating = Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
      }
    }

    await pool.query(
      `INSERT INTO review (
        review_id, account_id, hotel_id, booking_id, rating,
        location_rating, facilities_rating, service_rating, cleanliness_rating, value_rating,
        title, comment, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [
        reviewId, data.account_id, data.hotel_id, data.booking_id, overallRating,
        data.location_rating || null, data.facilities_rating || null, data.service_rating || null,
        data.cleanliness_rating || null, data.value_rating || null,
        data.title || null, data.comment || null
      ]
    );

    // Cập nhật avg_rating và review_count của hotel
    await this.updateHotelRating(data.hotel_id);

    return reviewId;
  }

  // Cập nhật review
  async updateReview(reviewId: string, accountId: string, data: Partial<Pick<Review, 'rating' | 'location_rating' | 'facilities_rating' | 'service_rating' | 'cleanliness_rating' | 'value_rating' | 'title' | 'comment'>>): Promise<void> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Handle category ratings
    if (data.location_rating !== undefined) {
      updateFields.push('location_rating = ?');
      updateValues.push(data.location_rating);
    }
    if (data.facilities_rating !== undefined) {
      updateFields.push('facilities_rating = ?');
      updateValues.push(data.facilities_rating);
    }
    if (data.service_rating !== undefined) {
      updateFields.push('service_rating = ?');
      updateValues.push(data.service_rating);
    }
    if (data.cleanliness_rating !== undefined) {
      updateFields.push('cleanliness_rating = ?');
      updateValues.push(data.cleanliness_rating);
    }
    if (data.value_rating !== undefined) {
      updateFields.push('value_rating = ?');
      updateValues.push(data.value_rating);
    }

    // Calculate overall rating if category ratings are provided
    if (data.location_rating !== undefined || data.facilities_rating !== undefined || 
        data.service_rating !== undefined || data.cleanliness_rating !== undefined || 
        data.value_rating !== undefined) {
      // Get current review to calculate average
      const currentReview = await this.getReviewById(reviewId, accountId);
      if (currentReview) {
        const ratings = [
          data.location_rating ?? currentReview.location_rating,
          data.facilities_rating ?? currentReview.facilities_rating,
          data.service_rating ?? currentReview.service_rating,
          data.cleanliness_rating ?? currentReview.cleanliness_rating,
          data.value_rating ?? currentReview.value_rating
        ].filter(r => r !== null && r !== undefined) as number[];
        
        if (ratings.length > 0) {
          const overallRating = Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10;
          updateFields.push('rating = ?');
          updateValues.push(overallRating);
        }
      }
    } else if (data.rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(data.rating);
    }

    if (data.title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(data.title);
    }
    if (data.comment !== undefined) {
      updateFields.push('comment = ?');
      updateValues.push(data.comment);
    }

    if (updateFields.length > 0) {
      updateValues.push(reviewId, accountId);
      await pool.query(
        `UPDATE review SET ${updateFields.join(', ')}, updated_at = NOW() WHERE review_id = ? AND account_id = ?`,
        updateValues
      );

      // Lấy hotel_id để cập nhật rating
      const review = await this.getReviewById(reviewId, accountId);
      if (review) {
        await this.updateHotelRating(review.hotel_id);
      }
    }
  }

  // Xóa review (soft delete)
  async deleteReview(reviewId: string, accountId: string): Promise<void> {
    const review = await this.getReviewById(reviewId, accountId);
    if (!review) throw new Error('Không tìm thấy đánh giá');

    await pool.query(
      `UPDATE review SET status = 'DELETED', updated_at = NOW() WHERE review_id = ? AND account_id = ?`,
      [reviewId, accountId]
    );

    // Cập nhật lại rating của hotel
    await this.updateHotelRating(review.hotel_id);
  }

  // Lấy tất cả reviews của hotel (public API - không cần auth)
  async getReviewsByHotelId(hotelId: string, limit: number = 100, offset: number = 0): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT DISTINCT
        r.review_id,
        r.account_id,
        r.hotel_id,
        r.booking_id,
        r.rating,
        r.location_rating,
        r.facilities_rating,
        r.service_rating,
        r.cleanliness_rating,
        r.value_rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        a.full_name as user_name,
        a.avatar_url as user_avatar,
        a.email as user_email,
        (SELECT bd2.checkin_date FROM booking_detail bd2 WHERE bd2.booking_id = r.booking_id LIMIT 1) as checkin_date,
        (SELECT bd2.checkout_date FROM booking_detail bd2 WHERE bd2.booking_id = r.booking_id LIMIT 1) as checkout_date,
        (SELECT bd2.guests_count FROM booking_detail bd2 WHERE bd2.booking_id = r.booking_id LIMIT 1) as guests_count,
        (SELECT bd2.nights_count FROM booking_detail bd2 WHERE bd2.booking_id = r.booking_id LIMIT 1) as nights_count,
        (SELECT rt2.name FROM booking_detail bd2 
         JOIN room ro2 ON ro2.room_id = bd2.room_id 
         JOIN room_type rt2 ON rt2.room_type_id = ro2.room_type_id 
         WHERE bd2.booking_id = r.booking_id LIMIT 1) as room_type_name,
        (SELECT rt2.bed_type FROM booking_detail bd2 
         JOIN room ro2 ON ro2.room_id = bd2.room_id 
         JOIN room_type rt2 ON rt2.room_type_id = ro2.room_type_id 
         WHERE bd2.booking_id = r.booking_id LIMIT 1) as bed_type
       FROM review r
       LEFT JOIN account a ON a.account_id = r.account_id
       WHERE r.hotel_id = ? AND r.status = 'ACTIVE'
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [hotelId, limit, offset]
    );
    
    // Fetch replies for each review
    const reviewsWithReplies = await Promise.all(rows.map(async (review: any) => {
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
        [review.review_id]
      );
      
      if (replies && replies.length > 0) {
        review.reply = {
          reply_id: replies[0].reply_id,
          reply_text: replies[0].reply_text,
          replied_by: replies[0].replied_by,
          replied_by_name: replies[0].replied_by_name,
          replied_at: replies[0].replied_at
        };
      }
      
      return review;
    }));
    
    return reviewsWithReplies;
  }

  // Lấy thống kê reviews của hotel (rating từ 1-5, nhưng hiển thị scale 1-10)
  async getHotelReviewStats(hotelId: string): Promise<any> {
    const [stats]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        AVG(location_rating) as avg_location_rating,
        AVG(facilities_rating) as avg_facilities_rating,
        AVG(service_rating) as avg_service_rating,
        AVG(cleanliness_rating) as avg_cleanliness_rating,
        AVG(value_rating) as avg_value_rating,
        COUNT(CASE WHEN rating >= 4.5 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN rating >= 4 AND rating < 4.5 THEN 1 END) as very_good_count,
        COUNT(CASE WHEN rating >= 3.5 AND rating < 4 THEN 1 END) as good_count,
        COUNT(CASE WHEN rating >= 3 AND rating < 3.5 THEN 1 END) as average_count,
        COUNT(CASE WHEN rating < 3 THEN 1 END) as poor_count
       FROM review
       WHERE hotel_id = ? AND status = 'ACTIVE'`,
      [hotelId]
    );

    const result = stats[0] || {
      total_reviews: 0,
      avg_rating: null,
      avg_location_rating: null,
      avg_facilities_rating: null,
      avg_service_rating: null,
      avg_cleanliness_rating: null,
      avg_value_rating: null,
      excellent_count: 0,
      very_good_count: 0,
      good_count: 0,
      average_count: 0,
      poor_count: 0
    };

    // Convert rating từ scale 1-5 sang 1-10 cho frontend
    // Handle null/undefined cases
    if (result.avg_rating !== null && result.avg_rating !== undefined) {
      const numericAvgRating = typeof result.avg_rating === 'number' 
        ? result.avg_rating 
        : parseFloat(result.avg_rating);
      
      if (!isNaN(numericAvgRating)) {
        result.avg_rating = parseFloat((numericAvgRating * 2).toFixed(1));
      } else {
        result.avg_rating = 0;
      }
    } else {
      result.avg_rating = 0;
    }

    // Convert category ratings to 1-10 scale
    ['avg_location_rating', 'avg_facilities_rating', 'avg_service_rating', 'avg_cleanliness_rating', 'avg_value_rating'].forEach(key => {
      if (result[key] !== null && result[key] !== undefined) {
        const numericRating = typeof result[key] === 'number' ? result[key] : parseFloat(result[key]);
        if (!isNaN(numericRating)) {
          result[key] = parseFloat((numericRating * 2).toFixed(1));
        } else {
          result[key] = 0;
        }
      } else {
        result[key] = 0;
      }
    });

    // Ensure all counts are numbers
    result.total_reviews = Number(result.total_reviews) || 0;
    result.excellent_count = Number(result.excellent_count) || 0;
    result.very_good_count = Number(result.very_good_count) || 0;
    result.good_count = Number(result.good_count) || 0;
    result.average_count = Number(result.average_count) || 0;
    result.poor_count = Number(result.poor_count) || 0;

    return result;
  }

  // Kiểm tra user đã review hotel này chưa
  async getUserReviewForHotel(accountId: string, hotelId: string): Promise<any | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        r.review_id,
        r.account_id,
        r.hotel_id,
        r.booking_id,
        r.rating,
        r.location_rating,
        r.facilities_rating,
        r.service_rating,
        r.cleanliness_rating,
        r.value_rating,
        r.title,
        r.comment,
        r.status,
        r.created_at,
        r.updated_at,
        a.full_name as user_name,
        a.avatar_url as user_avatar
       FROM review r
       LEFT JOIN account a ON a.account_id = r.account_id
       WHERE r.account_id = ? AND r.hotel_id = ? AND r.status = 'ACTIVE'
       LIMIT 1`,
      [accountId, hotelId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Cập nhật avg_rating và review_count của hotel
  // Tính avg_rating từ tất cả category ratings nếu có, nếu không thì dùng rating tổng
  private async updateHotelRating(hotelId: string): Promise<void> {
    const [stats]: any = await pool.query(
      `SELECT 
        COUNT(*) as review_count,
        AVG(rating) as avg_rating,
        AVG(location_rating) as avg_location_rating,
        AVG(facilities_rating) as avg_facilities_rating,
        AVG(service_rating) as avg_service_rating,
        AVG(cleanliness_rating) as avg_cleanliness_rating,
        AVG(value_rating) as avg_value_rating
       FROM review
       WHERE hotel_id = ? AND status = 'ACTIVE'`,
      [hotelId]
    );

    const reviewCount = Number(stats[0]?.review_count) || 0;
    let avgRating = stats[0]?.avg_rating;

    // Calculate average from category ratings if available
    const categoryRatings = [
      stats[0]?.avg_location_rating,
      stats[0]?.avg_facilities_rating,
      stats[0]?.avg_service_rating,
      stats[0]?.avg_cleanliness_rating,
      stats[0]?.avg_value_rating
    ].filter(r => r !== null && r !== undefined);

    if (categoryRatings.length > 0) {
      const avgCategoryRating = categoryRatings.reduce((sum: number, r: any) => {
        const num = typeof r === 'number' ? r : parseFloat(r);
        return sum + (isNaN(num) ? 0 : num);
      }, 0) / categoryRatings.length;
      
      // Use category average if it exists, otherwise use overall rating
      if (!isNaN(avgCategoryRating)) {
        avgRating = avgCategoryRating;
      }
    }

    if (reviewCount > 0 && avgRating !== null && avgRating !== undefined) {
      // Ensure avg_rating is a number
      const numericAvgRating = typeof avgRating === 'number' ? avgRating : parseFloat(avgRating);
      if (!isNaN(numericAvgRating)) {
        await pool.query(
          `UPDATE hotel SET avg_rating = ?, review_count = ? WHERE hotel_id = ?`,
          [parseFloat(numericAvgRating.toFixed(1)), reviewCount, hotelId]
        );
      } else {
        await pool.query(
          `UPDATE hotel SET avg_rating = 0.0, review_count = ? WHERE hotel_id = ?`,
          [reviewCount, hotelId]
        );
      }
    } else {
      await pool.query(
        `UPDATE hotel SET avg_rating = 0.0, review_count = 0 WHERE hotel_id = ?`,
        [hotelId]
      );
    }
  }
}


