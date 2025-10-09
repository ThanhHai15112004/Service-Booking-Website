import express from "express";
import dotenv from "dotenv";
import { initRoutes } from "./routes/index.route";
import "./config/db";
import { startCleanupJob } from "./jobs/cleanupUnverifiedAccounts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

initRoutes(app);

startCleanupJob();

app.listen(PORT, () => {
  console.log(` Server đang chạy trên cổng ${PORT}`);
});
