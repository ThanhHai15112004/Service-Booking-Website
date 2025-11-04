// DTOs for Hotel Search

export interface HotelSearchParams {
  // Search query
  q?: string; // General search keyword (city, district, hotel name)

  // Location
  destination?: string;
  city?: string;
  district?: string;
  country?: string;

  // Dates
  stayType: 'overnight' | 'dayuse';
  checkin?: string;
  checkout?: string;
  date?: string;

  // Guests
  rooms?: number;
  adults?: number;
  children?: number;

  // Filters
  minPrice?: number;
  maxPrice?: number;
  star_min?: number; // Minimum star rating
  minStar?: number; // Alias
  maxStar?: number;
  max_distance?: number; // Maximum distance from center (km)
  category_id?: string; // Hotel category ID
  facilities?: string[]; // Array of facility IDs
  bed_types?: string[]; // Array of bed type keys
  policies?: string[]; // Array of policy keys (e.g., ['free_cancellation', 'pay_later'])

  // Sorting & Pagination
  sort?: string; // 'price_asc' | 'price_desc' | 'star_desc' | 'rating_desc' | 'distance_asc'
  limit?: number;
  offset?: number;
}

export interface HotelSearchResult {
  hotelId: string;
  name: string;
  description: string | null;
  address: string | null;
  starRating: number | null;
  avgRating: number | null;
  reviewCount: number | null;
  mainImage: string | null;
  categoryName: string | null;
  
  // Location info (nested)
  location: {
    city: string;
    district: string | null;
    areaName: string | null;
    distanceCenter: number | null;
  };
  
  // Best offer info (nested)
  bestOffer: {
    stayType: 'overnight' | 'dayuse';
    nights: number;
    rooms: number;
    adults: number;
    children: number;
    roomTypeId: string;
    roomName: string;
    capacity: number;
    availableRooms: number;
    totalPrice: number;
    avgPricePerNight: number;
    originalPricePerNight?: number; // ✅ Chỉ có khi thực sự có giảm giá
    totalOriginalPrice?: number; // ✅ Chỉ có khi thực sự có giảm giá
    discountPercent?: number; // ✅ Chỉ có khi thực sự có giảm giá
    refundable: boolean;
    payLater: boolean;
    freeCancellation: boolean;
    noCreditCard: boolean;
    petsAllowed: boolean;
    childrenAllowed: boolean;
    smokingAllowed?: boolean;
    extraBedAllowed?: boolean;
    breakfastIncluded?: boolean;
    airportShuttle?: boolean;
    parkingAvailable?: boolean;
  };
  
  // Attached data (populated later)
  images?: any[];
  facilities?: any[];
}

export interface SearchFilter {
  conditions: string[];
  values: any[];
}

