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
    
    console.log("🔍 [Repository] SQL Query:");
    console.log(sql);
    console.log("📌 [Repository] Query Values:", values);
        
    const rows = await this.query(sql, values);
    
    console.log("📊 [Repository] Raw rows count:", rows.length);
    console.log("📊 [Repository] Raw rows:", rows);
    
    return this.mapResults(rows, params);
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

    console.log("📋 [buildSearchQuery] stayType:", isOvernight ? "overnight" : "dayuse");
    console.log("📋 [buildSearchQuery] nights:", nights);
    console.log("📋 [buildSearchQuery] rooms:", rooms);
    console.log("📋 [buildSearchQuery] checkinDate:", checkinDate);
    console.log("📋 [buildSearchQuery] checkoutDateStr:", checkoutDateStr);
    console.log("📋 [buildSearchQuery] filters.conditions:", filters.conditions);
    console.log("📋 [buildSearchQuery] filters.values:", filters.values);

    const sql = `
      SELECT
        h.hotel_id,
        h.name,
        h.star_rating,
        h.avg_rating,
        h.review_count,
        h.main_image,
        hl.city,
        hl.district,
        hl.area_name,
        hl.distance_center,
        rt.room_type_id,
        rt.name AS room_name,
        r.room_id,
        r.capacity,
        SUM(rps.base_price * (1 - rps.discount_percent / 100)) as sum_price,
        COUNT(DISTINCT CAST(rps.date AS DATE)) as date_count,
        MAX(rps.refundable) AS refundable,
        MAX(rps.pay_later) AS pay_later
      FROM hotel h
      JOIN hotel_location hl ON hl.location_id = h.location_id
      JOIN room_type rt ON rt.hotel_id = h.hotel_id
      JOIN room r ON r.room_type_id = rt.room_type_id
      JOIN room_price_schedule rps ON rps.room_id = r.room_id
      WHERE r.status = 'ACTIVE' 
        AND CAST(rps.date AS DATE) >= ?
        AND CAST(rps.date AS DATE) < ?
        AND rps.available_rooms > 0
        ${filters.conditions.length > 0 ? 'AND ' + filters.conditions.join(' AND ') : ''}
      GROUP BY h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
               hl.city, hl.district, hl.area_name, hl.distance_center,
               rt.room_type_id, rt.name,
               r.room_id, r.capacity
      HAVING COUNT(DISTINCT CAST(rps.date AS DATE)) >= ?
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const finalValues = [
      checkinDate,
      checkoutDateStr,
      ...filters.values,
      nights,
      limit,
      offset
    ];

    return { sql, values: finalValues };
  }

  private buildFilters(params: HotelSearchParams): SearchFilter {
    const conditions: string[] = [];
    const values: any[] = [];

    console.log("🔧 [buildFilters] Input params:", {
      q: params.q,
      star_min: params.star_min,
      max_distance: params.max_distance,
      category_id: params.category_id,
      facilities: params.facilities,
      bed_types: params.bed_types,
      policies: params.policies,
    });

    if (params.q && params.q.trim()) {
      // Normalize keyword: replace đ/Đ → d/D, then lowercase
      const normalizedKeyword = params.q.trim()
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
      console.log("🔧 [buildFilters] Added location search for:", params.q, "→ normalized:", normalizedKeyword);
    }

    if (params.star_min && params.star_min > 0) {
      conditions.push("h.star_rating >= ?");
      values.push(params.star_min);
      console.log("🔧 [buildFilters] Added star filter >= ", params.star_min);
    }

    if (params.max_distance && params.max_distance < 999) {
      conditions.push("hl.distance_center <= ?");
      values.push(params.max_distance);
      console.log("🔧 [buildFilters] Added distance filter <= ", params.max_distance);
    }

    if (params.category_id) {
      conditions.push("h.category_id = ?");
      values.push(params.category_id);
      console.log("🔧 [buildFilters] Added category filter:", params.category_id);
    }

    if (params.facilities && params.facilities.length > 0) {
      params.facilities.forEach((facilityId) => {
        conditions.push(`EXISTS (
          SELECT 1 FROM hotel_facility hf
          WHERE hf.hotel_id = h.hotel_id AND hf.facility_id = ?
        )`);
        values.push(facilityId);
      });
      console.log("🔧 [buildFilters] Added facility filters:", params.facilities);
    }

    if (params.bed_types && params.bed_types.length > 0) {
      const bedTypePlaceholders = params.bed_types.map(() => '?').join(',');
      conditions.push(`EXISTS (
        SELECT 1 FROM room_type rtype
        WHERE rtype.hotel_id = h.hotel_id 
        AND rtype.bed_type IN (${bedTypePlaceholders})
      )`);
      values.push(...params.bed_types);
      console.log("🔧 [buildFilters] Added bed_type filters:", params.bed_types);
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
          values.push(policy);
          console.log("🔧 [buildFilters] Added policy filter:", policy);
        }
      });
    }

    console.log("🔧 [buildFilters] Final conditions count:", conditions.length);
    console.log("🔧 [buildFilters] Final values:", values);

    return { conditions, values };
  }

  private buildOrderBy(sort?: string): string {
    switch (sort) {
      case "price_asc":
        return "ORDER BY sum_price ASC";
      case "price_desc":
        return "ORDER BY sum_price DESC";
      case "star_desc":
        return "ORDER BY h.star_rating DESC";
      case "rating_desc":
        return "ORDER BY h.avg_rating DESC";
      case "distance_asc":
        return "ORDER BY hl.distance_center ASC";
      default:
        return "ORDER BY sum_price ASC";
    }
  }

  private calculateNights(checkin: string, checkout: string): number {
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = d2.getTime() - d1.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    console.log("📅 [calculateNights] checkin:", checkin, "checkout:", checkout);
    console.log("📅 [calculateNights] d1:", d1, "d2:", d2);
    console.log("📅 [calculateNights] diff (ms):", diff, "nights:", nights);
    
    return nights > 0 ? nights : 1;
  }

  private mapResults(rows: any[], params: HotelSearchParams): HotelSearchResult[] {
    const nights = params.stayType === "overnight"
      ? this.calculateNights(params.checkin!, params.checkout!)
      : 1;
    
    const rooms = params.rooms || 1;

    console.log("🔄 [mapResults] Processing", rows.length, "rows");
    console.log("🔄 [mapResults] nights:", nights, "rooms:", rooms);

    return rows.map(row => {
      const totalPrice = (row.sum_price || 0) * rooms;
      const avgPricePerNight = row.sum_price ? (row.sum_price / row.date_count) : 0;
      
      console.log(`🔄 [mapResults] Hotel ${row.hotel_id}: sum_price=${row.sum_price}, date_count=${row.date_count}, totalPrice=${totalPrice}`);
      
      return {
        hotelId: row.hotel_id,
        name: row.name,
        starRating: row.star_rating ? Number(row.star_rating) : null,
        avgRating: row.avg_rating ? Number(row.avg_rating) : null,
        reviewCount: row.review_count ? Number(row.review_count) : null,
        mainImage: row.main_image,
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
          availableRooms: 0,
          totalPrice: totalPrice ? Number(totalPrice) : 0,
          avgPricePerNight: avgPricePerNight ? Number(avgPricePerNight) : 0,
          refundable: Boolean(row.refundable),
          payLater: Boolean(row.pay_later),
        },
      };
    });
  }
}