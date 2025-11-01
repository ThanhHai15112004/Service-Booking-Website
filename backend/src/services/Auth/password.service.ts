import crypto from "crypto";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PasswordRepository } from "../../Repository/Auth/password.repository";
import { EmailService } from "./email.service";
import { AccountRepository } from "../../Repository/Auth/account.repository";

dotenv.config();

export class PasswordService {
  constructor(
    private repo = new PasswordRepository(),
    private emailService = new EmailService(),
    private accountRepo = new AccountRepository()
  ) {}

  // Hàm chuyển đổi chuỗi thời gian hết hạn thành phút
  private parseExpireToMinutes(raw?: string): number {
    const val = raw || "15m";
    if (val.endsWith("m")) return parseInt(val.replace("m", ""), 10);
    if (val.endsWith("h")) return parseInt(val.replace("h", ""), 10) * 60;
    return parseInt(val, 10);
  }

  // Hàm yêu cầu đặt lại mật khẩu
  async requestPasswordReset(email: string): Promise<void> {
    const accountId = await this.repo.getAccountIdByEmail(email);
    if (!accountId) return;

    const token = crypto.randomBytes(32).toString("hex");
    const minutes = this.parseExpireToMinutes(
      process.env.PASSWORD_RESET_EXPIRES_IN
    );
    await this.repo.setResetToken(accountId, token, minutes);
    await this.emailService.sendPasswordReset(email, token);
  }

  // Hàm xác thực token đặt lại mật khẩu
  async verifyResetToken(token: string): Promise<boolean> {
    const record = await this.repo.isResetTokenValid(token);
    return !!record;
  }

  // Hàm đặt lại mật khẩu
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.repo.isResetTokenValid(token);
    if (!record) throw new Error("Token không hợp lệ hoặc đã hết hạn.");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePassword(record.account_id, passwordHash);

    const email = await this.accountRepo.getEmailByAccountId(record.account_id);
    if (email) await this.emailService.sendPasswordChanged(email);
  }

  // Hàm xử lý xác minh token đặt lại mật khẩu
  async handleVerifyResetToken(token: string): Promise<string> {
    const record = await this.repo.isResetTokenValid(token);
    if (!record) throw new Error("Token không hợp lệ hoặc đã hết hạn.");
    return "Token hợp lệ. Bạn có thể đặt lại mật khẩu.";
  }

  // Hàm xử lý đặt lại mật khẩu
  async handleResetPassword(token: string, newPassword: string): Promise<string> {
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    const record = await this.repo.isResetTokenValid(token);
    if (!record) throw new Error("Token không hợp lệ hoặc đã hết hạn.");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.repo.updatePassword(record.account_id, passwordHash);

    const email = await this.accountRepo.getEmailByAccountId(record.account_id);
    if (email) await this.emailService.sendPasswordChanged(email);

    return "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.";
  }

}
