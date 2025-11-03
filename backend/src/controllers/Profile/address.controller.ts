import { Request, Response } from "express";
import { AddressService } from "../../services/Profile/address.service";

const addressService = new AddressService();

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const addresses = await addressService.getAddresses(accountId);
    res.json({ success: true, data: addresses });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Lỗi khi lấy danh sách địa chỉ.",
    });
  }
};

export const getAddressById = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { addressId } = req.params;
    const address = await addressService.getAddressById(addressId, accountId);
    res.json({ success: true, data: address });
  } catch (err: any) {
    res.status(404).json({
      success: false,
      message: err.message || "Không tìm thấy địa chỉ.",
    });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const addressId = await addressService.createAddress(accountId, req.body);
    res.json({ success: true, data: { address_id: addressId }, message: "Tạo địa chỉ thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi tạo địa chỉ.",
    });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { addressId } = req.params;
    await addressService.updateAddress(addressId, accountId, req.body);
    res.json({ success: true, message: "Cập nhật địa chỉ thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi cập nhật địa chỉ.",
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const accountId = res.locals.accountId;
    const { addressId } = req.params;
    await addressService.deleteAddress(addressId, accountId);
    res.json({ success: true, message: "Xóa địa chỉ thành công." });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || "Lỗi khi xóa địa chỉ.",
    });
  }
};


