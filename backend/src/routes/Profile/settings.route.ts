import { Router } from "express";
import {
  getSettings,
  updateSettings
} from "../../controllers/Profile/settings.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, getSettings);
router.put("/", authenticateJWT, updateSettings);

export default router;


