import { AdminPromotionRepository } from "../../Repository/Admin/adminPromotion.repository";
import { CreatePromotionData } from "../../Repository/Promotion/promotion.repository";

export class AdminPromotionService {
  private promotionRepo = new AdminPromotionRepository();

  // Get all promotions
  async getAllPromotions(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    discountType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) {
    try {
      const result = await this.promotionRepo.getAllPromotions(filters);
      return {
        success: true,
        data: result.promotions || [],
        pagination: result.pagination,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getAllPromotions error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách promotion",
      };
    }
  }

  // Get promotion detail
  async getPromotionDetail(promotionId: string) {
    try {
      const promotion = await this.promotionRepo.getPromotionDetail(promotionId);
      if (!promotion) {
        return {
          success: false,
          message: "Không tìm thấy promotion",
        };
      }

      return {
        success: true,
        data: promotion,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getPromotionDetail error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết promotion",
      };
    }
  }

  // Create promotion
  async createPromotion(data: CreatePromotionData, createdBy: string) {
    try {
      // Validate input
      if (!data.name || !data.name.trim()) {
        return {
          success: false,
          message: "Tên promotion không được để trống",
        };
      }

      if (!data.type || !["PROVIDER", "SYSTEM", "BOTH"].includes(data.type)) {
        return {
          success: false,
          message: "Loại promotion không hợp lệ. Phải là PROVIDER, SYSTEM hoặc BOTH",
        };
      }

      if (!data.discount_type || !["PERCENTAGE", "FIXED_AMOUNT"].includes(data.discount_type)) {
        return {
          success: false,
          message: "Loại giảm giá không hợp lệ. Phải là PERCENTAGE hoặc FIXED_AMOUNT",
        };
      }

      if (!data.discount_value || data.discount_value <= 0) {
        return {
          success: false,
          message: "Giá trị giảm giá phải lớn hơn 0",
        };
      }

      if (data.discount_type === "PERCENTAGE" && data.discount_value > 100) {
        return {
          success: false,
          message: "Giảm giá phần trăm không được vượt quá 100%",
        };
      }

      if (!data.start_date || !data.end_date) {
        return {
          success: false,
          message: "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc",
        };
      }

      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
          success: false,
          message: "Ngày không hợp lệ",
        };
      }

      if (endDate < startDate) {
        return {
          success: false,
          message: "Ngày kết thúc phải sau ngày bắt đầu",
        };
      }

      // Validate max_discount for percentage
      if (data.discount_type === "PERCENTAGE" && data.max_discount) {
        if (data.max_discount <= 0) {
          return {
            success: false,
            message: "Giảm giá tối đa phải lớn hơn 0",
          };
        }
      }

      // Validate min_purchase
      if (data.min_purchase !== undefined && data.min_purchase < 0) {
        return {
          success: false,
          message: "Giá trị đơn tối thiểu không được âm",
        };
      }

      // Validate applicable_hotels
      if (data.applicable_hotels && !Array.isArray(data.applicable_hotels)) {
        return {
          success: false,
          message: "applicable_hotels phải là một mảng",
        };
      }

      // Validate applicable_rooms
      if (data.applicable_rooms && !Array.isArray(data.applicable_rooms)) {
        return {
          success: false,
          message: "applicable_rooms phải là một mảng",
        };
      }

      // Validate applicable_dates
      if (data.applicable_dates && !Array.isArray(data.applicable_dates)) {
        return {
          success: false,
          message: "applicable_dates phải là một mảng",
        };
      }

      // Validate day_of_week
      if (data.day_of_week && !Array.isArray(data.day_of_week)) {
        return {
          success: false,
          message: "day_of_week phải là một mảng",
        };
      }

      if (data.day_of_week) {
        const validDays = [0, 1, 2, 3, 4, 5, 6]; // 0 = Sunday, 6 = Saturday
        const invalidDays = data.day_of_week.filter((day) => !validDays.includes(day));
        if (invalidDays.length > 0) {
          return {
            success: false,
            message: `day_of_week chứa giá trị không hợp lệ: ${invalidDays.join(", ")}`,
          };
        }
      }

      // Create promotion
      const promotionData: CreatePromotionData = {
        ...data,
        created_by: createdBy,
        status: data.status || "ACTIVE",
      };

      const created = await this.promotionRepo.createPromotion(promotionData);

      if (!created) {
        return {
          success: false,
          message: "Không thể tạo promotion",
        };
      }

      // Get created promotion - find the most recently created one by this admin
      const promotions = await this.promotionRepo.getPromotions({ 
        created_by: createdBy,
        limit: 10 
      });
      // Sort by created_at descending and get the first one (most recent)
      const sortedPromotions = promotions.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      const newPromotion = sortedPromotions[0];

      if (!newPromotion) {
        return {
          success: false,
          message: "Tạo promotion thành công nhưng không thể lấy thông tin promotion",
        };
      }

