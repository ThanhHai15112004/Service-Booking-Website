import { AdminPaymentRepository } from "../../Repository/Admin/adminPayment.repository";
import { PaymentRepository } from "../../Repository/Payment/payment.repository";
import { PaymentStatus, PaymentMethod } from "../../models/Payment/payment.model";

export class AdminPaymentService {
  private adminPaymentRepo = new AdminPaymentRepository();
  private paymentRepo = new PaymentRepository();

  // Lấy danh sách payments
  async getAllPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: PaymentMethod | string;
    status?: PaymentStatus | string;
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "created_at" | "amount_due" | "status";
    sortOrder?: "ASC" | "DESC";
  }) {
    try {
      const result = await this.adminPaymentRepo.getAllPayments(params);
      return {
        success: true,
        data: {
          payments: result.payments,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getAllPayments error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách payments",
      };
    }
  }

  // Lấy chi tiết payment
  async getPaymentDetail(paymentId: string) {
    try {
      const payment = await this.adminPaymentRepo.getPaymentDetailForAdmin(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment",
        };
      }

      return {
        success: true,
        data: payment,
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getPaymentDetail error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết payment",
      };
    }
  }

  // Lấy dashboard stats
  async getDashboardStats() {
    try {
      const stats = await this.adminPaymentRepo.getDashboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getDashboardStats error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy dashboard stats",
      };
    }
  }

  // Lấy failed payments
  async getFailedPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const result = await this.adminPaymentRepo.getFailedPayments(params);
      return {
        success: true,
        data: {
          payments: result.payments,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getFailedPayments error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách failed payments",
      };
    }
  }

  // Lấy manual payments
  async getManualPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const result = await this.adminPaymentRepo.getManualPayments(params);
      return {
        success: true,
        data: {
          payments: result.payments,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getManualPayments error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách manual payments",
      };
    }
  }

  // Cập nhật payment status
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    adminId?: string,
    adminName?: string,
    note?: string
  ) {
    try {
      const payment = await this.paymentRepo.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment",
        };
      }

      const oldStatus = payment.status;
      const updated = await this.paymentRepo.updatePaymentStatus(
        paymentId,
        status,
        status === "SUCCESS" ? payment.amount_due : payment.amount_paid
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật payment status",
        };
      }

      // Note: Activity log được tạo tự động từ payment data, không cần lưu riêng

      return {
        success: true,
        message: "Cập nhật payment status thành công",
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] updatePaymentStatus error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật payment status",
      };
    }
  }

  // Retry payment
  async retryPayment(
    paymentId: string,
    newMethod?: PaymentMethod,
    adminId?: string,
    adminName?: string
  ) {
    try {
      const payment = await this.paymentRepo.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment",
        };
      }

      if (payment.status !== "FAILED") {
        return {
          success: false,
          message: "Chỉ có thể retry payment với status FAILED",
        };
      }

      // Update payment status to PENDING and method if needed
      const pool = await import("../../config/db");
      const conn = await pool.default.getConnection();
      try {
        await conn.beginTransaction();

        // Update payment status and method
        if (newMethod && newMethod !== payment.method) {
          await conn.query(
            `UPDATE payment SET status = ?, method = ?, updated_at = NOW() WHERE payment_id = ?`,
            ["PENDING", newMethod, paymentId]
          );
        } else {
          await conn.query(
            `UPDATE payment SET status = ?, updated_at = NOW() WHERE payment_id = ?`,
            ["PENDING", paymentId]
          );
        }

        await conn.commit();
      } catch (error: any) {
        await conn.rollback();
        throw error;
      } finally {
        conn.release();
      }

      // Note: Activity log được tạo tự động từ payment data, không cần lưu riêng

      return {
        success: true,
        message: newMethod
          ? `Đã retry payment thành công với phương thức ${newMethod}`
          : "Đã retry payment thành công",
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] retryPayment error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi retry payment",
      };
    }
  }

  // Confirm manual payment
  async confirmManualPayment(
    paymentId: string,
    confirmData: {
      admin_name: string;
      received_date: string;
      note?: string;
    },
    adminId?: string
  ) {
    try {
      const payment = await this.paymentRepo.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment",
        };
      }

      if (payment.status !== "PENDING") {
        return {
          success: false,
          message: "Chỉ có thể confirm payment với status PENDING",
        };
      }

      if (!["CASH", "BANK_TRANSFER"].includes(payment.method)) {
        return {
          success: false,
          message: "Chỉ có thể confirm manual payment (CASH/BANK_TRANSFER)",
        };
      }

      // Update payment status to SUCCESS
      const updated = await this.paymentRepo.updatePaymentStatus(
        paymentId,
        "SUCCESS",
        payment.amount_due
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể confirm payment",
        };
      }

      // Update booking status to PENDING_CONFIRMATION
      const { BookingRepository } = await import("../../Repository/Booking/booking.repository");
      const bookingRepo = new BookingRepository();
      await bookingRepo.updateBooking(payment.booking_id, {
        status: "PENDING_CONFIRMATION",
      });

      // Note: Activity log được tạo tự động từ payment data, không cần lưu riêng

      return {
        success: true,
        message: "Đã confirm manual payment thành công",
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] confirmManualPayment error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi confirm manual payment",
      };
    }
  }

  // Lấy payment reports
  async getPaymentReports(params: {
    period?: "7days" | "month" | "quarter" | "year";
    paymentMethod?: PaymentMethod | string;
    hotelId?: string;
  }) {
    try {
      const reports = await this.adminPaymentRepo.getPaymentReports(params);
      return {
        success: true,
        data: reports,
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getPaymentReports error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy payment reports",
      };
    }
  }

  // Lấy refunds
  async getRefunds(params: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: PaymentMethod | string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const result = await this.adminPaymentRepo.getRefunds(params);
      return {
        success: true,
        data: {
          refunds: result.refunds,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getRefunds error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách refunds",
      };
    }
  }

  // Lấy payment activity logs
  async getPaymentActivityLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    adminId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    try {
      const result = await this.adminPaymentRepo.getPaymentActivityLogs(params);
      return {
        success: true,
        data: {
          logs: result.logs,
          pagination: {
            page: params.page || 1,
            limit: params.limit || 10,
            total: result.total,
            totalPages: Math.ceil(result.total / (params.limit || 10)),
          },
        },
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] getPaymentActivityLogs error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy payment activity logs",
      };
    }
  }

  // Tạo refund
  async createRefund(
    paymentId: string,
    refundData: {
      amount: number;
      reason?: string;
      refund_date?: string;
    },
    adminId?: string,
    adminName?: string
  ) {
    try {
      const payment = await this.paymentRepo.getPaymentById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment",
        };
      }

      if (payment.status !== "SUCCESS") {
        return {
          success: false,
          message: "Chỉ có thể refund payment với status SUCCESS",
        };
      }

      if (refundData.amount > payment.amount_paid) {
        return {
          success: false,
          message: "Số tiền refund không được vượt quá số tiền đã thanh toán",
        };
      }

      // Update payment status to REFUNDED
      const updated = await this.paymentRepo.updatePaymentStatus(
        paymentId,
        "REFUNDED",
        refundData.amount
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể tạo refund",
        };
      }

      // Note: Activity log được tạo tự động từ payment data, không cần lưu riêng

      // Update booking status to CANCELLED if needed
      // This is optional, depends on business logic
      const { AdminBookingRepository } = await import("../../Repository/Admin/adminBooking.repository");
      const adminBookingRepo = new AdminBookingRepository();
      await adminBookingRepo.cancelBookingAndUnlockRoomsForAdmin(payment.booking_id);

      return {
        success: true,
        message: "Đã tạo refund thành công",
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] createRefund error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo refund",
      };
    }
  }

  // Export invoice (placeholder - có thể tích hợp với service khác)
  async exportInvoice(paymentId: string, format: "PDF" | "EMAIL") {
    try {
      const payment = await this.adminPaymentRepo.getPaymentDetailForAdmin(paymentId);
      if (!payment) {
        return {
          success: false,
          message: "Không tìm thấy payment",
        };
      }

      // TODO: Implement invoice generation
      // For now, just return success
      return {
        success: true,
        message: `Đã xuất hóa đơn thành công (${format})`,
        data: {
          payment_id: paymentId,
          format,
          // invoice_url: ... (if PDF)
          // email_sent: ... (if EMAIL)
        },
      };
    } catch (error: any) {
      console.error("[AdminPaymentService] exportInvoice error:", error.message);
      return {
        success: false,
        message: error.message || "Lỗi khi xuất hóa đơn",
      };
    }
  }
}

