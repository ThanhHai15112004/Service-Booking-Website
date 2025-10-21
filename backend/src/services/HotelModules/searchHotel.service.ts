import { HotelRepository } from "../../Repository/Hotel/hotel.repository";
import { HotelSearchParams } from "../../models/hotel.model";
import {
  validateHotelSearchDayuse,
  validateHotelSearchOvernight,
} from "../../utils/hotelSearch.validator";
import {
  sanitizeArrayStrings,
  sanitizeNumber,
} from "../../helpers/filter.helper";
import { evaluateChildrenPolicy } from "../../utils/occupancy.helper";
import { mapSortToSQL } from "../../helpers/sortMapping.helper";
import { normalizeString } from "../../utils/normalize.util";

export class HotelService {
  private repo = new HotelRepository();

  // 🧭 Hàm chính: xác định loại tìm kiếm
  async searchWithFilters(params: HotelSearchParams) {
    const safeParams = this.sanitizeParams(params);

    switch (safeParams.stayType) {
      case "overnight":
        return this.searchOvernight(safeParams);
      case "dayuse":
        return this.searchDayuse(safeParams);
      default:
        return {
          success: false,
          items: [],
          message: "Loại lưu trú không hợp lệ.",
        };
    }
  }

  // 🏨 Tìm kiếm khách sạn qua đêm
  private async searchOvernight(params: HotelSearchParams) {
    const validation = validateHotelSearchOvernight(params);
    if (!validation.success)
      return { success: false, items: [], message: validation.message };

    const {
      q,
      checkin,
      checkout,
      rooms,
      adults,
      children,
      childAges,
      requiredPerRoom,
      nights,
    } = validation.data!;

    const {
      price_min = 0,
      price_max = 999999999,
      star_min = 0,
      facilities = [],
      max_distance = 999,
      sort = "price_asc",
      limit = 10,
      offset = 0,
    } = params;

    // 🔧 Chuẩn hóa chuỗi tìm kiếm (bỏ dấu + lowercase)
    const normalizedQuery = normalizeString(q || "");
    const keyword = `%${normalizedQuery}%`;

    const sortSql = mapSortToSQL(sort);
    const requireChildrenAllowed = (children ?? 0) > 0;

    // 🧩 Xây SQL động cho facilities
    const facilitiesExistsSql =
      facilities.length > 0
        ? facilities
            .map(
              (_, i) =>
                `EXISTS (SELECT 1 FROM hotel_facility hf${i} 
                  WHERE hf${i}.hotel_id = h.hotel_id 
                  AND hf${i}.facility_id = ?)`
            )
            .join(" AND ")
        : "";

    // 🧠 SQL chính
    const sql = `
      WITH agg AS (
        SELECT 
          rps.room_id,
          COUNT(DISTINCT rps.date) AS days_count,
          MIN(rps.available_rooms) AS min_avail,
          SUM(rps.base_price * (1 - rps.discount_percent / 100)) AS sum_price
        FROM room_price_schedule rps
        WHERE rps.date >= ? AND rps.date < ?
        GROUP BY rps.room_id
      ),
      eligible AS (
        SELECT 
          r.hotel_id,
          r.room_id,
          rt.room_type_id,
          rt.name AS room_name,
          r.capacity,
          a.min_avail,
          a.sum_price,
          COALESCE(rp.children_allowed, 1) AS children_allowed,
          COALESCE(rp.free_child_age_limit, 6) AS free_child_age_limit,
          COALESCE(rp.adult_age_threshold, 12) AS adult_age_threshold,
          COALESCE(rp.extra_bed_fee, 0) AS extra_bed_fee
        FROM room r
        JOIN agg a ON a.room_id = r.room_id
        JOIN room_type rt ON rt.room_type_id = r.room_type_id
        LEFT JOIN room_policy rp ON rp.room_id = r.room_id
        WHERE r.status = 'ACTIVE'
          AND a.days_count = ?
          AND a.min_avail >= ?
          AND r.capacity >= ?
          ${requireChildrenAllowed ? "AND COALESCE(rp.children_allowed, 1) = 1" : ""}
      ),
      best AS (
        SELECT e.*, ROW_NUMBER() OVER (PARTITION BY e.hotel_id ORDER BY e.sum_price ASC) AS rn
        FROM eligible e
      )
      SELECT 
        h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
        hl.city, hl.district, hl.area_name, hl.distance_center,
        b.room_type_id, b.room_name, b.capacity, b.min_avail AS available_rooms,
        b.children_allowed, b.free_child_age_limit, b.adult_age_threshold, b.extra_bed_fee,
        (b.sum_price * ?) AS total_price,
        (b.sum_price / ?) AS avg_price_per_night
      FROM best b
      JOIN hotel h ON h.hotel_id = b.hotel_id AND h.status = 'ACTIVE'
      JOIN hotel_location hl ON hl.location_id = h.location_id
      WHERE b.rn = 1
        AND (
          LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE ? OR
          LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE ? OR
          LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE ?
        )
        AND h.star_rating >= ?
        AND hl.distance_center <= ?
        ${facilitiesExistsSql ? `AND ${facilitiesExistsSql}` : ""}
        AND (b.sum_price / ?) BETWEEN ? AND ?
      ${sortSql}
      LIMIT ? OFFSET ?;
    `;

    const values = [
      checkin,
      checkout,
      nights,
      rooms,
      requiredPerRoom,
      rooms,
      nights,
      keyword,
      keyword,
      keyword,
      star_min,
      max_distance,
      ...(facilities.length > 0 ? facilities : []),
      nights,
      price_min,
      price_max,
      limit,
      offset,
    ];

    const resultRows = await this.repo.searchOvernight(params, sql, values);

    // 🧾 Map kết quả
    const items = resultRows.map((r: any) => {
      const policy = {
        childrenAllowed: !!r.children_allowed,
        freeChildAgeLimit: Number(r.free_child_age_limit ?? 6),
        adultAgeThreshold: Number(r.adult_age_threshold ?? 12),
        extraBedFee: Number(r.extra_bed_fee ?? 0),
      };

      const childPolicy = evaluateChildrenPolicy(
        Array.isArray(childAges) ? childAges : [],
        policy,
        nights ?? 1
      );

      const totalPriceBase = Number(r.total_price);
      const extraChildFee = childPolicy.allowed ? childPolicy.extraFeeTotal : 0;
      const finalTotalPrice = totalPriceBase + extraChildFee;

      return {
        hotelId: r.hotel_id,
        name: r.name,
        starRating: Number(r.star_rating),
        avgRating: Number(r.avg_rating),
        reviewCount: Number(r.review_count),
        mainImage: r.main_image,
        location: {
          city: r.city,
          district: r.district,
          areaName: r.area_name,
          distanceCenter: Number(r.distance_center),
        },
        bestOffer: {
          stayType: "overnight",
          nights,
          rooms,
          adults,
          children,
          roomTypeId: r.room_type_id,
          roomName: r.room_name,
          availableRooms: Number(r.available_rooms),
          totalPrice: totalPriceBase,
          avgPricePerNight: Number(r.avg_price_per_night),
          extraChildFee,
          finalTotalPrice,
          childrenPolicy: { ...policy, result: childPolicy },
        },
      };
    });

    return { success: true, items };
  }

  // 🕒 Tìm kiếm khách sạn theo giờ (dayuse)
  private async searchDayuse(params: HotelSearchParams) {
    const validation = validateHotelSearchDayuse(params);
    if (!validation.success)
      return { success: false, items: [], message: validation.message };

    // Giữ nguyên logic cũ hoặc reuse searchOvernight nếu cấu trúc tương tự
    // (tùy bạn muốn viết riêng hoặc reuse)
    return { success: true, items: [] };
  }

  // 🧹 Chuẩn hóa dữ liệu đầu vào
  private sanitizeParams(params: HotelSearchParams): HotelSearchParams {
    return {
      ...params,
      q: String(params.q || "").slice(0, 120),
      price_min: sanitizeNumber(params.price_min, 0, 0),
      price_max: sanitizeNumber(params.price_max, 999999999, 0),
      star_min: sanitizeNumber(params.star_min, 0, 0, 5),
      max_distance: sanitizeNumber(params.max_distance, 999, 0),
      limit: sanitizeNumber(params.limit, 10, 1, 100),
      offset: sanitizeNumber(params.offset, 0, 0),
      facilities: sanitizeArrayStrings(params.facilities, 50),
    };
  }
}
