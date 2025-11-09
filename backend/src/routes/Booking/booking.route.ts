import { Router } from "express";
import {
  createBooking,
  createTemporaryBooking,
  getBooking,
  getMyBookings,
  cancelBooking,
  validateDiscountCode,
  getAvailableDiscountCodes
} from "../../controllers/Booking/booking.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

// ✅ Tạo booking tạm thời (status CREATED) khi vào trang booking (yêu cầu đăng nhập)
router.post("/temporary", authenticateJWT, createTemporaryBooking);

// Tạo booking mới hoặc update booking tạm thời (yêu cầu đăng nhập)
router.post("/", authenticateJWT, createBooking);

// Lấy danh sách bookings của user (yêu cầu đăng nhập)
router.get("/my-bookings", authenticateJWT, getMyBookings);

// ✅ Get available discount codes (public API, không cần đăng nhập)
router.get("/discount-codes/available", getAvailableDiscountCodes);

// ✅ Validate discount code (không cần đăng nhập)
router.post("/validate-discount", validateDiscountCode);

// Lấy thông tin booking by ID (yêu cầu đăng nhập)
router.get("/:bookingId", authenticateJWT, getBooking);

// Hủy booking (yêu cầu đăng nhập)
router.delete("/:bookingId", authenticateJWT, cancelBooking);

export default router;

