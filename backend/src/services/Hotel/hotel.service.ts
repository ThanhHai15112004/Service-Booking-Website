// services/Hotel/hotel.service.ts

import { HotelSearchRepository } from "../../Repository/Hotel/hotel.repository";
import { HotelSearchResult, HotelSearchParams } from "../../models/Hotel/hotel.model";
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

  // Tìm kiếm khách sạn
  async searchHotels(params: any): Promise<SearchHotelsResponse> {
    // Normalize params: support both checkIn/checkOut and checkin/checkout
    const normalizedParams = {
      ...params,
      checkin: params.checkIn || params.checkin,
      checkout: params.checkOut || params.checkout,
    };

    // Validate
    const validation = HotelSearchValidator.validate(normalizedParams);
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    const validatedParams = validation.data!;

    // Search
    try {
      const results = await this.repository.search(validatedParams);

      // Calculate pagination
      const page = validatedParams.offset 
        ? Math.floor(validatedParams.offset / (validatedParams.limit || 10)) + 1 
        : 1;
      const limit = validatedParams.limit || 10;
      
      // Get total count (for now, we'll estimate based on current results)
      // TODO: Implement proper total count query
      const total = results.length >= limit ? limit * page + 1 : (page - 1) * limit + results.length;
      const totalPages = Math.ceil(total / limit);

      // Build searchParams to pass to frontend
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
      console.error('Hotel Search Service Error:', error.message);
      return { success: false, message: "Lỗi khi tìm kiếm khách sạn" };
    }
  }

  // Get hotel detail with available rooms
  async getHotelDetail(hotelId: string, params: any): Promise<any> {
    try {

      // Validate params
      if (!hotelId || hotelId.trim().length === 0) {
        return { success: false, message: "Hotel ID is required" };
      }

      const checkIn = params.checkIn || params.checkin;
      const checkOut = params.checkOut || params.checkout;
      const rooms = parseInt(params.rooms) || 1;
      const adults = parseInt(params.adults) || 2;
      const children = parseInt(params.children) || 0;

      if (!checkIn || !checkOut) {
        return { success: false, message: "Check-in and check-out dates are required" };
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
        return { success: false, message: "Invalid date format. Use YYYY-MM-DD" };
      }

      // Validate dates logic
      const checkinDate = new Date(checkIn);
      const checkoutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkinDate >= checkoutDate) {
        return { success: false, message: "Check-out must be after check-in" };
      }

      // Allow check-in from today (not strictly in the future)
      if (checkinDate < today) {
        return { success: false, message: "Check-in date cannot be in the past" };
      }

      // Calculate length of stay
      const diffTime = checkoutDate.getTime() - checkinDate.getTime();
      const los = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Get hotel basic info
      const hotel = await this.repository.getHotelById(hotelId);

      if (!hotel) {
        return { success: false, message: "Hotel not found" };
      }

      // Get available rooms
      const availableRooms = await this.repository.getAvailableRoomsByHotelId(
        hotelId,
        checkIn,
        checkOut,
        adults,
        children,
        rooms  // ✅ FIX: Pass rooms param
      );

      return {
        success: true,
        data: {
          hotel,
          availableRooms,
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
      console.error('Hotel Detail Service Error:', error.message);
      return { success: false, message: "Lỗi khi lấy chi tiết khách sạn" };
    }
  }
}