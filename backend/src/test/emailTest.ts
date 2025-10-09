import transporter from "../config/email";

async function testSendEmail() {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: "recipient@gmail.com",
    subject: "🧪 Test Email from Booking Backend",
    text: "Hello! This is a test email from your booking backend project.",
  });

  console.log("✅ Email sent:", info.messageId);
}

testSendEmail().catch(console.error);
