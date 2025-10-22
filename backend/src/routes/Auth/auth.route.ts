import { Router } from "express";
import {  Register,  verifyEmailController,  resendVerificationController,  Login,  Logout,  forgotPasswordController,  verifyResetTokenController,  resetPasswordController,  refreshAccessToken,  checkEmailExistsController,  googleLoginController,} from "../../controllers/Auth/auth.controller";

const router = Router();

// Kiểm tra email tồn tại
router.get("/check-email", checkEmailExistsController);

// Đăng ký + xác minh email
router.post("/register", Register);
router.get("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);

// Đăng nhập / refresh / logout
router.post("/login", Login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", Logout);

// Đăng nhập bằng Google
router.post("/google", googleLoginController);

// Quên mật khẩu / reset password
router.post("/forgot-password", forgotPasswordController);
router.get("/verify-reset-token", verifyResetTokenController);
router.post("/reset-password", resetPasswordController);

export default router;
