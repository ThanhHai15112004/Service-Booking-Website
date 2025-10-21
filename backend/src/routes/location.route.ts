import { Router } from "express";
import { getLocationController } from "../controllers/HotelModules/location.controller";

const router = Router();

// Lấy danh sách địa điểm
router.get("/", getLocationController);

export default router;
