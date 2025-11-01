import bcrypt from "bcrypt";
import crypto from "crypto";
import { Account } from "../../models/Auth/account.model";
import { AccountRepository } from "../../Repository/Auth/account.repository";
import {
  validateRegisterInput,
  validateEmailFormat,
  isDisposableEmail,
} from "../../utils/validator";
import { EmailService } from "./email.service";
import { TokenService } from "./token.service";

export class AuthService {
    constructor(
      private accountRepo = new AccountRepository(),
      private emailService = new EmailService(),
      private tokenService = new TokenService()
    ) {}

  // Hàm kiểm tra email tồn tại
  async isEmailExisting(email: string): Promise<boolean> {
    const count = await this.accountRepo.countByEmail(email);
    return count > 0;
  }

  // Hàm tạo ID duy nhất cho account
  private async generateAccountId(): Promise<string> {
    const countToday = await this.accountRepo.countAccountsCreatedToday();
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
    const nextNum = countToday + 1;
    return `AC${datePart}${String(nextNum).padStart(4, "0")}`;
  }

  // Hàm sinh token xác minh
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Hàm đăng ký tài khoản mới
  async register(
    full_name: string,
    email: string,
    password: string,
    phone_number?: string
  ) {
    const validationMessage = validateRegisterInput(
      full_name,
      email,
      password,
      phone_number
    );
    if (validationMessage) throw new Error(validationMessage);

    if (!validateEmailFormat(email)) throw new Error("Email không hợp lệ.");

    if (isDisposableEmail(email))
      throw new Error("Không được sử dụng email tạm thời.");

    const emailExists = await this.isEmailExisting(email);
    if (emailExists) throw new Error("Email đã tồn tại.");

    const password_hash = await bcrypt.hash(password, 10);
    const verify_token = this.generateVerificationToken();
    const account_id = await this.generateAccountId();

    await this.accountRepo.create({
      account_id,
      full_name,
      email,
      password_hash,
      phone_number,
      verify_token,
      status: "PENDING",
      verify_expires_at: new Date(Date.now() + 3 * 60 * 1000), 
    });

    await this.emailService.sendVerification(email, verify_token);

    return {
      success: true,
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      data: {
        account_id,
        full_name,
        email,
        phone_number,
        status: "PENDING",
      },
    };
  }

  // Hàm xác thực token email
  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.accountRepo.findByVerifyToken(token);
    if (!user) return false;

    const expiresAt = user.verify_expires_at
      ? new Date(user.verify_expires_at)
      : null;
    if (!expiresAt || new Date() > expiresAt) return false;

    await this.accountRepo.markVerified(user.account_id);
    return true;
  }

  // Hàm gửi lại email xác minh
  async resendVerificationEmail(email: string): Promise<boolean> {
    if (!validateEmailFormat(email)) throw new Error("Email không hợp lệ.");
    if (isDisposableEmail(email))
      throw new Error("Không được sử dụng email tạm thời.");

    const user = await this.accountRepo.getVerificationStats(email);
    if (!user) throw new Error("Email không tồn tại.");
    if (user.is_verified) throw new Error("Tài khoản đã được xác thực.");

    const now = new Date();

    const lastReset = user.last_resend_reset_at
      ? new Date(user.last_resend_reset_at)
      : null;
    const isNewDay =
      !lastReset || now.getTime() - lastReset.getTime() > 86400000;

    if (isNewDay) {
      await this.accountRepo.resetResendLimit(user.account_id);
      user.resend_count = 0;
    }

    if (user.resend_count >= 5)
      throw new Error(
        "Đã đạt giới hạn 5 lần gửi lại trong 24 giờ. Vui lòng thử lại sau."
      );

    const lastSent = user.last_verification_email_at
      ? new Date(user.last_verification_email_at)
      : null;

    if (lastSent && now.getTime() - lastSent.getTime() < 2 * 60 * 1000) {
      const wait = Math.ceil(
        (2 * 60 * 1000 - (now.getTime() - lastSent.getTime())) / 1000
      );
      throw new Error(`Vui lòng đợi ${wait} giây trước khi gửi lại email.`);
    }

    const newToken = this.generateVerificationToken();
    await this.accountRepo.updateVerificationEmail(user.account_id, newToken);

    await this.emailService.sendVerification(email, newToken);

    return true;
  }

  // Hàm xác thực email & mật khẩu
  async verifyLoginCredentials(
    email: string,
    password: string
  ): Promise<Account> {
    if (!validateEmailFormat(email)) throw new Error("Email không hợp lệ.");
    if (isDisposableEmail(email))
      throw new Error("Không được sử dụng email tạm thời.");

    const account = await this.accountRepo.findByEmail(email);
    if (!account) throw new Error("Email không tồn tại.");
    if (account.status === "BANNED") throw new Error("Tài khoản đã bị khóa.");
    if (account.status === "DELETED") throw new Error("Tài khoản đã bị xóa.");
    if (!account.is_verified || account.status === "PENDING")
      throw new Error("Vui lòng xác thực email trước khi đăng nhập.");

    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) throw new Error("Mật khẩu không chính xác.");

    const { password_hash, verify_token, verify_expires_at, ...safeAccount } =
      account;
    return safeAccount as Account;
  }

  // Hàm đăng nhập (login)
  async login(email: string, password: string) {
    const user = await this.verifyLoginCredentials(email, password);
    const payload = {
      account_id: user.account_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);
    await this.tokenService.saveRefreshToken(user.account_id, refreshToken);

    return {
      user: {
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
      },
      tokens: { access_token: accessToken, refresh_token: refreshToken },
    };
  }
}
