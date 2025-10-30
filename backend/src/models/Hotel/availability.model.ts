// Thông tin phòng trống theo ngày
export interface DailyRoomAvailability {
  roomId: string;
  roomName: string;
  date: string;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  availableRooms: number;
  refundable: boolean;
  payLater: boolean;
}

// Tổng hợp phòng trống của một loại phòng
export interface RoomAvailabilitySummary {
  roomId: string;
  roomName: string;
  minAvailable: number;
  totalNights: number;
  hasFullAvailability: boolean;
  dailyAvailability: DailyRoomAvailability[];
}

// Thông tin phòng trống của toàn khách sạn
export interface HotelAvailability {
  hotelId: string;
  hotelName: string;
  rooms: RoomAvailabilitySummary[];
}

export interface AvailabilityCheckParams {
  startDate: string;
  endDate: string;
  roomsCount?: number;
}

export interface AvailabilityUpdateParams {
  roomId: string;
  startDate: string;
  endDate: string;
  roomsCount: number;
}

export interface AvailabilityResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Kết quả kiểm tra phòng trống với số lượng yêu cầu
export interface RoomAvailabilityCheckResult {
  dailyAvailability: DailyRoomAvailability[];
  hasEnoughRooms: boolean;
  minAvailable: number;
  roomsNeeded: number;
}

