import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  updateHotelStatus,
  deleteHotel,
  getDashboardStats,
  getReportData,
  getHotelFacilities,
  addHotelFacility,
  removeHotelFacility,
  getAllHighlights,
  getHotelHighlights,
  addHotelHighlight,
  updateHotelHighlight,
  removeHotelHighlight,
  getHotelPolicies,
  getPolicyTypes,
  setHotelPolicy,
  removeHotelPolicy,
  getHotelImages,
  addHotelImage,
  deleteHotelImage,
  getHotelReviews,
  getHotelStatistics,
  getHotelBookings,
  getHotelBookingDetail,
  updateHotelBookingStatus,
  checkInBooking,
  checkOutBooking,
  getHotelBookingStats,
  updateBookingAdminNote,
  updateBookingSpecialRequests,
  getBookingActivityLog,
  getTotalPendingBookingCount,
} from "../../../controllers/Admin/HotelManager/hotel.controller";

const router = Router();

// Dashboard stats
router.get("/dashboard/stats", authenticateJWT, requireAdmin, asyncHandler(getDashboardStats));

// Reports
router.get("/reports", authenticateJWT, requireAdmin, asyncHandler(getReportData));

// Bookings - Must be before /:hotelId routes to avoid route conflicts
router.get("/bookings/pending-count", authenticateJWT, requireAdmin, asyncHandler(getTotalPendingBookingCount));

// List hotels
router.get("/", authenticateJWT, requireAdmin, asyncHandler(getHotels));

// Create hotel (must be before /:hotelId routes)
router.post("/create", authenticateJWT, requireAdmin, asyncHandler(createHotel));

// Hotel detail
router.get("/:hotelId", authenticateJWT, requireAdmin, asyncHandler(getHotelById));

// Update hotel
router.put("/:hotelId", authenticateJWT, requireAdmin, asyncHandler(updateHotel));

// Update status
router.put("/:hotelId/status", authenticateJWT, requireAdmin, asyncHandler(updateHotelStatus));

// Delete hotel
router.delete("/:hotelId", authenticateJWT, requireAdmin, asyncHandler(deleteHotel));

// Hotel Facilities
router.get("/:hotelId/facilities", authenticateJWT, requireAdmin, asyncHandler(getHotelFacilities));
router.post("/:hotelId/facilities", authenticateJWT, requireAdmin, asyncHandler(addHotelFacility));
router.delete("/:hotelId/facilities/:facilityId", authenticateJWT, requireAdmin, asyncHandler(removeHotelFacility));

// Hotel Highlights
router.get("/highlights/all", authenticateJWT, requireAdmin, asyncHandler(getAllHighlights));
router.get("/:hotelId/highlights", authenticateJWT, requireAdmin, asyncHandler(getHotelHighlights));
router.post("/:hotelId/highlights", authenticateJWT, requireAdmin, asyncHandler(addHotelHighlight));
router.put("/:hotelId/highlights/:highlightId", authenticateJWT, requireAdmin, asyncHandler(updateHotelHighlight));
router.delete("/:hotelId/highlights/:highlightId", authenticateJWT, requireAdmin, asyncHandler(removeHotelHighlight));

// Hotel Policies
router.get("/policies/types", authenticateJWT, requireAdmin, asyncHandler(getPolicyTypes));
router.get("/:hotelId/policies", authenticateJWT, requireAdmin, asyncHandler(getHotelPolicies));
router.post("/:hotelId/policies", authenticateJWT, requireAdmin, asyncHandler(setHotelPolicy));
router.delete("/:hotelId/policies/:policyKey", authenticateJWT, requireAdmin, asyncHandler(removeHotelPolicy));

// Hotel Images
router.get("/:hotelId/images", authenticateJWT, requireAdmin, asyncHandler(getHotelImages));
router.post("/:hotelId/images", authenticateJWT, requireAdmin, asyncHandler(addHotelImage));
router.delete("/images/:imageId", authenticateJWT, requireAdmin, asyncHandler(deleteHotelImage));

// Hotel Reviews
router.get("/:hotelId/reviews", authenticateJWT, requireAdmin, asyncHandler(getHotelReviews));

// Hotel Statistics
router.get("/:hotelId/statistics", authenticateJWT, requireAdmin, asyncHandler(getHotelStatistics));

// Hotel Bookings Management
router.get("/:hotelId/bookings", authenticateJWT, requireAdmin, asyncHandler(getHotelBookings));
router.get("/:hotelId/bookings/stats", authenticateJWT, requireAdmin, asyncHandler(getHotelBookingStats));
router.get("/:hotelId/bookings/:bookingId", authenticateJWT, requireAdmin, asyncHandler(getHotelBookingDetail));
router.put("/:hotelId/bookings/:bookingId/status", authenticateJWT, requireAdmin, asyncHandler(updateHotelBookingStatus));
router.post("/:hotelId/bookings/:bookingId/checkin", authenticateJWT, requireAdmin, asyncHandler(checkInBooking));
router.post("/:hotelId/bookings/:bookingId/checkout", authenticateJWT, requireAdmin, asyncHandler(checkOutBooking));
router.put("/:hotelId/bookings/:bookingId/admin-note", authenticateJWT, requireAdmin, asyncHandler(updateBookingAdminNote));
router.put("/:hotelId/bookings/:bookingId/special-requests", authenticateJWT, requireAdmin, asyncHandler(updateBookingSpecialRequests));
router.get("/:hotelId/bookings/:bookingId/activity-log", authenticateJWT, requireAdmin, asyncHandler(getBookingActivityLog));

export default router;