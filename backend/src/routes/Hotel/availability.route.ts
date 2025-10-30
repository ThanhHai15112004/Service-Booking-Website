import { Router } from "express";
import {
  checkRoomTypeAvailability,
  checkRoomAvailability,
  checkHotelAvailability,
  reduceAvailability,
  increaseAvailability
} from "../../controllers/HotelModules/availability.controller";

const router = Router();

// ✅ RECOMMENDED: Kiểm tra phòng trống theo LOẠI PHÒNG (room_type_id)
router.get("/room-type/:roomTypeId", checkRoomTypeAvailability);

// ⚠️ LEGACY: Kiểm tra phòng trống theo phòng cụ thể (room_id)
router.get("/room/:roomId", checkRoomAvailability);

// Kiểm tra tất cả phòng của hotel  
router.get("/hotel/:hotelId", checkHotelAvailability);

// Giảm số phòng trống (dùng khi booking)
router.post("/reduce", reduceAvailability);

// Tăng số phòng trống (dùng khi hủy booking)
router.post("/increase", increaseAvailability);

export default router;
