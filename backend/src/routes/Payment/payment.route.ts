import express from "express";
import {
  confirmBooking,
  updatePaymentStatus,
  getPaymentByBookingId
} from "../../controllers/Payment/payment.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = express.Router();

// Confirm booking (tạo payment và cập nhật booking status)
router.post("/confirm", authenticateJWT, confirmBooking);

// Cập nhật payment status
router.put("/:paymentId/status", authenticateJWT, updatePaymentStatus);

// Lấy payment theo booking_id
router.get("/booking/:bookingId", authenticateJWT, getPaymentByBookingId);

export default router;

