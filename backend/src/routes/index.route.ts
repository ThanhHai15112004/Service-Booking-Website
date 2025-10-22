import { Express } from "express";
import authRoutes from "./auth.route";
import profileRoutes from "./profile.route";
import hotelRoutes from "./hotel.route";
import locationRoutes from "./location.route";
import categoryRoute from "./category.route";

export function initRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/categories", categoryRoute);
}
