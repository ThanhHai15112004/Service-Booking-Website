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
import roomRoutes from "./Hotel/room.route";

import bookingRoutes from "./Booking/booking.route";
import paymentRoutes from "./Payment/payment.route";

import addressRoutes from "./Profile/address.route";
import reviewRoutes from "./Profile/review.route";
import settingsRoutes from "./Profile/settings.route";
import paymentCardRoutes from "./Payment/paymentCard.route";
import uploadRoutes from "./Upload/upload.route";
import invoiceRoutes from "./Invoice/invoice.route";
import promotionRoutes from "./Promotion/promotion.route";
import adminRoutes from "./Admin/AccountManager/admin.route";

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
  app.use("/api/rooms", roomRoutes);

  //Booking
  app.use("/api/bookings", bookingRoutes);

  //Payment
  app.use("/api/payments", paymentRoutes);

  //Profile
  app.use("/api/profile/addresses", addressRoutes);
  app.use("/api/profile/reviews", reviewRoutes);
  app.use("/api/profile/settings", settingsRoutes);

  //Payment Cards
  app.use("/api/profile/cards", paymentCardRoutes);

  //Upload
  app.use("/api/upload", uploadRoutes);

  //Invoice
  app.use("/api/invoices", invoiceRoutes);

  //Promotion
  app.use("/api/promotions", promotionRoutes);

  //Admin
  app.use("/api/admin", adminRoutes);
}