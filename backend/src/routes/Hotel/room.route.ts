import { Router } from "express";
import {
  getRoomsByRoomTypeId,
  getAvailableRoomsByRoomTypeId,
  getHotelIdByRoomTypeId
} from "../../controllers/HotelModules/room.controller";

const router = Router();

router.get("/hotel/:roomTypeId", getHotelIdByRoomTypeId);

router.get("/", getRoomsByRoomTypeId);

router.get("/available", getAvailableRoomsByRoomTypeId);

export default router;

