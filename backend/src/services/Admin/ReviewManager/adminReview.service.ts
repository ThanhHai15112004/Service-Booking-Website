import { AdminReviewRepository, ReviewListFilters, ReviewDetail } from "../../../Repository/Admin/adminReview.repository";

export class AdminReviewService {
  private repository: AdminReviewRepository;

  constructor() {
    this.repository = new AdminReviewRepository();
  }

  // ========== Dashboard ==========
  async getDashboardStats() {
    const stats = await this.repository.getDashboardStats();
    return {
      success: true,
      data: stats
    };
  }

  // ========== List Reviews ==========
  async getReviews(filters: ReviewListFilters) {
    const result = await this.repository.getReviews(filters);
    return {
      success: true,
      data: result.reviews,
      total: result.total,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
  }

  // ========== Get Review Detail ==========
  async getReviewDetail(reviewId: string): Promise<{ success: boolean; data?: ReviewDetail; message?: string }> {
    const review = await this.repository.getReviewDetail(reviewId);
    
    if (!review) {
      return {
        success: false,
        message: "Không tìm thấy review"
      };
    }

    return {
      success: true,
      data: review
    };
  }

  // ========== Hide/Show Review ==========
  async updateReviewStatus(reviewId: string, status: "ACTIVE" | "HIDDEN"): Promise<{ success: boolean; message: string }> {
    // Check if review exists
    const review = await this.repository.getReviewDetail(reviewId);
    if (!review) {
      return {
        success: false,
        message: "Không tìm thấy review"
      };
    }

    await this.repository.updateReviewStatus(reviewId, status);
    
    return {
      success: true,
      message: status === "ACTIVE" ? "Đã hiện review" : "Đã ẩn review"
    };
  }

  // ========== Delete Review ==========
  async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    // Check if review exists
    const review = await this.repository.getReviewDetail(reviewId);
    if (!review) {
      return {
        success: false,
        message: "Không tìm thấy review"
      };
    }

    await this.repository.deleteReview(reviewId);
    
    return {
      success: true,
      message: "Đã xóa review thành công"
    };
  }

  // ========== Create/Update Reply ==========
  async createReply(reviewId: string, repliedBy: string, replyText: string): Promise<{ success: boolean; message: string; data?: { reply_id: string } }> {
    // Validate reply text
    if (!replyText || replyText.trim().length === 0) {
      return {
        success: false,
        message: "Nội dung phản hồi không được để trống"
      };
    }

    if (replyText.length > 1000) {
      return {
        success: false,
        message: "Nội dung phản hồi không được vượt quá 1000 ký tự"
      };
    }

    // Check if review exists
    const review = await this.repository.getReviewDetail(reviewId);
    if (!review) {
      return {
        success: false,
        message: "Không tìm thấy review"
      };
    }

    const replyId = await this.repository.createReply(reviewId, repliedBy, replyText);
    
    return {
      success: true,
      message: review.reply ? "Đã cập nhật phản hồi thành công" : "Đã gửi phản hồi thành công",
      data: { reply_id: replyId }
    };
  }

  // ========== Get Activity Log ==========
  async getReviewActivityLog(reviewId: string) {
    const logs = await this.repository.getReviewActivityLog(reviewId);
    return {
      success: true,
      data: logs
    };
  }

  // ========== Get Reports ==========
  async getReviewReports(filters: {
    period?: string;
    city?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const reports = await this.repository.getReviewReports(filters);
    return {
      success: true,
      data: reports
    };
  }

  // ========== Get All Activity Logs ==========
  async getAllActivityLogs(filters: {
    search?: string;
    admin?: string;
    action?: string;
    violationType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.repository.getAllActivityLogs(filters);
    return {
      success: true,
      data: result.logs,
      total: result.total,
      page: filters.page || 1,
      limit: filters.limit || 10
    };
  }
}

