import { Request, Response } from "express";
import { AdminReviewService } from "../../../services/Admin/ReviewManager/adminReview.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const reviewService = new AdminReviewService();

// ========== Dashboard ==========
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.getDashboardStats();
  res.status(200).json(result);
});

// ========== List Reviews ==========
export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    hotel_id: req.query.hotel_id as string,
    rating: req.query.rating as string,
    status: req.query.status as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    pendingOnly: req.query.pendingOnly === 'true',
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10
  };

  const result = await reviewService.getReviews(filters);
  res.status(200).json(result);
});

// ========== Get Review Detail ==========
export const getReviewDetail = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const result = await reviewService.getReviewDetail(reviewId);
  
  if (!result.success) {
    return res.status(404).json(result);
  }

  res.status(200).json(result);
});

// ========== Hide/Show Review ==========
export const updateReviewStatus = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { status } = req.body;

  if (!status || !['ACTIVE', 'HIDDEN'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status phải là ACTIVE hoặc HIDDEN"
    });
  }

  const result = await reviewService.updateReviewStatus(reviewId, status as "ACTIVE" | "HIDDEN");
  
  if (!result.success) {
    return res.status(404).json(result);
  }

  res.status(200).json(result);
});

// ========== Delete Review ==========
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const result = await reviewService.deleteReview(reviewId);
  
  if (!result.success) {
    return res.status(404).json(result);
  }

  res.status(200).json(result);
});

// ========== Create/Update Reply ==========
export const createReply = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { reply_text } = req.body;
  const repliedBy = (req as any).user.account_id;

  if (!reply_text) {
    return res.status(400).json({
      success: false,
      message: "Nội dung phản hồi không được để trống"
    });
  }

  const result = await reviewService.createReply(reviewId, repliedBy, reply_text);
  
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(200).json(result);
});

// ========== Get Review Activity Log ==========
export const getReviewActivityLog = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const result = await reviewService.getReviewActivityLog(reviewId);
  res.status(200).json(result);
});

// ========== Get Reports ==========
export const getReviewReports = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    period: req.query.period as string,
    city: req.query.city as string,
    category: req.query.category as string,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string
  };

  const result = await reviewService.getReviewReports(filters);
  res.status(200).json(result);
});

// ========== Get All Activity Logs ==========
export const getAllActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    admin: req.query.admin as string,
    action: req.query.action as string,
    violationType: req.query.violationType as string,
    dateFrom: req.query.dateFrom as string,
    dateTo: req.query.dateTo as string,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10
  };

  const result = await reviewService.getAllActivityLogs(filters);
  res.status(200).json(result);
});

