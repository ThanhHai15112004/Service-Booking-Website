import { Express } from "express";
import authRoutes from "./auth.route";
import profileRoutes from "./profile.route";
import hotelRoutes from "./hotel.route";
import locationRoutes from "./location.route";
// import categoryRoutes from "./category.route"; // sẽ thêm sau

export function initRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/locations", locationRoutes);
}
