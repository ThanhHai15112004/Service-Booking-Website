import pool from "../../config/db";

export interface AdminHotel {
  hotel_id: string;
  name: string;
  description?: string;
  category_id?: string;
  category?: string;
  location_id?: string;
  city?: string;
  district?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  star_rating?: number;
  avg_rating?: number;
  review_count?: number;
  checkin_time?: string;
  checkout_time?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  total_rooms?: number;
  main_image?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  booking_count?: number;
}

export interface HotelDashboardStats {
  totalHotels: number;
  activeHotels: number;
  inactiveHotels: number;
  pendingHotels: number;
  topRatedHotels: number;
  avgBookingsPerHotel: number;
  hotelsByCity: Array<{ city: string; count: number }>;
  hotelsByCategory: Array<{ category: string; count: number }>;
  bookingTrends: Array<{ month: string; bookings: number }>;
  topBookedHotels: Array<{
    hotel_id: string;
    name: string;
    booking_count: number;
    main_image?: string;
  }>;
  topRatedHotelsList: Array<{
    hotel_id: string;
    name: string;
    avg_rating: number;
    review_count: number;
    main_image?: string;
  }>;
}

export interface HotelReportData {
  summary: {
    totalBookings: number;
    totalRevenue: number;
    newReviews: number;
    avgRating: number;
  };
  hotelsDetail: Array<{
    hotel: string;
    bookings: number;
    reviews: number;
    avgRating: number;
    revenue: number;
  }>;
  revenueByHotel: Array<{
    hotel: string;
    revenue: number;
  }>;
  cancellationRate: Array<{
    hotel: string;
    rate: number;
  }>;
  topHotels: Array<{
    hotel: string;
    score: number;
  }>;
}

