import { Router } from "express";
import {
  createBooking,
  getBooking,
  getMyBookings,
  cancelBooking
} from "../../controllers/Booking/booking.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

// Tạo booking mới (yêu cầu đăng nhập)
router.post("/", authenticateJWT, createBooking);

// Lấy danh sách bookings của user (yêu cầu đăng nhập)
router.get("/my-bookings", authenticateJWT, getMyBookings);

// Lấy thông tin booking by ID (yêu cầu đăng nhập)
router.get("/:bookingId", authenticateJWT, getBooking);

// Hủy booking (yêu cầu đăng nhập)
router.delete("/:bookingId", authenticateJWT, cancelBooking);

export default router;

