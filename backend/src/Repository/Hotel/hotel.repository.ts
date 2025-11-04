import sequelize from "../../config/sequelize";
import { Op, Sequelize, fn, col, literal, where, cast, QueryTypes } from "sequelize";
import { Hotel } from "../../models/Hotel/hotel.model";
import { HotelImage } from "../../models/Hotel/hotelImage.model";
import { HotelFacility } from "../../models/Hotel/hotelFacility.model";
import { Facility } from "../../models/Hotel/facility.model";
import { Category } from "../../models/Hotel/category.model";
import { Location } from "../../models/Hotel/location.model";
import { RoomType } from "../../models/Hotel/roomType.model";
import { Room } from "../../models/Hotel/room.model";
import { RoomPriceSchedule } from "../../models/Hotel/roomPriceSchedule.model";
import { RoomPolicy } from "../../models/Hotel/roomPolicy.model";
import { RoomImage } from "../../models/Hotel/roomImage.model";
import { RoomAmenity } from "../../models/Hotel/roomAmenity.model";
import { Highlight } from "../../models/Hotel/highlight.model";
import { HotelHighlight } from "../../models/Hotel/hotelHighlight.model";
import { HotelSearchParams, HotelSearchResult, SearchFilter } from "../../models/Hotel/hotelSearch.dto";
import { PriceAutoGenerationService } from "../../services/Price/priceAutoGeneration.service";

export class HotelSearchRepository {

  // Hàm tìm kiếm khách sạn
  async search(params: HotelSearchParams): Promise<HotelSearchResult[]> {
    try {
      // ✅ Đảm bảo có giá tự động cho các ngày trong search range
      const isOvernight = params.stayType === "overnight";
      const checkinDate = (isOvernight ? params.checkin : params.date) || '';
      let checkoutDateStr: string;
      
      if (isOvernight) {
        checkoutDateStr = params.checkout || '';
      } else {
        const checkoutDate = new Date(params.date || '');
        checkoutDate.setDate(checkoutDate.getDate() + 1);
        checkoutDateStr = checkoutDate.toISOString().split('T')[0];
      }

      if (checkinDate && checkoutDateStr) {
        try {
          const priceService = new PriceAutoGenerationService();
          await priceService.ensurePriceSchedulesForSearch(checkinDate, checkoutDateStr);
        } catch (priceError: any) {
          console.error('[HotelRepository] Error ensuring price schedules:', priceError.message);
          // Không block search nếu auto-generate fail
        }
      }

      const rows = await this.buildSearchQuerySequelize(params);
      
      if (!Array.isArray(rows)) {
        console.error('[HotelRepository] search - Expected array but got:', typeof rows);
        return [];
      }
      
      const results = this.mapResults(rows, params);
      
      await this.attachImagesToResults(results);
      await this.attachFacilitiesToResults(results);
      await this.attachPoliciesToResults(results);
      
      return results;
    } catch (error: any) {
      console.error('[HotelRepository] search error:', error.message);
      throw error;
    }
  }

