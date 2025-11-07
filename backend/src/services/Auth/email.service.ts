import transporter from "../../config/email";

export class EmailService {
  private frontendUrl: string;
  private sender: string;

  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    this.sender = process.env.EMAIL_FROM || "noreply@booking.com";
  }

  // Hàm gửi email xác thực tài khoản
  async sendVerification(email: string, token: string, fullName?: string): Promise<void> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    const subject = "Xác thực email của bạn - Booking Service";

    const html = this.getVerificationTemplate(verifyUrl, fullName || email);
    await this.send(email, subject, html);
  }

  // Hàm gửi email đặt lại mật khẩu
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = "Đặt lại mật khẩu của bạn - Booking Service";

    const html = this.getPasswordResetTemplate(resetUrl);
    await this.send(email, subject, html);
  }

  // Hàm gửi thông báo đổi mật khẩu
  async sendPasswordChanged(email: string): Promise<void> {
    const subject = "Mật khẩu của bạn đã được thay đổi - Booking Service";
    const html = this.getPasswordChangedTemplate();
    await this.send(email, subject, html);
  }

  // Hàm gửi email (core function)
  private async send(to: string, subject: string, html: string) {
    try {
      await transporter.sendMail({
        from: this.sender,
        to,
        subject,
        html,
      });
    } catch (error: any) {
      console.error("[EmailService] send error:", error?.message || error);
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }
  }

  // Template xác thực tài khoản
  private getVerificationTemplate(verifyUrl: string, fullName: string): string {
    const currentDate = new Date().toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="Xác thực email để kích hoạt tài khoản Booking Service của bạn">
  <meta name="keywords" content="booking service, xác thực email, đăng ký tài khoản">
  <title>Xác thực Email - Booking Service</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🎉 Chào mừng bạn đến với Booking Service!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                Xin chào <strong style="color: #667eea;">${fullName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 15px;">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color: #667eea;">Booking Service</strong> - Hệ thống đặt phòng khách sạn hàng đầu!
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px;">
                Để hoàn tất quá trình đăng ký và bảo vệ tài khoản của bạn, vui lòng xác thực địa chỉ email bằng cách nhấn nút bên dưới:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 0 0 30px;">
                    <a href="${verifyUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                      ✨ Xác thực Email ngay
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; border-radius: 4px; margin: 0 0 30px;">
                <p style="margin: 0 0 8px; color: #666666; font-size: 13px; font-weight: 600;">
                  📋 Nếu nút không hoạt động, vui lòng sao chép và dán link sau vào trình duyệt:
                </p>
                <p style="margin: 0; color: #667eea; font-size: 12px; word-break: break-all;">
                  <a href="${verifyUrl}" style="color: #667eea; text-decoration: underline;">${verifyUrl}</a>
                </p>
              </div>
              
              <!-- Important Info -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 0 0 30px;">
                <p style="margin: 0; color: #856404; font-size: 13px;">
                  <strong>⏰ Lưu ý quan trọng:</strong> Link xác thực có hiệu lực trong <strong>3 phút</strong>. Nếu link hết hạn, vui lòng yêu cầu gửi lại email xác thực từ trang đăng nhập.
                </p>
              </div>
              
              <!-- Features -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0 0 15px; color: #333333; font-size: 15px; font-weight: 600;">
                  🚀 Sau khi xác thực, bạn sẽ được:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                  <li>Đặt phòng khách sạn với giá ưu đãi</li>
                  <li>Nhận thông báo về các chương trình khuyến mãi</li>
                  <li>Quản lý đơn đặt phòng dễ dàng</li>
                  <li>Tích lũy điểm thưởng và hưởng nhiều đặc quyền</li>
                </ul>
              </div>
              
              <!-- Footer Info -->
              <p style="margin: 30px 0 0; color: #999999; font-size: 13px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 20px;">
                📅 Email được gửi vào: <strong>${currentDate}</strong>
              </p>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px;">
                Trân trọng,<br>
                <strong style="color: #667eea;">Đội ngũ Booking Service</strong><br>
                <span style="color: #999999; font-size: 12px;">Hệ thống đặt phòng khách sạn uy tín và chuyên nghiệp</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                📧 Email hỗ trợ: <a href="mailto:support@booking.com" style="color: #667eea; text-decoration: none;">support@booking.com</a>
              </p>
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                🌐 Website: <a href="${this.frontendUrl}" style="color: #667eea; text-decoration: none;">${this.frontendUrl}</a>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} Booking Service. Tất cả quyền được bảo lưu.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                Nếu bạn không yêu cầu email này, vui lòng bỏ qua hoặc liên hệ hỗ trợ.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // Template đặt lại mật khẩu
  private getPasswordResetTemplate(resetUrl: string): string {
    const currentDate = new Date().toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="Đặt lại mật khẩu tài khoản Booking Service của bạn">
  <meta name="keywords" content="booking service, đặt lại mật khẩu, reset password">
  <title>Đặt lại Mật khẩu - Booking Service</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🔐 Đặt lại Mật khẩu
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                Xin chào,
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 15px;">
                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong style="color: #f5576c;">Booking Service</strong> của bạn.
              </p>
              
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px;">
                Để tiếp tục, vui lòng nhấn nút bên dưới để tạo mật khẩu mới:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 0 0 30px;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4); transition: all 0.3s ease;">
                      🔑 Đặt lại Mật khẩu
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #f5576c; padding: 15px; border-radius: 4px; margin: 0 0 30px;">
                <p style="margin: 0 0 8px; color: #666666; font-size: 13px; font-weight: 600;">
                  📋 Nếu nút không hoạt động, vui lòng sao chép và dán link sau vào trình duyệt:
                </p>
                <p style="margin: 0; color: #f5576c; font-size: 12px; word-break: break-all;">
                  <a href="${resetUrl}" style="color: #f5576c; text-decoration: underline;">${resetUrl}</a>
                </p>
              </div>
              
              <!-- Security Warning -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 0 0 30px;">
                <p style="margin: 0 0 10px; color: #856404; font-size: 13px; font-weight: 600;">
                  ⚠️ Lưu ý bảo mật:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #856404; font-size: 13px; line-height: 1.8;">
                  <li>Link có hiệu lực trong <strong>1 giờ</strong> kể từ khi nhận email</li>
                  <li>Nếu bạn KHÔNG yêu cầu đặt lại mật khẩu, vui lòng <strong>BỎ QUA</strong> email này</li>
                  <li>Mật khẩu của bạn sẽ không thay đổi cho đến khi bạn hoàn tất quá trình</li>
                </ul>
              </div>
              
              <!-- Security Tips -->
              <div style="margin: 30px 0; padding: 20px; background-color: #e7f3ff; border-radius: 8px; border-left: 4px solid #0066cc;">
                <p style="margin: 0 0 15px; color: #004085; font-size: 15px; font-weight: 600;">
                  🔒 Mẹo bảo mật mật khẩu:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #004085; font-size: 14px; line-height: 1.8;">
                  <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                  <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                  <li>Đổi mật khẩu định kỳ để đảm bảo an toàn</li>
                </ul>
              </div>
              
              <!-- Footer Info -->
              <p style="margin: 30px 0 0; color: #999999; font-size: 13px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 20px;">
                📅 Yêu cầu được gửi vào: <strong>${currentDate}</strong>
              </p>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px;">
                Trân trọng,<br>
                <strong style="color: #f5576c;">Đội ngũ Bảo mật Booking Service</strong><br>
                <span style="color: #999999; font-size: 12px;">Luôn bảo vệ thông tin tài khoản của bạn</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                📧 Email hỗ trợ: <a href="mailto:support@booking.com" style="color: #f5576c; text-decoration: none;">support@booking.com</a>
              </p>
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                🌐 Website: <a href="${this.frontendUrl}" style="color: #f5576c; text-decoration: none;">${this.frontendUrl}</a>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} Booking Service. Tất cả quyền được bảo lưu.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                Nếu bạn không yêu cầu email này, vui lòng bỏ qua hoặc liên hệ hỗ trợ ngay.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // Template thông báo đổi mật khẩu
  private getPasswordChangedTemplate(): string {
    const currentDate = new Date().toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="description" content="Thông báo mật khẩu đã được thay đổi - Booking Service">
  <meta name="keywords" content="booking service, thay đổi mật khẩu, bảo mật tài khoản">
  <title>Mật khẩu đã được thay đổi - Booking Service</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✅ Mật khẩu đã được thay đổi
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px;">
                Xin chào,
              </p>
              
              <p style="margin: 0 0 20px; color: #666666; font-size: 15px;">
                Mật khẩu cho tài khoản <strong style="color: #11998e;">Booking Service</strong> của bạn đã được thay đổi thành công.
              </p>
              
              <!-- Info Box -->
              <div style="background-color: #d1ecf1; border-left: 4px solid #11998e; padding: 20px; border-radius: 4px; margin: 0 0 30px;">
                <p style="margin: 0 0 10px; color: #0c5460; font-size: 14px; font-weight: 600;">
                  📅 Thời gian thay đổi:
                </p>
                <p style="margin: 0; color: #0c5460; font-size: 16px;">
                  <strong>${currentDate}</strong>
                </p>
              </div>
              
              <!-- Security Alert -->
              <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; border-radius: 4px; margin: 0 0 30px;">
                <p style="margin: 0 0 10px; color: #721c24; font-size: 14px; font-weight: 600;">
                  ⚠️ Quan trọng:
                </p>
                <p style="margin: 0; color: #721c24; font-size: 14px;">
                  Nếu bạn <strong>KHÔNG</strong> thực hiện thay đổi này, có thể tài khoản của bạn đã bị xâm nhập. Vui lòng:
                </p>
                <ul style="margin: 10px 0 0; padding-left: 20px; color: #721c24; font-size: 14px; line-height: 1.8;">
                  <li>Đặt lại mật khẩu ngay lập tức</li>
                  <li>Kiểm tra các hoạt động đăng nhập gần đây</li>
                  <li>Liên hệ hỗ trợ nếu cần thiết</li>
                </ul>
              </div>
              
              <!-- Action Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 0 0 30px;">
                    <a href="${this.frontendUrl}/login" 
                       style="display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(17, 153, 142, 0.4); transition: all 0.3s ease;">
                      🔐 Đăng nhập ngay
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security Tips -->
              <div style="margin: 30px 0; padding: 20px; background-color: #e7f3ff; border-radius: 8px; border-left: 4px solid #0066cc;">
                <p style="margin: 0 0 15px; color: #004085; font-size: 15px; font-weight: 600;">
                  🔒 Bảo vệ tài khoản của bạn:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #004085; font-size: 14px; line-height: 1.8;">
                  <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                  <li>Sử dụng mật khẩu mạnh và duy nhất</li>
                  <li>Bật xác thực 2 lớp nếu có</li>
                  <li>Thường xuyên kiểm tra hoạt động đăng nhập</li>
                </ul>
              </div>
              
              <!-- Footer Info -->
              <p style="margin: 30px 0 0; color: #999999; font-size: 13px; text-align: center; border-top: 1px solid #e9ecef; padding-top: 20px;">
                📧 Email này được gửi tự động để thông báo về thay đổi bảo mật
              </p>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px;">
                Trân trọng,<br>
                <strong style="color: #11998e;">Đội ngũ Bảo mật Booking Service</strong><br>
                <span style="color: #999999; font-size: 12px;">Luôn bảo vệ thông tin tài khoản của bạn</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                📧 Email hỗ trợ: <a href="mailto:support@booking.com" style="color: #11998e; text-decoration: none;">support@booking.com</a>
              </p>
              <p style="margin: 0 0 10px; color: #666666; font-size: 12px;">
                🌐 Website: <a href="${this.frontendUrl}" style="color: #11998e; text-decoration: none;">${this.frontendUrl}</a>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 11px;">
                © ${new Date().getFullYear()} Booking Service. Tất cả quyền được bảo lưu.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                Nếu bạn có thắc mắc, vui lòng liên hệ hỗ trợ để được giải đáp.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}
