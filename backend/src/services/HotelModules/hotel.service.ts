import { ChildrenPolicy } from './../../utils/occupancy.helper';
import pool from "../../config/db";
import { mapSortToSQL } from "../../helpers/sortMapping.helper";
import { HotelSearchParams } from "../../models/hotel.model";
import { validateHotelSearchDayuse, validateHotelSearchOvernight } from "../../utils/hotelSearch.validator";
import { evaluateChildrenPolicy } from "../../utils/occupancy.helper";



export async function searchHotelsWithFilters(params: HotelSearchParams) {
    const {stayType} = params;

    if(stayType === "overnight"){
        return await searchHotelsOvernight(params);
    }else if(stayType === "dayuse"){
        return await searchHotelsDayuse(params);
    }

    return {succes: false, message: "Loại hình lưu trú không hợp lệ."};
}

// Tìm kiếm khách sạn qua đêm
export async function searchHotelsOvernight(params: HotelSearchParams) {
  const validation = validateHotelSearchOvernight(params);
  if (!validation.success) {
    return { success: false, items: [], message: validation.message };
  }

  const {
    q, checkin, checkout, rooms, adults, children, childAges,
    requiredPerRoom, nights,
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

  const sortSql = mapSortToSQL(sort);
  const keyword = `%${q.toLowerCase()}%`;

  const conn = await pool.getConnection();
  try {
    const facilitiesExistsSql =
      facilities && facilities.length > 0
        ? facilities.map((_, i) =>
            `EXISTS (SELECT 1 FROM hotel_facility hf${i} WHERE hf${i}.hotel_id = h.hotel_id AND hf${i}.facility_id = ?)`
          ).join(" AND ")
        : "";

    const requireChildrenAllowed = (children ?? 0) > 0;

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
        SELECT
          e.*,
          ROW_NUMBER() OVER (PARTITION BY e.hotel_id ORDER BY e.sum_price ASC) AS rn
        FROM eligible e
      )
      SELECT
        h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
        hl.city, hl.district, hl.area_name, hl.distance_center,
        b.room_type_id, b.room_name, b.capacity,
        b.min_avail AS available_rooms,
        b.children_allowed, b.free_child_age_limit, b.adult_age_threshold, b.extra_bed_fee,
        (b.sum_price * ?) AS total_price,
        (b.sum_price / ?) AS avg_price_per_night
      FROM best b
      JOIN hotel h ON h.hotel_id = b.hotel_id AND h.status = 'ACTIVE'
      JOIN hotel_location hl ON hl.location_id = h.location_id
      WHERE b.rn = 1
        AND (LOWER(hl.city) LIKE ? OR LOWER(hl.district) LIKE ? OR LOWER(hl.area_name) LIKE ?)
        AND h.star_rating >= ?
        AND hl.distance_center <= ?
        ${facilitiesExistsSql ? `AND ${facilitiesExistsSql}` : ""}
        AND (b.sum_price / ?) BETWEEN ? AND ?
      ${sortSql}
      LIMIT ? OFFSET ?;
    `;

    const values: any[] = [
      checkin, checkout,
      nights, rooms, requiredPerRoom,
      rooms, nights,
      keyword, keyword, keyword,
      star_min, max_distance,
      ...(facilities && facilities.length > 0 ? facilities : []),
      nights, price_min, price_max,
      limit, offset,
    ];

    const [rows] = await conn.query(sql, values);
    const resultRows = rows as any[];

    const items = resultRows.map((r) => {
      // Tính phí trẻ em/giường phụ theo policy
      const policy = {
        childrenAllowed: !!r.children_allowed,
        freeChildAgeLimit: Number(r.free_child_age_limit ?? 6),
        adultAgeThreshold: Number(r.adult_age_threshold ?? 12),
        extraBedFee: Number(r.extra_bed_fee ?? 0),
      };

      const childAgesArr = Array.isArray(childAges) ? childAges : [];
      const childPolicy = evaluateChildrenPolicy(childAgesArr, policy, nights);

      // Tổng giá cuối cùng = base + phí trẻ em
      const totalPriceBase = Number(r.total_price);
      const extraChildFee = childPolicy.allowed ? childPolicy.extraFeeTotal : 0;
      const finalTotalPrice = totalPriceBase + extraChildFee;

      return {
        hotelId: r.hotel_id,
        name: r.name,
        starRating: r.star_rating ? Number(r.star_rating) : null,
        avgRating: r.avg_rating ? Number(r.avg_rating) : null,
        reviewCount: r.review_count ? Number(r.review_count) : null,
        mainImage: r.main_image || null,
        location: {
          city: r.city,
          district: r.district,
          areaName: r.area_name,
          distanceCenter: r.distance_center != null ? Number(r.distance_center) : null,
        },
        bestOffer: {
          stayType: "overnight",
          nights,
          rooms,
          adults: adults ?? 1,
          children: children ?? 0,
          roomTypeId: r.room_type_id,
          roomName: r.room_name,
          capacity: r.capacity ? Number(r.capacity) : undefined,
          availableRooms: r.available_rooms ? Number(r.available_rooms) : 0,
          totalPrice: totalPriceBase,
          avgPricePerNight: Number(r.avg_price_per_night),
          // Thông tin children policy để FE hiển thị
          childrenPolicy: {
            ...policy,
            result: childPolicy,
          },
          // Giá cuối cùng sau khi cộng phí trẻ em
          extraChildFee,
          finalTotalPrice,
        },
      };
    });

    // Lưu ý: sort trong SQL hiện sắp theo base price.
    // Nếu muốn sắp theo finalTotalPrice (đã cộng phí trẻ), cần sort lại ở Node:
    // items.sort((a, b) => a.bestOffer.finalTotalPrice - b.bestOffer.finalTotalPrice);

    return { success: true, items };
  } catch (err) {
    console.error("❌ searchHotelsOvernight error:", err);
    return { success: false, items: [], message: "Lỗi tìm kiếm khách sạn (overnight)." };
  } finally {
    conn.release();
  }
}

// Tìm kiếm khách sạn trong ngày
export async function searchHotelsDayuse(params: HotelSearchParams) {
    // validation
    const validation = validateHotelSearchDayuse(params);
    if(!validation.success){
        return {success: false, items: [], message: validation.message};
    }

    const {
        q, checkin: date, rooms, adults, children, childAges,
        requiredPerRoom, nights,
    } = validation.data!;

    //filter
    const{
        price_min = 0,
        price_max = 999999999,
        star_min = 0,
        facilities = [],
        max_distance = 999,
        sort = "price_asc",
        limit = 10,
        offset = 0,
    } = params;

    const sortSql = mapSortToSQL(sort);
    const keyword = `%${q.toLowerCase()}%`;
    const requireChildrenAllowed = (children ?? 0) > 0;

    const conn = await pool.getConnection();
    try {
        const facilitiesExistsSql =
            facilities && facilities.length > 0
                ? facilities
                    .map((_, i) =>
              `EXISTS (SELECT 1 FROM hotel_facility hf${i} WHERE hf${i}.hotel_id = h.hotel_id AND hf${i}.facility_id = ?)`
            )
            .join(" AND ")
        : "";
        
        // sql dayuse
        const sql = `
            WITH day_price AS (
                SELECT
                rps.room_id,
                MIN(rps.available_rooms) AS min_avail,
                (rps.base_price * (1 - rps.discount_percent / 100)) AS day_price,
                rps.refundable,
                rps.pay_later
                FROM room_price_schedule rps
                WHERE rps.date = ?
                GROUP BY rps.room_id, rps.base_price, rps.discount_percent, rps.refundable, rps.pay_later
            ),
            eligible AS (
                SELECT
                r.hotel_id,
                r.room_id,
                rt.room_type_id,
                rt.name AS room_name,
                r.capacity,
                d.min_avail,
                d.day_price,
                d.refundable,
                d.pay_later,
                COALESCE(rp.children_allowed, 1) AS children_allowed,
                COALESCE(rp.free_child_age_limit, 6) AS free_child_age_limit,
                COALESCE(rp.adult_age_threshold, 12) AS adult_age_threshold,
                COALESCE(rp.extra_bed_fee, 0) AS extra_bed_fee
                FROM room r
                JOIN day_price d ON d.room_id = r.room_id
                JOIN room_type rt ON rt.room_type_id = r.room_type_id
                LEFT JOIN room_policy rp ON rp.room_id = r.room_id
                WHERE r.status = 'ACTIVE'
                AND d.min_avail >= ?
                AND r.capacity >= ?
                ${requireChildrenAllowed ? "AND COALESCE(rp.children_allowed, 1) = 1" : ""}
            ),
            best AS (
                SELECT
                e.*,
                ROW_NUMBER() OVER (PARTITION BY e.hotel_id ORDER BY e.day_price ASC) AS rn
                FROM eligible e
            )
            SELECT
                h.hotel_id, h.name, h.star_rating, h.avg_rating, h.review_count, h.main_image,
                hl.city, hl.district, hl.area_name, hl.distance_center,
                b.room_type_id, b.room_name, b.capacity,
                b.min_avail AS available_rooms,
                b.children_allowed, b.free_child_age_limit, b.adult_age_threshold, b.extra_bed_fee,
                (b.day_price * ?) AS total_price,   -- tổng cho N phòng
                b.day_price                          AS unit_price
            FROM best b
            JOIN hotel h ON h.hotel_id = b.hotel_id AND h.status = 'ACTIVE'
            JOIN hotel_location hl ON hl.location_id = h.location_id
            WHERE b.rn = 1
                AND (LOWER(hl.city) LIKE ? OR LOWER(hl.district) LIKE ? OR LOWER(hl.area_name) LIKE ?)
                AND h.star_rating >= ?
                AND hl.distance_center <= ?
                ${facilitiesExistsSql ? `AND ${facilitiesExistsSql}` : ""}
                AND b.day_price BETWEEN ? AND ?
            ${sortSql}
            LIMIT ? OFFSET ?;
            `;

            const values: any[] = [
                date,
                rooms,
                requiredPerRoom,
                rooms,
                keyword, keyword, keyword,
                star_min,
                max_distance,
                ...(facilities && facilities.length > 0 ? facilities : []),
                price_min, price_max,
                limit, offset,
            ];

            const [rows] = await conn.query(sql, values);
            const resultRows = rows as any[];

            //Post-process: children policy + tổng giá cuối
            const items = resultRows.map((r) => {
                const policty = {
                    childrenAllowed: !!r.children_allowed,
                    freeChildAgeLimit: Number(r.free_child_age_limit ?? 6),
                    adultAgeThreshold: Number(r.adult_age_threshold ?? 12),
                    extraBedFee: Number(r.extra_bed_fee ?? 0),
                };

                const childAgesArr = Array.isArray(childAges) ? childAges : [];
                const childPolicy = evaluateChildrenPolicy(childAgesArr, policty, nights);
                
                const totalPriceBase = Number(r.total_price);
                const extraChildFee = childPolicy.allowed ? childPolicy.extraFeeTotal : 0;
                const finalTotalPrice = totalPriceBase + extraChildFee;

                return {
                    hotelId: r.hotel_id,
                    name: r.name,
                    starRating: r.star_rating ? Number(r.star_rating) : null,
                    avgRating: r.avg_rating ? Number(r.avg_rating) : null,
                    reviewCount: r.review_count ? Number(r.review_count) : null,
                    mainImage: r.main_image || null,
                    location: {
                        city: r.city,
                        district: r.district,
                        areaName: r.area_name,
                        distanceCenter: r.distance_center != null ? Number(r.distance_center) : null,
                    },
                    bestOffer: {
                        stayType: "dayuse",
                        nights,
                        date, 
                        adults: adults ?? 1,
                        children: children ?? 0,
                        roomTypeId: r.room_type_id,
                        roomName: r.room_name,
                        capacity: r.capacity ? Number(r.capacity) : undefined,
                        availableRooms: r.available_rooms ? Number(r.available_rooms) : 0,
                        totalPrice: totalPriceBase,
                        pricePerUnit: Number(r.unit_price),
                        ChildrenPolicy: {
                            ...policty,
                            result: childPolicy,
                        },
                        extraChildFee,
                        finalTotalPrice,
                    },
                };
            });
    } catch (err) {
        console.error("Tìm kiếm khách sạn (day-use) lỗi:", err);
        return { success: false, items: [], message: "Lỗi tìm kiếm khách sạn (day-use)." };
    } finally {
        conn.release();
    }
}