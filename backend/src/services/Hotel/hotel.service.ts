import { HotelSearchRepository } from "../../Repository/Hotel/hotel.repository";
import { HotelSearchResult, HotelSearchParams } from "../../models/Hotel/hotelSearch.dto";
import { HotelSearchValidator } from "../../utils/hotelSearch.validator";

interface SearchHotelsResponse {
  success: boolean;
  data?: {
    hotels: HotelSearchResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    searchParams: {
      checkIn?: string;
      checkOut?: string;
      date?: string;
      rooms: number;
      adults: number;
      children: number;
      stayType: string;
    };
  };
  message?: string;
}

export class HotelService {
  private repository = new HotelSearchRepository();

  // Hàm tìm kiếm khách sạn
  async searchHotels(params: any): Promise<SearchHotelsResponse> {
    const normalizedParams = {
      ...params,
      checkin: params.checkIn || params.checkin,
      checkout: params.checkOut || params.checkout,
    };

    const validation = HotelSearchValidator.validate(normalizedParams);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const validatedParams = validation.data!;

    try {
      const results = await this.repository.search(validatedParams);

      const page = validatedParams.offset 
        ? Math.floor(validatedParams.offset / (validatedParams.limit || 10)) + 1 
        : 1;
      const limit = validatedParams.limit || 10;
      
      const total = results.length >= limit ? limit * page + 1 : (page - 1) * limit + results.length;
      const totalPages = Math.ceil(total / limit);
      const searchParams = {
        checkIn: validatedParams.checkin,
        checkOut: validatedParams.checkout,
        date: validatedParams.date,
        rooms: validatedParams.rooms || 1,
        adults: validatedParams.adults || 2,
        children: validatedParams.children || 0,
        stayType: validatedParams.stayType,
      };

      return { 
        success: true, 
        data: {
          hotels: results,
          pagination: {
            page,
            limit,
            total,
            totalPages
          },
          searchParams
        }
      };
    } catch (error: any) {
      console.error('[HotelService] searchHotels error:', error.message);
      return { success: false, message: "Lỗi khi tìm kiếm khách sạn" };
    }
  }

  // Hàm lấy chi tiết khách sạn kèm phòng có sẵn
  async getHotelDetail(hotelId: string, params: any): Promise<any> {
    try {
      if (!hotelId || hotelId.trim().length === 0) {
        return { success: false, message: "Hotel ID is required" };
      }

      let checkIn = params.checkIn || params.checkin;
      let checkOut = params.checkOut || params.checkout;
      const stayType = params.stayType || 'overnight'; // ✅ Thêm stayType
      const rooms = parseInt(params.rooms) || 1;
      const adults = parseInt(params.adults) || 2;
      const children = parseInt(params.children) || 0;

      // Normalize date format from ISO string to YYYY-MM-DD
      const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return '';
        // Nếu đã là YYYY-MM-DD thì giữ nguyên
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        // Nếu là ISO string, convert về YYYY-MM-DD
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return dateStr;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        } catch {
          return dateStr;
        }
      };

      checkIn = normalizeDate(checkIn);
      checkOut = normalizeDate(checkOut);

      if (!checkIn || !checkOut) {
        return { success: false, message: "Check-in and check-out dates are required" };
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
        return { success: false, message: "Invalid date format. Use YYYY-MM-DD" };
      }
      const checkinDate = new Date(checkIn);
      const checkoutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // ✅ FIX: Cho phép checkIn = checkOut với dayuse
      if (stayType === 'overnight') {
        if (checkinDate >= checkoutDate) {
          return { success: false, message: "Check-out must be after check-in" };
        }
      } else if (stayType === 'dayuse') {
        // Dayuse: checkIn phải bằng checkOut
        if (checkinDate.getTime() !== checkoutDate.getTime()) {
          return { success: false, message: "Dayuse: Check-in and check-out must be the same day" };
        }
      }

      if (checkinDate < today) {
        return { success: false, message: "Check-in date cannot be in the past" };
      }

      const diffTime = checkoutDate.getTime() - checkinDate.getTime();
      const los = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const hotel = await this.repository.getHotelById(hotelId);

      if (!hotel) {
        return { success: false, message: "Hotel not found" };
      }
      const availableRooms = await this.repository.getAvailableRoomsByHotelId(
        hotelId,
        checkIn,
        checkOut,
        adults,
        children,
        rooms
      );

      return {
        success: true,
        data: {
          hotel,
          availableRooms: availableRooms || [],
          searchParams: {
            checkIn,
            checkOut,
            rooms,
            adults,
            children,
            los
          }
        }
      };
    } catch (error: any) {
      console.error('[HotelService] getHotelDetail error:', error.message);
      return { success: false, message: "Lỗi khi lấy chi tiết khách sạn" };
    }
  }
}