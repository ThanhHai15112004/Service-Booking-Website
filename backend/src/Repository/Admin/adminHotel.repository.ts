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
        COUNT(DISTINCT b.booking_id) as booking_count
      FROM hotel h
      LEFT JOIN hotel_category c ON h.category_id = c.category_id
      LEFT JOIN hotel_location l ON h.location_id = l.location_id
      LEFT JOIN booking b ON b.hotel_id = h.hotel_id AND b.status IN ('CONFIRMED', 'COMPLETED')
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

    query += ` GROUP BY h.hotel_id`;

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
}

