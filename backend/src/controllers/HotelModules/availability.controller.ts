import { Request, Response } from "express";
import { AvailabilityService } from "../../services/Hotel/availability.service";

const availabilityService = new AvailabilityService();

// ✅ FLOW ĐÚNG: Kiểm tra phòng trống theo LOẠI PHÒNG (room_type_id)
export const checkRoomTypeAvailability = async (req: Request, res: Response) => {
  try {
    const { roomTypeId } = req.params;
    const { startDate, endDate, roomsCount } = req.query;

    console.log(`\n🔍 === CHECK ROOM TYPE AVAILABILITY ===`);
    console.log(`📦 Room Type ID: ${roomTypeId}`);
    console.log(`📅 Dates: ${startDate} → ${endDate}`);
    console.log(`🔢 Rooms needed: ${roomsCount || 'N/A'}`);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate"
      });
    }

    const result = await availabilityService.checkRoomTypeAvailability(roomTypeId, {
      startDate: startDate as string,
      endDate: endDate as string,
      roomsCount: roomsCount ? Number(roomsCount) : undefined
    });

    if (!result.success) {
      console.log(`❌ Check failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Room Type available: ${result.data?.availableRooms}/${result.data?.totalRooms} phòng`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra phòng trống"
    });
  }
};

// ⚠️ DEPRECATED: Kiểm tra phòng trống cho một room cụ thể (legacy)
export const checkRoomAvailability = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate, roomsCount } = req.query;

    console.log(`\n🔍 === CHECK ROOM AVAILABILITY ===`);
    console.log(`📦 Room ID: ${roomId}`);
    console.log(`📅 Dates: ${startDate} → ${endDate}`);
    console.log(`🔢 Rooms needed: ${roomsCount || 1}`);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate"
      });
    }

    const result = await availabilityService.checkRoomAvailability(roomId, {
      startDate: startDate as string,
      endDate: endDate as string,
      roomsCount: roomsCount ? Number(roomsCount) : undefined
    });

    if (!result.success) {
      console.log(`❌ Check failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Check completed successfully`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra phòng trống"
    });
  }
};

// Kiểm tra tất cả phòng của hotel
export const checkHotelAvailability = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    console.log(`\n🏨 === CHECK HOTEL AVAILABILITY ===`);
    console.log(`📦 Hotel ID: ${hotelId}`);
    console.log(`📅 Dates: ${startDate} → ${endDate}`);

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Thiếu startDate hoặc endDate"
      });
    }

    const result = await availabilityService.checkHotelAvailability(hotelId, {
      startDate: startDate as string,
      endDate: endDate as string
    });

    if (!result.success) {
      console.log(`❌ Check failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ Found ${result.data?.rooms.length} rooms`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra phòng trống"
    });
  }
};

// Giảm số phòng trống (sử dụng khi booking)
export const reduceAvailability = async (req: Request, res: Response) => {
  try {
    const { roomId, startDate, endDate, roomsCount } = req.body;

    console.log(`\n⬇️ === REDUCE AVAILABILITY ===`);
    console.log(`📦 Room ID: ${roomId}`);
    console.log(`📅 Dates: ${startDate} → ${endDate}`);
    console.log(`🔢 Rooms: ${roomsCount}`);

    if (!roomId || !startDate || !endDate || !roomsCount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: roomId, startDate, endDate, hoặc roomsCount"
      });
    }

    const result = await availabilityService.reduceAvailability({
      roomId,
      startDate,
      endDate,
      roomsCount: Number(roomsCount)
    });

    if (!result.success) {
      console.log(`❌ Reduce failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ ${result.message}`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phòng trống"
    });
  }
};

// Tăng số phòng trống (sử dụng khi hủy booking)
export const increaseAvailability = async (req: Request, res: Response) => {
  try {
    const { roomId, startDate, endDate, roomsCount } = req.body;

    console.log(`\n⬆️ === INCREASE AVAILABILITY ===`);
    console.log(`📦 Room ID: ${roomId}`);
    console.log(`📅 Dates: ${startDate} → ${endDate}`);
    console.log(`🔢 Rooms: ${roomsCount}`);

    if (!roomId || !startDate || !endDate || !roomsCount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: roomId, startDate, endDate, hoặc roomsCount"
      });
    }

    const result = await availabilityService.increaseAvailability({
      roomId,
      startDate,
      endDate,
      roomsCount: Number(roomsCount)
    });

    if (!result.success) {
      console.log(`❌ Increase failed: ${result.message}`);
      return res.status(400).json(result);
    }

    console.log(`✅ ${result.message}`);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phòng trống"
    });
  }
};
