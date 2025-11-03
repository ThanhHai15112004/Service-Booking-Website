import { Request, Response } from "express";
import { ReviewService } from "../../services/Profile/review.service";

const reviewService = new ReviewService();

export const getReviews = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const reviews = await reviewService.getReviews(accountId);
    res.json({ success: true, data: reviews });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách đánh giá.",
    });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { reviewId } = req.params;
    const review = await reviewService.getReviewById(reviewId, accountId);
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message || "Không tìm thấy đánh giá.",
    });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const reviewId = await reviewService.createReview(accountId, req.body);
    res.json({ success: true, data: { review_id: reviewId }, message: "Tạo đánh giá thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi tạo đánh giá.",
    });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { reviewId } = req.params;
    await reviewService.updateReview(reviewId, accountId, req.body);
    res.json({ success: true, message: "Cập nhật đánh giá thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi cập nhật đánh giá.",
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const accountId = res.locals.accountId;
    await reviewService.deleteReview(reviewId, accountId);
    res.json({ success: true, message: "Xóa đánh giá thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi xóa đánh giá.",
    });
  }
};

// Lấy review của user cho hotel cụ thể
export const getUserHotelReview = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { hotelId } = req.params;
    const review = await reviewService.getUserReviewForHotel(accountId, hotelId);
    res.json({ success: true, data: review });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy đánh giá của user.",
    });
  }
};

// Lấy reviews của hotel (public API - không cần auth)
export const getHotelReviews = async (req: Request, res: Response) => {
  try {
    const { hotelId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;

    const reviews = await reviewService.getHotelReviews(hotelId, limit, offset);
    const stats = await reviewService.getHotelReviewStats(hotelId);

    res.json({ 
      success: true, 
      data: {
        reviews,
        stats
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách đánh giá.",
    });
  }
};
