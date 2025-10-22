import express from "express";
import { getAllFacilitiesController } from "../../controllers/HotelModules/facility.controller";

const router = express.Router();

router.get("/", getAllFacilitiesController);

export default router;
