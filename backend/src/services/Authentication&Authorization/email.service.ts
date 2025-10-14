import transporter from "../../config/email";
import email from "../../config/email";

const frontendUrl = process.env.FRONTEND_URL;

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  try {
    // chỉnh sửa nội dung email ở đây    
    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    
    const subject = "Xác thực email của bạn";
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Xin chào!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản trên <strong>Booking Service</strong>.</p>
        <p>Vui lòng nhấn vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
        <a href="${verifyUrl}" 
          style="display:inline-block; padding:10px 20px; background-color:#007bff; color:white; 
                 text-decoration:none; border-radius:5px; margin-top:10px;">
          Xác nhận Email
        </a>
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        <hr>
        <p style="font-size: 12px; color: #888;">
          Liên hệ hỗ trợ: <a href="mailto:support@booking.com">support@booking.com</a>
        </p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(
      `✅ Verification email sent to ${email} (Message ID: ${info.messageId})`
    );
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw new Error("Email sending failed");
  }
}


export async function sendPasswordResetEmail(email:string, token:string):Promise<void>{
  try{
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const subject = "Đặt lại mật khẩu của bạn";
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn vào nút bên dưới để tạo mật khẩu mới (liên kết sẽ hết hạn sau một thời gian ngắn):</p>
          <a href="${resetUrl}" 
            style="display:inline-block; padding:10px 20px; background-color:#dc3545; color:white; 
                  text-decoration:none; border-radius:5px; margin-top:10px;">
            Đặt lại mật khẩu
          </a>
          <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          <hr>
          <p style="font-size: 12px; color: #888;">
            Liên hệ hỗ trợ: <a href="mailto:support@booking.com">support@booking.com</a>
          </p>
        </div>
      `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("❌ Failed to send reset email:", error);
    throw new Error("Email sending failed");
  }
}

export async function sendPasswordChangedNotice(email: string): Promise<void> {
  const subject = "Mật khẩu của bạn đã được thay đổi";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333">
      <h2>Thông báo bảo mật</h2>
      <p>Mật khẩu tài khoản của bạn vừa được thay đổi.</p>
      <p>Nếu không phải bạn thực hiện, vui lòng <strong>đổi lại mật khẩu ngay lập tức</strong> và liên hệ hỗ trợ.</p>
      <hr/>
      <p style="font-size:12px;color:#888">Liên hệ: <a href="mailto:support@booking.com">support@booking.com</a></p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
}
