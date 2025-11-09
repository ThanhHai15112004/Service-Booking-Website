import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import dashboardRoutes from "./dashboard.route";
import accountRoutes from "./account.route";
import bookingRoutes from "./booking.route";
import reviewRoutes from "./review.route";
import addressRoutes from "./address.route";
import packageRoutes from "./package.route";
import activityRoutes from "./activity.route";
import hotelRoutes from "../HotelManager/hotel.route";
import categoryRoutes from "../CategoryManager/category.route";
import locationRoutes from "../CategoryManager/location.route";
import roomRoutes from "../RoomManager/adminRoom.route";
import bookingManagerRoutes from "../BookingManager/adminBooking.route";
import paymentManagerRoutes from "../PaymentManager/adminPayment.route";
import discountManagerRoutes from "../DiscountManager/adminDiscount.route";
import promotionManagerRoutes from "../PromotionManager/adminPromotion.route";
import { toggleReviewVisibility, deleteReview } from "../../../controllers/Admin/AccountManager/review.controller";

const router = Router();

// Dashboard
router.use("/dashboard", dashboardRoutes);

// Account management
router.use("/accounts", accountRoutes);

// Account Bookings - nested under accounts
router.use("/accounts", bookingRoutes);

// Account Reviews - nested under accounts
router.use("/accounts", reviewRoutes);

// Review actions - standalone routes
router.put("/reviews/:reviewId/visibility", authenticateJWT, requireAdmin, asyncHandler(toggleReviewVisibility));
router.delete("/reviews/:reviewId", authenticateJWT, requireAdmin, asyncHandler(deleteReview));

// Account Addresses - nested under accounts
router.use("/accounts", addressRoutes);

// Account Packages & Payments - nested under accounts
router.use("/accounts", packageRoutes);

// Account Activity - nested under accounts
router.use("/accounts", activityRoutes);

// Hotel management
router.use("/hotels", hotelRoutes);

// Category management
router.use("/categories", categoryRoutes);

// Location management
router.use("/locations", locationRoutes);

// Room management
router.use("/rooms", roomRoutes);

// Booking management (Booking Manager)
router.use("/bookings", bookingManagerRoutes);

// Payment management (Payment Manager)
router.use("/payments", paymentManagerRoutes);

// Discount management (Discount Manager)
router.use("/discounts", discountManagerRoutes);

// Promotion management (Promotion Manager)
router.use("/promotions", promotionManagerRoutes);

export default router;
