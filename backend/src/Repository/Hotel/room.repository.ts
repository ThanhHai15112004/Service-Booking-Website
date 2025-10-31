import { Room } from "../../models/Hotel/room.model";
import { RoomType } from "../../models/Hotel/roomType.model";
import { Op } from "sequelize";

export class RoomRepository {
  /**
   * Lấy hotelId từ roomTypeId
   * @param roomTypeId - ID của loại phòng
   * @returns hotelId hoặc null
   */
  async getHotelIdByRoomTypeId(roomTypeId: string): Promise<string | null> {
    try {
      const roomType = await RoomType.findOne({
        where: { room_type_id: roomTypeId },
        attributes: ['hotel_id'],
        raw: true
      });
      
      return roomType ? (roomType as any).hotel_id : null;
    } catch (error: any) {
      console.error("[RoomRepository] getHotelIdByRoomTypeId error:", error.message);
      return null;
    }
  }

  /**
   * Lấy danh sách phòng theo room_type_id
   * @param roomTypeId - ID của loại phòng
   * @param status - Status của phòng (default: 'ACTIVE')
   * @returns Danh sách phòng thuộc room_type đó
   */
  async getRoomsByRoomTypeId(
    roomTypeId: string,
    status: string = 'ACTIVE'
  ): Promise<any[]> {
    try {
      const rooms = await Room.findAll({
        include: [
          {
            model: RoomType,
            as: 'roomType',
            attributes: ['hotel_id'],
            required: true
          }
        ],
        where: {
          room_type_id: roomTypeId,
          status: status
        },
        order: [
          ['room_number', 'ASC'], // Sort theo room_number để chọn phòng đầu tiên khi booking
          ['room_id', 'ASC']
        ],
        raw: false
      });

      return rooms.map(room => {
        const roomData = room.toJSON();
        return {
          roomId: roomData.room_id,
          roomTypeId: roomData.room_type_id,
          hotelId: roomData.roomType?.hotel_id || null, // ✅ Thêm hotelId
          roomNumber: roomData.room_number,
          capacity: roomData.capacity,
          imageUrl: roomData.image_url,
          priceBase: roomData.price_base ? Number(roomData.price_base) : null,
          status: roomData.status
        };
      });
    } catch (error: any) {
      console.error("[RoomRepository] getRoomsByRoomTypeId error:", error.message);
      return [];
    }
  }

  /**
   * Lấy phòng đầu tiên còn trống theo room_type_id và date range
   * Dùng để tự động chọn phòng khi booking
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
  ): Promise<any[]> {
    try {
      // TODO: Implement logic để lấy phòng có availability đủ trong date range
      // Tạm thời chỉ lấy danh sách phòng ACTIVE
      const rooms = await this.getRoomsByRoomTypeId(roomTypeId, 'ACTIVE');
      
      // Trả về số phòng đầu tiên đủ cho booking
      return rooms.slice(0, roomsNeeded);
    } catch (error: any) {
      console.error("[RoomRepository] getAvailableRoomsByRoomTypeId error:", error.message);
      return [];
    }
  }
}

