import { Request, Response } from "express";
import { AdminAccountReviewService } from "../../../services/Admin/AccountManager/accountReview.service";

const reviewService = new AdminAccountReviewService();

export const getAccountReviews = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { hotelName, rating, status, page, limit } = req.query;
    const result = await reviewService.getAccountReviews(accountId, {
      hotelName: hotelName as string,
      rating: rating as string,
      status: status as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách review",
    });
  }
};

export const toggleReviewVisibility = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    if (!status || (status !== "ACTIVE" && status !== "HIDDEN")) {
      return res.status(400).json({
        success: false,
        message: "Status phải là ACTIVE hoặc HIDDEN",
      });
    }
    const result = await reviewService.toggleReviewVisibility(reviewId, status);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể cập nhật review",
    });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewService.deleteReview(reviewId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể xóa review",
    });
  }
};

