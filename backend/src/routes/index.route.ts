import { Router, Express } from "express";
import {  Register,  verifyEmailController,  resendVerificationController,  Login,  Logout,  forgotPasswordController,  verifyResetTokenController,  resetPasswordController,  refreshAccessToken,  checkEmailExistsController, googleLoginController} from "../controllers/Authentication&Authorization/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import {  getProfile,  updatePassword,  updateProfile} from "../controllers/Authentication&Authorization/profile.controller";
import { getLocationController } from "../controllers/HotelModules/location.controller";
import { getHotelSearchController } from "../controllers/HotelModules/hotel.controller";

const router = Router();

// 🔐 AUTHENTICATION & ACCOUN
// Check email tồn tại
router.get("/auth/check-email", checkEmailExistsController);

// Đăng ký + xác minh email
router.post("/auth/register", Register);
router.get("/auth/verify-email", verifyEmailController);
router.post("/auth/resend-verification", resendVerificationController);

// Đăng nhập / refresh / logout
router.post("/auth/login", Login);
router.post("/auth/refresh-token", refreshAccessToken);
router.post("/auth/logout", Logout);

// Đăng nhập bằng Google
router.post("/auth/google", googleLoginController);

// Quên mật khẩu / reset password
router.post("/auth/forgot-password", forgotPasswordController);
router.get("/auth/verify-reset-token", verifyResetTokenController);
router.post("/auth/reset-password", resetPasswordController);

// Profile
router.get("/auth/profile", authenticateJWT, getProfile);
router.put("/auth/profile", authenticateJWT, updateProfile);
router.put("/auth/profile/password", authenticateJWT, updatePassword);

//HOTEL MODULES
// Tìm kiếm địa điểm
router.get("/locations", getLocationController);
router.get("/search", getHotelSearchController);


export function initRoutes(app: Express): void {
  app.use("/api", router); 
}

export default router;
