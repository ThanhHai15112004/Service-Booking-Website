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
    
    console.log('🔍 SQL Query:', sql);
    console.log('📦 Values:', values);
    
    try {
      const rows = await this.query(sql, values);
      console.log(`✅ Rows found: ${rows.length}`);
      
      const results = this.mapResults(rows, params);
      
      // Fetch images and facilities for all hotels
      await this.attachImagesToResults(results);
      await this.attachFacilitiesToResults(results);
      
      return results;
    } catch (error) {
      console.error('❌ SQL Error:', error);
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
            JOIN room_policy rp ON rp.room_id = rm.room_id
            WHERE rm.hotel_id = h.hotel_id AND rp.${policy} = 1
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
}