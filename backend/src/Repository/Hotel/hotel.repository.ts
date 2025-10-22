import pool from "../../config/db";
import { mapSortToSQL } from "../../helpers/sortMapping.helper";
import { HotelSearchParams, HotelSearchResult } from "../../models/Hotel/hotel.model";

// interface hỗ trợ
interface OfferContext {
  stayType: "overnight" | "dayuse";
  nights: number;
  rooms: number;
  adults: number;
  children: number;
}

interface PreparedParams {
  checkin: string | undefined;
  checkout: string | undefined;
  rooms: number;
  adults: number;
  children: number;
  star_min: number;
  facilities: string[];
  max_distance: number;
  limit: number;
  offset: number;
  keyword: string;
  sortSql: string;
  facilitiesSql: string;
  nights: number;
}

// hotel search repository base class
export abstract class HotelSearchRepository {
  protected async query<T = any>(sql: string, values: any[]): Promise<T[]> {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, values);
      return rows as T[];
    } finally {
      conn.release();
    }
  }

  protected buildFacilitySql(facilities: string[]): string {
    if (!facilities?.length) return "";
    return facilities
      .map(
        (_, i) => `
          EXISTS (
            SELECT 1 FROM hotel_facility hf${i}
            WHERE hf${i}.hotel_id = h.hotel_id
            AND hf${i}.facility_id = ?
          )`
      )
      .join(" AND ");
  }

  protected mapRowToResult(r: any, ctx: OfferContext): HotelSearchResult {
    return {
      hotelId: r.hotel_id,
      name: r.name,
      starRating: Number(r.star_rating ?? 0),
      avgRating: Number(r.avg_rating ?? 0),
      reviewCount: Number(r.review_count ?? 0),
      mainImage: r.main_image,
      location: {
        city: r.city,
        district: r.district ?? null,
        areaName: r.area_name ?? null,
        distanceCenter:
          r.distance_center != null ? Number(r.distance_center) : null,
      },
      bestOffer: {
        stayType: ctx.stayType,
        nights: ctx.nights,
        rooms: ctx.rooms,
        adults: ctx.adults,
        children: ctx.children,
        roomTypeId: r.room_type_id,
        roomName: r.room_name,
        capacity: Number(r.capacity ?? 0),
        availableRooms: 0,
        totalPrice: Number(r.total_price ?? 0),
        avgPricePerNight: Number(r.avg_price_per_night ?? 0),
        refundable: Boolean(r.refundable),
        payLater: Boolean(r.pay_later),
      },
    };
  }

  abstract search(params: HotelSearchParams): Promise<HotelSearchResult[]>;
}


// overnight search repository
export class OvernightSearchRepository extends HotelSearchRepository {
  async search(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    const prepared = this.prepareParams(params);
    const sql = this.buildSql(prepared.facilitiesSql, prepared.sortSql);
    const values = this.buildValues(prepared);
    const rows = await this.query(sql, values);
    return this.mapResults(rows, prepared);
  }

