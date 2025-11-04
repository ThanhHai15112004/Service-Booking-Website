import { AdminAccountRepository } from "../../../Repository/Admin/adminAccount.repository";
import { PaymentCardRepository } from "../../../Repository/Payment/paymentCard.repository";

export class AdminAccountPackageService {
  private adminRepo = new AdminAccountRepository();
  private paymentCardRepo = new PaymentCardRepository();

  async getAccountPackages(accountId: string) {
    const result = await this.adminRepo.getAccountPackages(accountId);
    return {
      success: true,
      data: result,
    };
  }

  async getAccountSubscriptions(accountId: string) {
    const subscriptions = await this.adminRepo.getAccountSubscriptions(accountId);
    return {
      success: true,
      data: subscriptions,
    };
  }

  async getAccountPaymentCards(accountId: string) {
    const cards = await this.paymentCardRepo.getCardsByAccountId(accountId);
    return {
      success: true,
      data: cards || [],
    };
  }

  async getAccountPayments(accountId: string, filters: {
    status?: string;
    method?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.adminRepo.getAccountPayments(accountId, filters);
    return {
      success: true,
      data: result.payments,
      total: result.total,
    };
  }
}

