import { AdminAccountRepository } from "../../../Repository/Admin/adminAccount.repository";

export class AdminAccountActivityService {
  private adminRepo = new AdminAccountRepository();

  async getAccountActivityStats(accountId: string) {
    const stats = await this.adminRepo.getAccountActivityStats(accountId);
    return {
      success: true,
      data: stats,
    };
  }

  async getAccountActivityChart(accountId: string, period: "7" | "30" | "90" = "30") {
    const chartData = await this.adminRepo.getAccountActivityChart(accountId, period);
    return {
      success: true,
      data: chartData,
    };
  }

  async getAccountActivityHistory(accountId: string, filters: {
    type?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.adminRepo.getAccountActivityHistory(accountId, filters);
    return {
      success: true,
      data: result.activities,
      total: result.total,
    };
  }
}