      return {
        success: true,
        data: newPromotion,
        message: "Tạo promotion thành công",
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] createPromotion error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo promotion",
      };
    }
  }

  // Update promotion
  async updatePromotion(promotionId: string, data: Partial<CreatePromotionData>) {
    try {
      // Check if promotion exists
      const existing = await this.promotionRepo.getPromotionById(promotionId);
      if (!existing) {
        return {
          success: false,
          message: "Không tìm thấy promotion",
        };
      }

      // Validate discount_value if provided
      if (data.discount_value !== undefined) {
        if (data.discount_value <= 0) {
          return {
            success: false,
            message: "Giá trị giảm giá phải lớn hơn 0",
          };
        }

        const discountType = data.discount_type || existing.discount_type;
        if (discountType === "PERCENTAGE" && data.discount_value > 100) {
          return {
            success: false,
            message: "Giảm giá phần trăm không được vượt quá 100%",
          };
        }
      }

      // Validate dates if provided
      if (data.start_date || data.end_date) {
        const startDate = data.start_date ? new Date(data.start_date) : new Date(existing.start_date);
        const endDate = data.end_date ? new Date(data.end_date) : new Date(existing.end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return {
            success: false,
            message: "Ngày không hợp lệ",
          };
        }

        if (endDate < startDate) {
          return {
            success: false,
            message: "Ngày kết thúc phải sau ngày bắt đầu",
          };
        }
      }

      // Validate max_discount
      if (data.max_discount !== undefined && data.max_discount !== null) {
        if (data.max_discount <= 0) {
          return {
            success: false,
            message: "Giảm giá tối đa phải lớn hơn 0",
          };
        }
      }

      // Validate min_purchase
      if (data.min_purchase !== undefined && data.min_purchase < 0) {
        return {
          success: false,
          message: "Giá trị đơn tối thiểu không được âm",
        };
      }

      // Validate arrays
      if (data.applicable_hotels !== undefined && !Array.isArray(data.applicable_hotels)) {
        return {
          success: false,
          message: "applicable_hotels phải là một mảng",
        };
      }

      if (data.applicable_rooms !== undefined && !Array.isArray(data.applicable_rooms)) {
        return {
          success: false,
          message: "applicable_rooms phải là một mảng",
        };
      }

      if (data.applicable_dates !== undefined && !Array.isArray(data.applicable_dates)) {
        return {
          success: false,
          message: "applicable_dates phải là một mảng",
        };
      }

      if (data.day_of_week !== undefined && !Array.isArray(data.day_of_week)) {
        return {
          success: false,
          message: "day_of_week phải là một mảng",
        };
      }

      if (data.day_of_week) {
        const validDays = [0, 1, 2, 3, 4, 5, 6];
        const invalidDays = data.day_of_week.filter((day) => !validDays.includes(day));
        if (invalidDays.length > 0) {
          return {
            success: false,
            message: `day_of_week chứa giá trị không hợp lệ: ${invalidDays.join(", ")}`,
          };
        }
      }

      // Update promotion
      const updated = await this.promotionRepo.updatePromotion(promotionId, data);

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật promotion",
        };
      }

      // Get updated promotion
      const updatedPromotion = await this.promotionRepo.getPromotionById(promotionId);

      return {
        success: true,
        data: updatedPromotion,
        message: "Cập nhật promotion thành công",
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] updatePromotion error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật promotion",
      };
    }
  }

  // Delete promotion
  async deletePromotion(promotionId: string) {
    try {
      const deleted = await this.promotionRepo.deletePromotion(promotionId);

      if (!deleted) {
        return {
          success: false,
          message: "Không thể xóa promotion",
        };
      }

      return {
        success: true,
        message: "Xóa promotion thành công",
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] deletePromotion error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi xóa promotion",
      };
    }
  }

  // Toggle promotion status
  async togglePromotionStatus(promotionId: string) {
    try {
      const result = await this.promotionRepo.togglePromotionStatus(promotionId);
      return result;
    } catch (error: any) {
      console.error("[AdminPromotionService] togglePromotionStatus error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi thay đổi trạng thái promotion",
      };
    }
  }

  // Apply promotion to schedules
  async applyPromotionToSchedules(promotionId: string) {
    try {
      const result = await this.promotionRepo.applyPromotionToSchedules(promotionId);
      if (!result.success) {
        console.error("[AdminPromotionService] applyPromotionToSchedules failed:", result.message);
      }
      return result;
    } catch (error: any) {
      console.error("[AdminPromotionService] applyPromotionToSchedules error:", error.message);
      console.error("[AdminPromotionService] applyPromotionToSchedules error stack:", error.stack);
      return {
        success: false,
        message: error.message || "Lỗi khi áp dụng promotion vào schedules",
      };
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const stats = await this.promotionRepo.getDashboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getDashboardStats error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê dashboard",
      };
    }
  }

  // Get promotion reports
  async getPromotionReports(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }) {
    try {
      const reports = await this.promotionRepo.getPromotionReports(filters);
      return {
        success: true,
        data: reports,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getPromotionReports error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo promotion",
      };
    }
  }

  // Get promotion activity logs
  async getPromotionActivityLogs(filters: {
    page?: number;
    limit?: number;
    promotionId?: string;
    adminId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const result = await this.promotionRepo.getPromotionActivityLogs(filters);
      return {
        success: true,
        data: result.logs,
        pagination: result.pagination,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getPromotionActivityLogs error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy activity logs",
      };
    }
  }

  // Get applicable hotels
  async getApplicableHotels() {
    try {
      const hotels = await this.promotionRepo.getApplicableHotels();
      return {
        success: true,
        data: hotels,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getApplicableHotels error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách khách sạn",
      };
    }
  }

  // Get applicable rooms
  async getApplicableRooms(hotelIds?: string[]) {
    try {
      const rooms = await this.promotionRepo.getApplicableRooms(hotelIds);
      return {
        success: true,
        data: rooms,
      };
    } catch (error: any) {
      console.error("[AdminPromotionService] getApplicableRooms error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách phòng",
      };
    }
  }
}

