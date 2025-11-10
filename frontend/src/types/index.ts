// ============================================================================
// HOTEL TYPES (List View - Simple)
// ============================================================================

export interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number;
  main_image: string;
  price_per_night: number;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviews_count?: number;
  amenities?: Array<{
    facilityId?: string;
    name: string;
    icon?: string;
  }>;
  highlights?: Array<{
    icon?: string;
    text: string;
    tooltip?: string;
  }>;
}

// ============================================================================
// HOTEL DETAIL TYPES (Detail View - Complete)
// ============================================================================

export interface HotelImage {
  imageId: string;
  imageUrl: string;
  isPrimary: boolean;
  caption?: string;
  sortOrder: number;
}

export interface HotelFacility {
  facilityId: string;
  name: string;
  icon?: string;
}

export interface HotelHighlight {
  icon?: string;
  iconType?: string;
  text: string;
  tooltip?: string;
}

export interface HotelBadge {
  type: 'popular' | 'new' | 'recommended' | 'top_rated' | 'best_value';
  label: string;
  color?: string;
}

export interface HotelPolicies {
  checkIn: {
    from: string;
    to?: string;
  };
  checkOut: {
    before: string;
  };
  children?: string;
  cancellation?: string;
  smoking?: boolean;
  pets?: boolean;
  additionalPolicies?: Array<{
    policyName: string;
    description: string;
  }>;
}

export interface HotelDetail {
  hotelId: string;
  name: string;
  description?: string;
  starRating: number;
  avgRating?: number;
  reviewCount?: number;
  mainImage?: string;
  categoryId?: string;
  categoryName?: string;
  address: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  checkinTime?: string;
  checkoutTime?: string;
  totalRooms?: number;
  
  // Location
  locationId?: string;
  city: string;
  district?: string;
  ward?: string;
  areaName?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  distanceCenter?: number;
  locationDescription?: string;
  
  // Relations
  images: HotelImage[];
  facilities: HotelFacility[];
  highlights: HotelHighlight[];
  badges?: HotelBadge[];
  policies?: HotelPolicies;
}

export interface HotelCounts {
  countryCount: number;
  cityCount: number;
}

// ============================================================================
// ROOM TYPES
// ============================================================================

export interface RoomFacility {
  facilityId: string;
  name: string;
  icon?: string;
}

export interface RoomImage {
  imageId: string;
  imageUrl: string;
  imageAlt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Promotion {
  promotion_id: string;
  name: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  discount_amount: number;
  max_discount?: number;
}

export interface RoomDailyAvailability {
  date: string;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  availableRooms: number;
  promotions?: Promotion[];
}

export interface Room {
  roomId: string;
  roomTypeId: string;
  roomName: string;
  roomDescription?: string;
  bedType?: string;
  area?: number;
  roomImage?: string;  // Deprecated - use images array
  images?: RoomImage[]; // New: Array of room images
  capacity: number;
  
  // Availability
  dailyAvailability: RoomDailyAvailability[];
  totalPrice: number;
  avgPricePerNight: number;
  totalBasePrice: number;
  minAvailable: number;
  hasFullAvailability: boolean;
  meetsCapacity: boolean;
  
  // ✅ NEW: Capacity fields
  requestedRooms?: number;      // Số phòng user muốn đặt
  totalCapacity?: number;       // capacity × rooms
  totalGuests?: number;         // adults + children
  maxBookableSets?: number;     // Số "bộ phòng" có thể đặt
  capacityWarning?: string | null; // Warning message nếu không đủ chỗ
  totalRooms?: number;          // Tổng số rooms vật lý
  
  // Policies
  refundable: boolean;
  payLater: boolean;
  freeCancellation: boolean;
  noCreditCard: boolean;
  extraBedFee: number;
  childrenAllowed: boolean;
  petsAllowed: boolean;
  
  // Promotions
  promotions?: Promotion[];
  
  // Facilities
  facilities: RoomFacility[];
}

export interface Booking {
  id?: string;
  hotel_id: string;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  total_price: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface RoomFiltersState {
  // ✅ Backward compatibility - giữ các keys cũ
  noSmoking?: boolean;
  payLater?: boolean;
  freeCancellation?: boolean;
  breakfast?: boolean;
  kingBed?: boolean;
  cityView?: boolean;
  noCreditCard?: boolean;
  // ✅ Dynamic filters từ backend - facilityIds và policyKeys
  [key: string]: boolean | undefined; // Cho phép dynamic keys
}

export interface FilterCounts {
  noSmoking?: number;
  payLater?: number;
  freeCancellation?: number;
  breakfast?: number;
  kingBed?: number;
  cityView?: number;
  noCreditCard?: number;
  // ✅ Dynamic counts từ backend
  [key: string]: number | undefined; // Cho phép dynamic keys
}

// ============================================================================
// SEARCH & PARAMS TYPES
// ============================================================================

export interface SearchParams {
  destination: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
}

export interface HotelSearchParams {
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  los: number; // Length of stay
}

export interface HotelDetailResponse {
  success: boolean;
  data?: {
    hotel: HotelDetail;
    availableRooms: Room[];
    searchParams: HotelSearchParams;
  };
  message?: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewCategory {
  label: string;
  score: number;
}

export interface Review {
  reviewId: string;
  accountId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  locationRating?: number;
  facilitiesRating?: number;
  serviceRating?: number;
  cleanlinessRating?: number;
  valueRating?: number;
  title?: string;
  comment: string;
  createdAt: string;
  helpful?: number;
  reply?: {
    reply_id: string;
    reply_text: string;
    replied_by: string;
    replied_by_name: string;
    replied_at: string;
  };
  bookingInfo?: {
    adults: number;
    children: number;
    checkin_date: string;
    checkout_date: string;
    nights_count: number;
    room_type_name?: string;
    bed_type?: string;
    guests_count: number;
  } | null;
}

// ============================================================================
// UI COMPONENT PROP TYPES
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href: string;
  count?: number;
}

export interface TabSection {
  id: string;
  label: string;
}
