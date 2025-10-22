import express from "express";
import { getAllPoliciesController } from "../../controllers/HotelModules/policy.controller";

const router = express.Router();
router.get("/", getAllPoliciesController);
export default router;
