// models/Hotel/hotel.model.ts

export interface Hotel {
  hotelId: string;
  name: string;
  description?: string | null;
  starRating?: number | null;
  avgRating?: number | null;
  reviewCount?: number | null;
  mainImage?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HotelLocation {
  city: string;
  district?: string | null;
  areaName?: string | null;
  distanceCenter: number | null;
}

export interface HotelBestOffer {
  stayType: "overnight" | "dayuse";
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  roomTypeId: string;
  roomName?: string;
  capacity?: number;
  availableRooms: number;
  totalPrice: number;
  avgPricePerNight?: number;
  originalPricePerNight?: number;
  totalOriginalPrice?: number;
  discountPercent?: number;
  refundable?: boolean;
  payLater?: boolean;
  freeCancellation?: boolean;
  noCreditCard?: boolean;
  petsAllowed?: boolean;
  childrenAllowed?: boolean;
}

export interface HotelSearchParams {
  stayType: "overnight" | "dayuse";
  q?: string;
  checkin?: string;
  checkout?: string;
  date?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  star_min?: number;
  facilities?: string[];
  max_distance?: number;
  category_id?: string;
  bed_types?: string[];
  policies?: string[];
  limit?: number;
  offset?: number;
  sort?: "price_asc" | "price_desc" | "star_desc" | "rating_desc" | "distance_asc";
}

export interface HotelImage {
  imageId: string;
  imageUrl: string;
  isPrimary: boolean;
  caption?: string | null;
  sortOrder: number;
}

export interface HotelFacility {
  facilityId: string;
  name: string;
  icon?: string | null;
}

export interface HotelSearchResult {
  hotelId: string;
  name: string;
  starRating?: number | null;
  avgRating?: number | null;
  reviewCount?: number | null;
  mainImage?: string | null;
  categoryName?: string | null;
  images?: HotelImage[];
  facilities?: HotelFacility[];
  location: HotelLocation;
  bestOffer: HotelBestOffer;
}

// Interface cho filter builder
export interface SearchFilter {
  conditions: string[];
  values: any[];
}

// Highlight for hotel detail page
export interface HotelHighlight {
  iconType: 'wifi' | 'parking' | 'reception' | 'pool' | 'restaurant' | 'gym' | 'spa' | 'other';
  text: string;
  tooltip?: string;
}

// Badge for hotel (e.g., "Popular", "New", "Recommended")
export interface HotelBadge {
  type: 'popular' | 'new' | 'recommended' | 'top_rated' | 'best_value';
  label: string;
  color?: string;
}

// Structured policies
export interface HotelPolicies {
  checkIn: {
    from: string; // "14:00"
    to?: string;
  };
  checkOut: {
    before: string; // "12:00"
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

// Extended hotel detail response
export interface HotelDetailData extends Hotel {
  categoryName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  checkinTime?: string;
  checkoutTime?: string;
  totalRooms?: number;
  city?: string;
  district?: string;
  ward?: string;
  areaName?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  distanceCenter?: number;
  images?: HotelImage[];
  facilities?: HotelFacility[];
  highlights?: HotelHighlight[];
  badges?: HotelBadge[];
  policies?: HotelPolicies;
}