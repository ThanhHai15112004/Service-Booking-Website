import express from "express";
import { getLocationController } from "../../controllers/HotelModules/location.controller";

const router = express.Router();

// Lấy danh sách địa điểm
router.get("/", getLocationController);

export default router;
