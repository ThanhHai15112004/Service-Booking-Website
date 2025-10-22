import express from "express";
import { getAllBedTypesController } from "../../controllers/HotelModules/bedType.controller";

const router = express.Router();

router.get("/", getAllBedTypesController);

export default router;
