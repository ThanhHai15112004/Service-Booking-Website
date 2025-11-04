import { Request, Response } from "express";
import { AdminAccountBookingService } from "../../../services/Admin/AccountManager/accountBooking.service";

const bookingService = new AdminAccountBookingService();

export const getAccountBookings = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { status, dateFrom, dateTo, hotelName, page, limit } = req.query;
    const result = await bookingService.getAccountBookings(accountId, {
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      hotelName: hotelName as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách booking",
    });
  }
};

export const getBookingDetail = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const result = await bookingService.getBookingDetail(bookingId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy booking",
    });
  }
};

