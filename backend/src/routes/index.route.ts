import { Express } from "express";
import authRoutes from "./Auth/auth.route";
import profileRoutes from "./Auth/profile.route";

import hotelRoutes from "./Hotel/hotel.route";
import locationRoutes from "./Hotel/location.route";
import categoryRoute from "./Hotel/category.route";
import facilityRoute from "./Hotel/facility.route";
import policyRoute from "./Hotel/policy.route";
import bedTypeRoutes from "./Hotel/bedType.route";
import availabilityRoutes from "./Hotel/availability.route";

import bookingRoutes from "./Booking/booking.route";

export function initRoutes(app: Express): void {
  //Auth
  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);

  //Hotel
  app.use("/api/hotels", hotelRoutes);
  app.use("/api/locations", locationRoutes);
  app.use("/api/categories", categoryRoute);
  app.use("/api/facilities", facilityRoute);
  app.use("/api/policies", policyRoute);
  app.use("/api/bed-types", bedTypeRoutes);
  app.use("/api/availability", availabilityRoutes);

  //Booking
  app.use("/api/bookings", bookingRoutes);
}