import { Request, Response } from "express";
import { AdminAccountService } from "../../../services/Auth/adminAccount.service";
import { AuthService } from "../../../services/Auth/auth.service";

const adminAccountService = new AdminAccountService();
const authService = new AuthService();

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

export const createAdminAccount = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    
    if (!currentUser || currentUser.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: `Chỉ SUPER ADMIN mới có quyền tạo tài khoản admin. Role hiện tại của bạn: ${currentUser?.role || 'N/A'}`,
      });
    }

    const { full_name, email, password, phone_number, role, avatar_url } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin: Họ tên, Email, Mật khẩu.",
      });
    }

    if (role && role !== "ADMIN" && role !== "STAFF") {
      return res.status(400).json({
        success: false,
        message: "Role không hợp lệ. Chỉ có thể là ADMIN hoặc STAFF.",
      });
    }

    const result = await authService.createAdminAccount(
      full_name,
      email,
      password,
      phone_number,
      role || "ADMIN",
      avatar_url
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo tài khoản admin.",
    });
  }
};

export const createUserAccount = async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, phone_number, avatar_url } = req.body;
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
      avatar_url,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo tài khoản User",
    });
  }
};

