import api from "../api/axiosClient";

// ✅ Request để tạo booking tạm thời (khi vào trang booking)
export interface CreateTemporaryBookingRequest {
  hotelId: string;
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
}

export interface CreateBookingRequest {
  bookingId?: string;        // ✅ Optional: Booking ID từ temporary booking
  hotelId: string;
  roomId?: string;
  roomTypeId?: string; // ✅ Backend supports auto-selecting room if roomTypeId is provided
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
  childAges?: number[];
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
  };
  specialRequests?: string;
  paymentMethod: 'VNPAY' | 'MOMO' | 'CASH';
  // ✅ Backend may not support these yet, but we send them anyway
  checkInTime?: string;
  smokingPreference?: 'non-smoking' | 'smoking' | null;
  bedPreference?: 'large-bed' | 'twin-beds' | null;
}

export interface BookingConfirmation {
  bookingId: string;
  bookingCode: string;
  status: string;
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
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country?: string;
  };
  priceBreakdown: {
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalPrice: number;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid';
  paymentDeadline?: string;
  specialRequests?: string;
  createdAt: Date;
}

// ✅ Tạo booking tạm thời (status CREATED) khi vào trang booking
export const createTemporaryBooking = async (request: CreateTemporaryBookingRequest): Promise<{
  success: boolean;
  data?: {
    bookingId: string;
    bookingCode: string;
    expiresAt: Date;
  };
  message?: string;
}> => {
  try {
    console.log('📤 Creating temporary booking:', request);
    const res = await api.post('/api/bookings/temporary', request);
    console.log('✅ Temporary booking created:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating temporary booking:', error);
    
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để đặt phòng'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tạo booking tạm thời'
    };
  }
};

// ✅ Check if booking exists and is still valid
export const checkBookingExists = async (bookingId: string): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const res = await api.get(`/api/bookings/${bookingId}`);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error checking booking:', error);
    
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Booking không tồn tại'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể kiểm tra booking'
    };
  }
};

// ✅ Cancel booking
export const cancelBooking = async (bookingId: string): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const res = await api.delete(`/api/bookings/${bookingId}`);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error canceling booking:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể hủy booking'
    };
  }
};

export const createBooking = async (request: CreateBookingRequest): Promise<{
  success: boolean;
  data?: BookingConfirmation;
  message?: string;
}> => {
  try {
    // ✅ Log request payload for debugging
    console.log('📤 Creating booking request:', {
      hotelId: request.hotelId,
      roomId: request.roomId || 'N/A',
      roomTypeId: request.roomTypeId || 'N/A',
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      rooms: request.rooms,
      adults: request.adults,
      children: request.children,
      paymentMethod: request.paymentMethod,
      guestInfo: {
        firstName: request.guestInfo.firstName,
        lastName: request.guestInfo.lastName,
        email: request.guestInfo.email,
        phone: request.guestInfo.phone
      }
    });

    const res = await api.post('/api/bookings', request);
    console.log('✅ Booking created successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error creating booking:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Request payload:', request);
    
    // Handle authentication error
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Vui lòng đăng nhập để đặt phòng'
      };
    }
    
    // Handle 400 Bad Request (validation errors)
    if (error.response?.status === 400) {
      return {
        success: false,
        message: error.response?.data?.message || 'Thông tin đặt phòng không hợp lệ'
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tạo booking'
    };
  }
};

