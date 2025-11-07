import { MainDashboardRepository } from "../../Repository/Admin/mainDashboard.repository";

export class MainDashboardService {
  private repo = new MainDashboardRepository();

  async getMainDashboardStats() {
    try {
      const data = await this.repo.getMainDashboardStats();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error("[MainDashboardService] Error getting dashboard stats:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê dashboard",
      };
    }
  }
}

