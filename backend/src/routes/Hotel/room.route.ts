import { Router } from "express";
import {
  getRoomsByRoomTypeId,
  getAvailableRoomsByRoomTypeId,
  getHotelIdByRoomTypeId
} from "../../controllers/HotelModules/room.controller";

const router = Router();

// GET /api/rooms/hotel/:roomTypeId
// Lấy hotelId từ roomTypeId
router.get("/hotel/:roomTypeId", getHotelIdByRoomTypeId);

// GET /api/rooms?roomTypeId=RT001
// Lấy danh sách phòng theo room_type_id
router.get("/", getRoomsByRoomTypeId);

// GET /api/rooms/available?roomTypeId=RT001&checkIn=2025-11-01&checkOut=2025-11-03&roomsNeeded=1
// Lấy danh sách phòng có thể đặt theo room_type_id và date range
router.get("/available", getAvailableRoomsByRoomTypeId);

export default router;

