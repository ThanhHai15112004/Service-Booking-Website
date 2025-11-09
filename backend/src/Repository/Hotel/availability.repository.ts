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
        [
          sequelize.fn('AVG',
            sequelize.literal(`
              CASE 
                WHEN RoomPriceSchedule.final_price IS NOT NULL AND RoomPriceSchedule.final_price > 0
                THEN RoomPriceSchedule.final_price
                ELSE GREATEST(0,
                  (RoomPriceSchedule.base_price * (1 - (COALESCE(RoomPriceSchedule.discount_percent, 0) + COALESCE(RoomPriceSchedule.system_discount_percent, 0) + COALESCE(RoomPriceSchedule.provider_discount_percent, 0)) / 100))
                  - COALESCE(RoomPriceSchedule.provider_discount_amount, 0)
                  - COALESCE(RoomPriceSchedule.system_discount_amount, 0)
                )
              END
            `)
          ),
          'finalPrice'
        ],
        [
          sequelize.fn('AVG',
            sequelize.literal(`
              CASE 
                WHEN RoomPriceSchedule.final_price IS NOT NULL AND RoomPriceSchedule.base_price > 0
                THEN ((RoomPriceSchedule.base_price - RoomPriceSchedule.final_price) / RoomPriceSchedule.base_price) * 100
                ELSE (
                  ((COALESCE(RoomPriceSchedule.discount_percent, 0) + COALESCE(RoomPriceSchedule.system_discount_percent, 0) + COALESCE(RoomPriceSchedule.provider_discount_percent, 0)) * RoomPriceSchedule.base_price / 100)
                  + COALESCE(RoomPriceSchedule.provider_discount_amount, 0)
                  + COALESCE(RoomPriceSchedule.system_discount_amount, 0)
                ) / NULLIF(RoomPriceSchedule.base_price, 0) * 100
              END
            `)
          ),
          'discountPercent'
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
      
      // Get price for each room from room_price_schedule
      const roomsWithPrice = await Promise.all(
        results.map(async (row: any) => {
          try {
            const priceSchedule = await RoomPriceSchedule.findOne({
              where: {
                room_id: row.room_id,
                date: startDate
              },
              attributes: ['base_price', 'final_price', 'discount_percent', 'provider_discount_percent', 'system_discount_percent', 'provider_discount_amount', 'system_discount_amount'],
              raw: true
            });
            
            if (priceSchedule) {
              const schedule = priceSchedule as any;
              const basePrice = Number(schedule.base_price) || 0;
              
              // ✅ Calculate final price with all discount types
              let finalPrice = 0;
              if (schedule.final_price && Number(schedule.final_price) > 0) {
                finalPrice = Number(schedule.final_price);
              } else {
                const discountPercent = Number(schedule.discount_percent) || 0;
                const systemDiscountPercent = Number(schedule.system_discount_percent) || 0;
                const providerDiscountPercent = Number(schedule.provider_discount_percent) || 0;
                const providerDiscountAmount = Number(schedule.provider_discount_amount) || 0;
                const systemDiscountAmount = Number(schedule.system_discount_amount) || 0;
                
                // Calculate total discount percent (sum of all percent discounts)
                const totalDiscountPercent = discountPercent + systemDiscountPercent + providerDiscountPercent;
                
                // Apply percent discounts
                let priceAfterPercent = basePrice;
                if (totalDiscountPercent > 0) {
                  priceAfterPercent = basePrice * (1 - totalDiscountPercent / 100);
                }
                
                // Subtract discount amounts
                finalPrice = Math.max(0, priceAfterPercent - providerDiscountAmount - systemDiscountAmount);
              }
              
              // Calculate effective discount percent for display
              const discountPercent = basePrice > 0
                ? ((basePrice - finalPrice) / basePrice) * 100
                : 0;
              
              return {
                room_id: row.room_id,
                roomId: row.room_id,
                room_number: row.room_number,
                roomNumber: row.room_number,
                minAvailable: parseInt(row.minAvailable) || 0,
                base_price: basePrice,
                final_price: finalPrice,
                discount_percent: discountPercent
              };
            } else {
              return {
                room_id: row.room_id,
                roomId: row.room_id,
                room_number: row.room_number,
                roomNumber: row.room_number,
                minAvailable: parseInt(row.minAvailable) || 0,
                base_price: 0,
                final_price: 0,
                discount_percent: 0
              };
            }
          } catch (err) {
            console.error(`Error fetching price for room ${row.room_id}:`, err);
            return {
              room_id: row.room_id,
              roomId: row.room_id,
              room_number: row.room_number,
              roomNumber: row.room_number,
              minAvailable: parseInt(row.minAvailable) || 0,
              base_price: 0,
              final_price: 0,
              discount_percent: 0
            };
          }
        })
      );
      
      return roomsWithPrice;
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
      
      // Get average price for each room from room_price_schedule (for date range)
      const roomsWithPrice = await Promise.all(
        results.map(async (row: any) => {
          try {
            const priceSchedules = await RoomPriceSchedule.findAll({
              where: {
                room_id: row.room_id,
                date: {
                  [Op.gte]: startDate,
                  [Op.lt]: endDate
                }
              },
              attributes: ['base_price', 'final_price', 'discount_percent', 'provider_discount_percent', 'system_discount_percent', 'provider_discount_amount', 'system_discount_amount'],
              raw: true
            });
            
            if (priceSchedules.length > 0) {
              // ✅ Calculate final price for each schedule with all discount types
              const finalPrices = priceSchedules.map((p: any) => {
                if (p.final_price && Number(p.final_price) > 0) {
                  return Number(p.final_price);
                } else {
                  const basePrice = Number(p.base_price) || 0;
                  const discountPercent = Number(p.discount_percent) || 0;
                  const systemDiscountPercent = Number(p.system_discount_percent) || 0;
                  const providerDiscountPercent = Number(p.provider_discount_percent) || 0;
                  const providerDiscountAmount = Number(p.provider_discount_amount) || 0;
                  const systemDiscountAmount = Number(p.system_discount_amount) || 0;
                  
                  // Calculate total discount percent (sum of all percent discounts)
                  const totalDiscountPercent = discountPercent + systemDiscountPercent + providerDiscountPercent;
                  
                  // Apply percent discounts
                  let priceAfterPercent = basePrice;
                  if (totalDiscountPercent > 0) {
                    priceAfterPercent = basePrice * (1 - totalDiscountPercent / 100);
                  }
                  
                  // Subtract discount amounts
                  return Math.max(0, priceAfterPercent - providerDiscountAmount - systemDiscountAmount);
                }
              });
              const avgFinalPrice = finalPrices.reduce((sum: number, price: number) => sum + price, 0) / finalPrices.length;
              
              // Calculate average base price and discount percent
              const totalBasePrice = priceSchedules.reduce((sum: number, p: any) => sum + (Number(p.base_price) || 0), 0);
              const avgBasePrice = totalBasePrice / priceSchedules.length;
              const avgDiscountPercent = avgBasePrice > 0
                ? ((avgBasePrice - avgFinalPrice) / avgBasePrice) * 100
                : 0;
              
              return {
                room_id: row.room_id,
                roomId: row.room_id,
                room_number: row.room_number,
                roomNumber: row.room_number,
                minAvailable: parseInt(row.minAvailable) || 0,
                base_price: avgBasePrice,
                final_price: avgFinalPrice,
                discount_percent: avgDiscountPercent
              };
            } else {
              return {
                room_id: row.room_id,
                roomId: row.room_id,
                room_number: row.room_number,
                roomNumber: row.room_number,
                minAvailable: parseInt(row.minAvailable) || 0,
                base_price: 0,
                final_price: 0,
                discount_percent: 0
              };
            }
          } catch (err) {
            console.error(`Error fetching price for room ${row.room_id}:`, err);
            return {
              room_id: row.room_id,
              roomId: row.room_id,
              room_number: row.room_number,
              roomNumber: row.room_number,
              minAvailable: parseInt(row.minAvailable) || 0,
              base_price: 0,
              final_price: 0,
              discount_percent: 0
            };
          }
        })
      );
      
      return roomsWithPrice;
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
        [
          sequelize.literal(`
            CASE 
              WHEN RoomPriceSchedule.final_price IS NOT NULL AND RoomPriceSchedule.final_price > 0
              THEN RoomPriceSchedule.final_price
              ELSE GREATEST(0,
                (RoomPriceSchedule.base_price * (1 - (COALESCE(RoomPriceSchedule.discount_percent, 0) + COALESCE(RoomPriceSchedule.system_discount_percent, 0) + COALESCE(RoomPriceSchedule.provider_discount_percent, 0)) / 100))
                - COALESCE(RoomPriceSchedule.provider_discount_amount, 0)
                - COALESCE(RoomPriceSchedule.system_discount_amount, 0)
              )
            END
          `),
          'finalPrice'
        ],
        [
          sequelize.literal(`
            CASE 
              WHEN RoomPriceSchedule.final_price IS NOT NULL AND RoomPriceSchedule.base_price > 0
              THEN ((RoomPriceSchedule.base_price - RoomPriceSchedule.final_price) / RoomPriceSchedule.base_price) * 100
              ELSE (
                ((COALESCE(RoomPriceSchedule.discount_percent, 0) + COALESCE(RoomPriceSchedule.system_discount_percent, 0) + COALESCE(RoomPriceSchedule.provider_discount_percent, 0)) * RoomPriceSchedule.base_price / 100)
                + COALESCE(RoomPriceSchedule.provider_discount_amount, 0)
                + COALESCE(RoomPriceSchedule.system_discount_amount, 0)
              ) / NULLIF(RoomPriceSchedule.base_price, 0) * 100
            END
          `),
          'discount_percent'
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
