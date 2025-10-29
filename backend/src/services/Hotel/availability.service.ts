import { AvailabilityRepository } from "../../Repository/Hotel/availability.repository";
import {
  DailyRoomAvailability,
  RoomAvailabilitySummary,
  HotelAvailability,
  AvailabilityCheckParams,
  AvailabilityUpdateParams,
  AvailabilityResponse,
  RoomAvailabilityCheckResult
} from "../../models/Hotel/availability.model";
import { AvailabilityValidator } from "../../utils/availability.validator";
import { calculateNights } from "../../helpers/date.helper";

export class AvailabilityService {
  private repository = new AvailabilityRepository();

  // Kiểm tra phòng trống cho một room cụ thể
  async checkRoomAvailability(
    roomId: string,
    params: AvailabilityCheckParams
  ): Promise<AvailabilityResponse<DailyRoomAvailability[] | RoomAvailabilityCheckResult>> {
    try {
      // Validate roomId
      const roomIdValidation = AvailabilityValidator.validateRoomId(roomId);
      if (!roomIdValidation.valid) {
        return { success: false, message: roomIdValidation.message };
      }

      // Validate params
      const paramsValidation = AvailabilityValidator.validateCheckParams(params);
      if (!paramsValidation.valid) {
        return { success: false, message: paramsValidation.message };
      }

      // Get data from repository
      const availability = await this.repository.getRoomDailyAvailability(
        roomId,
        paramsValidation.data!.startDate,
        paramsValidation.data!.endDate
      );

      // Kiểm tra nếu không có dữ liệu
      if (availability.length === 0) {
        return {
          success: false,
          message: "Không tìm thấy dữ liệu giá cho khoảng thời gian này"
        };
      }

      // Nếu có roomsCount, kiểm tra có đủ phòng không
      if (params.roomsCount !== undefined) {
        const roomsNeeded = params.roomsCount;
        
        // Validate roomsCount
        if (roomsNeeded <= 0) {
          return {
            success: false,
            message: "Số lượng phòng phải lớn hơn 0"
          };
        }

        // Tìm số phòng tối thiểu available trong khoảng thời gian
        const minAvailable = Math.min(...availability.map(d => d.availableRooms));
        const hasEnoughRooms = minAvailable >= roomsNeeded;

        const result: RoomAvailabilityCheckResult = {
          dailyAvailability: availability,
          hasEnoughRooms,
          minAvailable,
          roomsNeeded
        };

        return {
          success: true,
          data: result,
          message: hasEnoughRooms 
            ? `Có đủ ${roomsNeeded} phòng trong khoảng thời gian này`
            : `Không đủ phòng. Chỉ còn ${minAvailable} phòng available`
        };
      }

      // Nếu không có roomsCount, trả về dữ liệu như cũ
      return {
        success: true,
        data: availability
      };
    } catch (error: any) {
      console.error("❌ Service error - checkRoomAvailability:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi kiểm tra phòng trống"
      };
    }
  }

  // Kiểm tra phòng trống cho tất cả các phòng của hotel
  async checkHotelAvailability(
    hotelId: string,
    params: AvailabilityCheckParams
  ): Promise<AvailabilityResponse<HotelAvailability>> {
    try {
      // Validate hotelId
      const hotelIdValidation = AvailabilityValidator.validateHotelId(hotelId);
      if (!hotelIdValidation.valid) {
        return { success: false, message: hotelIdValidation.message };
      }

      // Validate params
      const paramsValidation = AvailabilityValidator.validateCheckParams(params);
      if (!paramsValidation.valid) {
        return { success: false, message: paramsValidation.message };
      }

      // Get hotel info
      const hotel = await this.repository.getHotelById(hotelId);
      if (!hotel) {
        return { success: false, message: "Không tìm thấy khách sạn" };
      }

      // Get all active rooms
      const rooms = await this.repository.getActiveRoomsByHotel(hotelId);
      if (rooms.length === 0) {
        return {
          success: false,
          message: "Khách sạn không có phòng nào đang hoạt động"
        };
      }

      // Calculate expected nights using helper
      const expectedNights = calculateNights(
        paramsValidation.data!.startDate,
        paramsValidation.data!.endDate
      );

      // Get availability for each room
      const roomsAvailability: RoomAvailabilitySummary[] = await Promise.all(
        rooms.map(async (room) => {
          const dailyAvailability = await this.repository.getRoomDailyAvailability(
            room.room_id,
            paramsValidation.data!.startDate,
            paramsValidation.data!.endDate
          );

          const minAvailable = dailyAvailability.length > 0
            ? Math.min(...dailyAvailability.map(d => d.availableRooms))
            : 0;

          const hasFullAvailability = 
            dailyAvailability.length === expectedNights &&
            dailyAvailability.every(d => d.availableRooms > 0);

          return {
            roomId: room.room_id,
            roomName: room.room_name,
            minAvailable,
            totalNights: dailyAvailability.length,
            hasFullAvailability,
            dailyAvailability
          };
        })
      );

      const result: HotelAvailability = {
        hotelId: hotel.hotel_id,
        hotelName: hotel.name,
        rooms: roomsAvailability
      };

      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      console.error("❌ Service error - checkHotelAvailability:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi kiểm tra phòng trống"
      };
    }
  }

  // Giảm số phòng trống (khi booking)
  async reduceAvailability(
    params: AvailabilityUpdateParams
  ): Promise<AvailabilityResponse<{ affectedRows: number }>> {
    try {
      // Validate using validator
      const validation = AvailabilityValidator.validateUpdateParams(params);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const validatedParams = validation.data!;

      // Kiểm tra xem có đủ phòng không
      const hasEnough = await this.repository.hasEnoughAvailability(
        validatedParams.roomId,
        validatedParams.startDate,
        validatedParams.endDate,
        validatedParams.roomsCount
      );

      if (!hasEnough) {
        return {
          success: false,
          message: `Không đủ phòng trống. Vui lòng kiểm tra lại.`
        };
      }

      // Giảm availability
      const result = await this.repository.reduceAvailableRooms(
        validatedParams.roomId,
        validatedParams.startDate,
        validatedParams.endDate,
        validatedParams.roomsCount
      );

      if (!result.success) {
        return {
          success: false,
          message: "Không thể cập nhật số phòng trống"
        };
      }

      return {
        success: true,
        data: { affectedRows: result.affectedRows },
        message: `Đã giảm ${validatedParams.roomsCount} phòng thành công`
      };
    } catch (error: any) {
      console.error("❌ Service error - reduceAvailability:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật phòng trống"
      };
    }
  }

  //Tăng số phòng trống (khi hủy booking)
  async increaseAvailability(
    params: AvailabilityUpdateParams
  ): Promise<AvailabilityResponse<{ affectedRows: number }>> {
    try {
      // Validate using validator
      const validation = AvailabilityValidator.validateUpdateParams(params);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const validatedParams = validation.data!;

      // Tăng availability
      const result = await this.repository.increaseAvailableRooms(
        validatedParams.roomId,
        validatedParams.startDate,
        validatedParams.endDate,
        validatedParams.roomsCount
      );

      if (!result.success) {
        return {
          success: false,
          message: "Không thể cập nhật số phòng trống"
        };
      }

      return {
        success: true,
        data: { affectedRows: result.affectedRows },
        message: `Đã tăng ${validatedParams.roomsCount} phòng thành công`
      };
    } catch (error: any) {
      console.error("❌ Service error - increaseAvailability:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật phòng trống"
      };
    }
  }

}