export class AdminHotelRepository {
  // Lấy danh sách hotels với filter, sort, pagination
  async getHotels(filters: {
    search?: string;
    status?: string;
    category?: string;
    city?: string;
    starRating?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<{ hotels: AdminHotel[]; total: number }> {
    let query = `
      SELECT 
        h.hotel_id,
        h.name,
        h.description,
        h.category_id,
        c.name as category,
        h.location_id,
        l.city,
        l.district,
        h.address,
        h.latitude,
        h.longitude,
        h.star_rating,
        h.avg_rating,
        h.review_count,
        h.checkin_time,
        h.checkout_time,
        h.phone_number,
        h.email,
        h.website,
        h.total_rooms,
        h.main_image,
        h.status,
        h.created_at,
        h.updated_at,
        COALESCE((
          SELECT COUNT(DISTINCT b.booking_id)
          FROM booking b
          WHERE b.hotel_id = h.hotel_id 
            AND b.status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN', 'CHECKED_OUT')
        ), 0) as booking_count,
        COALESCE((
          SELECT COUNT(DISTINCT b2.booking_id)
          FROM booking b2
          WHERE b2.hotel_id = h.hotel_id 
            AND b2.status IN ('PENDING_CONFIRMATION', 'PAID')
        ), 0) as pending_booking_count
      FROM hotel h
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Filters
    if (filters.search) {
      query += ` AND (h.name LIKE ? OR h.hotel_id LIKE ? OR l.city LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.status) {
      query += ` AND h.status = ?`;
      params.push(filters.status);
    }

    if (filters.category) {
      query += ` AND c.name = ?`;
      params.push(filters.category);
    }

    if (filters.city) {
      query += ` AND l.city = ?`;
      params.push(filters.city);
    }

    if (filters.starRating) {
      query += ` AND h.star_rating = ?`;
      params.push(parseInt(filters.starRating));
    }

    // Get total count before GROUP BY
    const countQuery = `
      SELECT COUNT(DISTINCT h.hotel_id) as total
      FROM hotel h
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      WHERE 1=1
      ${filters.search ? `AND (h.name LIKE ? OR h.hotel_id LIKE ? OR l.city LIKE ?)` : ""}
      ${filters.status ? `AND h.status = ?` : ""}
      ${filters.category ? `AND c.name = ?` : ""}
      ${filters.city ? `AND l.city = ?` : ""}
      ${filters.starRating ? `AND h.star_rating = ?` : ""}
    `;
    
    const countParams: any[] = [];
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (filters.status) countParams.push(filters.status);
    if (filters.category) countParams.push(filters.category);
    if (filters.city) countParams.push(filters.city);
    if (filters.starRating) countParams.push(parseInt(filters.starRating));
    
    const [countRows]: any = await pool.query(countQuery, countParams);
    const total = countRows[0]?.total || 0;

    // Sort
    const sortBy = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "DESC";
    const validSortFields: Record<string, string> = {
      name: "h.name",
      rating: "h.avg_rating",
      bookings: "booking_count",
      created_at: "h.created_at",
    };
    const sortField = validSortFields[sortBy] || "h.created_at";
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ` LIMIT ? OFFSET ?`;
      params.push(filters.limit, offset);
    }

    const [rows]: any = await pool.query(query, params);

    return {
      hotels: rows.map((row: any) => ({
        hotel_id: row.hotel_id,
        name: row.name,
        description: row.description,
        category_id: row.category_id,
        category: row.category,
        location_id: row.location_id,
        city: row.city,
        district: row.district || null,
        address: row.address,
        latitude: row.latitude,
        longitude: row.longitude,
        star_rating: row.star_rating,
        avg_rating: row.avg_rating,
        review_count: row.review_count,
        checkin_time: row.checkin_time,
        checkout_time: row.checkout_time,
        phone_number: row.phone_number,
        email: row.email,
        website: row.website,
        total_rooms: row.total_rooms,
        main_image: row.main_image,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        booking_count: parseInt(row.booking_count) || 0,
        pending_booking_count: parseInt(row.pending_booking_count) || 0,
      })),
      total,
    };
  }

  // Lấy chi tiết hotel
  async getHotelById(hotelId: string): Promise<AdminHotel | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        h.*,
        c.name as category,
        l.city,
        l.district,
        COUNT(DISTINCT b.booking_id) as booking_count
      FROM hotel h
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id AND b.status IN ('CONFIRMED', 'COMPLETED')
      WHERE h.hotel_id = ?
      GROUP BY h.hotel_id`,
      [hotelId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      hotel_id: row.hotel_id,
      name: row.name,
      description: row.description,
      category_id: row.category_id,
      category: row.category,
      location_id: row.location_id,
      city: row.city,
      district: row.district,
      address: row.address,
      latitude: row.latitude,
      longitude: row.longitude,
      star_rating: row.star_rating,
      avg_rating: row.avg_rating,
      review_count: row.review_count,
      checkin_time: row.checkin_time,
      checkout_time: row.checkout_time,
      phone_number: row.phone_number,
      email: row.email,
      website: row.website,
      total_rooms: row.total_rooms,
      main_image: row.main_image,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      booking_count: parseInt(row.booking_count) || 0,
    };
  }

  // Cập nhật hotel
  async updateHotel(hotelId: string, data: {
    name?: string;
    description?: string;
    category_id?: string;
    location_id?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    star_rating?: number;
    checkin_time?: string;
    checkout_time?: string;
    phone_number?: string;
    email?: string;
    website?: string;
    total_rooms?: number;
    main_image?: string;
  }): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) { updates.push("name = ?"); values.push(data.name); }
    if (data.description !== undefined) { updates.push("description = ?"); values.push(data.description); }
    if (data.category_id !== undefined) { updates.push("category_id = ?"); values.push(data.category_id); }
    if (data.location_id !== undefined) { updates.push("location_id = ?"); values.push(data.location_id); }
    if (data.address !== undefined) { updates.push("address = ?"); values.push(data.address); }
    if (data.latitude !== undefined) { updates.push("latitude = ?"); values.push(data.latitude); }
    if (data.longitude !== undefined) { updates.push("longitude = ?"); values.push(data.longitude); }
    if (data.star_rating !== undefined) { updates.push("star_rating = ?"); values.push(data.star_rating); }
    if (data.checkin_time !== undefined) { updates.push("checkin_time = ?"); values.push(data.checkin_time); }
    if (data.checkout_time !== undefined) { updates.push("checkout_time = ?"); values.push(data.checkout_time); }
    if (data.phone_number !== undefined) { updates.push("phone_number = ?"); values.push(data.phone_number); }
    if (data.email !== undefined) { updates.push("email = ?"); values.push(data.email); }
    if (data.website !== undefined) { updates.push("website = ?"); values.push(data.website); }
    if (data.total_rooms !== undefined) { updates.push("total_rooms = ?"); values.push(data.total_rooms); }
    if (data.main_image !== undefined) { updates.push("main_image = ?"); values.push(data.main_image); }

    if (updates.length === 0) return;

    updates.push("updated_at = NOW()");
    values.push(hotelId);

    await pool.query(
      `UPDATE hotel SET ${updates.join(", ")} WHERE hotel_id = ?`,
      values
    );
  }

  // Cập nhật trạng thái hotel
  async updateHotelStatus(hotelId: string, status: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE hotel SET status = ?, updated_at = NOW() WHERE hotel_id = ?`,
      [status, hotelId]
    );
    return result.affectedRows > 0;
  }

  // Xóa hotel (soft delete - set status = DELETED hoặc hard delete)
  async deleteHotel(hotelId: string, hardDelete: boolean = false): Promise<boolean> {
    if (hardDelete) {
      const [result]: any = await pool.query(`DELETE FROM hotel WHERE hotel_id = ?`, [hotelId]);
      return result.affectedRows > 0;
    } else {
      return this.updateHotelStatus(hotelId, "INACTIVE");
    }
  }

  // Lấy dashboard stats
  async getDashboardStats(): Promise<HotelDashboardStats> {
    // Total hotels
    const [totalRows]: any = await pool.query(`SELECT COUNT(*) as total FROM hotel`);
    const totalHotels = totalRows[0]?.total || 0;

    // Status counts
    const [statusRows]: any = await pool.query(
      `SELECT status, COUNT(*) as count FROM hotel GROUP BY status`
    );
    const statusMap: Record<string, number> = {};
    statusRows.forEach((row: any) => {
      statusMap[row.status] = row.count;
    });

    // Hotels by city
    const [cityRows]: any = await pool.query(
      `SELECT l.city, COUNT(*) as count 
       FROM hotel h
       LEFT JOIN hotel_location l ON h.location_id = l.location_id
       WHERE l.city IS NOT NULL
       GROUP BY l.city
       ORDER BY count DESC
       LIMIT 10`
    );

    // Hotels by category
    const [categoryRows]: any = await pool.query(
      `SELECT c.name as category, COUNT(*) as count
       FROM hotel h
       LEFT JOIN hotel_category c ON h.category_id = c.category_id
       WHERE c.name IS NOT NULL
       GROUP BY c.name`
    );

    // Top booked hotels
    const [topBookedRows]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name,
        h.main_image,
        COUNT(DISTINCT b.booking_id) as booking_count
      FROM hotel h
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id AND b.status IN ('CONFIRMED', 'COMPLETED')
      GROUP BY h.hotel_id
      ORDER BY booking_count DESC
      LIMIT 5`
    );

    // Top rated hotels
    const [topRatedRows]: any = await pool.query(
      `SELECT 
        h.hotel_id,
        h.name,
        h.main_image,
        h.avg_rating,
        h.review_count
      FROM hotel h
      WHERE h.avg_rating > 0
      ORDER BY h.avg_rating DESC, h.review_count DESC
      LIMIT 5`
    );

    // Booking trends (last 12 months)
    const [trendRows]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as bookings
      FROM booking
      WHERE status IN ('CONFIRMED', 'COMPLETED')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC`
    );

    // Average bookings per hotel
    const [avgBookingsRow]: any = await pool.query(
      `SELECT 
        COUNT(DISTINCT b.booking_id) / NULLIF(COUNT(DISTINCT h.hotel_id), 0) as avg_bookings
      FROM hotel h
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id AND b.status IN ('CONFIRMED', 'COMPLETED')`
    );
    const avgBookingsPerHotel = parseFloat(avgBookingsRow[0]?.avg_bookings || 0);

    // Top rated hotels count (rating >= 8.0)
    const [topRatedCountRow]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel WHERE avg_rating >= 8.0`
    );
    const topRatedHotels = topRatedCountRow[0]?.count || 0;

    return {
      totalHotels,
      activeHotels: statusMap["ACTIVE"] || 0,
      inactiveHotels: statusMap["INACTIVE"] || 0,
      pendingHotels: statusMap["PENDING"] || 0,
      topRatedHotels,
      avgBookingsPerHotel: Math.round(avgBookingsPerHotel * 10) / 10,
      hotelsByCity: cityRows.map((row: any) => ({
        city: row.city,
        count: row.count,
      })),
      hotelsByCategory: categoryRows.map((row: any) => ({
        category: row.category,
        count: row.count,
      })),
      bookingTrends: trendRows.map((row: any) => ({
        month: new Date(row.month + "-01").toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        }),
        bookings: row.bookings,
      })),
      topBookedHotels: topBookedRows.map((row: any) => ({
        hotel_id: row.hotel_id,
        name: row.name,
        booking_count: parseInt(row.booking_count) || 0,
        main_image: row.main_image,
      })),
      topRatedHotelsList: topRatedRows.map((row: any) => ({
        hotel_id: row.hotel_id,
        name: row.name,
        avg_rating: parseFloat(row.avg_rating) || 0,
        review_count: parseInt(row.review_count) || 0,
        main_image: row.main_image,
      })),
    };
  }

  // Lấy report data
  async getReportData(filters: {
    period?: string; // days
    city?: string;
    category?: string;
  }): Promise<HotelReportData> {
    const period = parseInt(filters.period || "30");
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - period);
    const dateFromStr = dateFrom.toISOString().split("T")[0];

    let whereClause = `WHERE b.created_at >= ? AND b.status IN ('CONFIRMED', 'COMPLETED')`;
    const params: any[] = [dateFromStr];

    if (filters.city) {
      whereClause += ` AND l.city = ?`;
      params.push(filters.city);
    }

    if (filters.category) {
      whereClause += ` AND c.name = ?`;
      params.push(filters.category);
    }

    // Summary
    const [summaryRows]: any = await pool.query(
      `SELECT 
        COUNT(DISTINCT b.booking_id) as totalBookings,
        COALESCE(SUM(b.total_amount), 0) as totalRevenue,
        COUNT(DISTINCT r.review_id) as newReviews,
        COALESCE(AVG(r.rating), 0) as avgRating
      FROM booking b
      LEFT JOIN review r ON r.booking_id = b.booking_id AND r.created_at >= ?
      LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      ${whereClause}`,
      [dateFromStr, ...params]
    );

    // Hotels detail
    const [hotelsDetailRows]: any = await pool.query(
      `SELECT 
        h.name as hotel,
        COUNT(DISTINCT b.booking_id) as bookings,
        COUNT(DISTINCT r.review_id) as reviews,
        COALESCE(AVG(r.rating), 0) as avgRating,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM hotel h
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id ${whereClause.replace("WHERE", "AND")}
      LEFT JOIN review r ON r.booking_id = b.booking_id AND r.created_at >= ?
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      GROUP BY h.hotel_id, h.name
      HAVING bookings > 0
      ORDER BY bookings DESC
      LIMIT 10`,
      [dateFromStr, ...params]
    );

    // Revenue by hotel
    const [revenueRows]: any = await pool.query(
      `SELECT 
        h.name as hotel,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM hotel h
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id ${whereClause.replace("WHERE", "AND")}
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      GROUP BY h.hotel_id, h.name
      HAVING revenue > 0
      ORDER BY revenue DESC
      LIMIT 10`,
      params
    );

    // Cancellation rate
    const [cancelRows]: any = await pool.query(
      `SELECT 
        h.name as hotel,
        COUNT(DISTINCT CASE WHEN b.status = 'CANCELLED' THEN b.booking_id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT b.booking_id), 0) as rate
      FROM hotel h
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id AND b.created_at >= ?
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      ${filters.city ? "AND l.city = ?" : ""}
      ${filters.category ? "AND c.name = ?" : ""}
      GROUP BY h.hotel_id, h.name
      HAVING COUNT(DISTINCT b.booking_id) > 0
      ORDER BY rate ASC
      LIMIT 10`,
      filters.city || filters.category
        ? [dateFromStr, ...(filters.city ? [filters.city] : []), ...(filters.category ? [filters.category] : [])]
        : [dateFromStr]
    );

    // Top hotels (composite score)
    const [topHotelsRows]: any = await pool.query(
      `SELECT 
        h.name as hotel,
        (h.avg_rating * 10 + COUNT(DISTINCT b.booking_id) * 0.1 + COUNT(DISTINCT r.review_id) * 0.05) as score
      FROM hotel h
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id ${whereClause.replace("WHERE", "AND")}
      LEFT JOIN review r ON r.booking_id = b.booking_id
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      GROUP BY h.hotel_id, h.name, h.avg_rating
      ORDER BY score DESC
      LIMIT 10`,
      [dateFromStr, ...params]
    );

    const summary = summaryRows[0] || {};
    return {
      summary: {
        totalBookings: parseInt(summary.totalBookings) || 0,
        totalRevenue: parseFloat(summary.totalRevenue) || 0,
        newReviews: parseInt(summary.newReviews) || 0,
        avgRating: Math.round(parseFloat(summary.avgRating) * 10) / 10,
      },
      hotelsDetail: hotelsDetailRows.map((row: any) => ({
        hotel: row.hotel,
        bookings: parseInt(row.bookings) || 0,
        reviews: parseInt(row.reviews) || 0,
        avgRating: Math.round(parseFloat(row.avgRating) * 10) / 10,
        revenue: parseFloat(row.revenue) || 0,
      })),
      revenueByHotel: revenueRows.map((row: any) => ({
        hotel: row.hotel,
        revenue: parseFloat(row.revenue) || 0,
      })),
      cancellationRate: cancelRows.map((row: any) => ({
        hotel: row.hotel,
        rate: Math.round(parseFloat(row.rate) * 10) / 10,
      })),
      topHotels: topHotelsRows.map((row: any) => ({
        hotel: row.hotel,
        score: Math.round(parseFloat(row.score) * 10) / 10,
      })),
    };
  }

  // ========== Hotel Facilities ==========
  async getHotelFacilities(hotelId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        f.facility_id, f.name, f.category, f.icon,
        hf.created_at
      FROM hotel_facility hf
      JOIN facility f ON hf.facility_id = f.facility_id
      WHERE hf.hotel_id = ?
      ORDER BY f.category, f.name`,
      [hotelId]
    );
    return rows;
  }

  async addHotelFacility(hotelId: string, facilityId: string): Promise<void> {
    await pool.query(
      `INSERT INTO hotel_facility (hotel_id, facility_id) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE created_at = created_at`,
      [hotelId, facilityId]
    );
  }

  async removeHotelFacility(hotelId: string, facilityId: string): Promise<void> {
    await pool.query(
      `DELETE FROM hotel_facility WHERE hotel_id = ? AND facility_id = ?`,
      [hotelId, facilityId]
    );
  }

  // ========== Hotel Highlights ==========
  async getAllHighlights(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT highlight_id, name, icon_url, description, category, created_at
       FROM highlight
       ORDER BY category, name`
    );
    return rows;
  }

  async getHotelHighlights(hotelId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        hh.hotel_id, hh.highlight_id, hh.custom_text, hh.sort_order,
        h.name, h.icon_url, h.description, h.category
      FROM hotel_highlight hh
      JOIN highlight h ON hh.highlight_id = h.highlight_id
      WHERE hh.hotel_id = ?
      ORDER BY hh.sort_order ASC`,
      [hotelId]
    );
    return rows;
  }

  async addHotelHighlight(hotelId: string, highlightId: string, customText?: string, sortOrder?: number): Promise<void> {
    await pool.query(
      `INSERT INTO hotel_highlight (hotel_id, highlight_id, custom_text, sort_order) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE custom_text = VALUES(custom_text), sort_order = VALUES(sort_order)`,
      [hotelId, highlightId, customText || null, sortOrder || 0]
    );
  }

  async updateHotelHighlight(hotelId: string, highlightId: string, customText?: string, sortOrder?: number): Promise<void> {
    await pool.query(
      `UPDATE hotel_highlight 
       SET custom_text = ?, sort_order = ?
       WHERE hotel_id = ? AND highlight_id = ?`,
      [customText || null, sortOrder || 0, hotelId, highlightId]
    );
  }

  async removeHotelHighlight(hotelId: string, highlightId: string): Promise<void> {
    await pool.query(
      `DELETE FROM hotel_highlight WHERE hotel_id = ? AND highlight_id = ?`,
      [hotelId, highlightId]
    );
  }

  // ========== Hotel Policies ==========
  async getHotelPolicies(hotelId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT 
        hp.id, hp.hotel_id, hp.policy_key, hp.value, hp.created_at, hp.updated_at,
        pt.name_vi, pt.name_en, pt.data_type, pt.applicable_to, pt.icon
      FROM hotel_policy hp
      JOIN policy_type pt ON hp.policy_key = pt.policy_key
      WHERE hp.hotel_id = ?
      ORDER BY pt.display_order`,
      [hotelId]
    );
    return rows;
  }

  async getPolicyTypes(): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT policy_key, name_vi, name_en, description, data_type, applicable_to, icon, display_order
       FROM policy_type
       WHERE is_active = 1
       ORDER BY display_order`
    );
    return rows;
  }

  async setHotelPolicy(hotelId: string, policyKey: string, value: string): Promise<void> {
    await pool.query(
      `INSERT INTO hotel_policy (hotel_id, policy_key, value) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
      [hotelId, policyKey, value]
    );
  }

  async removeHotelPolicy(hotelId: string, policyKey: string): Promise<void> {
    await pool.query(
      `DELETE FROM hotel_policy WHERE hotel_id = ? AND policy_key = ?`,
      [hotelId, policyKey]
    );
  }

  // ========== Hotel Images ==========
  async getHotelImages(hotelId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT image_id, hotel_id, image_url, is_primary, caption, sort_order, created_at
       FROM hotel_image
       WHERE hotel_id = ?
       ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [hotelId]
    );
    return rows;
  }

  async addHotelImage(hotelId: string, imageUrl: string, sortOrder: number = 0, isPrimary: boolean = false): Promise<void> {
    // Generate image_id
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM hotel_image WHERE hotel_id = ?`,
      [hotelId]
    );
    const count = countRows[0].count || 0;
    const imageId = `${hotelId}_IMG${String(count + 1).padStart(3, "0")}`;

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await pool.query(
        `UPDATE hotel_image SET is_primary = 0 WHERE hotel_id = ?`,
        [hotelId]
      );
    }

    await pool.query(
      `INSERT INTO hotel_image (image_id, hotel_id, image_url, is_primary, sort_order) 
       VALUES (?, ?, ?, ?, ?)`,
      [imageId, hotelId, imageUrl, isPrimary ? 1 : 0, sortOrder]
    );
  }

  async deleteHotelImage(imageId: string): Promise<void> {
    await pool.query(`DELETE FROM hotel_image WHERE image_id = ?`, [imageId]);
  }

  // ========== Hotel Reviews ==========
  async getHotelReviews(hotelId: string, filters: {
    rating?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ reviews: any[]; total: number }> {
    let whereConditions = ["r.hotel_id = ?"];
    let queryParams: any[] = [hotelId];

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
        a.account_id,
        a.full_name,
        a.email,
        a.avatar_url
      FROM review r
      LEFT JOIN booking b ON r.booking_id = b.booking_id
      LEFT JOIN account a ON (b.account_id = a.account_id OR r.account_id = a.account_id)
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [total]: any = await pool.query(
      `SELECT COUNT(*) as count
       FROM review r
       WHERE ${whereClause}`,
      queryParams
    );

    return {
      reviews: reviews || [],
      total: total[0]?.count || 0,
    };
  }

  // ========== Hotel Statistics ==========
  async getHotelStatistics(hotelId: string): Promise<any> {
    // Total bookings
    const [bookingRows]: any = await pool.query(
      `SELECT COUNT(*) as totalBookings, COALESCE(SUM(total_amount), 0) as totalRevenue
       FROM booking
       WHERE hotel_id = ? AND status IN ('CONFIRMED', 'COMPLETED')`,
      [hotelId]
    );

    // Average rating
    const [ratingRows]: any = await pool.query(
      `SELECT 
        COALESCE(AVG(rating), 0) as avgRating,
        COUNT(*) as reviewCount
       FROM review r
       JOIN booking b ON r.booking_id = b.booking_id
       WHERE b.hotel_id = ?`,
      [hotelId]
    );

    // Cancellation rate
    const [cancelRows]: any = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
       FROM booking
       WHERE hotel_id = ?`,
      [hotelId]
    );

    // Monthly booking trends
    const [trendRows]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as bookings
       FROM booking
       WHERE hotel_id = ? AND status IN ('CONFIRMED', 'COMPLETED')
         AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [hotelId]
    );

    const booking = bookingRows[0] || {};
    const rating = ratingRows[0] || {};
    const cancel = cancelRows[0] || {};

    const total = parseInt(cancel.total) || 0;
    const cancelled = parseInt(cancel.cancelled) || 0;
    const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;

    return {
      totalBookings: parseInt(booking.totalBookings) || 0,
      totalRevenue: parseFloat(booking.totalRevenue) || 0,
      avgRating: Math.round(parseFloat(rating.avgRating) * 10) / 10,
      reviewCount: parseInt(rating.reviewCount) || 0,
      cancellationRate: Math.round(cancelRate * 10) / 10,
      bookingTrends: trendRows.map((row: any) => ({
        month: new Date(row.month + "-01").toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        }),
        bookings: parseInt(row.bookings) || 0,
      })),
    };
  }

  // ========== Hotel Bookings Management ==========
  
  // Lấy danh sách bookings của hotel với filter, sort, pagination
  async getHotelBookings(hotelId: string, filters: {
    status?: string;
    accountId?: string;
    accountName?: string;
    accountEmail?: string;
    dateFrom?: string;
    dateTo?: string;
    checkinFrom?: string;
    checkinTo?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<{ bookings: any[]; total: number }> {
    let whereConditions = ["b.hotel_id = ?"];
    let queryParams: any[] = [hotelId];

    if (filters.status) {
      whereConditions.push("b.status = ?");
      queryParams.push(filters.status);
    }
    if (filters.accountId) {
      whereConditions.push("b.account_id = ?");
      queryParams.push(filters.accountId);
    }
    if (filters.accountName) {
      whereConditions.push("a.full_name LIKE ?");
      queryParams.push(`%${filters.accountName}%`);
    }
    if (filters.accountEmail) {
      whereConditions.push("a.email LIKE ?");
      queryParams.push(`%${filters.accountEmail}%`);
    }
    if (filters.dateFrom) {
      whereConditions.push("DATE(b.created_at) >= ?");
      queryParams.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      whereConditions.push("DATE(b.created_at) <= ?");
      queryParams.push(filters.dateTo);
    }
    // Note: checkinFrom và checkinTo sẽ được xử lý trong HAVING clause

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    const whereClause = whereConditions.join(" AND ");
    
    const sortBy = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder || "DESC";

    // Query chính với GROUP BY để lấy thông tin booking và account
    const [bookings]: any = await pool.query(
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
        a.full_name as account_name,
        a.email as account_email,
        a.phone_number as account_phone,
        a.avatar_url as account_avatar,
        a.status as account_status,
        MIN(bd.checkin_date) as checkin_date,
        MAX(bd.checkout_date) as checkout_date,
        MIN(bd.nights_count) as nights_count,
        SUM(bd.guests_count) as total_guests,
        COUNT(DISTINCT bd.room_id) as rooms_count,
        GROUP_CONCAT(DISTINCT rt.name ORDER BY rt.name SEPARATOR ', ') as room_type_names,
        p.payment_id,
        p.method as payment_method,
        p.status as payment_status,
        p.amount_due,
        p.amount_paid,
        p.created_at as payment_created_at
      FROM booking b
      JOIN account a ON a.account_id = b.account_id
      LEFT JOIN booking_detail bd ON bd.booking_id = b.booking_id
      LEFT JOIN room r ON r.room_id = bd.room_id
      LEFT JOIN room_type rt ON rt.room_type_id = r.room_type_id
      LEFT JOIN payment p ON p.booking_id = b.booking_id
        AND p.created_at = (
          SELECT MAX(p2.created_at)
          FROM payment p2
          WHERE p2.booking_id = b.booking_id
        )
      WHERE ${whereClause}
      GROUP BY b.booking_id, b.account_id, b.hotel_id, b.status, b.subtotal, 
               b.tax_amount, b.discount_amount, b.total_amount, b.special_requests,
               b.created_at, b.updated_at, a.full_name, a.email, a.phone_number, 
               a.avatar_url, a.status, p.payment_id, p.method, p.status, 
               p.amount_due, p.amount_paid, p.created_at
      ${filters.checkinFrom || filters.checkinTo 
        ? `HAVING ${filters.checkinFrom ? `MIN(bd.checkin_date) >= ?` : '1=1'} ${filters.checkinTo ? `AND MIN(bd.checkin_date) <= ?` : ''}` 
        : ''}
      ORDER BY b.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?`,
      [
        ...queryParams,
        ...(filters.checkinFrom ? [filters.checkinFrom] : []),
        ...(filters.checkinTo ? [filters.checkinTo] : []),
        limit,
        offset
      ]
    );

    // Query count tổng số bookings (sử dụng subquery để xử lý checkin date filters)
    let countWhereClause = whereConditions.filter(c => !c.includes('MIN(')).join(" AND ");
    let countParams = queryParams.filter((_, idx) => !whereConditions[idx]?.includes('MIN('));
    
    if (filters.checkinFrom || filters.checkinTo) {
      countWhereClause += ` AND EXISTS (
        SELECT 1 FROM booking_detail bd2 
        WHERE bd2.booking_id = b.booking_id
        ${filters.checkinFrom ? `AND bd2.checkin_date >= ?` : ''}
        ${filters.checkinTo ? `AND bd2.checkin_date <= ?` : ''}
      )`;
      if (filters.checkinFrom) countParams.push(filters.checkinFrom);
      if (filters.checkinTo) countParams.push(filters.checkinTo);
    }
    
    const [total]: any = await pool.query(
      `SELECT COUNT(DISTINCT b.booking_id) as count
       FROM booking b
       JOIN account a ON a.account_id = b.account_id
       ${countWhereClause ? `WHERE ${countWhereClause}` : ''}`,
      countParams
    );

    return {
      bookings: bookings || [],
      total: total[0]?.count || 0,
    };
  }

  // Lấy chi tiết booking của hotel (bao gồm account info và booking details)
  async getHotelBookingDetail(hotelId: string, bookingId: string): Promise<any | null> {
    // Lấy thông tin booking chính
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
        a.full_name as account_name,
        a.email as account_email,
        a.phone_number as account_phone,
        a.avatar_url as account_avatar,
        a.status as account_status,
        a.created_at as account_created_at,
        h.name as hotel_name,
        h.address as hotel_address,
        h.phone_number as hotel_phone,
        h.email as hotel_email,
        p.payment_id,
        p.method as payment_method,
        p.status as payment_status,
        p.amount_due,
        p.amount_paid,
        p.created_at as payment_created_at,
        p.updated_at as payment_updated_at
      FROM booking b
      JOIN account a ON a.account_id = b.account_id
      JOIN hotel h ON h.hotel_id = b.hotel_id
      LEFT JOIN payment p ON p.booking_id = b.booking_id
        AND p.created_at = (
          SELECT MAX(p2.created_at)
          FROM payment p2
          WHERE p2.booking_id = b.booking_id
        )
      WHERE b.booking_id = ? AND b.hotel_id = ?`,
      [bookingId, hotelId]
    );

    if (!booking || booking.length === 0) {
      return null;
    }

    // Lấy booking details (rooms)
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
        r.capacity,
        rt.name as room_type_name,
        rt.room_type_id,
        rt.bed_type,
        rt.area as room_area
      FROM booking_detail bd
      JOIN room r ON r.room_id = bd.room_id
      JOIN room_type rt ON rt.room_type_id = r.room_type_id
      WHERE bd.booking_id = ?
      ORDER BY bd.booking_detail_id ASC`,
      [bookingId]
    );

    // Lấy discount code nếu có
    const [discountCode]: any = await pool.query(
      `SELECT 
        dc.code,
        dc.percentage_off,
        dc.max_discount,
        bd.discount_amount
      FROM booking_discount bd
      JOIN discount_code dc ON dc.discount_id = bd.discount_id
      WHERE bd.booking_id = ?`,
      [bookingId]
    );

    return {
      ...booking[0],
      booking_details: bookingDetails || [],
      discount_code: discountCode[0] || null,
    };
  }

  // Cập nhật trạng thái booking
  async updateBookingStatus(bookingId: string, hotelId: string, status: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE booking 
       SET status = ?, updated_at = NOW()
       WHERE booking_id = ? AND hotel_id = ?`,
      [status, bookingId, hotelId]
    );
    return result.affectedRows > 0;
  }

  // Cập nhật special_requests cho booking (được gọi từ service sau khi đã xử lý admin note)
  async updateBookingAdminNote(hotelId: string, bookingId: string, specialRequests: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE booking 
       SET special_requests = ?,
           updated_at = NOW()
       WHERE booking_id = ? AND hotel_id = ?`,
      [specialRequests || null, bookingId, hotelId]
    );
    return result.affectedRows > 0;
  }

  // Cập nhật special_requests cho booking (trực tiếp, không xử lý admin note)
  async updateBookingSpecialRequests(hotelId: string, bookingId: string, specialRequests: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE booking 
       SET special_requests = ?,
           updated_at = NOW()
       WHERE booking_id = ? AND hotel_id = ?`,
      [specialRequests || null, bookingId, hotelId]
    );
    return result.affectedRows > 0;
  }

  // Lấy activity log cho booking (từ các bảng liên quan)
  async getBookingActivityLog(hotelId: string, bookingId: string): Promise<any[]> {
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
      WHERE b.booking_id = ? AND b.hotel_id = ?
      GROUP BY b.booking_id, b.status, b.created_at, b.updated_at, b.total_amount`,
      [bookingId, hotelId]
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
    
    return logs;
  }

  // Lấy tổng số booking đang chờ xác nhận trên tất cả hotels
  async getTotalPendingBookingCount(): Promise<number> {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM booking WHERE status IN ('PENDING_CONFIRMATION', 'PAID')`
    );
    return rows[0]?.total || 0;
  }

  // Lấy thống kê bookings của hotel
  async getHotelBookingStats(hotelId: string): Promise<any> {
    const [stats]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'CREATED' THEN 1 END) as created_bookings,
        COUNT(CASE WHEN status = 'PENDING_CONFIRMATION' THEN 1 END) as pending_confirmation_bookings,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'CHECKED_IN' THEN 1 END) as checked_in_bookings,
        COUNT(CASE WHEN status = 'CHECKED_OUT' THEN 1 END) as checked_out_bookings,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_bookings,
        SUM(CASE WHEN status IN ('CONFIRMED', 'PAID', 'PENDING_CONFIRMATION') THEN total_amount ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status IN ('CONFIRMED', 'PAID', 'PENDING_CONFIRMATION') THEN total_amount ELSE NULL END) as avg_booking_amount
      FROM booking
      WHERE hotel_id = ?`,
      [hotelId]
    );

    const [recentBookings]: any = await pool.query(
      `SELECT 
        b.booking_id,
        b.status,
        b.total_amount,
        b.created_at,
        a.full_name as account_name,
        a.email as account_email
      FROM booking b
      JOIN account a ON a.account_id = b.account_id
      WHERE b.hotel_id = ?
      ORDER BY b.created_at DESC
      LIMIT 10`,
      [hotelId]
    );

    return {
      ...stats[0],
      recent_bookings: recentBookings || [],
    };
  }
}

