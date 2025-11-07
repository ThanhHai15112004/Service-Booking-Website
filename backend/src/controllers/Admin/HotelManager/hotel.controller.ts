import { Request, Response } from "express";
import { AdminHotelService } from "../../../services/Admin/adminHotel.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const hotelService = new AdminHotelService();

// Lấy danh sách hotels
export const getHotels = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      category,
      city,
      starRating,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const result = await hotelService.getHotels({
      search: search as string,
      status: status as string,
      category: category as string,
      city: city as string,
      starRating: starRating as string,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as "ASC" | "DESC") || "DESC",
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách khách sạn",
    });
  }
};

// Cập nhật hotel
export const updateHotel = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.updateHotel(hotelId, req.body);
  res.status(result.success ? 200 : 400).json(result);
});

// Lấy chi tiết hotel
export const getHotelById = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const result = await hotelService.getHotelById(hotelId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy thông tin khách sạn",
    });
  }
};

// Cập nhật trạng thái hotel
export const updateHotelStatus = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu trường status",
      });
    }

    const result = await hotelService.updateHotelStatus(hotelId, status);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi cập nhật trạng thái",
    });
  }
};

// Xóa hotel
export const deleteHotel = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const { hardDelete } = req.query;

    const result = await hotelService.deleteHotel(hotelId, hardDelete === "true");

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi xóa khách sạn",
    });
  }
};

// Lấy dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await hotelService.getDashboardStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy thống kê dashboard",
    });
  }
};

// Lấy report data
export const getReportData = async (req: Request, res: Response) => {
  try {
    const { period, city, category } = req.query;

    const result = await hotelService.getReportData({
      period: period as string,
      city: city as string,
      category: category as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy báo cáo",
    });
  }
};

// ========== Hotel Facilities ==========
export const getHotelFacilities = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.getHotelFacilities(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

export const addHotelFacility = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { facilityId } = req.body;
  
  if (!facilityId) {
    return res.status(400).json({
      success: false,
      message: "facilityId là bắt buộc"
    });
  }
  
  const result = await hotelService.addHotelFacility(hotelId, facilityId);
  res.status(result.success ? 200 : 400).json(result);
});

export const removeHotelFacility = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, facilityId } = req.params;
  const result = await hotelService.removeHotelFacility(hotelId, facilityId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== Hotel Highlights ==========
export const getAllHighlights = asyncHandler(async (req: Request, res: Response) => {
  const result = await hotelService.getAllHighlights();
  res.status(result.success ? 200 : 400).json(result);
});

export const getHotelHighlights = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.getHotelHighlights(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

export const addHotelHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { highlightId, customText, sortOrder } = req.body;
  const result = await hotelService.addHotelHighlight(hotelId, highlightId, customText, sortOrder);
  res.status(result.success ? 200 : 400).json(result);
});

export const updateHotelHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, highlightId } = req.params;
  const { customText, sortOrder } = req.body;
  const result = await hotelService.updateHotelHighlight(hotelId, highlightId, customText, sortOrder);
  res.status(result.success ? 200 : 400).json(result);
});

export const removeHotelHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, highlightId } = req.params;
  const result = await hotelService.removeHotelHighlight(hotelId, highlightId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== Hotel Policies ==========
export const getHotelPolicies = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.getHotelPolicies(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

export const getPolicyTypes = asyncHandler(async (req: Request, res: Response) => {
  const result = await hotelService.getPolicyTypes();
  res.status(result.success ? 200 : 400).json(result);
});

export const setHotelPolicy = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { policyKey, value } = req.body;
  const result = await hotelService.setHotelPolicy(hotelId, policyKey, value);
  res.status(result.success ? 200 : 400).json(result);
});

export const removeHotelPolicy = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, policyKey } = req.params;
  const result = await hotelService.removeHotelPolicy(hotelId, policyKey);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== Hotel Images ==========
