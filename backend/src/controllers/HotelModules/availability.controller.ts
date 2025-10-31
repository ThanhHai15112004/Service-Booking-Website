import { Request, Response } from "express";
import { AvailabilityService } from "../../services/Hotel/availability.service";

const availabilityService = new AvailabilityService();

// ✅ FLOW ĐÚNG: Kiểm tra phòng trống theo LOẠI PHÒNG (room_type_id)
export const checkRoomTypeAvailability = async (req: Request, res: Response) => {
  try {
    const { roomTypeId } = req.params;
    const { startDate, endDate, roomsCount } = req.query;

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
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AvailabilityController] checkRoomTypeAvailability error:", error.message);
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
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AvailabilityController] checkRoomAvailability error:", error.message);
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
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AvailabilityController] checkHotelAvailability error:", error.message);
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
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AvailabilityController] reduceAvailability error:", error.message);
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
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AvailabilityController] increaseAvailability error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật phòng trống"
    });
  }
};
