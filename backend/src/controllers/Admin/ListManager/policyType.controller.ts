import { Request, Response } from "express";
import { AdminPolicyTypeService } from "../../../services/Admin/adminPolicyType.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const policyTypeService = new AdminPolicyTypeService();

export const getAllPolicyTypes = asyncHandler(async (req: Request, res: Response) => {
  const policyTypes = await policyTypeService.getAllPolicyTypes();
  res.status(200).json({
    success: true,
    data: policyTypes,
  });
});

export const getPolicyTypeById = asyncHandler(async (req: Request, res: Response) => {
  const { policyKey } = req.params;
  const policyType = await policyTypeService.getPolicyTypeById(policyKey);
  res.status(200).json({
    success: true,
    data: policyType,
  });
});

export const createPolicyType = asyncHandler(async (req: Request, res: Response) => {
  const policyType = await policyTypeService.createPolicyType(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo loại chính sách thành công",
    data: policyType,
  });
});

export const updatePolicyType = asyncHandler(async (req: Request, res: Response) => {
  const { policyKey } = req.params;
  const policyType = await policyTypeService.updatePolicyType(policyKey, req.body);
  res.status(200).json({
    success: true,
    message: "Cập nhật loại chính sách thành công",
    data: policyType,
  });
});

export const deletePolicyType = asyncHandler(async (req: Request, res: Response) => {
  const { policyKey } = req.params;
  await policyTypeService.deletePolicyType(policyKey);
  res.status(200).json({
    success: true,
    message: "Xóa loại chính sách thành công",
  });
});

