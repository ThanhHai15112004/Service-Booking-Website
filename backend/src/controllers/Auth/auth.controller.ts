import { Request, Response } from "express";
import { PasswordService } from "../../services/Auth/password.service";
import { GoogleAuthService } from "../../services/Auth/google.service";
import { AuthService } from "../../services/Auth/auth.service";
import { TokenService } from "../../services/Auth/token.service";

const authService = new AuthService(); 
const passwordService = new PasswordService();
const googleAuthService = new GoogleAuthService();
const tokenService = new TokenService();

// Hàm đăng ký (register)
export const Register = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone_number } = req.body;
    const result = await authService.register(full_name, email, password, phone_number);
    res.status(200).json({
      success: true,
      message: "Đăng ký thành công! Vui lòng kiểm tra email xác thực.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// Hàm xác thực email
export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    const success = await authService.verifyEmail(token);
    res.status(success ? 200 : 400).json({
      success,
      message: success ? "Xác thực email thành công." : "Token không hợp lệ hoặc hết hạn.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Hàm kiểm tra email có tồn tại
export const checkEmailExistsController = async (req: Request, res: Response) => {
  try {
    let email = req.query.email;
    if (Array.isArray(email)) email = email[0];
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: "Thiếu email."
      });
    }

    const exists = await authService.isEmailExisting(email.trim().toLowerCase());
    return res.status(200).json({
      success: true,
      isValid: true,
      exists,
      message: exists ? "Email đã tồn tại." : "Email có thể sử dụng."
    });
  } catch (error: any) {
    console.error("[AuthController] checkEmailExists error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi kiểm tra email."
    });
  }
};


// Hàm gửi lại email xác minh
export const resendVerificationController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email."
      });
    }

    await authService.resendVerificationEmail(email);
    return res.status(200).json({
      success: true,
      message: "Email xác thực mới đã được gửi, vui lòng kiểm tra hộp thư."
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể gửi lại email xác thực."
    });
  }
};






// Hàm đăng nhập (login)
export const Login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    res.status(200).json({ success: true, message: "Đăng nhập thành công.", data });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};


// Hàm đăng xuất (logout)
export const Logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token)
      return res.status(400).json({ success: false, message: "Thiếu refresh token." });

    await tokenService.revokeRefreshToken(refresh_token);
    res.status(200).json({ success: true, message: "Đăng xuất thành công." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hàm refresh access token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token)
      return res.status(400).json({ success: false, message: "Thiếu refresh token." });

    const newAccessToken = await tokenService.refreshAccessToken(refresh_token);
    res.status(200).json({
      success: true,
      access_token: newAccessToken,
      message: "Cấp lại access token thành công.",
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      message: error.message || "Refresh token không hợp lệ hoặc đã hết hạn.",
    });
  }
};



// Hàm quên mật khẩu (gửi email reset)
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email." });
    }

    await passwordService.requestPasswordReset(email);
    return res.status(200).json({
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi một liên kết đặt lại mật khẩu.",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// Hàm xác minh token reset
export const verifyResetTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) throw new Error("Thiếu token trong đường dẫn.");

    const message = await passwordService.handleVerifyResetToken(token);
    return res.status(200).json({ success: true, message });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


// Hàm đặt lại mật khẩu bằng token
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) throw new Error("Thiếu token hoặc mật khẩu mới.");

    const message = await passwordService.handleResetPassword(token, new_password);
    return res.status(200).json({ success: true, message });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};





// Hàm đăng nhập bằng Google
export const googleLoginController = async (req: Request, res: Response) => {
  try {
    const { id_token } = req.body;
    if (!id_token)
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ID token từ Google." });

    const { user, tokens } = await googleAuthService.loginWithGoogle(id_token);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập bằng Google thành công.",
      data: {
        user: {
          account_id: user.account_id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          avatar_url: user.avatar_url,
          provider: user.provider,
          role: user.role,
          status: user.status,
        },
        tokens,
      },
    });
  } catch (error: any) {
    console.error("[AuthController] googleLogin error:", error?.message || error);
    return res.status(400).json({
      success: false,
      message: error.message || "Đăng nhập Google thất bại.",
    });
  }
};
