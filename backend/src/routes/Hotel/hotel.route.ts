import { Router } from "express";
import { searchHotelsController } from "../../controllers/HotelModules/searchHotel.controller";

const router = Router();

// Tìm kiếm khách sạn
router.get("/", searchHotelsController);

export default router;
