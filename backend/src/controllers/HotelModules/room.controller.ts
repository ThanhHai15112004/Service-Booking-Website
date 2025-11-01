import { Request, Response } from "express";
import { RoomService } from "../../services/Hotel/room.service";

const roomService = new RoomService();

// Hàm lấy hotelId từ roomTypeId
export const getHotelIdByRoomTypeId = async (req: Request, res: Response) => {
  try {
    const { roomTypeId } = req.params;

    if (!roomTypeId || typeof roomTypeId !== 'string') {
      return res.status(400).json({
        success: false,
        message: "roomTypeId parameter is required",
        data: null
      });
    }

    const result = await roomService.getHotelIdByRoomTypeId(roomTypeId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[RoomController] getHotelIdByRoomTypeId error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy hotel ID",
      data: null
    });
  }
};

// Hàm lấy danh sách phòng theo roomTypeId
export const getRoomsByRoomTypeId = async (req: Request, res: Response) => {
  try {
    const { roomTypeId } = req.query;

    if (!roomTypeId || typeof roomTypeId !== 'string') {
      return res.status(400).json({
        success: false,
        message: "roomTypeId query parameter is required",
        data: []
      });
    }

    const result = await roomService.getRoomsByRoomTypeId(roomTypeId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[RoomController] getRoomsByRoomTypeId error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng",
      data: []
    });
  }
};

// Hàm lấy danh sách phòng có thể đặt theo roomTypeId và date range
export const getAvailableRoomsByRoomTypeId = async (req: Request, res: Response) => {
  try {
    const { roomTypeId, checkIn, checkOut, roomsNeeded } = req.query;

    if (!roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: "roomTypeId, checkIn, and checkOut query parameters are required",
        data: []
      });
    }

    const result = await roomService.getAvailableRoomsByRoomTypeId(
      roomTypeId as string,
      checkIn as string,
      checkOut as string,
      roomsNeeded ? Number(roomsNeeded) : 1
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[RoomController] getAvailableRoomsByRoomTypeId error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách phòng có thể đặt",
      data: []
    });
  }
};

