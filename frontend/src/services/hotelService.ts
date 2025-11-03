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

// Lấy danh sách khách sạn nổi bật cho homepage
export const getFeaturedHotels = async (params?: {
  limit?: number;
  minRating?: number;
  minStars?: number;
}) => {
  try {
    // Tạo default dates (ngày mai và ngày kia) để có thể lấy được giá
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const queryParams: any = {
      stayType: 'overnight', // ✅ REQUIRED by backend
      checkin: formatDate(tomorrow),
      checkout: formatDate(dayAfter),
      adults: 2,
      rooms: 1,
      children: 0,
      limit: params?.limit || 6,
      sort: 'rating_desc', // Sắp xếp theo rating cao nhất
    };

    if (params?.minStars) queryParams.star_min = params.minStars;

    const res = await api.get("/api/hotels/search", { params: queryParams });
    
    console.log('✅ getFeaturedHotels response:', res.data);
    
    if (res.data.success && res.data.data?.hotels) {
      // Map response từ backend sang format Hotel của frontend
      const hotels = res.data.data.hotels.map((hotel: any) => {
        // hotel.address từ backend có thể đã chứa đầy đủ address
        // Nếu có sẵn và đủ dài, dùng luôn. Nếu không thì build từ location
        let fullAddress = '';
        
        if (hotel.address && hotel.address.length > 5 && hotel.address !== 'NULL') {
          // Address đã đầy đủ từ backend, dùng luôn
          fullAddress = hotel.address;
        } else {
          // Build address từ location data
          const addressParts = [];
          
          if (hotel.address && hotel.address !== 'NULL') {
            addressParts.push(hotel.address);
          } else if (hotel.location?.areaName && /^\d/.test(hotel.location.areaName)) {
            addressParts.push(hotel.location.areaName);
          }
          
          if (hotel.location?.district) {
            addressParts.push(hotel.location.district);
          }
          
          if (hotel.location?.city) {
            addressParts.push(hotel.location.city);
          }
          
          fullAddress = addressParts.filter(Boolean).join(', ');
        }
        
        return {
          id: hotel.hotelId,
          name: hotel.name,
          description: hotel.description || '',
          address: fullAddress || 'Địa chỉ đang cập nhật',
          city: hotel.location?.city || '',
          country: 'Việt Nam',
          star_rating: hotel.starRating || 0,
          main_image: hotel.mainImage || '',
          price_per_night: hotel.bestOffer?.avgPricePerNight || 0,
          rating: hotel.avgRating || 0,
          reviews_count: hotel.reviewCount || 0,
          amenities: hotel.facilities || [],
          highlights: hotel.highlights || []
        };
      });

      return {
        success: true,
        data: {
          hotels,
          pagination: res.data.data.pagination
        }
      };
    }
    
    return res.data;
  } catch (error: any) {
    console.error('❌ Error fetching featured hotels:', error);
    return { success: false, message: "Không thể tải khách sạn nổi bật." };
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

/**
 * Get similar hotels in the same city (excluding current hotel)
 */
export const getSimilarHotelsInCity = async (params: {
  city: string;
  excludeHotelId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
  limit?: number;
}) => {
  try {
    const beParams: any = {
      q: params.city,
      adults: params.guests,
      rooms: params.rooms,
      children: params.children,
      checkin: params.checkIn,
      checkout: params.checkOut,
      stayType: 'overnight', // ✅ Required by backend validator
      limit: params.limit || 12,
    };

    const res = await api.get("/api/hotels/search", { params: beParams });
    
    // ✅ Check response structure - API returns { success, data: { hotels: [...] } }
    const hotels = res.data?.data?.hotels || res.data?.data || [];
    
    if (res.data?.success && Array.isArray(hotels)) {
      // Filter out current hotel and map to SimilarHotel format
      let filteredHotels = hotels
        .filter((hotel: any) => hotel.hotelId !== params.excludeHotelId)
        .map((hotel: any) => {
          // ✅ Map từ HotelSearchResult sang SimilarHotel
          return {
            hotelId: hotel.hotelId,
            name: hotel.name,
            starRating: hotel.starRating,
            avgRating: hotel.avgRating,
            reviewCount: hotel.reviewCount,
            mainImage: hotel.mainImage,
            city: hotel.location?.city || hotel.city,
            distanceCenter: hotel.location?.distanceCenter || hotel.distanceCenter,
            categoryName: hotel.categoryName,
            // ✅ Map từ bestOffer
            sumPrice: hotel.bestOffer?.totalPrice,
            originalPrice: hotel.bestOffer?.totalOriginalPrice,
            avgDiscountPercent: hotel.bestOffer?.discountPercent,
            capacity: hotel.bestOffer?.capacity,
            roomName: hotel.bestOffer?.roomName,
          };
        });

      filteredHotels = filteredHotels.slice(0, params.limit || 12);
      
      return {
        success: true,
        data: filteredHotels,
        count: filteredHotels.length
      };
    }
    
    return { success: false, data: [], count: 0 };
  } catch (error: any) {
    console.error('❌ getSimilarHotelsInCity error:', error);
    return { success: false, data: [], count: 0, message: "Không thể lấy danh sách khách sạn tương tự." };
  }
};