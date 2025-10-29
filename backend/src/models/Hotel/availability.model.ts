// Thông tin phòng trống của một ngày cụ thể
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

//Thông tin tổng hợp phòng trống của một room type
export interface RoomAvailabilitySummary {
  roomId: string;
  roomName: string;
  minAvailable: number;          
  totalNights: number;          
  hasFullAvailability: boolean;   
  dailyAvailability: DailyRoomAvailability[];
}

// Thông tin phòng trống của toàn bộ hotel
export interface HotelAvailability {
  hotelId: string;
  hotelName: string;
  rooms: RoomAvailabilitySummary[];
}

// Request params để kiểm tra availability
export interface AvailabilityCheckParams {
  startDate: string;
  endDate: string;
  roomsCount?: number; // Optional: số phòng cần check (mặc định 1)
}

//Request params để giảm/tăng availability
export interface AvailabilityUpdateParams {
  roomId: string;
  startDate: string;
  endDate: string;
  roomsCount: number;
}

// Response format chuẩn
export interface AvailabilityResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Response cho room availability check với roomsCount
export interface RoomAvailabilityCheckResult {
  dailyAvailability: DailyRoomAvailability[];
  hasEnoughRooms: boolean; // Có đủ số phòng yêu cầu không
  minAvailable: number;    // Số phòng tối thiểu available trong khoảng thời gian
  roomsNeeded: number;     // Số phòng cần thiết
}

