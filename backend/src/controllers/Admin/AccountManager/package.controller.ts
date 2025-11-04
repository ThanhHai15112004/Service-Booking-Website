import { Request, Response } from "express";
import { AdminAccountPackageService } from "../../../services/Admin/AccountManager/accountPackage.service";

const packageService = new AdminAccountPackageService();

export const getAccountPackages = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await packageService.getAccountPackages(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy thông tin gói",
    });
  }
};

export const getAccountSubscriptions = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await packageService.getAccountSubscriptions(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy lịch sử subscription",
    });
  }
};

export const getAccountPaymentCards = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await packageService.getAccountPaymentCards(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách thẻ",
    });
  }
};

export const getAccountPayments = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { status, method, dateFrom, dateTo, page, limit } = req.query;
    const result = await packageService.getAccountPayments(accountId, {
      status: status as string,
      method: method as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy lịch sử thanh toán",
    });
  }
};

