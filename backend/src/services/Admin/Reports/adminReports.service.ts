import { AdminReportsRepository } from "../../../Repository/Admin/adminReports.repository";

export class AdminReportsService {
  private repo = new AdminReportsRepository();

  async getBookingReports(filters: {
    startDate?: string;
    endDate?: string;
    hotel_id?: string;
    city?: string;
    status?: string;
  }) {
    try {
      const data = await this.repo.getBookingReports(filters);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[AdminReportsService] Error getting booking reports:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo booking",
        data: null,
      };
    }
  }

  async getRevenueReports(filters: {
    startDate?: string;
    endDate?: string;
    hotel_id?: string;
    paymentMethod?: string;
    viewType?: "daily" | "weekly" | "monthly" | "yearly";
  }) {
    try {
      const data = await this.repo.getRevenueReports(filters);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[AdminReportsService] Error getting revenue reports:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo doanh thu",
        data: null,
      };
    }
  }

  async getOccupancyReports(filters: {
    month?: string;
    city?: string;
    category?: string;
    year?: string;
  }) {
    try {
      const data = await this.repo.getOccupancyReports(filters);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[AdminReportsService] Error getting occupancy reports:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo tỷ lệ lấp đầy",
        data: null,
      };
    }
  }

  async getCustomerInsights() {
    try {
      const data = await this.repo.getCustomerInsights();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[AdminReportsService] Error getting customer insights:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thông tin khách hàng",
        data: null,
      };
    }
  }

  async getPackageReports(filters: {
    startDate?: string;
    endDate?: string;
    package?: string;
  }) {
    try {
      const data = await this.repo.getPackageReports(filters);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[AdminReportsService] Error getting package reports:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo gói tài khoản",
        data: null,
      };
    }
  }

  async getStaffReports(filters: {
    startDate?: string;
    endDate?: string;
    staff?: string;
    actionType?: string;
  }) {
    try {
      const data = await this.repo.getStaffReports(filters);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[AdminReportsService] Error getting staff reports:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo nhân viên",
        data: null,
      };
    }
  }
}

