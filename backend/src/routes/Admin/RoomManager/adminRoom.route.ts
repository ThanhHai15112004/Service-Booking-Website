import { Router } from "express";
import { authenticateJWT, requireAdmin } from "../../../middleware/auth.middleware";
import { asyncHandler } from "../../../middleware/admin.middleware";
import {
  getRoomTypesByHotel,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRoomsByHotel,
  getRoomsByRoomType,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getBedTypes,
  getRoomTypesForHotel,
  getRoomImages,
  addRoomImage,
  deleteRoomImage,
  setPrimaryRoomImage,
  getRoomTypeAmenities,
  getAllFacilities,
  addRoomTypeAmenity,
  removeRoomTypeAmenity,
  getRoomTypePolicies,
  getAllPolicyTypes,
  addRoomTypePolicy,
  updateRoomTypePolicy,
  removeRoomTypePolicy,
  getRoomTypePriceSchedules,
  getRoomTypeBasePrice,
  updateRoomTypeBasePrice,
  updateRoomTypeDateDiscount,
  getRoomTypeDatePolicies,
  updateRoomTypeDatePolicies,
  updateRoomTypeDateBasePrice,
} from "../../../controllers/Admin/RoomManager/adminRoom.controller";

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);


// Helper endpoints (must be before parameterized routes)
router.get("/bed-types", asyncHandler(getBedTypes));
router.get("/hotels/:hotelId/room-types", asyncHandler(getRoomTypesForHotel));

// ========== ROOM TYPES ==========
// Room types by hotel
router.get("/hotels/:hotelId/room-types/list", asyncHandler(getRoomTypesByHotel));
router.post("/room-types", asyncHandler(createRoomType));

// IMPORTANT: Put specific routes (with extra path segments) BEFORE general routes
// to avoid route conflicts. Express matches routes in order.
router.put("/room-types/:roomTypeId/discount", asyncHandler(updateRoomTypeDateDiscount));
router.put("/room-types/:roomTypeId/date-base-price", asyncHandler(updateRoomTypeDateBasePrice));
router.put("/room-types/:roomTypeId/date-policies", asyncHandler(updateRoomTypeDatePolicies));
router.get("/room-types/:roomTypeId/date-policies", asyncHandler(getRoomTypeDatePolicies));
router.put("/room-types/:roomTypeId/base-price", asyncHandler(updateRoomTypeBasePrice));
router.get("/room-types/:roomTypeId/base-price", asyncHandler(getRoomTypeBasePrice));
router.get("/room-types/:roomTypeId/price-schedules", asyncHandler(getRoomTypePriceSchedules));
router.get("/room-types/:roomTypeId/images", asyncHandler(getRoomImages));
router.post("/room-types/:roomTypeId/images", asyncHandler(addRoomImage));
router.put("/room-types/:roomTypeId/images/:imageId/primary", asyncHandler(setPrimaryRoomImage));
router.get("/room-types/:roomTypeId/amenities", asyncHandler(getRoomTypeAmenities));
router.post("/room-types/:roomTypeId/amenities", asyncHandler(addRoomTypeAmenity));
router.delete("/room-types/:roomTypeId/amenities/:facilityId", asyncHandler(removeRoomTypeAmenity));
router.get("/room-types/:roomTypeId/policies", asyncHandler(getRoomTypePolicies));
router.post("/room-types/:roomTypeId/policies", asyncHandler(addRoomTypePolicy));
router.put("/room-types/:roomTypeId/policies/:policyKey", asyncHandler(updateRoomTypePolicy));
router.delete("/room-types/:roomTypeId/policies/:policyKey", asyncHandler(removeRoomTypePolicy));
router.get("/room-types/:roomTypeId/rooms", asyncHandler(getRoomsByRoomType));

// General routes (must come after specific routes)
router.get("/room-types/:roomTypeId", asyncHandler(getRoomTypeById));
router.put("/room-types/:roomTypeId", asyncHandler(updateRoomType));
router.delete("/room-types/:roomTypeId", asyncHandler(deleteRoomType));

// ========== ROOMS ==========
// Rooms by hotel
router.get("/hotels/:hotelId/rooms", asyncHandler(getRoomsByHotel));
router.post("/rooms", asyncHandler(createRoom));
router.get("/rooms/:roomId", asyncHandler(getRoomById));
router.put("/rooms/:roomId", asyncHandler(updateRoom));
router.delete("/rooms/:roomId", asyncHandler(deleteRoom));
router.put("/rooms/:roomId/status", asyncHandler(updateRoomStatus));

// ========== ROOM IMAGES ==========
router.delete("/images/:imageId", asyncHandler(deleteRoomImage));

// ========== ROOM AMENITIES ==========
router.get("/facilities", asyncHandler(getAllFacilities));

// ========== ROOM POLICIES ==========
router.get("/policy-types", asyncHandler(getAllPolicyTypes));

export default router;