  private prepareParams(params: HotelSearchParams): PreparedParams {
    const {
      q = "",
      checkin,
      checkout,
      rooms = 1,
      adults = 1,
      children = 0,
      star_min = 0,
      facilities = [],
      max_distance = 999,
      sort = "price_asc",
      limit = 10,
      offset = 0,
    } = params;

    const keyword = `%${q.trim().toLowerCase()}%`;
    const sortSql = mapSortToSQL(sort);
    const facilitiesSql = this.buildFacilitySql(facilities);

    const nights =
      Math.max(
        1,
        Math.ceil(
          (new Date(checkout!).getTime() - new Date(checkin!).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      ) || 1;

    return {
      checkin,
      checkout,
      rooms,
      adults,
      children,
      star_min,
      facilities,
      max_distance,
      limit,
      offset,
      keyword,
      sortSql,
      facilitiesSql,
      nights,
    };
  }

  private buildSql(facilitiesSql: string, sortSql: string): string {
    return `
      WITH cheapest AS (
        SELECT 
          r.hotel_id,
          r.room_id,
          r.room_type_id,
          r.capacity,
          AVG(rps.base_price * (1 - rps.discount_percent / 100)) AS price_base,
          MAX(rps.refundable) AS refundable,
          MAX(rps.pay_later) AS pay_later,
          ROW_NUMBER() OVER (PARTITION BY r.hotel_id ORDER BY AVG(rps.base_price) ASC) AS rn
        FROM room r
        JOIN room_price_schedule rps ON rps.room_id = r.room_id
        WHERE r.status = 'ACTIVE' AND rps.date BETWEEN ? AND ?
        GROUP BY r.hotel_id, r.room_id, r.room_type_id, r.capacity
      )
      SELECT
        h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
        hl.city, hl.district, hl.area_name, hl.distance_center,
        c.room_type_id, rt.name AS room_name, c.capacity,
        (c.price_base * ? * ?) AS total_price,
        c.price_base AS avg_price_per_night,
        c.refundable, c.pay_later
      FROM cheapest c
      JOIN hotel h ON h.hotel_id = c.hotel_id
      JOIN hotel_location hl ON hl.location_id = h.location_id
      JOIN room_type rt ON rt.room_type_id = c.room_type_id
      WHERE c.rn = 1
        AND (
          LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
        )
        AND h.star_rating >= ?
        AND hl.distance_center <= ?
        ${facilitiesSql ? `AND ${facilitiesSql}` : ""}
      ${sortSql}
      LIMIT ? OFFSET ?;
    `;
  }

  private buildValues(p: PreparedParams): any[] {
    return [
      p.checkin,
      p.checkout,
      p.rooms,
      p.nights,
      p.keyword,
      p.keyword,
      p.keyword,
      p.star_min,
      p.max_distance,
      ...(p.facilities.length ? p.facilities : []),
      p.limit,
      p.offset,
    ];
  }

  private mapResults(rows: any[], p: PreparedParams): HotelSearchResult[] {
    return rows.map((r) =>
      this.mapRowToResult(r, {
        stayType: "overnight",
        nights: p.nights,
        rooms: p.rooms,
        adults: p.adults,
        children: p.children,
      })
    );
  }
}


// dayuse search repository
export class DayuseSearchRepository extends HotelSearchRepository {
  async search(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    const prepared = this.prepareParams(params);
    const sql = this.buildSql(prepared.facilitiesSql, prepared.sortSql);
    const values = this.buildValues(prepared);
    const rows = await this.query(sql, values);
    return this.mapResults(rows, prepared);
  }

  private prepareParams(params: HotelSearchParams): PreparedParams {
    const {
      q = "",
      date,
      rooms = 1,
      adults = 1,
      children = 0,
      star_min = 0,
      facilities = [],
      max_distance = 999,
      sort = "price_asc",
      limit = 10,
      offset = 0,
    } = params;

    const keyword = `%${q.trim().toLowerCase()}%`;
    const sortSql = mapSortToSQL(sort);
    const facilitiesSql = this.buildFacilitySql(facilities);

    const nights = 1;
    const checkin = date;
    const checkout = date;

    return {
      checkin,
      checkout,
      rooms,
      adults,
      children,
      star_min,
      facilities,
      max_distance,
      limit,
      offset,
      keyword,
      sortSql,
      facilitiesSql,
      nights,
    };
  }

  private buildSql(facilitiesSql: string, sortSql: string): string {
    return `
      WITH cheapest AS (
        SELECT 
          r.hotel_id,
          r.room_id,
          r.room_type_id,
          r.capacity,
          AVG(rps.base_price * (1 - rps.discount_percent / 100)) AS price_base,
          MAX(rps.refundable) AS refundable,
          MAX(rps.pay_later) AS pay_later,
          ROW_NUMBER() OVER (PARTITION BY r.hotel_id ORDER BY AVG(rps.base_price) ASC) AS rn
        FROM room r
        JOIN room_price_schedule rps ON rps.room_id = r.room_id
        WHERE r.status = 'ACTIVE' AND rps.date = ?
        GROUP BY r.hotel_id, r.room_id, r.room_type_id, r.capacity
      )
      SELECT
        h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
        hl.city, hl.district, hl.area_name, hl.distance_center,
        c.room_type_id, rt.name AS room_name, c.capacity,
        (c.price_base * ?) AS total_price,
        c.price_base AS avg_price_per_night,
        c.refundable, c.pay_later
      FROM cheapest c
      JOIN hotel h ON h.hotel_id = c.hotel_id
      JOIN hotel_location hl ON hl.location_id = h.location_id
      JOIN room_type rt ON rt.room_type_id = c.room_type_id
      WHERE c.rn = 1
        AND (
          LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE ?
          OR LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
        )
        AND h.star_rating >= ?
        AND hl.distance_center <= ?
        ${facilitiesSql ? `AND ${facilitiesSql}` : ""}
      ${sortSql}
      LIMIT ? OFFSET ?;
    `;
  }

  private buildValues(p: PreparedParams): any[] {
    return [
      p.checkin,
      p.rooms,
      p.keyword,
      p.keyword,
      p.keyword,
      p.star_min,
      p.max_distance,
      ...(p.facilities.length ? p.facilities : []),
      p.limit,
      p.offset,
    ];
  }

  private mapResults(rows: any[], p: PreparedParams): HotelSearchResult[] {
    return rows.map((r) =>
      this.mapRowToResult(r, {
        stayType: "dayuse",
        nights: 1,
        rooms: p.rooms,
        adults: p.adults,
        children: p.children,
      })
    );
  }
}
