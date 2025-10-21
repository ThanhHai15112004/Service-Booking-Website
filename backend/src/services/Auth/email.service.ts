import transporter from "../../config/email";

export class EmailService {
  private frontendUrl: string;
  private sender: string;

  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    this.sender = process.env.EMAIL_FROM || "noreply@booking.com";
  }

  //Gửi email xác thực tài khoản
  async sendVerification(email: string, token: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const subject = "Xác thực email của bạn - Booking Service";

    const html = this.getVerificationTemplate(verifyUrl);
    await this.send(email, subject, html);
    console.log(`Verification email sent to ${email}`);
  }

  //Gửi email đặt lại mật khẩu
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = "Đặt lại mật khẩu của bạn - Booking Service";

    const html = this.getPasswordResetTemplate(resetUrl);
    await this.send(email, subject, html);
    console.log(`Password reset email sent to ${email}`);
  }

  //Gửi thông báo đổi mật khẩu
  async sendPasswordChanged(email: string): Promise<void> {
    const subject = "Mật khẩu của bạn đã được thay đổi - Booking Service";
    const html = this.getPasswordChangedTemplate();
    await this.send(email, subject, html);
    console.log(`Password changed notice sent to ${email}`);
  }

  //Gửi email (core function)
  private async send(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: this.sender,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error(`❌ Email sending failed to ${to}:`, error);
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }
  }

  //Template: Xác thực tài khoản
  private getVerificationTemplate(verifyUrl: string): string {
    return `
      <html>
        <body style="font-family: sans-serif; background: #f5f7fa; padding: 20px;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">
            <h2 style="color:#667eea;">Chào mừng bạn!</h2>
            <p>Cảm ơn bạn đã đăng ký tại <strong>Booking Service</strong>.</p>
            <p>Vui lòng nhấn nút bên dưới để xác thực email:</p>
            <a href="${verifyUrl}" 
               style="display:inline-block;background:#667eea;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Xác thực Email
            </a>
            <p style="margin-top:20px;font-size:13px;color:#666;">
              Nếu nút không hoạt động, hãy sao chép link này vào trình duyệt:
              <br /><a href="${verifyUrl}" style="color:#667eea;">${verifyUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  //Template: Đặt lại mật khẩu
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <html>
        <body style="font-family: sans-serif; background: #f5f7fa; padding: 20px;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">
            <h2 style="color:#f5576c;">Đặt lại mật khẩu</h2>
            <p>Bạn đã gửi yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào nút bên dưới để tiếp tục:</p>
            <a href="${resetUrl}" 
               style="display:inline-block;background:#f5576c;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Đặt lại mật khẩu
            </a>
            <p style="margin-top:20px;font-size:13px;color:#666;">
              Liên kết có hiệu lực trong vòng 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  //Template: Thông báo đổi mật khẩu
  private getPasswordChangedTemplate(): string {
    const date = new Date().toLocaleString("vi-VN");
    return `
      <html>
        <body style="font-family: sans-serif; background: #f5f7fa; padding: 20px;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:40px;border-radius:8px;">
            <h2 style="color:#11998e;">Mật khẩu đã được thay đổi</h2>
            <p>Tài khoản của bạn đã được đổi mật khẩu vào lúc <strong>${date}</strong>.</p>
            <p>Nếu đây không phải là bạn, vui lòng đặt lại mật khẩu ngay lập tức hoặc liên hệ hỗ trợ.</p>
            <p style="margin-top:20px;">Trân trọng,<br><strong>Đội ngũ Booking Service</strong></p>
          </div>
        </body>
      </html>
    `;
  }
}
