import express from "express";
import { getAllCategoriesController } from "../controllers/HotelModules/category.controller";

const router = express.Router();

// GET /api/categories
router.get("/", getAllCategoriesController);

export default router;
