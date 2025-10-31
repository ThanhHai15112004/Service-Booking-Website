import api from "../api/axiosClient";

export const searchHotels = async (params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
  stayType?: 'overnight' | 'dayuse';
  categoryId?: string;
  starMin?: number;
  facilities?: string[];
  bedTypes?: string[];
  policies?: string[];
  maxDistance?: number;
  sort?: string;
}) => {
  try {
    const beParams: any = {
      q: params.destination,
      adults: params.guests,
      rooms: params.rooms,
      children: params.children,
      stayType: params.stayType || 'overnight',
    };

    // Date params
    if (params.stayType === 'dayuse') {
      beParams.date = params.checkIn;
    } else {
      beParams.checkin = params.checkIn;
      beParams.checkout = params.checkOut;
    }

    // Filter params
    if (params.categoryId) beParams.category_id = params.categoryId;
    if (params.starMin) beParams.star_min = params.starMin;
    if (params.facilities && params.facilities.length > 0) beParams.facilities = params.facilities.join(',');
    if (params.bedTypes && params.bedTypes.length > 0) beParams.bed_types = params.bedTypes.join(',');
    if (params.policies && params.policies.length > 0) beParams.policies = params.policies.join(',');
    if (params.maxDistance) beParams.max_distance = params.maxDistance;
    if (params.sort) beParams.sort = params.sort;

    const res = await api.get("/api/hotels/search", { params: beParams });
    return res.data;
  } catch (error: any) {
    return { success: false, message: "Không thể tìm kiếm khách sạn." };
  }
};

export const getHotelDetail = async (hotelId: string, params: {
  checkIn: string;
  checkOut: string;
  adults?: number;
  children?: number;
  rooms?: number;
}) => {
  try {
    console.log('🔍 getHotelDetail called:', { hotelId, params });
    
    const res = await api.get(`/api/hotels/${hotelId}`, {
      params: {
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        adults: params.adults || 2,
        children: params.children || 0,
        rooms: params.rooms || 1
      }
    });
    
    console.log('✅ getHotelDetail API response:', {
      status: res.status,
      success: res.data?.success,
      hasData: !!res.data?.data,
      hasHotel: !!res.data?.data?.hotel,
      availableRoomsCount: res.data?.data?.availableRooms?.length || 0
    });
    
    // ✅ FIX: Validate response structure
    if (!res.data) {
      console.error('❌ Empty response from API');
      return { success: false, message: "Không nhận được dữ liệu từ server." };
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ getHotelDetail error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    });
    
    // ✅ FIX: Return proper error structure
    return { 
      success: false, 
      message: error.response?.data?.message || error.message || "Không thể lấy chi tiết khách sạn." 
    };
  }
};

/**
 * Get hotel counts for breadcrumb navigation
 */
export const getHotelCounts = async (country: string, city?: string) => {
  try {
    const res = await api.get('/api/locations/hotel-counts', {
      params: { country, city }
    });
    return res.data;
  } catch (error: any) {
    console.error('❌ getHotelCounts error:', error);
    return { 
      success: false, 
      message: "Không thể đếm khách sạn.",
      data: { countryCount: 0, cityCount: 0 }
    };
  }
};