import express from "express";
import {
  getCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  setDefaultCard
} from "../../controllers/Payment/paymentCard.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = express.Router();

// Tất cả routes đều cần authenticate
router.use(authenticateJWT);

// Lấy tất cả thẻ
router.get("/", getCards);

// Lấy thẻ theo ID
router.get("/:cardId", getCardById);

// Tạo thẻ mới
router.post("/", createCard);

// Cập nhật thẻ
router.put("/:cardId", updateCard);

// Xóa thẻ
router.delete("/:cardId", deleteCard);

// Đặt thẻ mặc định
router.put("/:cardId/default", setDefaultCard);

export default router;


