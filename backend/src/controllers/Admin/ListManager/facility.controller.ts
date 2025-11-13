import { Request, Response } from "express";
import { AdminFacilityService } from "../../../services/Admin/adminFacility.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const facilityService = new AdminFacilityService();

export const getAllFacilities = asyncHandler(async (req: Request, res: Response) => {
  const facilities = await facilityService.getAllFacilities();
  res.status(200).json({
    success: true,
    data: facilities,
  });
});

export const getFacilityById = asyncHandler(async (req: Request, res: Response) => {
  const { facilityId } = req.params;
  const facility = await facilityService.getFacilityById(facilityId);
  res.status(200).json({
    success: true,
    data: facility,
  });
});

export const createFacility = asyncHandler(async (req: Request, res: Response) => {
  const facility = await facilityService.createFacility(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo tiện ích thành công",
    data: facility,
  });
});

export const updateFacility = asyncHandler(async (req: Request, res: Response) => {
  const { facilityId } = req.params;
  const facility = await facilityService.updateFacility(facilityId, req.body);
  res.status(200).json({
    success: true,
    message: "Cập nhật tiện ích thành công",
    data: facility,
  });
});

export const deleteFacility = asyncHandler(async (req: Request, res: Response) => {
  const { facilityId } = req.params;
  await facilityService.deleteFacility(facilityId);
  res.status(200).json({
    success: true,
    message: "Xóa tiện ích thành công",
  });
});

