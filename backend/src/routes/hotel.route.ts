import { Router } from "express";
import { searchHotelsController } from "../controllers/HotelModules/hotel.controller";

const router = Router();

// Tìm kiếm khách sạn
router.get("/search", searchHotelsController);

export default router;
