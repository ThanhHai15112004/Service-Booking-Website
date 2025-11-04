export type BookingStatus = 'CREATED' | 'CONFIRMED' | 'CANCELLED' | 'PAID';

export type PaymentMethod = 'VNPAY' | 'MOMO' | 'CASH';

// Guest information
export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
}

export interface CreateTemporaryBookingRequest {
  hotelId: string;
  roomTypeId: string;        
  checkIn: string;          
  checkOut: string;
  stayType?: 'overnight' | 'dayuse'; // ✅ Thêm stayType
  rooms: number;           
  adults: number;
  children?: number;
  discountCode?: string; // ✅ Mã giảm giá (nếu có)
}

export interface CreateBookingRequest {
  bookingId?: string;       
  hotelId: string;
  roomId?: string;          
  roomTypeId?: string;       
  checkIn: string;          
  checkOut: string;
  stayType?: 'overnight' | 'dayuse'; // ✅ Thêm stayType
  rooms: number;            
  adults: number;
  children?: number;
  childAges?: number[];
  guestInfo: GuestInfo;
  specialRequests?: string;
  paymentMethod: PaymentMethod;
  discountCode?: string; // ✅ Mã giảm giá (nếu có)
}

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
    roomNumber?: string | null; 
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children?: number;
  guestInfo: GuestInfo;
  priceBreakdown: {
    subtotal: number; // Tổng giá trước package discount
    packageDiscount: number; // Discount từ account package
    subtotalAfterPackage: number; // Subtotal sau package discount
    taxAmount: number; // Thuế (10%)
    codeDiscount: number; // Discount từ discount code
    discountAmount: number; // Tổng discount (packageDiscount + codeDiscount)
    totalPrice: number; // Tổng cuối cùng
  };
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  paymentDeadline?: string;
  specialRequests?: string;
  createdAt: Date;
}

export interface BookingResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface BookingPriceCalculation {
  dailyPrices: Array<{
    date: string;
    basePrice: number;
    discountPercent: number; // Legacy field (từ discount_percent cũ)
    providerDiscount: number; // Provider discount amount
    systemDiscount: number; // System discount amount
    finalPrice: number; // = basePrice - providerDiscount - systemDiscount
  }>;
  subtotal: number; // Tổng giá trước khi áp dụng package discount
  packageDiscount: number; // Discount từ account package
  subtotalAfterPackage: number; // Subtotal sau khi áp dụng package discount
  taxAmount: number; // Thuế (10%)
  codeDiscount: number; // Discount từ discount code
  discountAmount: number; // Tổng discount (packageDiscount + codeDiscount)
  totalAmount: number; // Tổng cuối cùng
  nightsCount: number;
}

