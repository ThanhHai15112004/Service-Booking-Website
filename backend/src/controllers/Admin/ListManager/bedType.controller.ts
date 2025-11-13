import { Request, Response } from "express";
import { AdminBedTypeService } from "../../../services/Admin/adminBedType.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const bedTypeService = new AdminBedTypeService();

export const getAllBedTypes = asyncHandler(async (req: Request, res: Response) => {
  const bedTypes = await bedTypeService.getAllBedTypes();
  res.status(200).json({
    success: true,
    data: bedTypes,
  });
});

export const getBedTypeById = asyncHandler(async (req: Request, res: Response) => {
  const { bedTypeKey } = req.params;
  const bedType = await bedTypeService.getBedTypeById(bedTypeKey);
  res.status(200).json({
    success: true,
    data: bedType,
  });
});

export const createBedType = asyncHandler(async (req: Request, res: Response) => {
  const bedType = await bedTypeService.createBedType(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo loại giường thành công",
    data: bedType,
  });
});

export const updateBedType = asyncHandler(async (req: Request, res: Response) => {
  const { bedTypeKey } = req.params;
  const bedType = await bedTypeService.updateBedType(bedTypeKey, req.body);
  res.status(200).json({
    success: true,
    message: "Cập nhật loại giường thành công",
    data: bedType,
  });
});

export const deleteBedType = asyncHandler(async (req: Request, res: Response) => {
  const { bedTypeKey } = req.params;
  await bedTypeService.deleteBedType(bedTypeKey);
  res.status(200).json({
    success: true,
    message: "Xóa loại giường thành công",
  });
});

