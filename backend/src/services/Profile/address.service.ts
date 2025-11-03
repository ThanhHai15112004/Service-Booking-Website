import { AddressRepository } from "../../Repository/Profile/address.repository";

export class AddressService {
  private repo = new AddressRepository();

  async getAddresses(accountId: string) {
    return await this.repo.getAddressesByAccountId(accountId);
  }

  async getAddressById(addressId: string, accountId: string) {
    const address = await this.repo.getAddressById(addressId, accountId);
    if (!address) throw new Error("Không tìm thấy địa chỉ.");
    return address;
  }

  async createAddress(accountId: string, data: any) {
    const { name, phone, address, city, country, district, street_name, house_number, is_default } = data;
    if (!name || !phone || !city) {
      throw new Error("Thiếu thông tin địa chỉ (tên, số điện thoại, thành phố là bắt buộc).");
    }
    
    // Tạo địa chỉ đầy đủ từ các trường riêng lẻ nếu có
    let fullAddress = address || '';
    if (!fullAddress && (house_number || street_name)) {
      const parts = [house_number, street_name, district, city, country].filter(Boolean);
      fullAddress = parts.join(', ');
    }
    
    return await this.repo.createAddress({
      account_id: accountId,
      name,
      phone,
      address: fullAddress,
      city,
      country: country || 'VN',
      district: district || null,
      street_name: street_name || null,
      house_number: house_number || null,
      is_default: is_default || false
    });
  }

  async updateAddress(addressId: string, accountId: string, data: any) {
    const address = await this.repo.getAddressById(addressId, accountId);
    if (!address) throw new Error("Không tìm thấy địa chỉ.");

    await this.repo.updateAddress(addressId, accountId, data);
  }

  async deleteAddress(addressId: string, accountId: string) {
    const address = await this.repo.getAddressById(addressId, accountId);
    if (!address) throw new Error("Không tìm thấy địa chỉ.");
    await this.repo.deleteAddress(addressId, accountId);
  }
}


