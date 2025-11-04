import { AdminAccountRepository } from "../../../Repository/Admin/adminAccount.repository";

export class AdminAccountBookingService {
  private adminRepo = new AdminAccountRepository();

  async getAccountBookings(accountId: string, filters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    hotelName?: string;
    page?: number;
    limit?: number;
  }) {
    const result = await this.adminRepo.getAccountBookings(accountId, filters);
    return {
      success: true,
      data: result.bookings,
      total: result.total,
    };
  }

  async getBookingDetail(bookingId: string) {
    const booking = await this.adminRepo.getBookingDetailForAdmin(bookingId);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }
    return {
      success: true,
      data: booking,
    };
  }
}

