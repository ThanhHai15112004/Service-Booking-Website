import { AdminAccountRepository } from "../../../Repository/Admin/adminAccount.repository";

export class AdminAccountReviewService {
  private adminRepo = new AdminAccountRepository();

  async getAccountReviews(accountId: string, filters: {
    hotelName?: string;
    rating?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.adminRepo.getAccountReviews(accountId, filters);
    return {
      success: true,
      data: result.reviews,
      total: result.total,
    };
  }

  async toggleReviewVisibility(reviewId: string, status: "ACTIVE" | "HIDDEN") {
    await this.adminRepo.updateReviewStatus(reviewId, status);
    return {
      success: true,
      message: status === "ACTIVE" ? "Đã hiện review" : "Đã ẩn review",
    };
  }

  async deleteReview(reviewId: string) {
    await this.adminRepo.updateReviewStatus(reviewId, "DELETED");
    return {
      success: true,
      message: "Xóa review thành công",
    };
  }
}

