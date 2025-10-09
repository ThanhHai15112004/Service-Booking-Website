import { Router, Express } from "express";
import { Register, verifyEmailController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", Register);
router.get("/verify-email", verifyEmailController);

export function initRoutes(app: Express): void {
  app.use("/api/auth", router);
}

export default router;