  // Hàm attach images vào results
  private async attachImagesToResults(results: HotelSearchResult[]): Promise<void> {
    if (results.length === 0) return;
    
    const hotelIds = results.map(r => r.hotelId);
    
    const images = await HotelImage.findAll({
      where: {
        hotel_id: { [Op.in]: hotelIds }
      },
      attributes: [
        ['image_id', 'imageId'],
        ['hotel_id', 'hotelId'],
        ['image_url', 'imageUrl'],
        ['is_primary', 'isPrimary'],
        'caption',
        ['sort_order', 'sortOrder']
      ],
      order: [
        ['hotel_id', 'ASC'],
        ['sort_order', 'ASC'],
        ['is_primary', 'DESC']
      ],
      raw: true
    });
    
    const imagesByHotel = (images as any[]).reduce((acc: any, img: any) => {
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
    
    results.forEach(result => {
      result.images = imagesByHotel[result.hotelId] || [];
    });
  }

  // Hàm attach policies vào results
  private async attachPoliciesToResults(results: HotelSearchResult[]): Promise<void> {
    if (results.length === 0) return;
    
    const hotelIds = results.map(r => r.hotelId);
    const roomTypeIds = results.map(r => r.bestOffer.roomTypeId)
      .filter((id, index, self) => self.indexOf(id) === index); // Unique roomTypeIds
    
    // Lấy tất cả rooms thuộc các roomTypeIds này
    const rooms = await Room.findAll({
      where: {
        room_type_id: { [Op.in]: roomTypeIds },
        status: 'ACTIVE'
      },
      attributes: ['room_id', 'room_type_id'],
      raw: true
    });
    
    const roomIdsList = (rooms as any[]).map(r => r.room_id);
    
    // Lấy policies từ room_policy (room-level policies)
    const roomPolicies = roomIdsList.length > 0 ? await RoomPolicy.findAll({
      where: {
        room_id: { [Op.in]: roomIdsList },
        policy_key: { [Op.in]: ['free_cancellation', 'no_credit_card', 'pets_allowed', 'children_allowed', 'smoking_allowed', 'extra_bed_allowed'] },
        value: { [Op.in]: ['1', 'true'] }
      },
      attributes: ['room_id', 'policy_key'],
      raw: true
    }) : [];
    
    // Lấy policies từ hotel_policy (hotel-level policies)
    const hotelPolicies = await sequelize.query<any>(`
      SELECT hotel_id, policy_key 
      FROM hotel_policy
      WHERE hotel_id IN (:hotelIds)
        AND policy_key IN ('free_cancellation', 'no_credit_card', 'breakfast_included', 'airport_shuttle', 'parking_available', 'pay_later')
        AND value IN ('1', 'true')
    `, {
      replacements: { hotelIds },
      type: QueryTypes.SELECT
    });
    
    // Tạo map: room_type_id -> room policies
    const policiesByRoomType = new Map<string, Set<string>>();
    
    // First, map room_id -> room_type_id
    const roomTypeMap = new Map<string, string>();
    (rooms as any[]).forEach(r => {
      roomTypeMap.set(r.room_id, r.room_type_id);
    });
    
    // Then, map room policies
    (roomPolicies as any[]).forEach(p => {
      const roomTypeId = roomTypeMap.get(p.room_id);
      if (roomTypeId) {
        if (!policiesByRoomType.has(roomTypeId)) {
          policiesByRoomType.set(roomTypeId, new Set());
        }
        policiesByRoomType.get(roomTypeId)!.add(p.policy_key);
      }
    });
    
    // Tạo map: hotel_id -> hotel policies
    const policiesByHotel = new Map<string, Set<string>>();
    hotelPolicies.forEach((p: any) => {
      if (!policiesByHotel.has(p.hotel_id)) {
        policiesByHotel.set(p.hotel_id, new Set());
      }
      policiesByHotel.get(p.hotel_id)!.add(p.policy_key);
    });
    
    // Attach policies vào results
    results.forEach(result => {
      const roomTypeId = result.bestOffer.roomTypeId;
      const hotelId = result.hotelId;
      
      // Room-level policies
      const roomPoliciesSet = policiesByRoomType.get(roomTypeId) || new Set();
      
      // Hotel-level policies
      const hotelPoliciesSet = policiesByHotel.get(hotelId) || new Set();
      
      // Combine: room policies take precedence, but hotel policies can also apply
      result.bestOffer.freeCancellation = roomPoliciesSet.has('free_cancellation') || hotelPoliciesSet.has('free_cancellation');
      result.bestOffer.noCreditCard = roomPoliciesSet.has('no_credit_card') || hotelPoliciesSet.has('no_credit_card');
      result.bestOffer.petsAllowed = roomPoliciesSet.has('pets_allowed');
      result.bestOffer.childrenAllowed = roomPoliciesSet.has('children_allowed');
      result.bestOffer.smokingAllowed = roomPoliciesSet.has('smoking_allowed');
      result.bestOffer.extraBedAllowed = roomPoliciesSet.has('extra_bed_allowed');
      
      // Hotel-level only policies
      result.bestOffer.breakfastIncluded = hotelPoliciesSet.has('breakfast_included');
      result.bestOffer.airportShuttle = hotelPoliciesSet.has('airport_shuttle');
      result.bestOffer.parkingAvailable = hotelPoliciesSet.has('parking_available');
      // payLater từ room_price_schedule, không cần lấy từ hotel_policy nữa
    });
  }

  // Hàm attach facilities vào results
  private async attachFacilitiesToResults(results: HotelSearchResult[]): Promise<void> {
    if (results.length === 0) return;
    
    const hotelIds = results.map(r => r.hotelId);
    
    const facilities = await HotelFacility.findAll({
      include: [
        {
          model: Facility,
          as: 'facility',
          attributes: ['facility_id', 'name', 'icon'],
          required: true
        }
      ],
      where: {
        hotel_id: { [Op.in]: hotelIds }
      },
      attributes: ['hotel_id'],
      order: [
        ['hotel_id', 'ASC'],
        [sequelize.col('facility.name'), 'ASC']
      ],
      raw: true,
      nest: true
    });
    
    const facilitiesByHotel = (facilities as any[]).reduce((acc: any, item: any) => {
      const hotelId = item.hotel_id;
      if (!acc[hotelId]) acc[hotelId] = [];
      acc[hotelId].push({
        facilityId: item.facility.facility_id,
        name: item.facility.name,
        icon: item.facility.icon
      });
      return acc;
    }, {});
    
    results.forEach(result => {
      result.facilities = facilitiesByHotel[result.hotelId] || [];
    });
  }

  // Hàm build và execute search query (query phức tạp với subquery để tìm best offer)
  private async buildSearchQuerySequelize(params: HotelSearchParams): Promise<any[]> {
    const isOvernight = params.stayType === "overnight";
    const nights = isOvernight 
      ? this.calculateNights(params.checkin!, params.checkout!)
      : 1;
    
    const rooms = params.rooms || 1;
    const limit = params.limit || 10;
    const offset = params.offset || 0;

    const checkinDate = (isOvernight ? params.checkin : params.date) || '';
    let checkoutDateStr: string;
    
    if (isOvernight) {
      checkoutDateStr = params.checkout || '';
    } else {
      const checkoutDate = new Date(params.date || '');
      checkoutDate.setDate(checkoutDate.getDate() + 1);
      checkoutDateStr = checkoutDate.toISOString().split('T')[0];
    }

    const whereConditions = this.buildSequelizeWhereConditions(params, checkinDate, checkoutDateStr, nights);
    const order = this.buildSequelizeOrder(params.sort);

    const results = await sequelize.query(`
      SELECT
        t1.hotel_id,
        t1.name,
        t1.description,
        t1.address,
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
        t1.pay_later
      FROM (
        SELECT
          h.hotel_id,
          h.name,
          h.description,
          h.address,
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
          MAX(rps.pay_later) AS pay_later
        FROM hotel h
        JOIN hotel_location hl ON hl.location_id = h.location_id
        LEFT JOIN hotel_category hc ON hc.category_id = h.category_id
        JOIN room_type rt ON rt.hotel_id = h.hotel_id
        JOIN room r ON r.room_type_id = rt.room_type_id
        JOIN room_price_schedule rps ON rps.room_id = r.room_id
        WHERE r.status = 'ACTIVE' 
          AND CAST(rps.date AS DATE) >= :checkinDate
          AND CAST(rps.date AS DATE) < :checkoutDateStr
          AND rps.available_rooms > 0
          ${whereConditions.sqlConditions}
        GROUP BY h.hotel_id, h.name, h.description, h.address, h.star_rating, h.avg_rating, h.review_count, h.main_image,
                 hc.name, hl.city, hl.district, hl.area_name, hl.distance_center,
                 rt.room_type_id, rt.name,
                 r.room_id, r.capacity
        HAVING COUNT(DISTINCT CAST(rps.date AS DATE)) >= :nights
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
            AND CAST(rps.date AS DATE) >= :checkinDate2
            AND CAST(rps.date AS DATE) < :checkoutDateStr2
            AND rps.available_rooms > 0
          GROUP BY h.hotel_id, r.room_id
          HAVING COUNT(DISTINCT CAST(rps.date AS DATE)) >= :nights2
        ) AS prices
        GROUP BY hotel_id
      ) AS t2 ON t1.hotel_id = t2.hotel_id AND t1.sum_price = t2.min_price
      ORDER BY ${order.column} ${order.direction}
      LIMIT :limit OFFSET :offset
    `, {
      replacements: {
        checkinDate,
        checkoutDateStr,
        checkinDate2: checkinDate,
        checkoutDateStr2: checkoutDateStr,
        nights,
        nights2: nights,
        limit,
        offset,
        ...whereConditions.replacements
      },
      type: QueryTypes.SELECT
    });

    if (!results) {
      return [];
    }
    
    if (Array.isArray(results) && results.length === 2 && Array.isArray(results[0])) {
      return results[0] as any[];
    }
    
    if (Array.isArray(results)) {
      return results as any[];
    }
    
    return [results];
  }

  // Hàm build facilities filter conditions (hỗ trợ HOTEL và ROOM facilities)
  private buildFacilitiesFilterConditions(
    facilities: string[],
    replacements: Record<string, any>,
    paramIndex: number,
    useRoomFilter: boolean = true
  ): { conditions: string[]; nextParamIndex: number } {
    const conditions: string[] = [];
    let currentIndex = paramIndex;

    facilities.forEach((facilityId) => {
      const paramName = `facility_${currentIndex++}`;
      replacements[paramName] = facilityId;
      
      if (useRoomFilter) {
        conditions.push(`(
          EXISTS (
            SELECT 1 FROM hotel_facility hf
            INNER JOIN facility f ON f.facility_id = hf.facility_id
            WHERE hf.hotel_id = h.hotel_id 
              AND hf.facility_id = :${paramName}
              AND f.category = 'HOTEL'
          )
          OR
          EXISTS (
            SELECT 1 FROM room_amenity ra
            INNER JOIN facility f ON f.facility_id = ra.facility_id
            WHERE ra.room_id = r.room_id
              AND ra.facility_id = :${paramName}
              AND f.category = 'ROOM'
          )
        )`);
      } else {
        conditions.push(`EXISTS (
          SELECT 1 FROM hotel_facility hf
          INNER JOIN facility f ON f.facility_id = hf.facility_id
          WHERE hf.hotel_id = h.hotel_id 
            AND hf.facility_id = :${paramName}
            AND f.category = 'HOTEL'
        )`);
      }
    });

    return { conditions, nextParamIndex: currentIndex };
  }

  // Hàm build WHERE conditions cho search query (dùng named parameters để tránh SQL injection)
  private buildSequelizeWhereConditions(
    params: HotelSearchParams, 
    checkinDate: string, 
    checkoutDateStr: string, 
    nights: number
  ): { sqlConditions: string; replacements: Record<string, any> } {
    const sqlConditions: string[] = [];
    const replacements: Record<string, any> = {};
    let paramIndex = 1;

    if (params.q && params.q.trim()) {
      const parts = params.q.trim().split(',').map(p => p.trim()).filter(Boolean);
      
      if (parts.length === 1) {
        const normalizedKeyword = parts[0].replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
        const keywordParam = `q_keyword_${paramIndex++}`;
        replacements[keywordParam] = `%${normalizedKeyword}%`;
        
        sqlConditions.push(`(
          LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
          OR LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
          OR LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
          OR LOWER(REPLACE(REPLACE(h.name, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
        )`);
      } else if (parts.length === 2) {
        const keyword1Param = `q_keyword1_${paramIndex++}`;
        const keyword2Param = `q_keyword2_${paramIndex++}`;
        replacements[keyword1Param] = `%${parts[0].replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()}%`;
        replacements[keyword2Param] = `%${parts[1].replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()}%`;
        
        sqlConditions.push(`(
          (LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword1Param} 
           AND LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword2Param})
          OR (LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword1Param} 
              AND LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword2Param})
          OR LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword1Param}
          OR LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword2Param}
          OR LOWER(REPLACE(REPLACE(h.name, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword1Param}
          OR LOWER(REPLACE(REPLACE(h.name, 'đ', 'd'), 'Đ', 'D')) LIKE :${keyword2Param}
        )`);
      } else {
        const searchConditions: string[] = [];
        for (const part of parts) {
          const keywordParam = `q_keyword_${paramIndex++}`;
          replacements[keywordParam] = `%${part.replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()}%`;
          searchConditions.push(`(
            LOWER(REPLACE(REPLACE(hl.city, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
            OR LOWER(REPLACE(REPLACE(hl.district, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
            OR LOWER(REPLACE(REPLACE(hl.area_name, 'đ', 'd'), 'Đ', 'D')) LIKE :${keywordParam}
          )`);
        }
        sqlConditions.push(`(${searchConditions.join(' AND ')})`);
      }
    }

    if (params.star_min && params.star_min > 0) {
      const paramName = `star_min_${paramIndex++}`;
      replacements[paramName] = params.star_min;
      sqlConditions.push(`h.star_rating >= :${paramName}`);
    }

    if (params.max_distance && params.max_distance < 999) {
      const paramName = `max_distance_${paramIndex++}`;
      replacements[paramName] = params.max_distance;
      sqlConditions.push(`hl.distance_center <= :${paramName}`);
    }

    if (params.category_id) {
      const paramName = `category_id_${paramIndex++}`;
      replacements[paramName] = params.category_id;
      sqlConditions.push(`h.category_id = :${paramName}`);
    }

    if (params.facilities && params.facilities.length > 0) {
      const facilitiesFilter = this.buildFacilitiesFilterConditions(
        params.facilities,
        replacements,
        paramIndex,
        true
      );
      sqlConditions.push(...facilitiesFilter.conditions);
      paramIndex = facilitiesFilter.nextParamIndex;
    }

    if (params.bed_types && params.bed_types.length > 0) {
      const bedTypeParams = params.bed_types.map((_, idx) => {
        const paramName = `bed_type_${paramIndex++}`;
        replacements[paramName] = params.bed_types![idx];
        return `:${paramName}`;
      }).join(',');
      sqlConditions.push(`EXISTS (
        SELECT 1 FROM room_type rtype
        WHERE rtype.hotel_id = h.hotel_id 
        AND rtype.bed_type IN (${bedTypeParams})
      )`);
    }

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
          const paramName = `policy_${paramIndex++}`;
          replacements[paramName] = policy;
          sqlConditions.push(`EXISTS (
            SELECT 1 FROM room rm
            JOIN room_type rmt ON rmt.room_type_id = rm.room_type_id
            JOIN room_policy rp ON rp.room_id = rm.room_id
            WHERE rmt.hotel_id = h.hotel_id 
              AND rp.policy_key = :${paramName}
              AND (rp.value = '1' OR rp.value = 'true')
          )`);
        }
      });
    }

    return {
      sqlConditions: sqlConditions.length > 0 ? 'AND ' + sqlConditions.join(' AND ') : '',
      replacements
    };
  }


  // Hàm build ORDER BY cho search query (whitelist validation để tránh SQL injection)
  private buildSequelizeOrder(sort?: string): { column: string; direction: string } {
    const sortMappings: Record<string, { column: string; direction: string }> = {
      price_asc: { column: 'sum_price', direction: 'ASC' },
      price_desc: { column: 'sum_price', direction: 'DESC' },
      star_desc: { column: 'star_rating', direction: 'DESC' },
      rating_desc: { column: 'avg_rating', direction: 'DESC' },
      distance_asc: { column: 'distance_center', direction: 'ASC' }
    };

    const validColumns = ['sum_price', 'star_rating', 'avg_rating', 'distance_center'];
    const validDirections = ['ASC', 'DESC'];
    
    const selected = sortMappings[sort || 'price_asc'] || sortMappings.price_asc;
    
    const safeColumn = validColumns.includes(selected.column) ? selected.column : 'sum_price';
    const safeDirection = validDirections.includes(selected.direction) ? selected.direction : 'ASC';
    
    return { column: safeColumn, direction: safeDirection };
  }

  // Hàm tính số đêm
  private calculateNights(checkin: string, checkout: string): number {
    const d1 = new Date(checkin);
    const d2 = new Date(checkout);
    const diff = d2.getTime() - d1.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  }

  // Hàm map kết quả từ database sang HotelSearchResult
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
      
      // ✅ Chỉ tính discount nếu có original_price > sum_price (có giảm giá thực sự)
      const hasDiscount = originalPricePerNight > 0 && avgPricePerNight > 0 && originalPricePerNight > avgPricePerNight;
      const discountPercent = hasDiscount 
        ? ((originalPricePerNight - avgPricePerNight) / originalPricePerNight) * 100
        : 0;
      
      return {
        hotelId: row.hotel_id,
        name: row.name,
        description: row.description || null,
        address: row.address || null,
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
          // ✅ Chỉ set originalPricePerNight và discountPercent nếu thực sự có giảm giá
          ...(hasDiscount ? {
            originalPricePerNight: Number(originalPricePerNight),
            totalOriginalPrice: Number(totalOriginalPrice),
            discountPercent: Number(discountPercent.toFixed(2))
          } : {}),
          refundable: Boolean(row.refundable),
          payLater: Boolean(row.pay_later),
          freeCancellation: false,
          noCreditCard: false,
          petsAllowed: false,
          childrenAllowed: false,
          smokingAllowed: false,
          extraBedAllowed: false,
          breakfastIncluded: false,
          airportShuttle: false,
          parkingAvailable: false,
        },
      } as HotelSearchResult;
    });
  }

  // Hàm lấy chi tiết hotel by ID
  async getHotelById(hotelId: string): Promise<any | null> {
    try {
      const hotelData = await Hotel.findOne({
        where: { hotel_id: hotelId },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['category_id', 'name'],
            required: false
          },
          {
            model: Location,
            as: 'location',
            attributes: [
              'location_id', 'city', 'district', 'ward', 'area_name',
              'country', 'latitude', 'longitude', 'distance_center', 'description'
            ],
            required: false
          }
        ],
        raw: false
      });

      if (!hotelData) {
        return null;
      }

      const hotel = hotelData.toJSON() as any;

      const images = await HotelImage.findAll({
        where: { hotel_id: hotelId },
        attributes: [
          ['image_id', 'imageId'],
          ['image_url', 'imageUrl'],
          ['is_primary', 'isPrimary'],
          'caption',
          ['sort_order', 'sortOrder']
        ],
        order: [
          ['sort_order', 'ASC'],
          ['is_primary', 'DESC']
        ],
        raw: true
      });

      const facilities = await HotelFacility.findAll({
        include: [
          {
            model: Facility,
            as: 'facility',
            attributes: ['facility_id', 'name', 'icon'],
            required: true
          }
        ],
        where: { hotel_id: hotelId },
        attributes: [],
        order: [[sequelize.col('facility.name'), 'ASC']],
        raw: true,
        nest: true
      });

      const highlightsData = await HotelHighlight.findAll({
        where: { hotel_id: hotelId },
        include: [
          {
            model: Highlight,
            as: 'highlight',
            attributes: ['highlight_id', 'name', 'icon_url', 'description', 'category'],
            required: true
          }
        ],
        order: [['sort_order', 'ASC']],
        raw: false
      });

      const highlights = highlightsData.map((item: any) => {
        const data = item.toJSON();
        const highlight = data.highlight || {};
        return {
          highlightId: highlight.highlight_id,
          text: data.text || highlight.name || data.custom_text,
          icon: highlight.icon_url,
          tooltip: highlight.description,
          category: highlight.category,
          sortOrder: data.sort_order
        };
      });
      const policies = {
        checkIn: {
          from: hotel.checkin_time || '14:00',
          to: '23:59'
        },
        checkOut: {
          before: hotel.checkout_time || '12:00'
        },
        children: 'Cho phép trẻ em ở cùng',
        cancellation: 'Miễn phí hủy trước 48 giờ',
        smoking: false,
        pets: false,
        additionalPolicies: []
        };

      const badges = this.generateBadges({
        avgRating: hotel.avg_rating,
        reviewCount: hotel.review_count,
        starRating: hotel.star_rating,
        createdAt: hotel.created_at
      });

      return {
        hotelId: hotel.hotel_id,
        name: hotel.name,
        description: hotel.description,
        starRating: hotel.star_rating,
        avgRating: hotel.avg_rating,
        reviewCount: hotel.review_count,
        mainImage: hotel.main_image,
        categoryId: hotel.category?.category_id || hotel.category_id,
        categoryName: hotel.category?.name || null,
        address: hotel.address,
        phoneNumber: hotel.phone_number,
        email: hotel.email,
        website: hotel.website,
        checkinTime: hotel.checkin_time,
        checkoutTime: hotel.checkout_time,
        totalRooms: hotel.total_rooms,
        locationId: hotel.location?.location_id || hotel.location_id,
        city: hotel.location?.city || null,
        district: hotel.location?.district || null,
        ward: hotel.location?.ward || null,
        areaName: hotel.location?.area_name || null,
        country: hotel.location?.country || null,
        latitude: hotel.location?.latitude || null,
        longitude: hotel.location?.longitude || null,
        distanceCenter: hotel.location?.distance_center || null,
        locationDescription: hotel.location?.description || null,
        images: (images as any[]).map((img: any) => ({
          imageId: img.imageId,
          imageUrl: img.imageUrl,
          isPrimary: Boolean(img.isPrimary),
          caption: img.caption,
          sortOrder: img.sortOrder
        })),
        facilities: (facilities as any[]).map((item: any) => ({
          facilityId: item.facility.facility_id,
          name: item.facility.name,
          icon: item.facility.icon
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
      console.error('[HotelRepository] getHotelById error:', error.message);
      throw error;
    }
  }

  // Hàm lấy phòng có sẵn theo hotelId và date range
  async getAvailableRoomsByHotelId(
    hotelId: string, 
    checkIn: string, 
    checkOut: string,
    adults: number = 2,
    children: number = 0,
    rooms: number = 1
  ): Promise<any[]> {
    try {
      const nights = this.calculateNights(checkIn, checkOut);
      
      // ✅ FIX: Với dayuse (checkIn = checkOut), query đúng 1 ngày
      const isDayuse = checkIn === checkOut;
      const dateCondition = isDayuse 
        ? { [Op.eq]: checkIn }  // Dayuse: chỉ tìm đúng ngày đó
        : {                      // Overnight: tìm range
            [Op.gte]: checkIn,
            [Op.lt]: checkOut
          };

      const schedules = await RoomPriceSchedule.findAll({
        include: [
          {
            model: Room,
            as: 'room',
            attributes: ['room_id', 'room_number', 'capacity', 'status'],
            required: true,
            where: { status: 'ACTIVE' },
            include: [
              {
                model: RoomType,
                as: 'roomType',
                required: true,
                where: { hotel_id: hotelId }
              },
              {
                model: RoomPolicy,
                as: 'policies',
                attributes: ['policy_key', 'value'],
                required: false
              }
            ]
          }
        ],
        where: {
          date: dateCondition, // ✅ Sử dụng điều kiện đã điều chỉnh
          available_rooms: {
            [Op.gt]: 0
          }
        },
        order: [
          [sequelize.col('room.roomType.room_type_id'), 'ASC'],
          [sequelize.col('room.room_id'), 'ASC'],
          ['date', 'ASC']
        ],
        raw: false
      });

      const rows = schedules.map((schedule: any) => {
        const data = schedule.toJSON();
        const room = data.room || {};
        const roomType = room.roomType || {};
        const policies = room.policies || [];
        
        const policyMap: any = {};
        policies.forEach((p: any) => {
          policyMap[p.policy_key] = p.value;
        });
        
        return {
          roomTypeId: roomType.room_type_id,
          roomName: roomType.name,
          roomDescription: roomType.description,
          bedType: roomType.bed_type,
          area: roomType.size_sqm || roomType.area || null,
          roomImage: null,
          roomId: room.room_id,
          roomNumber: room.room_number,
          capacity: room.capacity,
          date: data.date,
          basePrice: data.base_price,
          discountPercent: data.discount_percent,
          availableRooms: data.available_rooms,
          refundable: data.refundable,
          payLater: data.pay_later,
          freeCancellation: policyMap['free_cancellation'] === '1' || policyMap['free_cancellation'] === 'true',
          noCreditCard: policyMap['no_credit_card'] === '1' || policyMap['no_credit_card'] === 'true',
          extraBedFee: parseFloat(policyMap['extra_bed_fee'] || '0'),
          childrenAllowed: policyMap['children_allowed'] === '1' || policyMap['children_allowed'] === 'true',
          petsAllowed: policyMap['pets_allowed'] === '1' || policyMap['pets_allowed'] === 'true'
        };
      });

      const roomTypesMap = new Map<string, any>();
      const roomsByType = new Map<string, Set<string>>();

      for (const row of rows) {
        const roomTypeId = row.roomTypeId;
        const roomId = row.roomId;
        const dateKey = row.date;
        
        if (!roomTypesMap.has(roomTypeId)) {
          roomTypesMap.set(roomTypeId, {
            roomTypeId: row.roomTypeId,
            roomName: row.roomName,
            roomDescription: row.roomDescription,
            bedType: row.bedType,
            area: row.area ? Number(row.area) : null,
            roomImage: row.roomImage,
            capacity: 0,
            roomsCapacityMap: new Map<string, {capacity: number, roomNumber: string}>(),
            dailyAvailabilityByDate: new Map(),
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
        
        if (!roomType.roomsCapacityMap.has(roomId)) {
          roomType.roomsCapacityMap.set(roomId, {
            capacity: row.capacity ? Number(row.capacity) : 0,
            roomNumber: row.roomNumber || ''
          });
        }
        
        if (!roomType.dailyAvailabilityByDate.has(dateKey)) {
          roomType.dailyAvailabilityByDate.set(dateKey, {
            date: dateKey,
            totalAvailable: 0,
            basePrice: Number(row.basePrice),
            discountPercent: Number(row.discountPercent),
            finalPrice: row.basePrice * (1 - row.discountPercent / 100)
          });
        }
        
        const dayData = roomType.dailyAvailabilityByDate.get(dateKey)!;
        dayData.totalAvailable += Number(row.availableRooms);
      }

      const availableRoomTypes: any[] = [];
      
      for (const [roomTypeId, roomType] of roomTypesMap) {
        type DayAvailability = {
          date: string;
          totalAvailable: number;
          basePrice: number;
          discountPercent: number;
          finalPrice: number;
        };
        const dailyAvailability: DayAvailability[] = Array.from(roomType.dailyAvailabilityByDate.values());
        
        // ✅ FIX: Với dayuse, nights = 0, nên cần ít nhất 1 ngày data
        const requiredDays = Math.max(nights, 1);
        if (dailyAvailability.length < requiredDays) {
          continue;
        }
        
        const totalPrice: number = dailyAvailability.reduce((sum: number, day) => sum + day.finalPrice, 0);
        const totalBasePrice: number = dailyAvailability.reduce((sum: number, day) => sum + day.basePrice, 0);
        const minAvailable = Math.min(...dailyAvailability.map(day => day.totalAvailable));
        const totalRooms = roomsByType.get(roomTypeId)!.size;
        
        const roomsData = Array.from<[string, {capacity: number, roomNumber: string}]>(roomType.roomsCapacityMap.entries())
          .map(entry => ({
            roomId: entry[0],
            capacity: entry[1].capacity,
            roomNumber: entry[1].roomNumber
          }))
          .sort((a, b) => {
            const numA = parseInt(a.roomNumber) || 0;
            const numB = parseInt(b.roomNumber) || 0;
            if (numA !== numB) return numA - numB;
            return a.roomNumber.localeCompare(b.roomNumber);
          });
        
        const selectedRooms = roomsData.slice(0, rooms);
        const selectedRoomsCapacity = selectedRooms.reduce((sum: number, room) => sum + room.capacity, 0);
        
        const displayCapacity = rooms === 1 
          ? (selectedRooms[0]?.capacity || 0)
          : selectedRoomsCapacity;
        
        const totalCapacity = selectedRoomsCapacity;
        const totalGuests = adults + children;
        const meetsCapacity = totalCapacity >= totalGuests;
        
        const maxBookableSets = rooms > 0 ? Math.floor(minAvailable / rooms) : minAvailable;
        
        availableRoomTypes.push({
          roomTypeId: roomType.roomTypeId,
          roomName: roomType.roomName,
          roomDescription: roomType.roomDescription,
          bedType: roomType.bedType,
          area: roomType.area,
          roomImage: roomType.roomImage,
          capacity: displayCapacity,
          totalRooms: totalRooms,
          minAvailable: minAvailable,
          maxBookableSets: maxBookableSets,
          requestedRooms: rooms,
          totalCapacity: totalCapacity,
          totalGuests: totalGuests,
          dailyAvailability: dailyAvailability,
          totalPrice: Number(totalPrice.toFixed(2)),
          avgPricePerNight: Number((totalPrice / nights).toFixed(2)),
          totalBasePrice: Number(totalBasePrice.toFixed(2)),
          hasFullAvailability: true,
          meetsCapacity: meetsCapacity,
          capacityWarning: !meetsCapacity ? 
            `Với ${rooms} phòng, tối đa ${totalCapacity} người.` : null,
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

      if (availableRoomTypes.length > 0) {
        const roomTypeIds = availableRoomTypes.map(rt => rt.roomTypeId);
        
        const images = await RoomImage.findAll({
          where: {
            room_type_id: { [Op.in]: roomTypeIds }
          },
          attributes: [
            ['room_type_id', 'roomTypeId'],
            ['image_id', 'imageId'],
            ['image_url', 'imageUrl'],
            ['image_alt', 'imageAlt'],
            ['is_primary', 'isPrimary'],
            ['sort_order', 'sortOrder']
          ],
          order: [
            ['room_type_id', 'ASC'],
            ['sort_order', 'ASC']
          ],
          raw: true
        });
        
        const imagesByRoomType = (images as any[]).reduce((acc: any, img: any) => {
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
        
        const facilities = await RoomAmenity.findAll({
          include: [
            {
              model: Room,
              as: 'room',
              attributes: ['room_type_id'],
              required: true,
              include: [
                {
                  model: RoomType,
                  as: 'roomType',
                  attributes: ['room_type_id'],
                  required: true,
                  where: {
                    room_type_id: { [Op.in]: roomTypeIds }
                  }
                }
              ]
            },
            {
              model: Facility,
              as: 'facility',
              attributes: ['facility_id', 'name', 'icon'],
              required: true
            }
          ],
          attributes: [],
          order: [
            [sequelize.col('room.roomType.room_type_id'), 'ASC'],
            [sequelize.col('facility.name'), 'ASC']
          ],
          raw: false
        });
        
        const facilitiesByRoomType: Record<string, Set<string>> = {};
        const facilitiesMap: Record<string, any> = {};
        
        facilities.forEach((item: any) => {
          const roomTypeId = item.room?.roomType?.room_type_id;
          const facilityId = item.facility?.facility_id;
          
          if (!roomTypeId || !facilityId) return;
          
          if (!facilitiesByRoomType[roomTypeId]) {
            facilitiesByRoomType[roomTypeId] = new Set();
          }
          
          const facilityKey = `${roomTypeId}_${facilityId}`;
          if (!facilitiesMap[facilityKey]) {
            facilitiesByRoomType[roomTypeId].add(facilityId);
            facilitiesMap[facilityKey] = {
              roomTypeId,
              facility: {
                facilityId: item.facility.facility_id,
                name: item.facility.name,
                icon: item.facility.icon
              }
            };
          }
        });
        
        const finalFacilitiesByRoomType: Record<string, any[]> = {};
        Object.keys(facilitiesByRoomType).forEach(roomTypeId => {
          finalFacilitiesByRoomType[roomTypeId] = Array.from(facilitiesByRoomType[roomTypeId])
            .map(facilityId => {
              const key = `${roomTypeId}_${facilityId}`;
              return facilitiesMap[key]?.facility;
            })
            .filter(Boolean);
        });
        
        availableRoomTypes.forEach(roomType => {
          roomType.images = imagesByRoomType[roomType.roomTypeId] || [];
          roomType.facilities = finalFacilitiesByRoomType[roomType.roomTypeId] || [];
        });
      }

      availableRoomTypes.sort((a, b) => a.totalPrice - b.totalPrice);

      return availableRoomTypes;
    } catch (error: any) {
      console.error('[HotelRepository] getAvailableRoomsByHotelId error:', error.message);
      throw error;
    }
  }

  // Hàm generate highlights từ facilities và hotel info
  private generateHighlights(facilities: any[], hotel: any): any[] {
    const highlights: any[] = [];
    const facilityNames = facilities.map(f => f.name.toLowerCase());

    if (facilityNames.includes('lễ tân 24 giờ') || facilityNames.includes('reception 24h')) {
      highlights.push({
        iconType: 'reception',
        text: 'Lễ tân phục vụ [24 giờ]',
        tooltip: 'Quầy lễ tân phục vụ 24/7'
      });
    }

    if (facilityNames.some(f => f.includes('wifi') || f.includes('wi-fi'))) {
      highlights.push({
        iconType: 'wifi',
        text: 'Wi-Fi miễn phí trong tất cả các phòng!',
        tooltip: 'Tốc độ cao, ổn định'
      });
    }

    if (facilityNames.some(f => f.includes('bãi đỗ xe') || f.includes('parking'))) {
      highlights.push({
        iconType: 'parking',
        text: 'Bãi đỗ xe miễn phí',
        tooltip: 'Chỗ đỗ xe rộng rãi'
      });
    }

    if (facilityNames.some(f => f.includes('bể bơi') || f.includes('pool'))) {
      highlights.push({
        iconType: 'pool',
        text: 'Bể bơi',
        tooltip: 'Bể bơi ngoài trời/trong nhà'
      });
    }

    if (facilityNames.some(f => f.includes('nhà hàng') || f.includes('restaurant'))) {
      highlights.push({
        iconType: 'restaurant',
        text: 'Nhà hàng',
        tooltip: 'Ẩm thực đa dạng'
      });
    }

    if (facilityNames.some(f => f.includes('phòng gym') || f.includes('fitness'))) {
      highlights.push({
        iconType: 'gym',
        text: 'Phòng tập gym',
        tooltip: 'Trang thiết bị hiện đại'
      });
    }

    if (facilityNames.some(f => f.includes('spa'))) {
      highlights.push({
        iconType: 'spa',
        text: 'Spa',
        tooltip: 'Dịch vụ massage và spa'
      });
    }

    return highlights;
  }

  // Hàm generate badges cho hotel
  private generateBadges(hotel: any): any[] {
    const badges: any[] = [];

    if (hotel.avgRating >= 4.5 && hotel.reviewCount >= 100) {
      badges.push({
        type: 'top_rated',
        label: 'Đánh giá cao',
        color: '#10b981'
      });
    }

    if (hotel.reviewCount >= 500) {
      badges.push({
        type: 'popular',
        label: 'Phổ biến',
        color: '#3b82f6'
      });
    }

    if (hotel.avgRating >= 4.0 && hotel.starRating >= 3) {
      badges.push({
        type: 'best_value',
        label: 'Đáng giá',
        color: '#f59e0b'
      });
    }

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