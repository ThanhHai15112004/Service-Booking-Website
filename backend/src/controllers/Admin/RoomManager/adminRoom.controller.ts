import { Request, Response } from "express";
import { AdminRoomService } from "../../../services/Admin/adminRoom.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const roomService = new AdminRoomService();

// ========== ROOM TYPES ==========

// Lấy danh sách room types theo hotel
export const getRoomTypesByHotel = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { search, bedType, status, page, limit } = req.query;

  const result = await roomService.getRoomTypesByHotel(hotelId, {
    search: search as string,
    bedType: bedType as string,
    status: status as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(result.success ? 200 : 400).json(result);
});

// Lấy chi tiết room type
export const getRoomTypeById = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.getRoomTypeById(roomTypeId);
  res.status(result.success ? 200 : 404).json(result);
});

// Tạo room type
export const createRoomType = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomService.createRoomType(req.body);
  res.status(result.success ? 201 : 400).json(result);
});

// Cập nhật room type
export const updateRoomType = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.updateRoomType(roomTypeId, req.body);
  res.status(result.success ? 200 : 400).json(result);
});

// Xóa room type
export const deleteRoomType = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.deleteRoomType(roomTypeId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== ROOMS ==========

// Lấy danh sách rooms theo hotel
export const getRoomsByHotel = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { roomTypeId, status, search, page, limit } = req.query;

  const result = await roomService.getRoomsByHotel(hotelId, {
    roomTypeId: roomTypeId as string,
    status: status as string,
    search: search as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(result.success ? 200 : 400).json(result);
});

// Lấy danh sách rooms theo room type
export const getRoomsByRoomType = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { status, search, page, limit } = req.query;

  const result = await roomService.getRoomsByRoomType(roomTypeId, {
    status: status as string,
    search: search as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(result.success ? 200 : 400).json(result);
});

// Lấy chi tiết room
export const getRoomById = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const result = await roomService.getRoomById(roomId);
  res.status(result.success ? 200 : 404).json(result);
});

// Tạo room
export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomService.createRoom(req.body);
  res.status(result.success ? 201 : 400).json(result);
});

// Cập nhật room
export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const result = await roomService.updateRoom(roomId, req.body);
  res.status(result.success ? 200 : 400).json(result);
});

// Xóa room
export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const result = await roomService.deleteRoom(roomId);
  res.status(result.success ? 200 : 400).json(result);
});

// Cập nhật status room
export const updateRoomStatus = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Thiếu trường status",
    });
  }

  const result = await roomService.updateRoomStatus(roomId, status);
  res.status(result.success ? 200 : 400).json(result);
});

// Helper endpoints
export const getBedTypes = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomService.getBedTypes();
  res.status(result.success ? 200 : 400).json(result);
});

export const getRoomTypesForHotel = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await roomService.getRoomTypesForHotel(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== ROOM IMAGES ==========
export const getRoomImages = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.getRoomImages(roomTypeId);
  res.status(result.success ? 200 : 400).json(result);
});

export const addRoomImage = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { imageUrl, imageAlt, isPrimary } = req.body;
  const result = await roomService.addRoomImage(roomTypeId, imageUrl, imageAlt, isPrimary);
  res.status(result.success ? 201 : 400).json(result);
});

export const deleteRoomImage = asyncHandler(async (req: Request, res: Response) => {
  const { imageId } = req.params;
  const result = await roomService.deleteRoomImage(imageId);
  res.status(result.success ? 200 : 400).json(result);
});

export const setPrimaryRoomImage = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId, imageId } = req.params;
  const result = await roomService.setPrimaryRoomImage(roomTypeId, imageId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== ROOM AMENITIES ==========
export const getRoomTypeAmenities = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.getRoomTypeAmenities(roomTypeId);
  res.status(result.success ? 200 : 400).json(result);
});

export const getAllFacilities = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query;
  const result = await roomService.getAllFacilities((category as string) || "ROOM");
  res.status(result.success ? 200 : 400).json(result);
});

export const addRoomTypeAmenity = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { facilityId } = req.body;
  const result = await roomService.addRoomTypeAmenity(roomTypeId, facilityId);
  res.status(result.success ? 201 : 400).json(result);
});

