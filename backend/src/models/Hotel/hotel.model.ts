export interface Hotel{
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

export interface HotelLocation{
    city: string;
    district?: string | null;
    areaName?: string | null;
    distanceCenter: number | null;
}

export interface HotelFacility{
    facilityId: string;
    name: string;
    category: "HOTEL" | "ROOM";
    icon?: string;
}

export interface HotelBestOffer{
    stayType: "overnight" | "dayuse";
    nights?: number;
    date?: string;
    rooms: number;
    adults: number;
    children: number;
    roomTypeId: string;
    roomName?: string;
    capacity?: number;
    availableRooms: number;
    totalPrice: number;
    avgPricePerNight?: number;
    refundable?: boolean;
    payLater?: boolean;
}

export interface HotelSearchParams {
  stayType: "overnight" | "dayuse";
  q: string;
  checkin?: string;
  checkout?: string;
  date?: string;
  rooms: number;
  adults: number;
  children: number;
  childAges?: number[];        
  price_min?: number;
  price_max?: number;
  star_min?: number;
  facilities?: string[];
  max_distance?: number;
  limit?: number;
  offset?: number;
  sort?: "price_asc" | "price_desc" | "star_desc" | "rating_desc" | "distance_asc";
}


export interface HotelSearchResult {
  hotelId: string;
  name: string;
  starRating?: number | null;
  avgRating?: number | null;
  reviewCount?: number | null;
  mainImage?: string | null;
  location: HotelLocation;
  bestOffer: HotelBestOffer;
}
