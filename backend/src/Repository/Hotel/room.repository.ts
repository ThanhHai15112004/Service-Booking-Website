import { Room } from "../../models/Hotel/room.model";
import { RoomType } from "../../models/Hotel/roomType.model";
import { Op } from "sequelize";

export class RoomRepository {
  // Hàm lấy hotelId từ roomTypeId
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

  // Hàm lấy danh sách phòng theo roomTypeId
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
          ['room_number', 'ASC'],
          ['room_id', 'ASC']
        ],
        raw: false
      });

      return rooms.map(room => {
        const roomData = room.toJSON();
        return {
          roomId: roomData.room_id,
          roomTypeId: roomData.room_type_id,
          hotelId: roomData.roomType?.hotel_id || null,
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

  // Hàm lấy phòng có thể đặt theo roomTypeId và date range
  async getAvailableRoomsByRoomTypeId(
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    roomsNeeded: number = 1
  ): Promise<any[]> {
    try {
      const rooms = await this.getRoomsByRoomTypeId(roomTypeId, 'ACTIVE');
      return rooms.slice(0, roomsNeeded);
    } catch (error: any) {
      console.error("[RoomRepository] getAvailableRoomsByRoomTypeId error:", error.message);
      return [];
    }
  }
}

