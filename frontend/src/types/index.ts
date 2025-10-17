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
  amenities?: string[];
}

export interface Room {
  id: string;
  hotel_id: string;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  bed_type: string;
  room_size?: number;
  available_rooms: number;
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

export interface SearchParams {
  destination: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
}
