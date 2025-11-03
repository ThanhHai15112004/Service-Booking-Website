import express from "express";
import { downloadInvoice } from "../../controllers/Invoice/invoice.controller";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = express.Router();

// Download invoice (tạm thời trả về JSON, có thể implement PDF sau)
router.get("/:bookingId/download", authenticateJWT, downloadInvoice);

export default router;

