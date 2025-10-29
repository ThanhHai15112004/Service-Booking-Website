import express from "express";
import { searchHotelsController, getHotelDetailController } from "../../controllers/HotelModules/hotel.controller";

const router = express.Router();

// Tìm kiếm khách sạn
router.get("/search", searchHotelsController);

// Lấy chi tiết khách sạn với phòng trống
router.get("/:hotelId", getHotelDetailController);

export default router;
