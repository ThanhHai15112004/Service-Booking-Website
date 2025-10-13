import { Router, Express } from "express";
import { Register, verifyEmailController, resendVerificationController, Login } from "../controllers/auth.controller";

const router = Router();

router.post("/register", Register);
router.post("/login", Login);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);

export function initRoutes(app: Express): void {
  app.use("/api/auth", router);
}

export default router;
