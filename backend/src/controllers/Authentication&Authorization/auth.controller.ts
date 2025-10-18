import { Request, Response } from "express";
import { validateRegisterInput, isDisposableEmail, validateEmailFormat } from "../../utils/validator";
import { isEmailExisting, createAccountforUser, generateVerificationToken, verifyEmailToken, resendVerificationEmail, verifyLoginCredentials  } from "../../services/Authentication&Authorization/user.service";
import { sendVerificationEmail } from "../../services/Authentication&Authorization/email.service";  
import bcrypt from "bcrypt";
import { verify } from "crypto";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.utils";
import { revokeRefreshToken, saveRefreshToken } from "../../services/Authentication&Authorization/token.service";
import { requestPasswordReset, resetPasswordWithToken, verifyResetToken } from "../../services/Authentication&Authorization/password.service";
import pool from "../../config/db";
import jwt from "jsonwebtoken";
import { loginWithGoogle } from "../../services/Authentication&Authorization/google.service";

export const checkEmailExistsController = async (req: Request, res: Response) => {
  try {
    let email = req.query.email;
    if (Array.isArray(email)) email = email[0];

    if (typeof email !== "string" || !email.trim()) {
      return res.status(200).json({ exists: false, message: "Thiếu email", isValid: false });
    }

    const normalized = email.trim().toLowerCase();

    // Kiểm tra định dạng email
    if (!validateEmailFormat(normalized)) {
      return res.status(200).json({ exists: false, message: "Email không hợp lệ", isValid: false });
    }

    // Kiểm tra email rác
    if (isDisposableEmail(normalized)) {
      return res.status(200).json({ exists: false, message: "Không được dùng email tạm thời", isValid: false });
    }

    const exists = await isEmailExisting(normalized);
    return res.status(200).json({ exists, isValid: true });
  } catch (error) {
    console.error("❌ checkEmailExistsController:", error);
    return res.status(200).json({ exists: false, message: "Lỗi server", isValid: false });
  }
};

export const Register = async (req: Request, res: Response) => {
    try {
        const { full_name, email, password, phone_number } = req.body;

        // Gọi hàm validateRegisterInput để kiểm tra dữ liệu đầu vào
        const errorMessage = validateRegisterInput(full_name, email, password, phone_number);
        if (errorMessage) {
            return res.status(400).json({ message: errorMessage });
        }

        // Kiểm tra email đã tồn tại hay chưa
        const emailExists = await isEmailExisting(email);
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email đã tồn tại.",
            });
        }

        // hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // sinh token xác thực
        const verify_token = generateVerificationToken();

        //insert account vào db
        const account_Id = await createAccountforUser(full_name, email, password_hash, verify_token, phone_number);

        // Gửi email xác thực
        await sendVerificationEmail(email, verify_token);

        // Nếu hợp lệ 
        return res.status(200).json({
            success: true,
            message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
            data:{
                account_Id,
                full_name,
                email,
                phone_number,
                status: 'ACTIVE',
                role: 'USER',
                
            }
        })
    } catch (error) {
        console.error("Đã xảy ra lỗi trong quá trình đăng ký:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error });
    }
};


// Xác thực email
export const verifyEmailController = async (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Thiếu token xác thực trong đường dẫn.",
            });
        }

        const success = await verifyEmailToken(token);

        if (!success) {
            return res.status(400).json({
                success: false,
                message: "Token xác thực không hợp lệ hoặc đã được sử dụng.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Xác thực email thành công.",
        });
    } catch (error) {
        console.error("Đã xảy ra lỗi trong quá trình xác thực email:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi", error });
    }
}

export const resendVerificationController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Thiếu địa chỉ email.",
            });
        }

        await resendVerificationEmail(email);

        return res.status(200).json({
            success: true,
            message: "Email xác thực mới đã được gửi. Vui lòng kiểm tra hộp thư đến.",
        });

    } catch (error: any) {
        console.error("Lỗi khi gửi lại email xác thực:", error);
        return res.status(400).json({
            success: false,
            message: error.message || "Không thể gửi lại email xác thực.",
        });
    }
}

//Login
export const Login = async (req: Request, res: Response)=>{
    try {
        const {email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false, 
                massage:"Thiếu email hoặc mật khẩu."
            })
        }

        //   Xác thực email & password
        const user = await verifyLoginCredentials(email, password);

         // Tạo Access & Refresh Token
        const payload = {
            account_id: user.account_id,
            email: user.email,
            role: user.role,
        }

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        // Lưu refresh token vào DB
        await saveRefreshToken(user.account_id, refreshToken);

        const userInfo = {
            account_id: user.account_id,
            full_name: user.full_name,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
            is_verified: user.is_verified,
        };


        //  Trả về response rõ ràng, gọn gàng
        return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công.",
        data: {
            user: userInfo,
            tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            },
        },
        });
    } catch (error:any) {
        return res.status(400).json({
            success: false, 
            massage:"Đăng nhập thất bại hoặc tài khoản và mật khẩu không đúng."
        })
    }
}


// đăng xuất
export const Logout = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, message: "Thiếu refresh token." });
    }

    await revokeRefreshToken(refresh_token);


    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi logout:", error);
    return res.status(500).json({ success: false, message: "Lỗi server khi logout." });
  }
};


// Forgot Password - Gửi email trước để  reset
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email.",
      });
    }

    // Luôn trả OK, kể cả khi email không tồn tại (tránh dò user)
    await requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      message: "Nếu email tồn tại, chúng tôi đã gửi một liên kết đặt lại mật khẩu.",
    });
  } catch (error) {
    console.error("Lỗi gửi email reset:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xử lý yêu cầu đặt lại mật khẩu.",
    });
  }
};


// xác thực token dùng để resset token
export const verifyResetTokenController = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu token trong đường dẫn.",
      });
    }

    const isValid = await verifyResetToken(token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Token hợp lệ. Bạn có thể đặt lại mật khẩu.",
    });
  } catch (error) {
    console.error("Lỗi khi xác minh token:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xác minh token.",
    });
  }
};

// đổi mật khẩu
export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Thiếu token hoặc mật khẩu mới.",
      });
    }

    // (tuỳ chọn) kiểm tra độ mạnh mật khẩu cơ bản
    if (typeof new_password !== "string" || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự.",
      });
    }

    await resetPasswordWithToken(token, new_password);

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
    });
  } catch (error: any) {
    console.error("Lỗi reset password:", error?.message || error);
    // Token sai/hết hạn → 400 là hợp lý
    return res.status(400).json({
      success: false,
      message: error?.message || "Không thể đặt lại mật khẩu.",
    });
  }
};



// refresh Access Token
export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "Thiếu refresh token." });
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM refresh_token WHERE token = ?`,
      [refresh_token]
    );
    if (rows.length === 0) {
      return res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn." });
    }

    const decoded: any = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!);

    const accountId = decoded.account_id;

    const newAccessToken = jwt.sign(
      { account_id: accountId },
      process.env.JWT_ACCESS_SECRET as jwt.Secret,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
    );



    res.json({
      success: true,
      access_token: newAccessToken,
      message: "Cấp lại access token thành công."
    });
  } catch (err: any) {
    res.status(403).json({ message: "Refresh token không hợp lệ hoặc đã hết hạn." });
  }
};


export const googleLoginController = async (req: Request, res: Response) => {
  try {
    const { id_token } = req.body;

    if (!id_token) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID token từ Google.",
      });
    }

    const { user, tokens } = await loginWithGoogle(id_token);

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
    console.error("Lỗi đăng nhập Google:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Đăng nhập Google thất bại.",
    });
  }
};