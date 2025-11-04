import { Request, Response } from "express";
import { AuthService } from "../../../services/Auth/auth.service";
import { AdminAccountService } from "../../../services/Auth/adminAccount.service";

const authService = new AuthService();
const adminAccountService = new AdminAccountService();

// ✅ Lấy dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // TODO: Implement real dashboard stats
    res.status(200).json({
      success: true,
      data: {
        totalUsers: 0,
        totalHotels: 0,
        totalBookings: 0,
        revenue: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy dashboard stats",
    });
  }
};

// ✅ Tạo tài khoản admin trực tiếp (chỉ SUPER ADMIN)
export const createAdminAccount = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    
    // ✅ Debug: Log thông tin user hiện tại
    console.log("[createAdminAccount] Current authenticated user:", {
      account_id: currentUser?.account_id,
      email: currentUser?.email,
      role: currentUser?.role
    });
    
    // Chỉ ADMIN mới được tạo tài khoản admin
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: `Chỉ SUPER ADMIN mới có quyền tạo tài khoản admin. Role hiện tại của bạn: ${currentUser?.role || 'N/A'}`,
      });
    }

    const { full_name, email, password, phone_number, role } = req.body;

    // Validate input
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin: Họ tên, Email, Mật khẩu.",
      });
    }

    // Validate role
    if (role && role !== "ADMIN" && role !== "STAFF") {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ. Chỉ có thể là ADMIN hoặc STAFF.",
      });
    }

    // Tạo tài khoản admin
    const result = await authService.createAdminAccount(
      full_name,
      email,
      password,
      phone_number,
      role || "ADMIN"
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error("[AdminController] createAdminAccount error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo tài khoản admin.",
    });
  }
};

// ✅ Lấy danh sách accounts
export const getAccounts = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      provider,
      is_verified,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const result = await adminAccountService.getAccounts({
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      role: role as "ADMIN" | "STAFF" | "USER" | undefined,
      status: status as "ACTIVE" | "PENDING" | "BANNED" | "DELETED" | undefined,
      provider: provider as "GOOGLE" | "FACEBOOK" | "LOCAL" | undefined,
      is_verified:
        is_verified !== undefined ? is_verified === "true" : undefined,
      sortBy: sortBy as "created_at" | "full_name" | "email",
      sortOrder: sortOrder as "ASC" | "DESC",
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách tài khoản",
    });
  }
};

// ✅ Lấy chi tiết account
export const getAccountDetail = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await adminAccountService.getAccountDetail(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy tài khoản",
    });
  }
};

// ✅ Cập nhật account
export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const updates = req.body;
    const result = await adminAccountService.updateAccount(accountId, updates);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể cập nhật tài khoản",
    });
  }
};

// ✅ Xóa account (soft delete)
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await adminAccountService.deleteAccount(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể xóa tài khoản",
    });
  }
};

// ✅ Force verify email
export const forceVerifyEmail = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await adminAccountService.forceVerifyEmail(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể xác thực email",
    });
  }
};

// ✅ Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp mật khẩu mới",
      });
    }
    const result = await adminAccountService.resetPassword(
      accountId,
      newPassword
    );
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể đặt lại mật khẩu",
    });
  }
};

// ✅ Tạo tài khoản User thủ công
export const createUserAccount = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone_number } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin: Họ tên, Email, Mật khẩu.",
      });
    }
    const result = await adminAccountService.createUserAccount({
      full_name,
      email,
      password,
      phone_number,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo tài khoản User",
    });
  }
}; 