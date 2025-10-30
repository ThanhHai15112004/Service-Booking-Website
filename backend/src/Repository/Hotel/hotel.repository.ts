// repositories/Hotel/hotel.repository.ts

import pool from "../../config/db";
import { HotelSearchParams, HotelSearchResult, SearchFilter } from "../../models/Hotel/hotel.model";

export class HotelSearchRepository {
  private async query<T = any>(sql: string, values: any[]): Promise<T[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, values);
      return rows as T[];
    } finally {
      conn.release();
    }
  }

  async search(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    const { sql, values } = this.buildSearchQuery(params);
    
    try {
      const rows = await this.query(sql, values);
      const results = this.mapResults(rows, params);
      
      await this.attachImagesToResults(results);
      await this.attachFacilitiesToResults(results);
      
      return results;
    } catch (error: any) {
      console.error('Hotel Search DB Error:', error.message);
      throw error;
    }
  }

  private async attachImagesToResults(results: HotelSearchResult[]): Promise<void> {
    if (results.length === 0) return;
    
    const hotelIds = results.map(r => r.hotelId);
    const placeholders = hotelIds.map(() => '?').join(',');
    
    const imagesSql = `
      SELECT 
        image_id as imageId,
        hotel_id as hotelId,
        image_url as imageUrl,
        is_primary as isPrimary,
        caption,
        sort_order as sortOrder
      FROM hotel_image
      WHERE hotel_id IN (${placeholders})
      ORDER BY hotel_id, sort_order ASC, is_primary DESC
    `;
    
    const images = await this.query<any>(imagesSql, hotelIds);
    
    // Group images by hotel_id
    const imagesByHotel = images.reduce((acc: any, img: any) => {
      if (!acc[img.hotelId]) acc[img.hotelId] = [];
      acc[img.hotelId].push({
        imageId: img.imageId,
        imageUrl: img.imageUrl,
        isPrimary: !!img.isPrimary,
        caption: img.caption,
        sortOrder: img.sortOrder
      });
      return acc;
    }, {});
    
    // Attach images to each result
    results.forEach(result => {
      result.images = imagesByHotel[result.hotelId] || [];
    });
  }

  private async attachFacilitiesToResults(results: HotelSearchResult[]): Promise<void> {
    if (results.length === 0) return;
    
    const hotelIds = results.map(r => r.hotelId);
    const placeholders = hotelIds.map(() => '?').join(',');
    
    const facilitiesSql = `
      SELECT 
        hf.hotel_id as hotelId,
        f.facility_id as facilityId,
        f.name,
        f.icon
      FROM hotel_facility hf
      JOIN facility f ON f.facility_id = hf.facility_id
      WHERE hf.hotel_id IN (${placeholders})
      ORDER BY hf.hotel_id, f.name ASC
    `;
    
    const facilities = await this.query<any>(facilitiesSql, hotelIds);
    
    // Group facilities by hotel_id
    const facilitiesByHotel = facilities.reduce((acc: any, fac: any) => {
      if (!acc[fac.hotelId]) acc[fac.hotelId] = [];
      acc[fac.hotelId].push({
        facilityId: fac.facilityId,
        name: fac.name,
        icon: fac.icon
      });
      return acc;
    }, {});
    
    // Attach facilities to each result
    results.forEach(result => {
      result.facilities = facilitiesByHotel[result.hotelId] || [];
    });
  }

  private buildSearchQuery(params: HotelSearchParams): { sql: string; values: any[] } {
    const isOvernight = params.stayType === "overnight";

    const nights = isOvernight 
      ? this.calculateNights(params.checkin!, params.checkout!)
      : 1;
    
    const rooms = params.rooms || 1;

    const filters = this.buildFilters(params);
    const orderBy = this.buildOrderBy(params.sort);

    const limit = params.limit || 10;
    const offset = params.offset || 0;

    // Build date range condition
    const checkinDate = isOvernight ? params.checkin : params.date;
    let checkoutDateStr: string;
    
    if (isOvernight) {
      checkoutDateStr = params.checkout!;
    } else {
      const checkoutDate = new Date(params.date!);
      checkoutDate.setDate(checkoutDate.getDate() + 1);
      checkoutDateStr = checkoutDate.toISOString().split('T')[0];
    }

    const sql = `
      SELECT
        t1.hotel_id,
        t1.name,
        t1.star_rating,
        t1.avg_rating,
        t1.review_count,
        t1.main_image,
        t1.category_name,
        t1.city,
        t1.district,
        t1.area_name,
        t1.distance_center,
        t1.room_type_id,
        t1.room_name,
        t1.room_id,
        t1.capacity,
        t1.sum_price,
        t1.original_price,
        t1.avg_discount_percent,
        t1.min_available_rooms,
        t1.date_count,
        t1.refundable,
        t1.pay_later,
        t1.free_cancellation,
        t1.no_credit_card,
        t1.pets_allowed,
        t1.children_allowed
      FROM (
        SELECT
          h.hotel_id,
          h.name,
          h.star_rating,
          h.avg_rating,
          h.review_count,
          h.main_image,
          hc.name AS category_name,
          hl.city,
          hl.district,
          hl.area_name,
          hl.distance_center,
          rt.room_type_id,
          rt.name AS room_name,
          r.room_id,
          r.capacity,
          SUM(rps.base_price * (1 - rps.discount_percent / 100)) as sum_price,
          SUM(rps.base_price) as original_price,
          AVG(rps.discount_percent) as avg_discount_percent,
          MIN(rps.available_rooms) as min_available_rooms,
          COUNT(DISTINCT CAST(rps.date AS DATE)) as date_count,
          MAX(rps.refundable) AS refundable,
          MAX(rps.pay_later) AS pay_later,
          MAX(rp.free_cancellation) AS free_cancellation,
          MAX(rp.no_credit_card) AS no_credit_card,
          MAX(rp.pets_allowed) AS pets_allowed,
          MAX(rp.children_allowed) AS children_allowed
        FROM hotel h
        JOIN hotel_location hl ON hl.location_id = h.location_id
        LEFT JOIN hotel_category hc ON hc.category_id = h.category_id
        JOIN room_type rt ON rt.hotel_id = h.hotel_id
        JOIN room r ON r.room_type_id = rt.room_type_id
        JOIN room_price_schedule rps ON rps.room_id = r.room_id
        LEFT JOIN room_policy rp ON rp.room_id = r.room_id
        WHERE r.status = 'ACTIVE' 
          AND CAST(rps.date AS DATE) >= ?
          AND CAST(rps.date AS DATE) < ?
          AND rps.available_rooms > 0
          ${filters.conditions.length > 0 ? 'AND ' + filters.conditions.join(' AND ') : ''}
        GROUP BY h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
                 hc.name, hl.city, hl.district, hl.area_name, hl.distance_center,
                 rt.room_type_id, rt.name,
                 r.room_id, r.capacity
        HAVING COUNT(DISTINCT CAST(rps.date AS DATE)) >= ?
      ) AS t1
      INNER JOIN (
        SELECT hotel_id, MIN(sum_price) as min_price
        FROM (
          SELECT
            h.hotel_id,
            SUM(rps.base_price * (1 - rps.discount_percent / 100)) as sum_price
          FROM hotel h
          JOIN room_type rt ON rt.hotel_id = h.hotel_id
          JOIN room r ON r.room_type_id = rt.room_type_id
          JOIN room_price_schedule rps ON rps.room_id = r.room_id
          WHERE r.status = 'ACTIVE' 
            AND CAST(rps.date AS DATE) >= ?
            AND CAST(rps.date AS DATE) < ?
            AND rps.available_rooms > 0
          GROUP BY h.hotel_id, r.room_id
          HAVING COUNT(DISTINCT CAST(rps.date AS DATE)) >= ?
        ) AS prices
        GROUP BY hotel_id
      ) AS t2 ON t1.hotel_id = t2.hotel_id AND t1.sum_price = t2.min_price
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const finalValues = [
      checkinDate,
      checkoutDateStr,
      ...filters.values,
      nights,
      checkinDate,
      checkoutDateStr,
      nights,
      limit,
      offset
    ];

    return { sql, values: finalValues };
  }

  private buildFilters(params: HotelSearchParams): SearchFilter {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params.q && params.q.trim()) {
      // Tách keyword thành các phần (ví dụ: "Hoàn Kiếm, Hà Nội" → ["Hoàn Kiếm", "Hà Nội"])
      const parts = params.q.trim().split(',').map(p => p.trim()).filter(Boolean);
      
      if (parts.length === 1) {
        // Search 1 keyword: tìm trong city, district, area_name, hotel.name
        const normalizedKeyword = parts[0]
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase();
        const keyword = `%${normalizedKeyword}%`;
        
        conditions.push(`(
          LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(h.name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
        )`);
        values.push(keyword, keyword, keyword, keyword);
      } else if (parts.length === 2) {
        // Search 2 keywords: part[0] là district/area, part[1] là city
        // Tìm theo (district LIKE part[0] AND city LIKE part[1]) OR (city LIKE part[0]) OR (city LIKE part[1])
        const keyword1 = `%${parts[0].replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()}%`;
        const keyword2 = `%${parts[1].replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()}%`;
        
        conditions.push(`(
          (LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE ? 
           AND LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?)
          OR (LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE ? 
              AND LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?)
          OR LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(h.name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(h.name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
        )`);
        values.push(keyword1, keyword2, keyword1, keyword2, keyword1, keyword2, keyword1, keyword2);
      } else {
        // Search nhiều keywords: tìm bất kỳ keyword nào match
        const searchConditions = [];
        for (const part of parts) {
          const keyword = `%${part.replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()}%`;
          searchConditions.push(`(
            LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?
            OR LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE ?
            OR LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          )`);
          values.push(keyword, keyword, keyword);
        }
        conditions.push(`(${searchConditions.join(' AND ')})`);
      }
    }

    if (params.star_min && params.star_min > 0) {
      conditions.push("h.star_rating >= ?");
      values.push(params.star_min);
    }

    if (params.max_distance && params.max_distance < 999) {
      conditions.push("hl.distance_center <= ?");
      values.push(params.max_distance);
    }

    if (params.category_id) {
      conditions.push("h.category_id = ?");
      values.push(params.category_id);
    }

    if (params.facilities && params.facilities.length > 0) {
      params.facilities.forEach((facilityId) => {
        conditions.push(`EXISTS (
          SELECT 1 FROM hotel_facility hf
          WHERE hf.hotel_id = h.hotel_id AND hf.facility_id = ?
        )`);
        values.push(facilityId);
      });
    }

    if (params.bed_types && params.bed_types.length > 0) {
      const bedTypePlaceholders = params.bed_types.map(() => '?').join(',');
      conditions.push(`EXISTS (
        SELECT 1 FROM room_type rtype
        WHERE rtype.hotel_id = h.hotel_id 
        AND rtype.bed_type IN (${bedTypePlaceholders})
      )`);
      values.push(...params.bed_types);
    }

    // ✅ Policies filter với whitelist
    if (params.policies && params.policies.length > 0) {
      const validPolicies = [
        'free_cancellation',
        'pay_later',
        'no_credit_card',
        'children_allowed',
        'pets_allowed'
      ];
      
      params.policies.forEach((policy) => {
        if (validPolicies.includes(policy)) {
          conditions.push(`EXISTS (
            SELECT 1 FROM room rm
            JOIN room_type rmt ON rmt.room_type_id = rm.room_type_id
            JOIN room_policy rp ON rp.room_id = rm.room_id
            WHERE rmt.hotel_id = h.hotel_id AND rp.${policy} = 1
          )`);
        }
      });
    }

    return { conditions, values };
  }

  private buildOrderBy(sort?: string): string {
    switch (sort) {
      case "price_asc":
        return "ORDER BY sum_price ASC";
      case "price_desc":
        return "ORDER BY sum_price DESC";
      case "star_desc":
        return "ORDER BY star_rating DESC";
      case "rating_desc":
        return "ORDER BY avg_rating DESC";
      case "distance_asc":
        return "ORDER BY distance_center ASC";
      default:
        return "ORDER BY sum_price ASC";
    }
  }

  private calculateNights(checkin: string, checkout: string): number {
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = d2.getTime() - d1.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  }

  private mapResults(rows: any[], params: HotelSearchParams): HotelSearchResult[] {
    const nights = params.stayType === "overnight"
      ? this.calculateNights(params.checkin!, params.checkout!)
      : 1;
    
    const rooms = params.rooms || 1;

    return rows.map(row => {
      const totalPrice = (row.sum_price || 0) * rooms;
      const avgPricePerNight = row.sum_price ? (row.sum_price / row.date_count) : 0;
      const originalPricePerNight = row.original_price ? (row.original_price / row.date_count) : 0;
      const totalOriginalPrice = (row.original_price || 0) * rooms;
      
      return {
        hotelId: row.hotel_id,
        name: row.name,
        starRating: row.star_rating ? Number(row.star_rating) : null,
        avgRating: row.avg_rating ? Number(row.avg_rating) : null,
        reviewCount: row.review_count ? Number(row.review_count) : null,
        mainImage: row.main_image,
        categoryName: row.category_name || null,
        location: {
          city: row.city,
          district: row.district || null,
          areaName: row.area_name || null,
          distanceCenter: row.distance_center ? Number(row.distance_center) : null,
        },
        bestOffer: {
          stayType: params.stayType,
          nights,
          rooms,
          adults: params.adults || 1,
          children: params.children || 0,
          roomTypeId: row.room_type_id,
          roomName: row.room_name,
          capacity: row.capacity ? Number(row.capacity) : 0,
          availableRooms: row.min_available_rooms ? Number(row.min_available_rooms) : 0,
          totalPrice: totalPrice ? Number(totalPrice) : 0,
          avgPricePerNight: avgPricePerNight ? Number(avgPricePerNight) : 0,
          originalPricePerNight: originalPricePerNight ? Number(originalPricePerNight) : 0,
          totalOriginalPrice: totalOriginalPrice ? Number(totalOriginalPrice) : 0,
          discountPercent: row.avg_discount_percent ? Number(row.avg_discount_percent) : 0,
          refundable: Boolean(row.refundable),
          payLater: Boolean(row.pay_later),
          freeCancellation: Boolean(row.free_cancellation),
          noCreditCard: Boolean(row.no_credit_card),
          petsAllowed: Boolean(row.pets_allowed),
          childrenAllowed: Boolean(row.children_allowed),
        },
      };
    });
  }

  // ============================================================================
  // HOTEL DETAIL METHODS
  // ============================================================================

  /**
   * Get hotel detail by ID with all images, facilities, and policies
   */
  async getHotelById(hotelId: string): Promise<any | null> {
    try {

      // Get basic hotel info (includes policy fields from hotel table)
      const hotelSql = `
        SELECT 
          h.hotel_id as hotelId,
          h.name,
          h.description,
          h.star_rating as starRating,
          h.avg_rating as avgRating,
          h.review_count as reviewCount,
          h.main_image as mainImage,
          h.category_id as categoryId,
          hc.name as categoryName,
          h.address,
          h.phone_number as phoneNumber,
          h.email,
          h.website,
          h.checkin_time as checkinTime,
          h.checkout_time as checkoutTime,
          h.total_rooms as totalRooms,
          hl.location_id as locationId,
          hl.city,
          hl.district,
          hl.ward,
          hl.area_name as areaName,
          hl.country,
          hl.latitude,
          hl.longitude,
          hl.distance_center as distanceCenter,
          hl.description as locationDescription
        FROM hotel h
        LEFT JOIN hotel_category hc ON hc.category_id = h.category_id
        LEFT JOIN hotel_location hl ON hl.location_id = h.location_id
        WHERE h.hotel_id = ?
      `;

      const hotels = await this.query<any>(hotelSql, [hotelId]);
      
      if (hotels.length === 0) {
        return null;
      }

      const hotel = hotels[0];

      // Get images
      const imagesSql = `
        SELECT 
          image_id as imageId,
          image_url as imageUrl,
          is_primary as isPrimary,
          caption,
          sort_order as sortOrder
        FROM hotel_image
        WHERE hotel_id = ?
        ORDER BY sort_order ASC, is_primary DESC
      `;
      const images = await this.query<any>(imagesSql, [hotelId]);

      // Get facilities
      const facilitiesSql = `
        SELECT 
          f.facility_id as facilityId,
          f.name,
          f.icon
        FROM hotel_facility hf
        JOIN facility f ON f.facility_id = hf.facility_id
        WHERE hf.hotel_id = ?
        ORDER BY f.name ASC
      `;
      const facilities = await this.query<any>(facilitiesSql, [hotelId]);

      // Get highlights - Query from hotel_highlight JOIN highlight (similar to facilities)
      const highlightsSql = `
        SELECT 
          h.highlight_id as highlightId,
          COALESCE(hh.custom_text, h.name) as text,
          h.icon_url as icon,
          h.description as tooltip,
          h.category,
          hh.sort_order as sortOrder
        FROM hotel_highlight hh
        JOIN highlight h ON h.highlight_id = hh.highlight_id
        WHERE hh.hotel_id = ?
        ORDER BY hh.sort_order ASC
      `;
      const highlights = await this.query<any>(highlightsSql, [hotelId]);
  
      // Build structured policies
      const policies = {
        checkIn: {
          from: hotel.checkinTime || '14:00',
          to: '23:59'
        },
        checkOut: {
          before: hotel.checkoutTime || '12:00'
        },
        children: 'Cho phép trẻ em ở cùng',
        cancellation: 'Miễn phí hủy trước 48 giờ',
        smoking: false,
        pets: false,
        additionalPolicies: []
      };

      // Generate badges based on rating and reviews
      const badges = this.generateBadges(hotel);

      return {
        ...hotel,
        images: images.map((img: any) => ({
          imageId: img.imageId,
          imageUrl: img.imageUrl,
          isPrimary: Boolean(img.isPrimary),
          caption: img.caption,
          sortOrder: img.sortOrder
        })),
        facilities: facilities.map((fac: any) => ({
          facilityId: fac.facilityId,
          name: fac.name,
          icon: fac.icon
        })),
        highlights: highlights.map((hl: any) => ({
          highlightId: hl.highlightId,
          icon: hl.icon,
          text: hl.text,
          tooltip: hl.tooltip,
          category: hl.category,
          sortOrder: hl.sortOrder
        })),
        badges,
        policies
      };
    } catch (error: any) {
      console.error('Get Hotel By ID DB Error:', error.message);
      throw error;
    }
  }

  /**
   * Get available rooms for a hotel within a date range
   */
  async getAvailableRoomsByHotelId(
    hotelId: string, 
    checkIn: string, 
    checkOut: string,
    adults: number = 2,
    children: number = 0,
    rooms: number = 1  // ✅ NEW: Số phòng user muốn đặt
  ): Promise<any[]> {
    try {
      const nights = this.calculateNights(checkIn, checkOut);

      // Get all rooms with their price schedule for the date range
      const sql = `
        SELECT 
          rt.room_type_id as roomTypeId,
          rt.name as roomName,
          rt.description as roomDescription,
          rt.bed_type as bedType,
          rt.area,
          rt.image_url as roomImage,
          r.room_id as roomId,
          r.capacity,
          rps.date,
          rps.base_price as basePrice,
          rps.discount_percent as discountPercent,
          rps.available_rooms as availableRooms,
          rps.refundable,
          rps.pay_later as payLater,
          rp.free_cancellation as freeCancellation,
          rp.no_credit_card as noCreditCard,
          rp.extra_bed_fee as extraBedFee,
          rp.children_allowed as childrenAllowed,
          rp.pets_allowed as petsAllowed
        FROM room_type rt
        JOIN room r ON r.room_type_id = rt.room_type_id
        JOIN room_price_schedule rps ON rps.room_id = r.room_id
        LEFT JOIN room_policy rp ON rp.room_id = r.room_id
        WHERE rt.hotel_id = ?
          AND r.status = 'ACTIVE'
          AND CAST(rps.date AS DATE) >= ?
          AND CAST(rps.date AS DATE) < ?
          AND rps.available_rooms > 0
        ORDER BY rt.room_type_id, r.room_id, rps.date
      `;

      const rows = await this.query<any>(sql, [hotelId, checkIn, checkOut]);

      // Group by room_type_id (not room_id!)
      // Vì hiển thị theo LOẠI PHÒNG, không phải từng phòng riêng lẻ
      const roomTypesMap = new Map<string, any>();
      const roomsByType = new Map<string, Set<string>>(); // Track rooms per type

      for (const row of rows) {
        const roomTypeId = row.roomTypeId;
        const roomId = row.roomId;
        const dateKey = row.date;
        
        // Initialize room type nếu chưa có
        if (!roomTypesMap.has(roomTypeId)) {
          roomTypesMap.set(roomTypeId, {
            roomTypeId: row.roomTypeId,
            roomName: row.roomName,
            roomDescription: row.roomDescription,
            bedType: row.bedType,
            area: row.area ? Number(row.area) : null,
            roomImage: row.roomImage,
            capacity: row.capacity ? Number(row.capacity) : 0,
            dailyAvailabilityByDate: new Map(), // Map<date, {totalAvailable, prices[]}>
            facilities: [],
            refundable: Boolean(row.refundable),
            payLater: Boolean(row.payLater),
            freeCancellation: Boolean(row.freeCancellation),
            noCreditCard: Boolean(row.noCreditCard),
            extraBedFee: row.extraBedFee ? Number(row.extraBedFee) : 0,
            childrenAllowed: Boolean(row.childrenAllowed),
            petsAllowed: Boolean(row.petsAllowed)
          });
          roomsByType.set(roomTypeId, new Set());
        }

        const roomType = roomTypesMap.get(roomTypeId)!;
        roomsByType.get(roomTypeId)!.add(roomId);
        
        // Aggregate availability by date
        if (!roomType.dailyAvailabilityByDate.has(dateKey)) {
          roomType.dailyAvailabilityByDate.set(dateKey, {
            date: dateKey,
            totalAvailable: 0,
            basePrice: Number(row.basePrice),
            discountPercent: Number(row.discountPercent),
            finalPrice: row.basePrice * (1 - row.discountPercent / 100)
          });
        }
        
        // Cộng dồn available_rooms của tất cả rooms cùng loại
        const dayData = roomType.dailyAvailabilityByDate.get(dateKey)!;
        dayData.totalAvailable += Number(row.availableRooms);
      }

      // Convert Map to Array và tính toán
      const availableRoomTypes: any[] = [];
      
      for (const [roomTypeId, roomType] of roomTypesMap) {
        // Convert dailyAvailabilityByDate Map to Array
        type DayAvailability = {
          date: string;
          totalAvailable: number;
          basePrice: number;
          discountPercent: number;
          finalPrice: number;
        };
        const dailyAvailability: DayAvailability[] = Array.from(roomType.dailyAvailabilityByDate.values());
        
        // Filter: Chỉ giữ room_type có đủ availability cho tất cả các ngày
        if (dailyAvailability.length < nights) {
          continue; // Skip room type này
        }
        
        // Calculate totals
        const totalPrice: number = dailyAvailability.reduce((sum: number, day) => sum + day.finalPrice, 0);
        const totalBasePrice: number = dailyAvailability.reduce((sum: number, day) => sum + day.basePrice, 0);
        const minAvailable = Math.min(...dailyAvailability.map(day => day.totalAvailable));
        const totalRooms = roomsByType.get(roomTypeId)!.size;
        
        // ✅ FIX: Tính capacity và availability với số phòng user muốn đặt
        const totalCapacity = roomType.capacity * rooms;
        const totalGuests = adults + children;
        const meetsCapacity = totalCapacity >= totalGuests;
        
        // Tính số "bộ phòng" có thể đặt (VD: user muốn 2 phòng/lần, available=5 → 2 bộ)
        const maxBookableSets = rooms > 0 ? Math.floor(minAvailable / rooms) : minAvailable;
        
        availableRoomTypes.push({
          roomTypeId: roomType.roomTypeId,
          roomName: roomType.roomName,
          roomDescription: roomType.roomDescription,
          bedType: roomType.bedType,
          area: roomType.area,
          roomImage: roomType.roomImage,
          capacity: roomType.capacity,                // Capacity per room
          totalRooms: totalRooms,                     // Tổng số rooms vật lý thuộc loại này
          minAvailable: minAvailable,                 // Min available trong các ngày
          maxBookableSets: maxBookableSets,           // ✅ NEW: Số bộ có thể đặt
          requestedRooms: rooms,                      // ✅ NEW: Số phòng user muốn đặt
          totalCapacity: totalCapacity,               // ✅ NEW: Total capacity (capacity × rooms)
          totalGuests: totalGuests,                   // ✅ NEW: Tổng số khách
          dailyAvailability: dailyAvailability,
          totalPrice: Number(totalPrice.toFixed(2)),
          avgPricePerNight: Number((totalPrice / nights).toFixed(2)),
          totalBasePrice: Number(totalBasePrice.toFixed(2)),
          hasFullAvailability: true,
          meetsCapacity: meetsCapacity,               // ✅ FIXED: capacity * rooms >= guests
          capacityWarning: !meetsCapacity ? 
            `Phòng này chỉ chứa ${roomType.capacity} người/phòng. Với ${rooms} phòng, tối đa ${totalCapacity} người.` : null,
          facilities: [],
          images: [],
          refundable: roomType.refundable,
          payLater: roomType.payLater,
          freeCancellation: roomType.freeCancellation,
          noCreditCard: roomType.noCreditCard,
          extraBedFee: roomType.extraBedFee,
          childrenAllowed: roomType.childrenAllowed,
          petsAllowed: roomType.petsAllowed
        });
      }

      // Fetch facilities và images cho room types
      if (availableRoomTypes.length > 0) {
        const roomTypeIds = availableRoomTypes.map(rt => rt.roomTypeId);
        const placeholdersType = roomTypeIds.map(() => '?').join(',');
        
        // Fetch room images (theo room_type_id)
        const imagesSql = `
          SELECT 
            ri.room_type_id as roomTypeId,
            ri.image_id as imageId,
            ri.image_url as imageUrl,
            ri.image_alt as imageAlt,
            ri.is_primary as isPrimary,
            ri.sort_order as sortOrder
          FROM room_image ri
          WHERE ri.room_type_id IN (${placeholdersType})
          ORDER BY ri.room_type_id, ri.sort_order ASC
        `;
        
        const images = await this.query<any>(imagesSql, roomTypeIds);
        
        // Group images by room_type_id
        const imagesByRoomType = images.reduce((acc: any, img: any) => {
          if (!acc[img.roomTypeId]) acc[img.roomTypeId] = [];
          acc[img.roomTypeId].push({
            imageId: img.imageId,
            imageUrl: img.imageUrl,
            imageAlt: img.imageAlt,
            isPrimary: Boolean(img.isPrimary),
            sortOrder: Number(img.sortOrder)
          });
          return acc;
        }, {});
        
        // Fetch room facilities (lấy từ bất kỳ room nào thuộc room_type)
        // Vì tất cả rooms cùng loại có cùng facilities
        const facilitiesSql = `
          SELECT DISTINCT
            rt.room_type_id as roomTypeId,
            f.facility_id as facilityId,
            f.name,
            f.icon
          FROM room_type rt
          JOIN room r ON r.room_type_id = rt.room_type_id
          JOIN room_amenity ra ON ra.room_id = r.room_id
          JOIN facility f ON f.facility_id = ra.facility_id
          WHERE rt.room_type_id IN (${placeholdersType})
          ORDER BY rt.room_type_id, f.name ASC
        `;
        
        const facilities = await this.query<any>(facilitiesSql, roomTypeIds);
        
        // Group facilities by room_type_id
        const facilitiesByRoomType = facilities.reduce((acc: any, fac: any) => {
          if (!acc[fac.roomTypeId]) acc[fac.roomTypeId] = [];
          acc[fac.roomTypeId].push({
            facilityId: fac.facilityId,
            name: fac.name,
            icon: fac.icon
          });
          return acc;
        }, {});
        
        // Attach facilities and images to room types
        availableRoomTypes.forEach(roomType => {
          roomType.images = imagesByRoomType[roomType.roomTypeId] || [];
          roomType.facilities = facilitiesByRoomType[roomType.roomTypeId] || [];
        });
      }

      // Sort by price
      availableRoomTypes.sort((a, b) => a.totalPrice - b.totalPrice);

      return availableRoomTypes;
    } catch (error: any) {
      console.error('Get Available Rooms DB Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate highlights based on facilities and hotel features
   */
  private generateHighlights(facilities: any[], hotel: any): any[] {
    const highlights: any[] = [];
    const facilityNames = facilities.map(f => f.name.toLowerCase());

    // Check for 24h reception (based on typical hotel features)
    if (facilityNames.includes('lễ tân 24 giờ') || facilityNames.includes('reception 24h')) {
      highlights.push({
        iconType: 'reception',
        text: 'Lễ tân phục vụ [24 giờ]',
        tooltip: 'Quầy lễ tân phục vụ 24/7'
      });
    }

    // Check for WiFi
    if (facilityNames.some(f => f.includes('wifi') || f.includes('wi-fi'))) {
      highlights.push({
        iconType: 'wifi',
        text: 'Wi-Fi miễn phí trong tất cả các phòng!',
        tooltip: 'Tốc độ cao, ổn định'
      });
    }

    // Check for parking
    if (facilityNames.some(f => f.includes('bãi đỗ xe') || f.includes('parking'))) {
      highlights.push({
        iconType: 'parking',
        text: 'Bãi đỗ xe miễn phí',
        tooltip: 'Chỗ đỗ xe rộng rãi'
      });
    }

    // Check for pool
    if (facilityNames.some(f => f.includes('bể bơi') || f.includes('pool'))) {
      highlights.push({
        iconType: 'pool',
        text: 'Bể bơi',
        tooltip: 'Bể bơi ngoài trời/trong nhà'
      });
    }

    // Check for restaurant
    if (facilityNames.some(f => f.includes('nhà hàng') || f.includes('restaurant'))) {
      highlights.push({
        iconType: 'restaurant',
        text: 'Nhà hàng',
        tooltip: 'Ẩm thực đa dạng'
      });
    }

    // Check for gym
    if (facilityNames.some(f => f.includes('phòng gym') || f.includes('fitness'))) {
      highlights.push({
        iconType: 'gym',
        text: 'Phòng tập gym',
        tooltip: 'Trang thiết bị hiện đại'
      });
    }

    // Check for spa
    if (facilityNames.some(f => f.includes('spa'))) {
      highlights.push({
        iconType: 'spa',
        text: 'Spa',
        tooltip: 'Dịch vụ massage và spa'
      });
    }

    return highlights;
  }

  /**
   * Generate badges based on hotel rating and reviews
   */
  private generateBadges(hotel: any): any[] {
    const badges: any[] = [];

    // Top rated badge
    if (hotel.avgRating >= 4.5 && hotel.reviewCount >= 100) {
      badges.push({
        type: 'top_rated',
        label: 'Đánh giá cao',
        color: '#10b981'
      });
    }

    // Popular badge
    if (hotel.reviewCount >= 500) {
      badges.push({
        type: 'popular',
        label: 'Phổ biến',
        color: '#3b82f6'
      });
    }

    // Best value badge
    if (hotel.avgRating >= 4.0 && hotel.starRating >= 3) {
      badges.push({
        type: 'best_value',
        label: 'Đáng giá',
        color: '#f59e0b'
      });
    }

    // New badge (created within last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (hotel.createdAt && new Date(hotel.createdAt) > sixMonthsAgo) {
      badges.push({
        type: 'new',
        label: 'Mới',
        color: '#8b5cf6'
      });
    }

    return badges;
  }
}