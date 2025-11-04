import { AccountRepository } from "../../Repository/Auth/account.repository";
import { Account } from "../../models/Auth/account.model";
import bcrypt from "bcrypt";

export class AdminAccountService {
  private accountRepo = new AccountRepository();

  // ✅ Lấy danh sách accounts với filter và pagination
  async getAccounts(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: "ADMIN" | "STAFF" | "USER";
    status?: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
    provider?: "GOOGLE" | "FACEBOOK" | "LOCAL";
    is_verified?: boolean;
    sortBy?: "created_at" | "full_name" | "email";
    sortOrder?: "ASC" | "DESC";
  }) {
    const result = await this.accountRepo.findAll(params);
    return {
      success: true,
      data: {
        accounts: result.accounts,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: result.total,
          totalPages: Math.ceil(result.total / (params.limit || 10)),
        },
      },
    };
  }

  // ✅ Lấy chi tiết account
  async getAccountDetail(accountId: string) {
    const account = await this.accountRepo.findById(accountId);
    if (!account) {
      throw new Error("Không tìm thấy tài khoản");
    }
    // Convert is_verified từ database (có thể là 0/1 hoặc boolean) sang boolean
    const accountData = account as any;
    const isVerified = accountData.is_verified === 1 || accountData.is_verified === true || accountData.is_verified === "1";
    
    return {
      success: true,
      data: {
        ...account,
        is_verified: Boolean(isVerified),
      },
    };
  }

  // ✅ Cập nhật account
  async updateAccount(
    accountId: string,
    updates: {
      full_name?: string;
      email?: string;
      phone_number?: string;
      status?: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
      role?: "ADMIN" | "STAFF" | "USER";
      is_verified?: boolean;
    }
  ) {
    // Validate email nếu có thay đổi
    if (updates.email) {
      const existingAccount = await this.accountRepo.findByEmail(updates.email);
      if (existingAccount && existingAccount.account_id !== accountId) {
        throw new Error("Email đã được sử dụng bởi tài khoản khác");
      }
    }

    const success = await this.accountRepo.update(accountId, updates);
    if (!success) {
      throw new Error("Không thể cập nhật tài khoản");
    }

    const updatedAccount = await this.accountRepo.findById(accountId);
    return {
      success: true,
      message: "Cập nhật tài khoản thành công",
      data: updatedAccount,
    };
  }

  // ✅ Xóa account (soft delete)
  async deleteAccount(accountId: string) {
    const success = await this.accountRepo.softDelete(accountId);
    if (!success) {
      throw new Error("Không thể xóa tài khoản");
    }
    return {
      success: true,
      message: "Xóa tài khoản thành công",
    };
  }

  // ✅ Force verify email
  async forceVerifyEmail(accountId: string) {
    const success = await this.accountRepo.forceVerify(accountId);
    if (!success) {
      throw new Error("Không thể xác thực email");
    }
    return {
      success: true,
      message: "Xác thực email thành công",
    };
  }

  // ✅ Reset password
  async resetPassword(accountId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const success = await this.accountRepo.resetPassword(accountId, passwordHash);
    if (!success) {
      throw new Error("Không thể đặt lại mật khẩu");
    }
    return {
      success: true,
      message: "Đặt lại mật khẩu thành công",
    };
  }

  // ✅ Tạo account User thủ công
  async createUserAccount(data: {
    full_name: string;
    email: string;
    password: string;
    phone_number?: string;
    avatar_url?: string;
  }) {
    // Check email exists
    const existingAccount = await this.accountRepo.findByEmail(data.email);
    if (existingAccount) {
      throw new Error("Email đã tồn tại trong hệ thống");
    }

    // Generate account_id
    const todayCount = await this.accountRepo.countAccountsCreatedToday();
    const accountId = `AC${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(todayCount + 1).padStart(3, "0")}`;

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create account
    await this.accountRepo.create({
      account_id: accountId,
      full_name: data.full_name,
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      phone_number: data.phone_number || null,
      avatar_url: data.avatar_url || null,
      role: "USER",
      status: "ACTIVE",
      is_verified: true, // Admin tạo thì auto verify
      provider: "LOCAL",
    });

    const newAccount = await this.accountRepo.findById(accountId);
    return {
      success: true,
      message: "Tạo tài khoản User thành công",
      data: newAccount,
    };
  }
}
