import { AdminDiscountRepository } from "../../Repository/Admin/adminDiscount.repository";

export class AdminDiscountService {
  private discountRepo = new AdminDiscountRepository();

  // Get all discount codes
  async getAllDiscountCodes(filters: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    discountType?: string;
    expiryDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }) {
    try {
      const result = await this.discountRepo.getAllDiscountCodes(filters);
      return {
        success: true,
        data: result.codes,
        pagination: result.pagination,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getAllDiscountCodes error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách mã giảm giá",
      };
    }
  }

  // Get discount code detail
  async getDiscountCodeDetail(discountId: string) {
    try {
      const code = await this.discountRepo.getDiscountCodeDetail(discountId);
      if (!code) {
        return {
          success: false,
          message: "Không tìm thấy mã giảm giá",
        };
      }

      return {
        success: true,
        data: code,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getDiscountCodeDetail error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết mã giảm giá",
      };
    }
  }

  // Create discount code
  async createDiscountCode(data: {
    code: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
    max_discount?: number;
    min_purchase?: number;
    usage_limit?: number;
    per_user_limit?: number;
    start_date: string;
    expiry_date: string;
    min_nights?: number;
    max_nights?: number;
    applicable_hotels?: string[];
    applicable_categories?: string[];
    status: "ACTIVE" | "INACTIVE";
  }) {
    try {
      // Validate input
      // Validate code
      if (!data.code || !data.code.trim()) {
        return {
          success: false,
          message: "Mã giảm giá không được để trống",
        };
      }

      // Validate code format (no spaces)
      if (data.code.includes(' ')) {
        return {
          success: false,
          message: "Mã giảm giá không được chứa khoảng trắng",
        };
      }

      // Validate discount_type
      if (!data.discount_type || !["PERCENT", "FIXED"].includes(data.discount_type)) {
        return {
          success: false,
          message: "Loại giảm giá không hợp lệ. Phải là PERCENT hoặc FIXED",
        };
      }

      // Validate discount_value
      if (!data.discount_value || data.discount_value <= 0) {
        return {
          success: false,
          message: "Giá trị giảm giá phải lớn hơn 0",
        };
      }

      if (data.discount_type === "PERCENT" && data.discount_value > 100) {
        return {
          success: false,
          message: "Giảm giá phần trăm không được vượt quá 100%",
        };
      }

      if (data.discount_type === "PERCENT" && data.discount_value < 0) {
        return {
          success: false,
          message: "Giảm giá phần trăm không được nhỏ hơn 0%",
        };
      }

      if (data.discount_type === "FIXED" && data.discount_value < 1000) {
        return {
          success: false,
          message: "Giảm giá cố định phải tối thiểu 1,000 VND",
        };
      }

      // Validate max_discount (only for PERCENT)
      if (data.discount_type === "PERCENT" && data.max_discount) {
        if (data.max_discount <= 0) {
          return {
            success: false,
            message: "Giảm tối đa phải lớn hơn 0",
          };
        }
        if (data.max_discount < 1000) {
          return {
            success: false,
            message: "Giảm tối đa phải tối thiểu 1,000 VND",
          };
        }
      }

      // Validate min_purchase
      if (data.min_purchase !== undefined && data.min_purchase !== null) {
        if (data.min_purchase < 0) {
          return {
            success: false,
            message: "Giá trị đơn hàng tối thiểu không được âm",
          };
        }
        if (data.min_purchase > 0 && data.min_purchase < 1000) {
          return {
            success: false,
            message: "Giá trị đơn hàng tối thiểu phải tối thiểu 1,000 VND",
          };
        }
      }

      // Validate usage_limit
      if (data.usage_limit !== undefined && data.usage_limit !== null) {
        if (data.usage_limit <= 0) {
          return {
            success: false,
            message: "Số lần sử dụng tối đa phải lớn hơn 0",
          };
        }
      }

      // Validate per_user_limit
      if (data.per_user_limit !== undefined && data.per_user_limit !== null) {
        if (data.per_user_limit <= 0) {
          return {
            success: false,
            message: "Giới hạn mỗi user phải lớn hơn 0",
          };
        }
        if (data.usage_limit && data.per_user_limit > data.usage_limit) {
          return {
            success: false,
            message: "Giới hạn mỗi user không được lớn hơn số lần sử dụng tối đa",
          };
        }
      }

      // Validate dates (required for create)
      if (!data.start_date || !data.expiry_date) {
        return {
          success: false,
          message: "Ngày bắt đầu và ngày hết hạn không được để trống",
        };
      }

      const startDate = new Date(data.start_date);
      const expiryDate = new Date(data.expiry_date);
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (isNaN(startDate.getTime()) || isNaN(expiryDate.getTime())) {
        return {
          success: false,
          message: "Ngày bắt đầu hoặc ngày hết hạn không hợp lệ",
        };
      }

      if (expiryDate <= startDate) {
        return {
          success: false,
          message: "Ngày hết hạn phải sau ngày bắt đầu",
        };
      }

      // Validate applicable dates if provided
      if ((data as any).applicable_start_date || (data as any).applicable_end_date) {
        const applicableStartDate = (data as any).applicable_start_date;
        const applicableEndDate = (data as any).applicable_end_date;
        
        if (!applicableStartDate || !applicableEndDate) {
          return {
            success: false,
            message: "Nếu chọn ngày áp dụng mã, phải chọn đầy đủ ngày bắt đầu và ngày kết thúc",
          };
        }

        const appStartDate = new Date(applicableStartDate);
        const appEndDate = new Date(applicableEndDate);

        if (isNaN(appStartDate.getTime()) || isNaN(appEndDate.getTime())) {
          return {
            success: false,
            message: "Ngày áp dụng mã không hợp lệ",
          };
        }

        if (appEndDate <= appStartDate) {
          return {
            success: false,
            message: "Ngày kết thúc áp dụng phải sau ngày bắt đầu áp dụng",
          };
        }

        if (appStartDate < startDate) {
          return {
            success: false,
            message: "Ngày bắt đầu áp dụng không được trước ngày bắt đầu của mã",
          };
        }

        if (appEndDate > expiryDate) {
          return {
            success: false,
            message: "Ngày kết thúc áp dụng không được sau ngày hết hạn của mã",
          };
        }
      }

      // Validate nights
      if (data.min_nights !== undefined && data.min_nights !== null) {
        if (data.min_nights < 0) {
          return {
            success: false,
            message: "Số đêm tối thiểu không được âm",
          };
        }
      }

      if (data.max_nights !== undefined && data.max_nights !== null) {
        if (data.max_nights < 0) {
          return {
            success: false,
            message: "Số đêm tối đa không được âm",
          };
        }
      }

      if (data.min_nights && data.max_nights && data.min_nights > data.max_nights) {
        return {
          success: false,
          message: "Số đêm tối thiểu không được lớn hơn số đêm tối đa",
        };
      }

      // Validate applicable dates if provided
      const applicableStartDate = (data as any).applicable_start_date;
      const applicableEndDate = (data as any).applicable_end_date;
      
      if (applicableStartDate || applicableEndDate) {
        if (!applicableStartDate || !applicableEndDate) {
          return {
            success: false,
            message: "Nếu chọn ngày áp dụng mã, phải chọn đầy đủ ngày bắt đầu và ngày kết thúc",
          };
        }

        const appStartDate = new Date(applicableStartDate);
        const appEndDate = new Date(applicableEndDate);

        if (isNaN(appStartDate.getTime()) || isNaN(appEndDate.getTime())) {
          return {
            success: false,
            message: "Ngày áp dụng mã không hợp lệ",
          };
        }

        if (appEndDate <= appStartDate) {
          return {
            success: false,
            message: "Ngày kết thúc áp dụng phải sau ngày bắt đầu áp dụng",
          };
        }

        if (appStartDate < startDate) {
          return {
            success: false,
            message: "Ngày bắt đầu áp dụng không được trước ngày bắt đầu của mã",
          };
        }

        if (appEndDate > expiryDate) {
          return {
            success: false,
            message: "Ngày kết thúc áp dụng không được sau ngày hết hạn của mã",
          };
        }
      }

      // Validate applicable_hotels (if provided, must be array of valid hotel IDs)
      if (data.applicable_hotels && !Array.isArray(data.applicable_hotels)) {
        return {
          success: false,
          message: "Danh sách khách sạn phải là mảng",
        };
      }

      // Validate applicable_categories (if provided, must be array of valid category IDs)
      if (data.applicable_categories && !Array.isArray(data.applicable_categories)) {
        return {
          success: false,
          message: "Danh sách category phải là mảng",
        };
      }

      // Validate status
      if (data.status && !["ACTIVE", "INACTIVE"].includes(data.status)) {
        return {
          success: false,
          message: "Trạng thái không hợp lệ. Phải là ACTIVE hoặc INACTIVE",
        };
      }

      // Create discount code
      const result = await this.discountRepo.createDiscountCode(data);
      return result;
    } catch (error: any) {
      console.error("[AdminDiscountService] createDiscountCode error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo mã giảm giá",
      };
    }
  }

  // Update discount code
  async updateDiscountCode(
    discountId: string,
    data: Partial<{
      code: string;
      discount_type: "PERCENT" | "FIXED";
      discount_value: number;
      max_discount?: number;
      min_purchase?: number;
      usage_limit?: number;
      per_user_limit?: number;
      start_date: string;
      expiry_date: string;
      min_nights?: number;
      max_nights?: number;
      applicable_hotels?: string[];
      applicable_categories?: string[];
      status: "ACTIVE" | "INACTIVE" | "EXPIRED";
    }>
  ) {
    try {
      // Validate code if updating
      if (data.code !== undefined) {
        if (!data.code || !data.code.trim()) {
          return {
            success: false,
            message: "Mã giảm giá không được để trống",
          };
        }
        if (data.code.includes(' ')) {
          return {
            success: false,
            message: "Mã giảm giá không được chứa khoảng trắng",
          };
        }
      }

      // Validate discount_type and discount_value
      if (data.discount_type && !["PERCENT", "FIXED"].includes(data.discount_type)) {
        return {
          success: false,
          message: "Loại giảm giá không hợp lệ. Phải là PERCENT hoặc FIXED",
        };
      }

      if (data.discount_value !== undefined) {
        if (data.discount_value <= 0) {
          return {
            success: false,
            message: "Giá trị giảm giá phải lớn hơn 0",
          };
        }

        if (data.discount_type === "PERCENT" && data.discount_value > 100) {
          return {
            success: false,
            message: "Giảm giá phần trăm không được vượt quá 100%",
          };
        }

        if (data.discount_type === "FIXED" && data.discount_value < 1000) {
          return {
            success: false,
            message: "Giảm giá cố định phải tối thiểu 1,000 VND",
          };
        }
      }

      // Validate max_discount
      if (data.max_discount !== undefined && data.max_discount !== null) {
        if (data.max_discount <= 0) {
          return {
            success: false,
            message: "Giảm tối đa phải lớn hơn 0",
          };
        }
        if (data.max_discount < 1000) {
          return {
            success: false,
            message: "Giảm tối đa phải tối thiểu 1,000 VND",
          };
        }
      }

      // Validate min_purchase
      if (data.min_purchase !== undefined && data.min_purchase !== null) {
        if (data.min_purchase < 0) {
          return {
            success: false,
            message: "Giá trị đơn hàng tối thiểu không được âm",
          };
        }
        if (data.min_purchase > 0 && data.min_purchase < 1000) {
          return {
            success: false,
            message: "Giá trị đơn hàng tối thiểu phải tối thiểu 1,000 VND",
          };
        }
      }

      // Validate usage_limit
      if (data.usage_limit !== undefined && data.usage_limit !== null) {
        if (data.usage_limit <= 0) {
          return {
            success: false,
            message: "Số lần sử dụng tối đa phải lớn hơn 0",
          };
        }
      }

      // Validate per_user_limit
      if (data.per_user_limit !== undefined && data.per_user_limit !== null) {
        if (data.per_user_limit <= 0) {
          return {
            success: false,
            message: "Giới hạn mỗi user phải lớn hơn 0",
          };
        }
        if (data.usage_limit && data.per_user_limit > data.usage_limit) {
          return {
            success: false,
            message: "Giới hạn mỗi user không được lớn hơn số lần sử dụng tối đa",
          };
        }
      }

      // Validate dates
      if (data.start_date && data.expiry_date) {
        const startDate = new Date(data.start_date);
        const expiryDate = new Date(data.expiry_date);

        if (isNaN(startDate.getTime()) || isNaN(expiryDate.getTime())) {
          return {
            success: false,
            message: "Ngày bắt đầu hoặc ngày hết hạn không hợp lệ",
          };
        }

        if (expiryDate <= startDate) {
          return {
            success: false,
            message: "Ngày hết hạn phải sau ngày bắt đầu",
          };
        }
      }

      // Validate nights
      if (data.min_nights !== undefined && data.min_nights !== null && data.min_nights < 0) {
        return {
          success: false,
          message: "Số đêm tối thiểu không được âm",
        };
      }

      if (data.max_nights !== undefined && data.max_nights !== null && data.max_nights < 0) {
        return {
          success: false,
          message: "Số đêm tối đa không được âm",
        };
      }

      if (data.min_nights !== undefined && data.max_nights !== undefined && 
          data.min_nights !== null && data.max_nights !== null && 
          data.min_nights > data.max_nights) {
        return {
          success: false,
          message: "Số đêm tối thiểu không được lớn hơn số đêm tối đa",
        };
      }

      // Validate arrays
      if (data.applicable_hotels !== undefined && !Array.isArray(data.applicable_hotels)) {
        return {
          success: false,
          message: "Danh sách khách sạn phải là mảng",
        };
      }

      if (data.applicable_categories !== undefined && !Array.isArray(data.applicable_categories)) {
        return {
          success: false,
          message: "Danh sách category phải là mảng",
        };
      }

      // Validate status
      if (data.status && !["ACTIVE", "INACTIVE", "EXPIRED"].includes(data.status)) {
        return {
          success: false,
          message: "Trạng thái không hợp lệ. Phải là ACTIVE, INACTIVE hoặc EXPIRED",
        };
      }

      const result = await this.discountRepo.updateDiscountCode(discountId, data);
      return result;
    } catch (error: any) {
      console.error("[AdminDiscountService] updateDiscountCode error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật mã giảm giá",
      };
    }
  }

  // Delete discount code
  async deleteDiscountCode(discountId: string) {
    try {
      const result = await this.discountRepo.deleteDiscountCode(discountId);
      return result;
    } catch (error: any) {
      console.error("[AdminDiscountService] deleteDiscountCode error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi xóa mã giảm giá",
      };
    }
  }

  // Toggle discount code status
  async toggleDiscountCodeStatus(discountId: string) {
    try {
      const result = await this.discountRepo.toggleDiscountCodeStatus(discountId);
      return result;
    } catch (error: any) {
      console.error("[AdminDiscountService] toggleDiscountCodeStatus error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi thay đổi trạng thái mã giảm giá",
      };
    }
  }

  // Extend discount code expiry
  async extendDiscountCodeExpiry(discountId: string, days: number) {
    try {
      if (!days || days <= 0) {
        return {
          success: false,
          message: "Số ngày gia hạn phải lớn hơn 0",
        };
      }

      const result = await this.discountRepo.extendDiscountCodeExpiry(discountId, days);
      return result;
    } catch (error: any) {
      console.error("[AdminDiscountService] extendDiscountCodeExpiry error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi gia hạn mã giảm giá",
      };
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const stats = await this.discountRepo.getDashboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getDashboardStats error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê dashboard",
      };
    }
  }

  // Get discount usage analytics
  async getDiscountUsageAnalytics(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const analytics = await this.discountRepo.getDiscountUsageAnalytics(filters);
      return {
        success: true,
        data: analytics,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getDiscountUsageAnalytics error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê sử dụng mã",
      };
    }
  }

  // Get discount reports
  async getDiscountReports(filters: {
    period?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }) {
    try {
      const reports = await this.discountRepo.getDiscountReports(filters);
      return {
        success: true,
        data: reports,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getDiscountReports error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo mã giảm giá",
      };
    }
  }

  // Get discount users
  async getDiscountUsers(filters: {
    page?: number;
    limit?: number;
    search?: string;
    discountCode?: string;
    customerEmail?: string;
    dateFrom?: string;
    dateTo?: string;
    bookingStatus?: string;
  }) {
    try {
      const result = await this.discountRepo.getDiscountUsers(filters);
      return {
        success: true,
        data: result.users,
        pagination: result.pagination,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getDiscountUsers error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách người dùng",
      };
    }
  }

  // Get applicable hotels
  async getApplicableHotels() {
    try {
      const hotels = await this.discountRepo.getApplicableHotels();
      return {
        success: true,
        data: hotels,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getApplicableHotels error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách khách sạn",
      };
    }
  }

  // Get applicable categories
  async getApplicableCategories() {
    try {
      const categories = await this.discountRepo.getApplicableCategories();
      return {
        success: true,
        data: categories,
      };
    } catch (error: any) {
      console.error("[AdminDiscountService] getApplicableCategories error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách category",
      };
    }
  }

  // Export discount report
  async exportDiscountReport(filters: {
    format: "CSV" | "EXCEL" | "PDF";
    period?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }) {
    try {
      // Get report data
      const reportsResult = await this.discountRepo.getDiscountReports({
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy || "code",
      });

      if (filters.format === "CSV") {
        // Generate CSV
        const csvRows: string[] = [];
        
        // Header
        if (filters.groupBy === "customer") {
          csvRows.push("Khách hàng,Lượt sử dụng,Tổng tiết kiệm (VNĐ)");
          reportsResult.usageByCustomer.forEach((item: any) => {
            csvRows.push(`"${item.customer_name}",${item.usage_count},${item.total_saved}`);
          });
        } else if (filters.groupBy === "hotel") {
          csvRows.push("Khách sạn,Lượt sử dụng,Tổng giảm giá (VNĐ)");
          reportsResult.usageByHotel.forEach((item: any) => {
            csvRows.push(`"${item.hotel_name}",${item.usage_count},${item.discount_amount}`);
          });
        } else {
          csvRows.push("Mã giảm giá,Lượt sử dụng,Tổng giảm giá (VNĐ)");
          reportsResult.totalUsageByCode.forEach((item: any) => {
            csvRows.push(`"${item.code}",${item.usage_count},${item.discount_amount}`);
          });
        }

        const csvContent = csvRows.join("\n");
        const csvBuffer = Buffer.from("\ufeff" + csvContent, "utf8"); // Add BOM for Excel

        return {
          success: true,
          data: {
            format: "CSV",
            content: csvBuffer.toString("base64"),
            filename: `discount-report-${new Date().toISOString().split("T")[0]}.csv`,
          },
        };
      } else if (filters.format === "EXCEL" || filters.format === "PDF") {
        // For EXCEL and PDF, return JSON data for frontend to handle
        // Frontend can use libraries like xlsx or jsPDF
        return {
          success: true,
          data: {
            format: filters.format,
            data: reportsResult,
            message: "Dữ liệu đã sẵn sàng. Frontend có thể export bằng thư viện tương ứng.",
          },
        };
      } else {
        return {
          success: false,
          message: "Format không hỗ trợ. Chỉ hỗ trợ CSV, EXCEL, PDF",
        };
      }
    } catch (error: any) {
      console.error("[AdminDiscountService] exportDiscountReport error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi xuất báo cáo",
      };
    }
  }
}
