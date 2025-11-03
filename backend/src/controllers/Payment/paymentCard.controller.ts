import { Request, Response } from "express";
import { PaymentCardService } from "../../services/Payment/paymentCard.service";

const paymentCardService = new PaymentCardService();

export const getCards = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    
    if (!accountId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập"
      });
    }
    
    const cards = await paymentCardService.getCards(accountId);
    res.json({ success: true, data: cards || [] });
  } catch (err: any) {
    console.error('[PaymentCardController] Error in getCards:', err);
    // Nếu bảng chưa tồn tại, trả về mảng rỗng thay vì lỗi 500
    if (err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes("doesn't exist")) {
      return res.json({ 
        success: true, 
        data: [],
        message: "Bảng payment_card chưa được tạo. Vui lòng chạy migration SQL."
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách thẻ.",
    });
  }
};

export const getCardById = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { cardId } = req.params;
    const card = await paymentCardService.getCardById(cardId, accountId);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message || "Không tìm thấy thẻ.",
    });
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const cardId = await paymentCardService.createCard(accountId, req.body);
    res.json({ success: true, data: { card_id: cardId }, message: "Thêm thẻ thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi thêm thẻ.",
    });
  }
};

export const updateCard = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { cardId } = req.params;
    await paymentCardService.updateCard(cardId, accountId, req.body);
    res.json({ success: true, message: "Cập nhật thẻ thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi cập nhật thẻ.",
    });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { cardId } = req.params;
    await paymentCardService.deleteCard(cardId, accountId);
    res.json({ success: true, message: "Xóa thẻ thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi xóa thẻ.",
    });
  }
};

export const setDefaultCard = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { cardId } = req.params;
    await paymentCardService.setDefaultCard(cardId, accountId);
    res.json({ success: true, message: "Đặt thẻ mặc định thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi đặt thẻ mặc định.",
    });
  }
};

