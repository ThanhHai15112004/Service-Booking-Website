import pool from "../../config/db";
import { PaymentCard } from "../../models/Payment/paymentCard.model";

export class PaymentCardRepository {
  // Lấy tất cả thẻ của user
  async getCardsByAccountId(accountId: string): Promise<PaymentCard[]> {
    try {
      const [rows]: any = await pool.query(
        `SELECT 
          card_id,
          account_id,
          card_type,
          last_four_digits,
          cardholder_name,
          expiry_month,
          expiry_year,
          CASE WHEN is_default = 1 THEN true ELSE false END as is_default,
          status,
          created_at,
          updated_at
         FROM payment_card 
         WHERE account_id = ? AND status = 'ACTIVE' 
         ORDER BY is_default DESC, created_at DESC`,
        [accountId]
      );
      // Normalize boolean fields
      return (rows || []).map((row: any) => ({
        ...row,
        is_default: Boolean(row.is_default === 1 || row.is_default === true)
      }));
    } catch (error: any) {
      // Nếu bảng chưa tồn tại, trả về mảng rỗng
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        console.error('[PaymentCardRepository] Table payment_card does not exist. Please run migration: backend/database/payment_card_migration.sql');
        return [];
      }
      throw error;
    }
  }

  // Lấy thẻ theo ID
  async getCardById(cardId: string, accountId: string): Promise<PaymentCard | null> {
    try {
      const [rows]: any = await pool.query(
        `SELECT * FROM payment_card WHERE card_id = ? AND account_id = ? AND status = 'ACTIVE'`,
        [cardId, accountId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        return null;
      }
      throw error;
    }
  }

  // Tạo thẻ mới
  async createCard(data: Omit<PaymentCard, 'card_id' | 'created_at' | 'updated_at'>): Promise<string> {
    // Kiểm tra bảng có tồn tại không
    try {
      await pool.query('SELECT 1 FROM payment_card LIMIT 1');
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('Bảng payment_card chưa được tạo. Vui lòng chạy migration SQL: backend/database/payment_card_migration.sql');
      }
      throw error;
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Nếu thẻ này là default, bỏ default của các thẻ khác
      if (data.is_default) {
        await conn.query(
          `UPDATE payment_card SET is_default = 0 WHERE account_id = ?`,
          [data.account_id]
        );
      }

      // Kiểm tra thẻ đã hết hạn chưa
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      
      let status = 'ACTIVE';
      if (data.expiry_year < currentYear || 
          (data.expiry_year === currentYear && data.expiry_month < currentMonth)) {
        status = 'EXPIRED';
      }

      // Tạo card_id mới (format: CD + timestamp 9 chữ số + random 3 chữ số)
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const cardId = `CD${timestamp.slice(-9)}${random}`;

      // Insert thẻ mới
      await conn.query(
        `INSERT INTO payment_card (card_id, account_id, card_type, last_four_digits, cardholder_name, expiry_month, expiry_year, is_default, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cardId,
          data.account_id,
          data.card_type,
          data.last_four_digits,
          data.cardholder_name,
          data.expiry_month,
          data.expiry_year,
          data.is_default ? 1 : 0,
          status
        ]
      );

      await conn.commit();
      return cardId;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }

  // Cập nhật thẻ
  async updateCard(cardId: string, accountId: string, data: Partial<Omit<PaymentCard, 'card_id' | 'account_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    // Kiểm tra bảng có tồn tại không
    try {
      await pool.query('SELECT 1 FROM payment_card LIMIT 1');
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('Bảng payment_card chưa được tạo. Vui lòng chạy migration SQL: backend/database/payment_card_migration.sql');
      }
      throw error;
    }
    
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Nếu đặt thẻ này là default, bỏ default của các thẻ khác
      if (data.is_default) {
        await conn.query(
          `UPDATE payment_card SET is_default = 0 WHERE account_id = ? AND card_id != ?`,
          [accountId, cardId]
        );
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (data.card_type !== undefined) {
        updateFields.push('card_type = ?');
        updateValues.push(data.card_type);
      }
      if (data.last_four_digits !== undefined) {
        updateFields.push('last_four_digits = ?');
        updateValues.push(data.last_four_digits);
      }
      if (data.cardholder_name !== undefined) {
        updateFields.push('cardholder_name = ?');
        updateValues.push(data.cardholder_name);
      }
      if (data.expiry_month !== undefined) {
        updateFields.push('expiry_month = ?');
        updateValues.push(data.expiry_month);
      }
      if (data.expiry_year !== undefined) {
        updateFields.push('expiry_year = ?');
        updateValues.push(data.expiry_year);
      }
      if (data.is_default !== undefined) {
        updateFields.push('is_default = ?');
        updateValues.push(data.is_default ? 1 : 0);
      }
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }

      if (updateFields.length > 0) {
        updateValues.push(cardId, accountId);
        await conn.query(
          `UPDATE payment_card SET ${updateFields.join(', ')}, updated_at = NOW() 
           WHERE card_id = ? AND account_id = ?`,
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

  // Xóa thẻ (soft delete)
  async deleteCard(cardId: string, accountId: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE payment_card SET status = 'DELETED', updated_at = NOW() 
         WHERE card_id = ? AND account_id = ?`,
        [cardId, accountId]
      );
    } catch (error: any) {
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        throw new Error('Bảng payment_card chưa được tạo. Vui lòng chạy migration SQL: backend/database/payment_card_migration.sql');
      }
      throw error;
    }
  }
}

