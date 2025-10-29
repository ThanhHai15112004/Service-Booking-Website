import { Router } from "express";
import {
  checkRoomAvailability,
  checkHotelAvailability,
  reduceAvailability,
  increaseAvailability
} from "../../controllers/HotelModules/availability.controller";

const router = Router();

// Kiểm tra phòng trống chi tiết theo ngày
router.get("/room/:roomId", checkRoomAvailability);

// Kiểm tra tất cả phòng của hotel  
router.get("/hotel/:hotelId", checkHotelAvailability);

// Giảm số phòng trống (dùng khi booking)
router.post("/reduce", reduceAvailability);

// Tăng số phòng trống (dùng khi hủy booking)
router.post("/increase", increaseAvailability);

export default router;
