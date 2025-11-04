import { Request, Response } from "express";
import { AdminAccountAddressService } from "../../../services/Admin/AccountManager/accountAddress.service";

const addressService = new AdminAccountAddressService();

export const getAccountAddresses = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await addressService.getAccountAddresses(accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi server khi lấy danh sách địa chỉ",
    });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const result = await addressService.createAddress(accountId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo địa chỉ",
    });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { accountId, addressId } = req.params;
    const result = await addressService.updateAddress(addressId, accountId, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể cập nhật địa chỉ",
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const { accountId, addressId } = req.params;
    const result = await addressService.deleteAddress(addressId, accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể xóa địa chỉ",
    });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const { accountId, addressId } = req.params;
    const result = await addressService.setDefaultAddress(addressId, accountId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Không thể đặt địa chỉ mặc định",
    });
  }
};

