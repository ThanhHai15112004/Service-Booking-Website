import express from "express";
import { getLocationController, getHotelCountsController, getPopularDestinationsController } from "../../controllers/HotelModules/location.controller";

const router = express.Router();

// Lấy danh sách địa điểm
router.get("/", getLocationController);

// Đếm số khách sạn theo country/city (for breadcrumb)
router.get("/hotel-counts", getHotelCountsController);

// Lấy danh sách điểm đến phổ biến
router.get("/popular", getPopularDestinationsController);

export default router;