export const removeRoomTypeAmenity = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId, facilityId } = req.params;
  const result = await roomService.removeRoomTypeAmenity(roomTypeId, facilityId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== ROOM POLICIES ==========
export const getRoomTypePolicies = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.getRoomTypePolicies(roomTypeId);
  res.status(result.success ? 200 : 400).json(result);
});

export const getAllPolicyTypes = asyncHandler(async (req: Request, res: Response) => {
  const { applicableTo } = req.query;
  const result = await roomService.getAllPolicyTypes((applicableTo as string) || "ROOM");
  res.status(result.success ? 200 : 400).json(result);
});

export const addRoomTypePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { policyKey, value } = req.body;
  const result = await roomService.addRoomTypePolicy(roomTypeId, policyKey, value);
  res.status(result.success ? 201 : 400).json(result);
});

export const updateRoomTypePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId, policyKey } = req.params;
  const { value } = req.body;
  const result = await roomService.updateRoomTypePolicy(roomTypeId, policyKey, value);
  res.status(result.success ? 200 : 400).json(result);
});

export const removeRoomTypePolicy = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId, policyKey } = req.params;
  const result = await roomService.removeRoomTypePolicy(roomTypeId, policyKey);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== ROOM PRICE SCHEDULES ==========
export const getRoomTypePriceSchedules = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.getRoomTypePriceSchedules(roomTypeId);
  res.status(result.success ? 200 : 400).json(result);
});

export const getRoomTypeBasePrice = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const result = await roomService.getRoomTypeBasePrice(roomTypeId);
  res.status(result.success ? 200 : 400).json(result);
});

export const updateRoomTypeBasePrice = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { basePrice } = req.body;

  if (typeof basePrice !== "number" || basePrice < 0) {
    return res.status(400).json({
      success: false,
      message: "Giá cơ bản phải là số và lớn hơn hoặc bằng 0",
    });
  }

  const result = await roomService.updateRoomTypeBasePrice(roomTypeId, basePrice);
  res.status(result.success ? 200 : 400).json(result);
});

export const updateRoomTypeDateDiscount = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { date, discountPercent } = req.body;

  if (!date || typeof date !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin ngày hoặc định dạng ngày không hợp lệ",
    });
  }

  // Validate date format (should be YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD",
    });
  }

  // Convert to number if it's a string
  const discountValue = typeof discountPercent === "string" ? parseFloat(discountPercent) : discountPercent;
  
  if (typeof discountValue !== "number" || isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
    return res.status(400).json({
      success: false,
      message: "Phần trăm giảm giá phải là số từ 0 đến 100",
    });
  }

  try {
    // Ensure date is in correct format (YYYY-MM-DD)
    const normalizedDate = date.trim();
    const result = await roomService.updateRoomTypeDateDiscount(roomTypeId, normalizedDate, discountValue);
    res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi khi cập nhật khuyến mãi",
      });
    }
  });

// Get policies for a specific date
export const getRoomTypeDatePolicies = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { date } = req.query;

  if (!date || typeof date !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin ngày",
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD",
    });
  }

  try {
    const result = await roomService.getRoomTypeDatePolicies(roomTypeId, date);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin chính sách",
    });
  }
});

// Update policies for a specific date
export const updateRoomTypeDatePolicies = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { date, refundable, payLater } = req.body;

  if (!date || typeof date !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin ngày",
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD",
    });
  }

  if (typeof refundable !== "boolean" || typeof payLater !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "refundable và payLater phải là boolean",
    });
  }

  try {
    const result = await roomService.updateRoomTypeDatePolicies(
      roomTypeId,
      date,
      refundable,
      payLater
    );
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật chính sách",
    });
  }
});

// Update base price for a specific date
export const updateRoomTypeDateBasePrice = asyncHandler(async (req: Request, res: Response) => {
  const { roomTypeId } = req.params;
  const { date, basePrice } = req.body;

  if (!date || typeof date !== "string") {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin ngày",
    });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD",
    });
  }

  const priceValue = typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;
  
  if (typeof priceValue !== "number" || isNaN(priceValue) || priceValue < 0) {
    return res.status(400).json({
      success: false,
      message: "Giá cơ bản phải là số lớn hơn hoặc bằng 0",
    });
  }

  try {
    const result = await roomService.updateRoomTypeDateBasePrice(roomTypeId, date, priceValue);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật giá cơ bản",
    });
  }
});

