import { Router } from "express";
import {  getProfile,  updatePassword,  updateProfile,} from "../../controllers/Auth/profile.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, getProfile);
router.put("/", authenticateJWT, updateProfile);
router.put("/password", authenticateJWT, updatePassword);

export default router;
