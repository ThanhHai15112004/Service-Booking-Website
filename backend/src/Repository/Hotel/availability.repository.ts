import sequelize from "../../config/sequelize";
import { QueryTypes, Op } from "sequelize";
import { RoomPriceSchedule } from "../../models/Hotel/roomPriceSchedule.model";
import { Room } from "../../models/Hotel/room.model";
import { RoomType } from "../../models/Hotel/roomType.model";

export class AvailabilityRepository {
  // Lấy phòng trống theo loại phòng (aggregate từ nhiều phòng)
  async getRoomTypeAvailability(roomTypeId: string, startDate: string, endDate: string) {
    return await RoomPriceSchedule.findAll({
      include: [
        {
          model: Room,
          as: 'room',
          attributes: [],
          required: true,
          where: { status: 'ACTIVE' },
          include: [
            {
              model: RoomType,
              as: 'roomType',
              attributes: ['room_type_id', 'name'],
              required: true,
              where: { room_type_id: roomTypeId }
            }
          ]
        }
      ],
      attributes: [
        [sequelize.col('room.roomType.room_type_id'), 'roomTypeId'],
        [sequelize.col('room.roomType.name'), 'roomName'],
        [sequelize.fn('DATE_FORMAT', sequelize.col('RoomPriceSchedule.date'), '%Y-%m-%d'), 'date'],
        [sequelize.fn('AVG', sequelize.col('RoomPriceSchedule.base_price')), 'basePrice'],
        [sequelize.fn('AVG', sequelize.col('RoomPriceSchedule.discount_percent')), 'discountPercent'],
        [
          sequelize.fn('AVG', 
            sequelize.literal('(RoomPriceSchedule.base_price * (1 - RoomPriceSchedule.discount_percent / 100))')
          ), 
          'finalPrice'
        ],
        [sequelize.fn('SUM', sequelize.col('RoomPriceSchedule.available_rooms')), 'availableRooms'],
        [sequelize.fn('MAX', sequelize.col('RoomPriceSchedule.refundable')), 'refundable'],
        [sequelize.fn('MAX', sequelize.col('RoomPriceSchedule.pay_later')), 'payLater'],
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('room.room_id'))), 'totalRooms']
      ],
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      group: [
        sequelize.col('room.roomType.room_type_id'),
        sequelize.col('room.roomType.name'),
        sequelize.fn('DATE_FORMAT', sequelize.col('RoomPriceSchedule.date'), '%Y-%m-%d')
      ],
      order: [[sequelize.col('RoomPriceSchedule.date'), 'ASC']],
      raw: true,
      nest: false
    });
  }

  // Lấy danh sách phòng còn trống (để system pick khi booking)
  async getAvailableRoomsInType(roomTypeId: string, startDate: string, endDate: string, roomsNeeded: number = 1) {
    return await Room.findAll({
      include: [
        {
          model: RoomPriceSchedule,
          as: 'priceSchedules',
          attributes: [],
          required: true,
          where: {
            date: {
              [Op.gte]: startDate,
              [Op.lt]: endDate
            }
          }
        }
      ],
      attributes: [
        'room_id',
        'room_number',
        [sequelize.fn('MIN', sequelize.col('priceSchedules.available_rooms')), 'minAvailable']
      ],
      where: {
        room_type_id: roomTypeId,
        status: 'ACTIVE'
      },
      group: ['room.room_id', 'room.room_number'],
      having: sequelize.where(
        sequelize.fn('MIN', sequelize.col('priceSchedules.available_rooms')),
        { [Op.gte]: roomsNeeded }
      ),
      order: [['room_number', 'ASC']],
      limit: roomsNeeded,
      raw: true
    });
  }

  // LEGACY: Check theo room_id cụ thể (backward compatibility)
  async getRoomDailyAvailability(roomId: string, startDate: string, endDate: string) {
    return await RoomPriceSchedule.findAll({
      include: [
        {
          model: Room,
          as: 'room',
          attributes: [],
          required: true,
          include: [
            {
              model: RoomType,
              as: 'roomType',
              attributes: ['name'],
              required: true
            }
          ]
        }
      ],
      attributes: [
        'room_id',
        [sequelize.col('room.roomType.name'), 'roomName'],
        [sequelize.fn('DATE_FORMAT', sequelize.col('RoomPriceSchedule.date'), '%Y-%m-%d'), 'date'],
        'base_price',
        'discount_percent',
        [
          sequelize.literal('(RoomPriceSchedule.base_price * (1 - RoomPriceSchedule.discount_percent / 100))'),
          'finalPrice'
        ],
        'available_rooms',
        'refundable',
        'pay_later'
      ],
      where: {
        room_id: roomId,
        date: {
          [Op.gte]: startDate,
          [Op.lt]: endDate
        }
      },
      order: [['date', 'ASC']],
      raw: true,
      nest: false
    });
  }

  // Lấy thông tin khách sạn (vẫn dùng raw query vì chưa có Hotel model)
  async getHotelById(hotelId: string) {
    const [result] = await sequelize.query<{ hotel_id: string; name: string }>(
      `SELECT hotel_id, name FROM hotel WHERE hotel_id = ?`,
      {
        replacements: [hotelId],
        type: QueryTypes.SELECT
      }
    );

    return result || null;
  }

  // Lấy danh sách phòng đang hoạt động
  async getActiveRoomsByHotel(hotelId: string) {
    return await Room.findAll({
      include: [
        {
          model: RoomType,
          as: 'roomType',
          attributes: ['name'],
          required: true,
          where: { hotel_id: hotelId }
        }
      ],
      attributes: [
        'room_id',
        [sequelize.col('roomType.name'), 'room_name']
      ],
      where: {
        status: 'ACTIVE'
      },
      order: [[sequelize.col('roomType.name'), 'ASC']],
      raw: true
    });
  }

  // Giảm số phòng trống cho một phòng cụ thể (được pick tự động)
  async reduceAvailableRooms(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsCount: number = 1
  ): Promise<{ success: boolean; affectedRows: number }> {
    const [affectedCount] = await RoomPriceSchedule.update(
      {
        available_rooms: sequelize.literal(`available_rooms - ${roomsCount}`)
      },
      {
        where: {
          room_id: roomId,
          date: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          },
          available_rooms: {
            [Op.gte]: roomsCount
          }
        }
      }
    );

    return {
      success: affectedCount > 0,
      affectedRows: affectedCount
    };
  }

  // Tăng số phòng trống cho một phòng cụ thể (khi hủy booking)
  async increaseAvailableRooms(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsCount: number = 1
  ): Promise<{ success: boolean; affectedRows: number }> {
    const [affectedCount] = await RoomPriceSchedule.update(
      {
        available_rooms: sequelize.literal(`available_rooms + ${roomsCount}`)
      },
      {
        where: {
          room_id: roomId,
          date: {
            [Op.gte]: startDate,
            [Op.lt]: endDate
          }
        }
      }
    );

    return {
      success: affectedCount > 0,
      affectedRows: affectedCount
    };
  }

  // Kiểm tra loại phòng có đủ không
  async hasEnoughRoomTypeAvailability(
    roomTypeId: string,
    startDate: string,
    endDate: string,
    roomsNeeded: number
  ): Promise<{ hasEnough: boolean; minAvailable: number }> {
    const data = await this.getRoomTypeAvailability(roomTypeId, startDate, endDate);

    if (data.length === 0) {
      return { hasEnough: false, minAvailable: 0 };
    }

    const minAvailable = Math.min(...(data as any[]).map(d => parseInt(d.availableRooms)));

    return {
      hasEnough: minAvailable >= roomsNeeded,
      minAvailable
    };
  }

  // LEGACY: Kiểm tra room cụ thể có đủ không
  async hasEnoughAvailability(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsNeeded: number
  ): Promise<boolean> {
    const data = await this.getRoomDailyAvailability(roomId, startDate, endDate);

    if (data.length === 0) return false;

    const minAvailable = Math.min(...(data as any[]).map(d => parseInt(d.availableRooms || d.available_rooms)));
    return minAvailable >= roomsNeeded;
  }
}
