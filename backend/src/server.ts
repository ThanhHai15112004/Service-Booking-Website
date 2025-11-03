import express from "express";
import dotenv from "dotenv";
import path from "path";
import { initRoutes } from "./routes/index.route";
import "./config/db"; // Keep MySQL pool for raw queries
import sequelize, { testConnection } from "./config/sequelize"; // ✅ Add Sequelize
import { startCleanupJob } from "./jobs/cleanupUnverifiedAccounts";
import { startCleanupExpiredBookingsJob } from "./jobs/cleanupExpiredBookings";
const cors = require('cors');
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Serve static files từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));  

initRoutes(app);

startCleanupJob(); // Cleanup unverified accounts
startCleanupExpiredBookingsJob(); // Cleanup expired CREATED bookings (20 phút) và unlock phòng

// ✅ Initialize Sequelize and start server
(async () => {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

