import {  validateHotelSearchDayuse,  validateHotelSearchOvernight,} from "../../utils/hotelSearch.validator";
import {  sanitizeArrayStrings,  sanitizeNumber,} from "../../helpers/filter.helper";
import { normalizeString } from "../../utils/normalize.util";
import {  OvernightSearchRepository,  DayuseSearchRepository,} from "../../Repository/Hotel/hotelSearch.repository";
import { HotelSearchParams } from "../../models/hotel.model";

// Hàm tính số đêm giữa ngày nhận và ngày trả phòng
function calculateNights(checkin?: string, checkout?: string): number {
  if (!checkin || !checkout) return 1;
  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  const diff = d2.getTime() - d1.getTime();
  const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Number.isFinite(nights) && nights > 0 ? nights : 1;
}

// Dịch vụ chính xử lý tìm kiếm khách sạn
export class HotelService {
  private overnightRepo = new OvernightSearchRepository();
  private dayuseRepo = new DayuseSearchRepository();

  // Tìm kiếm khách sạn với bộ lọc
  async searchWithFilters(params: any) {
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

  // Tìm khách sạn qua đêm
  private async searchOvernight(params: HotelSearchParams) {
    const validation = validateHotelSearchOvernight(params);
    if (!validation.success || !validation.data) {
      return { success: false, items: [], message: validation.message };
    }

    const { q, checkin, checkout } = validation.data;
    const nights = calculateNights(checkin, checkout);
    const normalizedQ = normalizeString(q || "");

    const searchParams: HotelSearchParams = {
      ...validation.data,
      q: normalizedQ,
      stayType: "overnight",
    };

    const items = await this.overnightRepo.search(searchParams);
    return { success: true, items };
  }

  // Tìm khách sạn theo giờ (day-use)
  private async searchDayuse(params: HotelSearchParams) {
    const validation = validateHotelSearchDayuse(params);
    if (!validation.success || !validation.data) {
      return { success: false, items: [], message: validation.message };
    }

    const normalizedQ = normalizeString(validation.data.q || "");
    const searchParams: HotelSearchParams = {
      ...validation.data,
      q: normalizedQ,
      stayType: "dayuse",
    };

    const items = await this.dayuseRepo.search(searchParams);
    return { success: true, items };
  }

  // làm sạch và chuẩn hóa tham số đầu vào
  private sanitizeParams(params: any): HotelSearchParams {
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
      stayType: params.stayType ?? "overnight",
      rooms: Number(params.rooms ?? 1),
      adults: Number(params.adults ?? 1),
      children: Number(params.children ?? 0),
    };
  }
}
