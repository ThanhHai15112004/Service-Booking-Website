import express from "express";
import { searchHotelsController, getHotelDetailController } from "../../controllers/HotelModules/hotel.controller";
import { getHotelReviews } from "../../controllers/Profile/review.controller";

const router = express.Router();

// Tìm kiếm khách sạn
router.get("/search", searchHotelsController);

// Lấy reviews của hotel (public API)
router.get("/:hotelId/reviews", getHotelReviews);

// Lấy chi tiết khách sạn với phòng trống
router.get("/:hotelId", getHotelDetailController);

export default router;
