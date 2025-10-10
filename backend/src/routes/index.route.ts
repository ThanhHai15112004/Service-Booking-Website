import { Router, Express } from "express";
import { Register, verifyEmailController, resendVerificationController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", Register);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);

export function initRoutes(app: Express): void {
  app.use("/api/auth", router);
}

export default router;
