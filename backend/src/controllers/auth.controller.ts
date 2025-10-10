import { Request, Response } from "express";
import { validateRegisterInput } from "../utils/validator";
import { isEmailExisting, createAccountforUser, generateVerificationToken, verifyEmailToken, resendVerificationEmail  } from "../services/user.service";
import { sendVerificationEmail } from "../services/email.service";  
import bcrypt from "bcrypt";

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