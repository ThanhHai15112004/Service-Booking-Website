import transporter from "../config/email";
import email from "../config/email";

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  try {
    // chỉnh sửa nội dung email ở đây
    const verifyUrl = `http://localhost:3000/verify?token=${token}`;
    
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
