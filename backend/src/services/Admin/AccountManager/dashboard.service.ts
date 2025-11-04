import { AdminAccountRepository } from "../../../Repository/Admin/adminAccount.repository";

export class AdminDashboardService {
  private adminRepo = new AdminAccountRepository();

  async getDashboardStats() {
    const data = await this.adminRepo.getDashboardStats();
    return {
      success: true,
      data,
    };
  }
}

