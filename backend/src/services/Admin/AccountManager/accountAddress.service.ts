import { AddressRepository } from "../../../Repository/Profile/address.repository";

export class AdminAccountAddressService {
  private addressRepo = new AddressRepository();

  async getAccountAddresses(accountId: string) {
    const addresses = await this.addressRepo.getAddressesByAccountId(accountId);
    return {
      success: true,
      data: addresses,
    };
  }

  async createAddress(accountId: string, data: {
    name: string;
    phone: string;
    house_number?: string;
    street_name?: string;
    district?: string;
    city: string;
    country?: string;
    is_default?: boolean;
  }) {
    const addressParts = [
      data.house_number,
      data.street_name,
      data.district,
      data.city,
      data.country || "VN",
    ].filter(Boolean);
    const fullAddress = addressParts.join(", ");

    const addressId = await this.addressRepo.createAddress({
      account_id: accountId,
      name: data.name,
      phone: data.phone,
      address: fullAddress,
      city: data.city,
      country: data.country || "VN",
      district: data.district || undefined,
      street_name: data.street_name || undefined,
      house_number: data.house_number || undefined,
      is_default: data.is_default || false,
    });

    const newAddress = await this.addressRepo.getAddressById(addressId, accountId);
    return {
      success: true,
      message: "Thêm địa chỉ thành công",
      data: newAddress,
    };
  }

  async updateAddress(addressId: string, accountId: string, data: {
    name?: string;
    phone?: string;
    house_number?: string;
    street_name?: string;
    district?: string;
    city?: string;
    country?: string;
    is_default?: boolean;
  }) {
    await this.addressRepo.updateAddress(addressId, accountId, data);
    const updatedAddress = await this.addressRepo.getAddressById(addressId, accountId);
    return {
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: updatedAddress,
    };
  }

  async deleteAddress(addressId: string, accountId: string) {
    await this.addressRepo.deleteAddress(addressId, accountId);
    return {
      success: true,
      message: "Xóa địa chỉ thành công",
    };
  }

  async setDefaultAddress(addressId: string, accountId: string) {
    await this.addressRepo.setDefaultAddress(addressId, accountId);
    return {
      success: true,
      message: "Đặt địa chỉ mặc định thành công",
    };
  }
}

