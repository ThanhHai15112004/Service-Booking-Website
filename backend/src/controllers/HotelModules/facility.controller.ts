import { FacilityService } from "../../services/Hotel/facility.service";
import { Request, Response } from "express";


const facilityServices = new FacilityService();

export const getAllFacilitiesController = async (req: Request, res: Response) => {
    try {
        const result = await facilityServices.getAllFacilities();
        return res.status(200).json(result);
    } catch (error: any) {
        console.error("[FacilityController] getAllFacilities error:", error.message || error);
        return res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách tiện nghi.",
        });
    }
}