import pool from "../../config/db";

export interface UserAddress {
  address_id: string;
  account_id: string;
  name: string;
  phone: string;
  address: string; // Địa chỉ đầy đủ (backward compatible)
  city: string;
  country: string;
  district?: string; // Quận/Huyện
  street_name?: string; // Tên đường
  house_number?: string; // Số nhà
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export class AddressRepository {
  // Lấy tất cả địa chỉ của user
  // Sắp xếp: default lên đầu, nhưng không thay đổi thứ tự các địa chỉ khác
  async getAddressesByAccountId(accountId: string): Promise<UserAddress[]> {
    const [rows]: any = await pool.query(
      `SELECT * FROM user_address WHERE account_id = ? ORDER BY is_default DESC, created_at DESC`,
      [accountId]
    );
    return rows;
  }

  // Lấy địa chỉ theo ID
  async getAddressById(addressId: string, accountId: string): Promise<UserAddress | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM user_address WHERE address_id = ? AND account_id = ?`,
      [addressId, accountId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Tạo địa chỉ mới
  async createAddress(data: Omit<UserAddress, 'address_id' | 'created_at' | 'updated_at'>): Promise<string> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Nếu địa chỉ này là default, bỏ default của các địa chỉ khác
      if (data.is_default) {
        await conn.query(
          `UPDATE user_address SET is_default = 0 WHERE account_id = ?`,
          [data.account_id]
        );
      }

      // Tạo address_id mới (format giống booking_id: AD + timestamp 9 chữ số + random 3 chữ số)
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const addressId = `AD${timestamp.slice(-9)}${random}`;

      // Insert địa chỉ mới
      await conn.query(
        `INSERT INTO user_address (address_id, account_id, name, phone, address, city, country, district, street_name, house_number, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          addressId, 
          data.account_id, 
          data.name, 
          data.phone, 
          data.address, 
          data.city, 
          data.country,
          data.district || null,
          data.street_name || null,
          data.house_number || null,
          data.is_default ? 1 : 0
        ]
      );

      await conn.commit();
      return addressId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Cập nhật địa chỉ
  async updateAddress(addressId: string, accountId: string, data: Partial<Omit<UserAddress, 'address_id' | 'account_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Nếu đặt địa chỉ này là default, bỏ default của các địa chỉ khác
      if (data.is_default) {
        await conn.query(
          `UPDATE user_address SET is_default = 0 WHERE account_id = ? AND address_id != ?`,
          [accountId, addressId]
        );
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.name !== undefined) {
        updateFields.push('name = ?');
        updateValues.push(data.name);
      }
      if (data.phone !== undefined) {
        updateFields.push('phone = ?');
        updateValues.push(data.phone);
      }
      if (data.address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(data.address);
      }
      if (data.city !== undefined) {
        updateFields.push('city = ?');
        updateValues.push(data.city);
      }
      if (data.country !== undefined) {
        updateFields.push('country = ?');
        updateValues.push(data.country);
      }
      if (data.district !== undefined) {
        updateFields.push('district = ?');
        updateValues.push(data.district);
      }
      if (data.street_name !== undefined) {
        updateFields.push('street_name = ?');
        updateValues.push(data.street_name);
      }
      if (data.house_number !== undefined) {
        updateFields.push('house_number = ?');
        updateValues.push(data.house_number);
      }
      if (data.is_default !== undefined) {
        updateFields.push('is_default = ?');
        updateValues.push(data.is_default ? 1 : 0);
      }

      if (updateFields.length > 0) {
        updateValues.push(addressId, accountId);
        await conn.query(
          `UPDATE user_address SET ${updateFields.join(', ')}, updated_at = NOW() WHERE address_id = ? AND account_id = ?`,
          updateValues
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Xóa địa chỉ
  async deleteAddress(addressId: string, accountId: string): Promise<void> {
    await pool.query(
      `DELETE FROM user_address WHERE address_id = ? AND account_id = ?`,
      [addressId, accountId]
    );
  }

  // Đặt địa chỉ mặc định
  async setDefaultAddress(addressId: string, accountId: string): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Bỏ default của tất cả địa chỉ khác
      await conn.query(
        `UPDATE user_address SET is_default = 0 WHERE account_id = ? AND address_id != ?`,
        [accountId, addressId]
      );

      // Đặt địa chỉ này làm default
      await conn.query(
        `UPDATE user_address SET is_default = 1, updated_at = NOW() WHERE address_id = ? AND account_id = ?`,
        [addressId, accountId]
      );

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

