import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

(async () => {
    try {
        await transporter.verify();
        console.log("Email service is ready to send messages.");
    } catch (error) {
        console.error("Error verifying email service:", error);
    }
})();

export default transporter;