export const getHotelImages = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.getHotelImages(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

export const addHotelImage = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { imageUrl, sortOrder, isPrimary } = req.body;
  const result = await hotelService.addHotelImage(hotelId, imageUrl, sortOrder, isPrimary);
  res.status(result.success ? 200 : 400).json(result);
});

export const deleteHotelImage = asyncHandler(async (req: Request, res: Response) => {
  const { imageId } = req.params;
  const result = await hotelService.deleteHotelImage(imageId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== Hotel Reviews ==========
export const getHotelReviews = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const { rating, status, page, limit } = req.query;
  const result = await hotelService.getHotelReviews(hotelId, {
    rating: rating as string,
    status: status as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.status(result.success ? 200 : 400).json(result);
});

// ========== Hotel Statistics ==========
export const getHotelStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.getHotelStatistics(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

// ========== Hotel Bookings Management ==========
export const getHotelBookings = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const {
    status,
    accountId,
    accountName,
    accountEmail,
    dateFrom,
    dateTo,
    checkinFrom,
    checkinTo,
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;

  const result = await hotelService.getHotelBookings(hotelId, {
    status: status as string,
    accountId: accountId as string,
    accountName: accountName as string,
    accountEmail: accountEmail as string,
    dateFrom: dateFrom as string,
    dateTo: dateTo as string,
    checkinFrom: checkinFrom as string,
    checkinTo: checkinTo as string,
    sortBy: sortBy as string,
    sortOrder: (sortOrder as "ASC" | "DESC") || "DESC",
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  res.status(result.success ? 200 : 400).json(result);
});

export const getHotelBookingDetail = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const result = await hotelService.getHotelBookingDetail(hotelId, bookingId);
  res.status(result.success ? 200 : 404).json(result);
});

export const updateHotelBookingStatus = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: "Thiếu trường status",
    });
  }

  const result = await hotelService.updateBookingStatus(hotelId, bookingId, status);
  res.status(result.success ? 200 : 400).json(result);
});

// Check-in booking
export const checkInBooking = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const { staffName } = req.body;
  const result = await hotelService.checkInBooking(hotelId, bookingId, staffName);
  res.status(result.success ? 200 : 400).json(result);
});

// Check-out booking
export const checkOutBooking = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const { staffName } = req.body;
  const result = await hotelService.checkOutBooking(hotelId, bookingId, staffName);
  res.status(result.success ? 200 : 400).json(result);
});

export const getHotelBookingStats = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId } = req.params;
  const result = await hotelService.getHotelBookingStats(hotelId);
  res.status(result.success ? 200 : 400).json(result);
});

// Cập nhật special requests cho booking
export const updateBookingSpecialRequests = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const { specialRequests } = req.body;

  if (specialRequests === undefined) {
    return res.status(400).json({
      success: false,
      message: "Thiếu trường specialRequests",
    });
  }

  const result = await hotelService.updateBookingSpecialRequests(hotelId, bookingId, specialRequests);
  res.status(result.success ? 200 : 400).json(result);
});

// Cập nhật admin note cho booking
export const updateBookingAdminNote = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const { adminNote } = req.body;

  if (adminNote === undefined) {
    return res.status(400).json({
      success: false,
      message: "Thiếu trường adminNote",
    });
  }

  const result = await hotelService.updateBookingAdminNote(hotelId, bookingId, adminNote);
  res.status(result.success ? 200 : 400).json(result);
});

// Lấy activity log cho booking
export const getBookingActivityLog = asyncHandler(async (req: Request, res: Response) => {
  const { hotelId, bookingId } = req.params;
  const result = await hotelService.getBookingActivityLog(hotelId, bookingId);
  res.status(result.success ? 200 : 400).json(result);
});

// Lấy tổng số booking đang chờ xác nhận
export const getTotalPendingBookingCount = asyncHandler(async (req: Request, res: Response) => {
  const result = await hotelService.getTotalPendingBookingCount();
  res.status(result.success ? 200 : 400).json(result);
});

