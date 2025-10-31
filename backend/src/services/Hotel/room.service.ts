import { RoomRepository } from "../../Repository/Hotel/room.repository";

export class RoomService {
  private repository = new RoomRepository();

  /**
   * Lấy hotelId từ roomTypeId
   * @param roomTypeId - ID của loại phòng
   * @returns hotelId hoặc null
   */
  async getHotelIdByRoomTypeId(roomTypeId: string): Promise<any> {
    try {
      if (!roomTypeId || roomTypeId.trim().length === 0) {
        return {
          success: false,
          message: "Room Type ID is required",
          data: null
        };
      }

      const hotelId = await this.repository.getHotelIdByRoomTypeId(roomTypeId);

      if (!hotelId) {
        return {
          success: false,
          message: "Không tìm thấy khách sạn cho loại phòng này",
          data: null
        };
      }

      return {
        success: true,
        message: "Found hotel ID",
        data: { hotelId }
      };
    } catch (error: any) {
      console.error("[RoomService] getHotelIdByRoomTypeId error:", error.message || error);
      return {
        success: false,
        message: "Lỗi khi lấy hotel ID",
        data: null
      };
    }
  }

  /**
   * Lấy danh sách phòng theo room_type_id
   * @param roomTypeId - ID của loại phòng
   * @returns Danh sách phòng thuộc room_type đó
   */
  async getRoomsByRoomTypeId(roomTypeId: string): Promise<any> {
    try {
      if (!roomTypeId || roomTypeId.trim().length === 0) {
        return {
          success: false,
          message: "Room Type ID is required",
          data: []
        };
      }

      const rooms = await this.repository.getRoomsByRoomTypeId(roomTypeId);

      return {
        success: true,
        message: `Found ${rooms.length} room(s)`,
        data: rooms
      };
    } catch (error: any) {
      console.error("[RoomService] getRoomsByRoomTypeId error:", error.message || error);
      return {
        success: false,
        message: "Lỗi khi lấy danh sách phòng",
        data: []
      };
    }
  }

  /**
   * Lấy phòng có thể đặt theo room_type_id và date range
   * @param roomTypeId - ID của loại phòng
   * @param checkIn - Ngày check-in
   * @param checkOut - Ngày check-out
   * @param roomsNeeded - Số phòng cần đặt
   * @returns Danh sách phòng có thể đặt
   */
  async getAvailableRoomsByRoomTypeId(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    roomsNeeded: number = 1
  ): Promise<any> {
    try {
      if (!roomTypeId || !checkIn || !checkOut) {
        return {
          success: false,
          message: "Room Type ID, check-in and check-out dates are required",
          data: []
        };
      }

      const rooms = await this.repository.getAvailableRoomsByRoomTypeId(
        roomTypeId,
        checkIn,
        checkOut,
        roomsNeeded
      );

      return {
        success: true,
        message: `Found ${rooms.length} available room(s)`,
        data: rooms
      };
    } catch (error: any) {
      console.error("[RoomService] getAvailableRoomsByRoomTypeId error:", error.message || error);
      return {
        success: false,
        message: "Lỗi khi lấy danh sách phòng có thể đặt",
        data: []
      };
    }
  }
}

