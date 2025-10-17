import transporter from "../../config/email";
const frontendUrl = process.env.FRONTEND_URL;

/**
 * 📩 Gửi email xác thực tài khoản
 */
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  try {
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
    const subject = "Xác thực email của bạn - Booking Service";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background: #f5f7fa; padding: 20px 0; }
            .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px 30px; text-align: center; }
            .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
            .header p { font-size: 16px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .content h2 { color: #667eea; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
            .content p { color: #555555; font-size: 16px; line-height: 1.8; margin-bottom: 16px; }
            .greeting { font-size: 18px; color: #333333; margin-bottom: 24px; }
            .highlight-box { background: linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 6px; margin: 24px 0; }
            .highlight-box strong { color: #667eea; }
            .security-info { background: #fef3cd; border: 1px solid #ffc107; color: #856404; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; margin: 24px 0; }
            .security-info strong { color: #664d03; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e8eef5; }
            .footer-content { color: #888888; font-size: 14px; line-height: 1.8; }
            .footer-divider { height: 1px; background: #e0e0e0; margin: 16px 0; }
            .copyright { font-size: 12px; color: #999999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <!-- Header -->
            <div class="header">
              <h1>Chào mừng bạn!</h1>
              <p>Hãy hoàn tất quá trình đăng ký của bạn</p>
            </div>

            <!-- Content -->
            <div class="content">
              <p class="greeting">Xin chào,</p>
              
              <p>Cảm ơn bạn đã tạo tài khoản trên <strong>Booking Service</strong>! Chúng tôi rất vui được chào đón bạn vào cộng đồng của chúng tôi.</p>
              
              <p>Để hoàn tất quá trình đăng ký và khám phá các tính năng tuyệt vời, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn nút bên dưới:</p>

              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 32px auto;">
                <tr>
                  <td align="center" style="border-radius:8px; background-color:#667eea;">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block; padding:18px 50px; font-size:18px; font-weight:600; color:#ffffff; text-decoration:none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">✔️ Xác thực Email Của Tôi</a>
                  </td>
                </tr>
              </table>

              <div class="highlight-box">
                <p><strong>💡 Lưu ý quan trọng:</strong> Liên kết xác thực này sẽ hết hạn sau <strong>24 giờ</strong>. Vui lòng hoàn tất xác thực trong thời gian này để tránh phải đăng ký lại.</p>
              </div>

              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin-top: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border-radius: 6px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #888888;">
                      Hoặc sao chép và dán link này vào trình duyệt:
                    </p>
                    <a href="${verifyUrl}" target="_blank" style="display: block; word-break: break-all; font-size: 13px; color: #667eea; text-decoration: underline;">
                      ${verifyUrl}
                    </a>
                  </td>
                </tr>
              </table>

              <div class="security-info">
                <p><strong>🔒 Bảo mật:</strong> Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi ngay lập tức. Chúng tôi sẽ tự động xóa tài khoản chưa xác thực sau 24 giờ.</p>
              </div>

              <p>Nếu bạn gặp bất kỳ vấn đề nào trong quá trình xác thực hoặc có câu hỏi, vui lòng không ngần ngại liên hệ với đội hỗ trợ của chúng tôi.</p>
              
              <p style="margin-top: 24px;">Trân trọng,<br><strong style="color: #667eea;">Đội ngũ Booking Service</strong></p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <p style="font-weight: 600; color: #333333; margin-bottom: 16px;">Booking Service</p>
                <div class="footer-divider"></div>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td style="padding: 0 12px;">
                      <a href="mailto:support@booking.com" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 500; font-size: 14px;">📧 support@booking.com</a>
                    </td>
                    <td style="padding: 0 12px;">
                      <a href="${frontendUrl}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 500; font-size: 14px;">🌐 Truy cập Website</a>
                    </td>
                  </tr>
                </table>
              </div>
              <p class="copyright">© ${new Date().getFullYear()} Booking Service. Bảo lưu mọi quyền.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`Verification email sent to ${email} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Email sending failed");
  }
}

/**
 * 🔑 Gửi email đặt lại mật khẩu
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  try {
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const subject = "🔐 Đặt lại mật khẩu của bạn - Booking Service";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background: #f5f7fa; padding: 20px 0; }
            .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 50px 30px; text-align: center; }
            .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
            .header p { font-size: 16px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .content h2 { color: #f5576c; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
            .content p { color: #555555; font-size: 16px; line-height: 1.8; margin-bottom: 16px; }
            .greeting { font-size: 18px; color: #333333; margin-bottom: 24px; }
            .highlight-box { background: linear-gradient(135deg, rgba(245,87,108,0.08) 0%, rgba(240,147,251,0.08) 100%); border-left: 4px solid #f5576c; padding: 20px; border-radius: 6px; margin: 24px 0; }
            .highlight-box strong { color: #f5576c; }
            .warning-info { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; margin: 24px 0; }
            .warning-info strong { color: #721c24; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e8eef5; }
            .footer-content { color: #888888; font-size: 14px; line-height: 1.8; }
            .footer-divider { height: 1px; background: #e0e0e0; margin: 16px 0; }
            .copyright { font-size: 12px; color: #999999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <!-- Header -->
            <div class="header">
              <h1>🔐 Đặt lại mật khẩu</h1>
              <p>Yêu cầu thay đổi mật khẩu của bạn</p>
            </div>

            <!-- Content -->
            <div class="content">
              <p class="greeting">Xin chào,</p>
              
              <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên <strong>Booking Service</strong>.</p>
              
              <p>Vui lòng nhấn vào nút bên dưới để tạo mật khẩu mới cho tài khoản của bạn:</p>

              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 32px auto;">
                <tr>
                  <td align="center" style="border-radius:8px; background-color:#f5576c;">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block; padding:18px 50px; font-size:18px; font-weight:600; color:#ffffff; text-decoration:none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">🔑 Đặt Lại Mật Khẩu</a>
                  </td>
                </tr>
              </table>

              <div class="highlight-box">
                <p><strong>⏱️ Thời gian hạn chế:</strong> Liên kết này chỉ có hiệu lực trong <strong>1 giờ</strong> từ lúc nhận email. Sau đó, bạn sẽ phải gửi yêu cầu đặt lại mật khẩu mới.</p>
              </div>

              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin-top: 24px;">
                <tr>
                  <td style="padding: 16px; background-color: #f8f9fa; border-radius: 6px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #888888;">
                      Hoặc sao chép và dán link này vào trình duyệt:
                    </p>
                    <a href="${resetUrl}" target="_blank" style="display: block; word-break: break-all; font-size: 13px; color: #f5576c; text-decoration: underline;">
                      ${resetUrl}
                    </a>
                  </td>
                </tr>
              </table>

              <div class="warning-info">
                <p><strong>⚠️ Bảo mật:</strong> Nếu bạn <strong>không</strong> gửi yêu cầu đặt lại mật khẩu này, vui lòng bỏ qua email này hoặc liên hệ ngay với chúng tôi. Tài khoản của bạn có thể đang gặp nguy hiểm.</p>
              </div>

              <p>Để bảo vệ tài khoản của bạn, đừng chia sẻ liên kết này với bất kỳ ai.</p>
              
              <p style="margin-top: 24px;">Trân trọng,<br><strong style="color: #f5576c;">Đội ngũ Booking Service</strong></p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <p style="font-weight: 600; color: #333333; margin-bottom: 16px;">Booking Service</p>
                <div class="footer-divider"></div>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td style="padding: 0 12px;">
                      <a href="mailto:support@booking.com" target="_blank" style="color: #f5576c; text-decoration: none; font-weight: 500; font-size: 14px;">📧 support@booking.com</a>
                    </td>
                    <td style="padding: 0 12px;">
                      <a href="${frontendUrl}" target="_blank" style="color: #f5576c; text-decoration: none; font-weight: 500; font-size: 14px;">🌐 Truy cập Website</a>
                    </td>
                  </tr>
                </table>
              </div>
              <p class="copyright">© ${new Date().getFullYear()} Booking Service. Bảo lưu mọi quyền.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    throw new Error("Email sending failed");
  }
}

/**
 * 🔒 Gửi email thông báo đổi mật khẩu
 */
export async function sendPasswordChangedNotice(email: string): Promise<void> {
  try {
    const subject = "✅ Mật khẩu của bạn đã được thay đổi - Booking Service";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background: #f5f7fa; padding: 20px 0; }
            .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 2px 12px rgba(0,0,0,0.08); border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 50px 30px; text-align: center; }
            .header h1 { font-size: 32px; font-weight: 700; margin-bottom: 10px; }
            .header p { font-size: 16px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .content h2 { color: #11998e; font-size: 24px; margin-bottom: 20px; font-weight: 600; }
            .content p { color: #555555; font-size: 16px; line-height: 1.8; margin-bottom: 16px; }
            .greeting { font-size: 18px; color: #333333; margin-bottom: 24px; }
            .success-box { background: linear-gradient(135deg, rgba(17,153,142,0.08) 0%, rgba(56,239,125,0.08) 100%); border-left: 4px solid #11998e; padding: 20px; border-radius: 6px; margin: 24px 0; }
            .success-box strong { color: #11998e; }
            .info-box { background: #f0f8f7; border: 1px solid #d4edea; color: #0d5f57; padding: 16px; border-radius: 6px; font-size: 14px; line-height: 1.6; margin: 24px 0; }
            .info-box strong { color: #0d5f57; }
            .action-list { margin: 20px 0; }
            .action-list li { color: #555555; font-size: 15px; line-height: 1.8; margin-bottom: 12px; }
            .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e8eef5; }
            .footer-content { color: #888888; font-size: 14px; line-height: 1.8; }
            .footer-divider { height: 1px; background: #e0e0e0; margin: 16px 0; }
            .copyright { font-size: 12px; color: #999999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <!-- Header -->
            <div class="header">
              <h1>✅ Thành công!</h1>
              <p>Mật khẩu của bạn đã được thay đổi</p>
            </div>

            <!-- Content -->
            <div class="content">
              <p class="greeting">Xin chào,</p>
              
              <p>Mật khẩu tài khoản <strong>Booking Service</strong> của bạn vừa được thay đổi thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.</p>
              
              <div class="success-box">
                <p><strong>✔️ Hành động này đã được xác nhận.</strong> Nếu đây là bạn, bạn có thể yên tâm. Tài khoản của bạn hiện đang an toàn.</p>
              </div>

              <p><strong>Nếu bạn KHÔNG thực hiện thay đổi này:</strong></p>
              <ul class="action-list">
                <li>🚨 Tài khoản của bạn có thể đang gặp nguy hiểm</li>
                <li>🔄 Hãy đặt lại mật khẩu ngay lập tức</li>
                <li>📞 Liên hệ bộ phận hỗ trợ để báo cáo hoạt động không bình thường</li>
              </ul>

              <div class="info-box">
                <p><strong>💡 Lời khuyên bảo mật:</strong> Để bảo vệ tài khoản của bạn, vui lòng sử dụng mật khẩu mạnh (ít nhất 8 ký tự, bao gồm chữ cai, chữ thường, số và ký tự đặc biệt).</p>
              </div>

              <p style="margin-top: 24px;">Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội hỗ trợ của chúng tôi.</p>
              
              <p style="margin-top: 24px;">Trân trọng,<br><strong style="color: #11998e;">Đội ngũ Booking Service</strong></p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-content">
                <p style="font-weight: 600; color: #333333; margin-bottom: 16px;">Booking Service</p>
                <div class="footer-divider"></div>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td style="padding: 0 12px;">
                      <a href="mailto:support@booking.com" target="_blank" style="color: #11998e; text-decoration: none; font-weight: 500; font-size: 14px;">📧 support@booking.com</a>
                    </td>
                    <td style="padding: 0 12px;">
                      <a href="${frontendUrl}" target="_blank" style="color: #11998e; text-decoration: none; font-weight: 500; font-size: 14px;">🌐 Truy cập Website</a>
                    </td>
                  </tr>
                </table>
              </div>
              <p class="copyright">© ${new Date().getFullYear()} Booking Service. Bảo lưu mọi quyền.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });
    console.log(`✅ Password changed notice sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send password changed notice:", error);
    throw new Error("Email sending failed");
  }
}
