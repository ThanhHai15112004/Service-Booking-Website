import { Request, Response } from "express";
import { AdminLocationService } from "../../../services/Admin/adminLocation.service";
import { asyncHandler } from "../../../middleware/admin.middleware";

const locationService = new AdminLocationService();

export const getLocations = asyncHandler(async (req: Request, res: Response) => {
  const locations = await locationService.getAllLocations();
  res.status(200).json({
    success: true,
    data: locations,
  });
});

export const getLocationById = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const location = await locationService.getLocationById(locationId);
  res.status(200).json({
    success: true,
    data: location,
  });
});

export const createLocation = asyncHandler(async (req: Request, res: Response) => {
  const location = await locationService.createLocation(req.body);
  res.status(201).json({
    success: true,
    message: "Tạo vị trí thành công",
    data: location,
  });
});

export const updateLocation = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const location = await locationService.updateLocation(locationId, req.body);
  res.status(200).json({
    success: true,
    message: "Cập nhật vị trí thành công",
    data: location,
  });
});

export const deleteLocation = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;
  await locationService.deleteLocation(locationId);
  res.status(200).json({
    success: true,
    message: "Xóa vị trí thành công",
  });
});

