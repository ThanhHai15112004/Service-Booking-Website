import express from "express";
import { searchHotelsController } from "../../controllers/HotelModules/hotel.controller";

const router = express.Router();

// Tìm kiếm khách sạn
router.get("/", searchHotelsController);

export default router;
