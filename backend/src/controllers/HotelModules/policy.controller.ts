import { Request, Response } from "express";
import { PolicyService } from "../../services/Hotel/policy.service";

const policyService = new PolicyService();

export const getAllPoliciesController = async (req: Request, res: Response) => {
  try {
    const result = await policyService.getAllPolicies();
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[PolicyController] getAllPolicies error:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách chính sách.",
      items: [],
    });
  }
};
