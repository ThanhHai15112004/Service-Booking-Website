import { Room } from "../../models/Hotel/room.model";
import { RoomType } from "../../models/Hotel/roomType.model";
import { RoomAmenity } from "../../models/Hotel/roomAmenity.model";
import { Facility } from "../../models/Hotel/facility.model";
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

  // Hàm lấy amenities của một phòng cụ thể
  async getRoomAmenities(roomId: string): Promise<any[]> {
    try {
      const amenities = await RoomAmenity.findAll({
        include: [
          {
            model: Facility,
            as: 'facility',
            attributes: ['facility_id', 'name', 'icon'],
            required: true
          }
        ],
        where: {
          room_id: roomId
        },
        attributes: [],
        raw: false
      });

      // Transform để format đúng
      const facilityMap = new Map<string, any>();
      amenities.forEach((item: any) => {
        const facility = item.facility;
        if (facility && !facilityMap.has(facility.facility_id)) {
          facilityMap.set(facility.facility_id, {
            facilityId: facility.facility_id,
            name: facility.name,
            icon: facility.icon
          });
        }
      });

      return Array.from(facilityMap.values());
    } catch (error: any) {
      console.error("[RoomRepository] getRoomAmenities error:", error.message);
      return [];
    }
  }
}

