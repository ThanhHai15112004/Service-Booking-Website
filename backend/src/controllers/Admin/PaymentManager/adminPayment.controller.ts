import { Request, Response } from "express";
import { AdminPaymentService } from "../../../services/Admin/adminPayment.service";
import { PaymentStatus, PaymentMethod } from "../../../models/Payment/payment.model";

const adminPaymentService = new AdminPaymentService();

// Lấy dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const result = await adminPaymentService.getDashboardStats();

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getDashboardStats error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy dashboard stats",
    });
  }
};

// Lấy danh sách payments
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      paymentMethod,
      status,
      hotelId,
      dateFrom,
      dateTo,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const result = await adminPaymentService.getAllPayments({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      paymentMethod: paymentMethod as PaymentMethod | string,
      status: status as PaymentStatus | string,
      hotelId: hotelId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      sortBy: sortBy as "created_at" | "amount_due" | "status",
      sortOrder: sortOrder as "ASC" | "DESC",
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getAllPayments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách payments",
    });
  }
};

// Lấy chi tiết payment
export const getPaymentDetail = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const result = await adminPaymentService.getPaymentDetail(paymentId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getPaymentDetail error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết payment",
    });
  }
};

// Cập nhật payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { status, note } = req.body;
    const adminId = (req as any).user?.account_id;
    const adminName = (req as any).user?.full_name;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu trạng thái mới",
      });
    }

    const result = await adminPaymentService.updatePaymentStatus(
      paymentId,
      status,
      adminId,
      adminName,
      note
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] updatePaymentStatus error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật payment status",
    });
  }
};

// Retry payment
export const retryPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { newMethod } = req.body;
    const adminId = (req as any).user?.account_id;
    const adminName = (req as any).user?.full_name;

    const result = await adminPaymentService.retryPayment(
      paymentId,
      newMethod,
      adminId,
      adminName
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] retryPayment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi retry payment",
    });
  }
};

// Confirm manual payment
export const confirmManualPayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { admin_name, received_date, note } = req.body;
    const adminId = (req as any).user?.account_id;

    if (!admin_name || !received_date) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin admin_name hoặc received_date",
      });
    }

    const result = await adminPaymentService.confirmManualPayment(
      paymentId,
      {
        admin_name,
        received_date,
        note,
      },
      adminId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] confirmManualPayment error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi confirm manual payment",
    });
  }
};

// Lấy failed payments
export const getFailedPayments = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
    } = req.query;

    const result = await adminPaymentService.getFailedPayments({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getFailedPayments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách failed payments",
    });
  }
};

// Lấy manual payments
export const getManualPayments = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
    } = req.query;

    const result = await adminPaymentService.getManualPayments({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getManualPayments error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách manual payments",
    });
  }
};

// Lấy payment reports
export const getPaymentReports = async (req: Request, res: Response) => {
  try {
    const { period, paymentMethod, hotelId } = req.query;

    const result = await adminPaymentService.getPaymentReports({
      period: period as "7days" | "month" | "quarter" | "year",
      paymentMethod: paymentMethod as PaymentMethod | string,
      hotelId: hotelId as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getPaymentReports error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy payment reports",
    });
  }
};

// Lấy refunds
export const getRefunds = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      paymentMethod,
      status,
      dateFrom,
      dateTo,
    } = req.query;

    const result = await adminPaymentService.getRefunds({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      paymentMethod: paymentMethod as PaymentMethod | string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getRefunds error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách refunds",
    });
  }
};

// Tạo refund
export const createRefund = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason, refund_date } = req.body;
    const adminId = (req as any).user?.account_id;
    const adminName = (req as any).user?.full_name;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Thiếu số tiền refund",
      });
    }

    const result = await adminPaymentService.createRefund(
      paymentId,
      {
        amount,
        reason,
        refund_date,
      },
      adminId,
      adminName
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] createRefund error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo refund",
    });
  }
};

// Lấy payment activity logs
export const getPaymentActivityLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search,
      admin,
      action,
      dateFrom,
      dateTo,
    } = req.query;

    const result = await adminPaymentService.getPaymentActivityLogs({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      adminId: admin as string,
      action: action as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] getPaymentActivityLogs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy payment activity logs",
    });
  }
};

// Export invoice
export const exportInvoice = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { format } = req.body;

    if (!format || !["PDF", "EMAIL"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Format phải là PDF hoặc EMAIL",
      });
    }

    const result = await adminPaymentService.exportInvoice(paymentId, format);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error("[AdminPaymentController] exportInvoice error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi xuất hóa đơn",
    });
  }
};

