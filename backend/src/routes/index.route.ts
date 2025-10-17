import { Router, Express } from "express";
import { Register, verifyEmailController, resendVerificationController, Login, Logout, forgotPasswordController, verifyResetTokenController, resetPasswordController, refreshAccessToken, checkEmailExistsController } from "../controllers/Authentication&Authorization/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { getProfile, updatePassword, updateProfile } from "../controllers/Authentication&Authorization/profile.controller";

const router = Router();
 
//Authentication & Authorization api endpoints
// Check if email exists
router.get('/check-email', checkEmailExistsController, );
//register + mail 
router.post("/register", Register);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);

//login
router.post("/login", Login);
router.post("/refresh-token", refreshAccessToken);

//logout
router.post("/logout", Logout);

//forgot-password
router.post("/forgot-password", forgotPasswordController);
router.get("/verify-reset-token", verifyResetTokenController);
router.post("/reset-password", resetPasswordController);

// account manager
router.get("/profile", authenticateJWT, getProfile);
router.put("/profile", authenticateJWT, updateProfile);
router.put("/profile/password", authenticateJWT, updatePassword);

router.get("/test", (req, res) => {
    res.json({ message: "Backend ok ✅" });
  });

export function initRoutes(app: Express): void {
  app.use("/api/auth", router);
  

}

export default router;
