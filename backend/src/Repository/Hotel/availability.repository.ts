import sequelize from "../../config/sequelize";
import { QueryTypes, Op } from "sequelize";
import { RoomPriceSchedule } from "../../models/Hotel/roomPriceSchedule.model";
import { Room } from "../../models/Hotel/room.model";
import { RoomType } from "../../models/Hotel/roomType.model";

export class AvailabilityRepository {
  // Hàm lấy phòng trống theo loại phòng (aggregate từ nhiều phòng)
  async getRoomTypeAvailability(roomTypeId: string, startDate: string, endDate: string) {
    // ✅ Auto-detect dayuse: if startDate === endDate, it's dayuse
    const isDayuse = startDate === endDate;
    
    // ✅ Build date condition based on stay type
    const dateCondition = isDayuse
      ? { [Op.eq]: startDate } // Dayuse: date = startDate
      : { [Op.gte]: startDate, [Op.lt]: endDate }; // Overnight: date >= startDate AND date < endDate

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
        date: dateCondition // ✅ Use dynamic date condition
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

  // Hàm lấy danh sách phòng còn trống (để system pick khi booking)
  async getAvailableRoomsInType(roomTypeId: string, startDate: string, endDate: string, roomsNeeded: number = 1) {
    // ✅ Auto-detect dayuse
    const isDayuse = startDate === endDate;
    
    if (isDayuse) {
      // ✅ Dayuse: simplified query with literal values
      const sql = `
        SELECT 
          r.room_id,
          r.room_number,
          MIN(rps.available_rooms) as minAvailable,
          COUNT(DISTINCT rps.date) as daysWithData,
          1 as requiredDays
        FROM room r
        INNER JOIN room_price_schedule rps ON rps.room_id = r.room_id
        WHERE r.room_type_id = ?
          AND r.status = 'ACTIVE'
          AND rps.date = ?
        GROUP BY r.room_id, r.room_number
        HAVING MIN(rps.available_rooms) >= 1
          AND COUNT(DISTINCT rps.date) = 1
        ORDER BY r.room_number ASC
        LIMIT ?
      `;
      
      const results = await sequelize.query(sql, {
        replacements: [roomTypeId, startDate, roomsNeeded],
        type: QueryTypes.SELECT
      }) as any[];
      
      return results.map((row: any) => ({
        room_id: row.room_id,
        roomId: row.room_id,
        room_number: row.room_number,
        roomNumber: row.room_number,
        minAvailable: parseInt(row.minAvailable) || 0
      }));
    } else {
      // ✅ Overnight: original query with date range
      const sql = `
        SELECT 
          r.room_id,
          r.room_number,
          MIN(rps.available_rooms) as minAvailable,
          COUNT(DISTINCT rps.date) as daysWithData,
          DATEDIFF(?, ?) as requiredDays
        FROM room r
        INNER JOIN room_price_schedule rps ON rps.room_id = r.room_id
        WHERE r.room_type_id = ?
          AND r.status = 'ACTIVE'
          AND rps.date >= ?
          AND rps.date < ?
        GROUP BY r.room_id, r.room_number
        HAVING MIN(rps.available_rooms) >= 1
          AND COUNT(DISTINCT rps.date) = DATEDIFF(?, ?)
        ORDER BY r.room_number ASC
        LIMIT ?
      `;
      
      const results = await sequelize.query(sql, {
        replacements: [endDate, startDate, roomTypeId, startDate, endDate, endDate, startDate, roomsNeeded],
        type: QueryTypes.SELECT
      }) as any[];
      
      return results.map((row: any) => ({
        room_id: row.room_id,
        roomId: row.room_id,
        room_number: row.room_number,
        roomNumber: row.room_number,
        minAvailable: parseInt(row.minAvailable) || 0
      }));
    }
  }

  // Hàm check theo room_id cụ thể (legacy - backward compatibility)
  async getRoomDailyAvailability(roomId: string, startDate: string, endDate: string) {
    // ✅ Handle dayuse vs overnight
    const isDayuse = startDate === endDate;
    const dateCondition = isDayuse
      ? { [Op.eq]: startDate }
      : { [Op.gte]: startDate, [Op.lt]: endDate };

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
        date: dateCondition
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

  // Hàm giảm số phòng trống (chỉ update room_price_schedule.available_rooms, không update room.status)
  async reduceAvailableRooms(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsCount: number = 1
  ): Promise<{ success: boolean; affectedRows: number }> {
    // ✅ Auto-detect dayuse
    const isDayuse = startDate === endDate;
    const dateCondition = isDayuse
      ? { [Op.eq]: startDate }
      : { [Op.gte]: startDate, [Op.lt]: endDate };
    
    const [affectedCount] = await RoomPriceSchedule.update(
      {
        available_rooms: sequelize.literal(`available_rooms - ${roomsCount}`)
      },
      {
        where: {
          room_id: roomId,
          date: dateCondition, // ✅ Use dynamic date condition
          available_rooms: {
            [Op.gte]: roomsCount
          }
        },
        hooks: false
      }
    );

    return {
      success: affectedCount > 0,
      affectedRows: affectedCount
    };
  }

  // Hàm tăng số phòng trống (chỉ update room_price_schedule.available_rooms, không update room.status)
  async increaseAvailableRooms(
    roomId: string,
    startDate: string,
    endDate: string,
    roomsCount: number = 1
  ): Promise<{ success: boolean; affectedRows: number }> {
    // ✅ Auto-detect dayuse
    const isDayuse = startDate === endDate;
    const dateCondition = isDayuse
      ? { [Op.eq]: startDate }
      : { [Op.gte]: startDate, [Op.lt]: endDate };
      
    const [affectedCount] = await RoomPriceSchedule.update(
      {
        available_rooms: sequelize.literal(`available_rooms + ${roomsCount}`)
      },
      {
        where: {
          room_id: roomId,
          date: dateCondition, // ✅ Use dynamic date condition
        },
        hooks: false
      }
    );

    return {
      success: affectedCount > 0,
      affectedRows: affectedCount
    };
  }

  // Hàm kiểm tra loại phòng có đủ không
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
