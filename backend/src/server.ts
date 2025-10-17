import express from "express";
import dotenv from "dotenv";
import { initRoutes } from "./routes/index.route";
import "./config/db";
import { startCleanupJob } from "./jobs/cleanupUnverifiedAccounts";
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

initRoutes(app);

startCleanupJob();

app.listen(PORT, () => {
  console.log(` Server đang chạy trên cổng ${PORT}`);
});

