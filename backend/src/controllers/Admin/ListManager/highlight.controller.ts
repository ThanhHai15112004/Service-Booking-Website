import { Request, Response } from "express";
import { AdminHighlightService } from "../../../services/Admin/adminHighlight.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const highlightService = new AdminHighlightService();

export const getAllHighlights = asyncHandler(async (req: Request, res: Response) => {
  const highlights = await highlightService.getAllHighlights();
  res.status(200).json({
    success: true,
    data: highlights,
  });
});

export const getHighlightById = asyncHandler(async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  const highlight = await highlightService.getHighlightById(highlightId);
  res.status(200).json({
    success: true,
    data: highlight,
  });
});

export const createHighlight = asyncHandler(async (req: Request, res: Response) => {
  const highlight = await highlightService.createHighlight(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo điểm nổi bật thành công",
    data: highlight,
  });
});

export const updateHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  const highlight = await highlightService.updateHighlight(highlightId, req.body);
  res.status(200).json({
    success: true,
    message: "Cập nhật điểm nổi bật thành công",
    data: highlight,
  });
});

export const deleteHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  await highlightService.deleteHighlight(highlightId);
  res.status(200).json({
    success: true,
    message: "Xóa điểm nổi bật thành công",
  });
});

