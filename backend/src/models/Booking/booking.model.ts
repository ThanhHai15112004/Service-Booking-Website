// Booking status
export type BookingStatus = 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'PAID';

// Payment method
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'CASH';

// Guest information
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
}

// Request để tạo booking mới
export interface CreateBookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;           // YYYY-MM-DD
  checkOut: string;          // YYYY-MM-DD
  rooms: number;             // Số phòng đặt
  adults: number;
  children?: number;
  childAges?: number[];
  guestInfo: GuestInfo;
  specialRequests?: string;
  paymentMethod: PaymentMethod;
}

// Booking record trong database
export interface Booking {
  booking_id: string;
  account_id: string;
  hotel_id: string;
  status: BookingStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  special_requests?: string;
  created_at: Date;
  updated_at: Date;
}

// Booking detail record trong database
export interface BookingDetail {
  booking_detail_id: string;
  booking_id: string;
  room_id: string;
  checkin_date: string;
  checkout_date: string;
  guests_count: number;
  price_per_night: number;
  nights_count: number;
  total_price: number;
}

// Response trả về khi tạo booking thành công
export interface BookingConfirmation {
  bookingId: string;
  bookingCode: string;
  status: BookingStatus;
  hotel: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  room: {
    id: string;
    name: string;
    type: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children?: number;
  guestInfo: GuestInfo;
  priceBreakdown: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalPrice: number;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  paymentDeadline?: string;
  specialRequests?: string;
  createdAt: Date;
}

// Response format chuẩn
export interface BookingResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Booking price calculation result
export interface BookingPriceCalculation {
  dailyPrices: Array<{
    date: string;
    basePrice: number;
    discountPercent: number;
    finalPrice: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  nightsCount: number;
}

