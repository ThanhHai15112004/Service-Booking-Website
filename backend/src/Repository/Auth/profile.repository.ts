import pool from "../../config/db";
import { Account } from "../../models/Auth/account.model";

export class ProfileRepository {
  // Hàm lấy thông tin user
  async getProfile(accountId: string): Promise<Partial<Account> | null> {
    const [rows]: any = await pool.query(
      `SELECT account_id, full_name, email, phone_number, status, role, is_verified, avatar_url, provider, created_at, updated_at
       FROM account
       WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // Hàm lấy booking statistics của user
  // Chỉ tính các đơn đã xác nhận (CONFIRMED, PAID, COMPLETED), không tính CANCELLED
  async getBookingStatistics(accountId: string): Promise<any> {
    try {
      const [rows]: any = await pool.query(
        `SELECT 
          COUNT(CASE WHEN status IN ('CONFIRMED', 'PAID', 'COMPLETED') THEN 1 END) as total_bookings,
          COALESCE(SUM(CASE WHEN status = 'CREATED' THEN 1 ELSE 0 END), 0) as created_count,
          COALESCE(SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END), 0) as paid_count,
          COALESCE(SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END), 0) as confirmed_count,
          COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as completed_count,
          COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelled_count,
          COALESCE(SUM(CASE WHEN status IN ('CONFIRMED', 'PAID', 'COMPLETED') THEN total_amount ELSE 0 END), 0) as total_spent,
          MAX(CASE WHEN status IN ('CONFIRMED', 'PAID', 'COMPLETED') THEN created_at END) as last_booking_date
         FROM booking
         WHERE account_id = ?`,
        [accountId]
      );
      
      const result = rows.length > 0 ? rows[0] : {
        total_bookings: 0,
        created_count: 0,
        paid_count: 0,
        confirmed_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        total_spent: 0,
        last_booking_date: null
      };
      
      // Ensure all numeric fields are numbers, not strings
      return {
        total_bookings: Number(result.total_bookings) || 0,
        created_count: Number(result.created_count) || 0,
        paid_count: Number(result.paid_count) || 0,
        confirmed_count: Number(result.confirmed_count) || 0,
        completed_count: Number(result.completed_count) || 0,
        cancelled_count: Number(result.cancelled_count) || 0,
        total_spent: Number(result.total_spent) || 0,
        last_booking_date: result.last_booking_date
      };
    } catch (error: any) {
      console.error('[ProfileRepository] Error in getBookingStatistics:', error.message);
      // Return default values on error
      return {
        total_bookings: 0,
        created_count: 0,
        paid_count: 0,
        confirmed_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        total_spent: 0,
        last_booking_date: null
      };
    }
  }

  // Hàm lấy recent activity (booking history và profile updates)
  async getRecentActivity(accountId: string, limit: number = 5): Promise<any[]> {
    try {
      const activities: any[] = [];

      // Lấy booking activities (chỉ các đơn đã xác nhận)
      try {
        const [bookings]: any = await pool.query(
          `SELECT 
            b.booking_id,
            b.status,
            b.created_at,
            'booking' as activity_type,
            CONCAT('Đặt phòng thành công - ', h.name) as description
           FROM booking b
           LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
           WHERE b.account_id = ? 
             AND b.status IN ('CONFIRMED', 'PAID', 'COMPLETED')
           ORDER BY b.created_at DESC
           LIMIT ?`,
          [accountId, limit]
        );

        // Combine và sort by date
        if (Array.isArray(bookings)) {
          bookings.forEach((b: any) => {
            activities.push({
              type: b.activity_type,
              description: b.description || 'Đặt phòng thành công',
              date: b.created_at,
              booking_id: b.booking_id
            });
          });
        }
      } catch (bookingErr: any) {
        console.error('[ProfileRepository] Error getting booking activities:', bookingErr.message);
        // Continue without bookings if error
      }

      // Lấy profile update activities (từ account.updated_at)
      try {
        const [profileUpdates]: any = await pool.query(
          `SELECT 
            account_id,
            updated_at,
            'profile' as activity_type,
            'Cập nhật thông tin cá nhân' as description
           FROM account
           WHERE account_id = ? 
             AND updated_at > created_at
             AND updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
           ORDER BY updated_at DESC
           LIMIT 1`,
          [accountId]
        );

        if (Array.isArray(profileUpdates)) {
          profileUpdates.forEach((p: any) => {
            activities.push({
              type: p.activity_type,
              description: p.description,
              date: p.updated_at
            });
          });
        }
      } catch (profileErr: any) {
        console.error('[ProfileRepository] Error getting profile updates:', profileErr.message);
        // Continue without profile updates if error
      }

      // Sort by date descending và limit
      activities.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
      
      return activities.slice(0, limit);
    } catch (error: any) {
      console.error('[ProfileRepository] Error in getRecentActivity:', error.message);
      return []; // Return empty array on error
    }
  }

  // Hàm cập nhật thông tin user
  async updateProfile(
    accountId: string,
    data: { full_name: string; phone_number?: string | null; avatar_url?: string | null }
  ): Promise<void> {
    const { full_name, phone_number, avatar_url } = data;
    
    // Build dynamic update query - chỉ update các field có giá trị
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    // ✅ full_name luôn bắt buộc
    updateFields.push('full_name = ?');
    updateValues.push(full_name);
    
    // ✅ phone_number chỉ update nếu có giá trị (không bắt buộc)
    if (phone_number !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(phone_number || null); // Cho phép null nếu empty string
    }
    
    // ✅ avatar_url chỉ update nếu có giá trị
    if (avatar_url !== undefined) {
      updateFields.push('avatar_url = ?');
      updateValues.push(avatar_url || null); // Cho phép null nếu empty string
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(accountId);
    
    await pool.query(
      `UPDATE account 
       SET ${updateFields.join(', ')}
       WHERE account_id = ?`,
      updateValues
    );
  }

  // Hàm lấy hash mật khẩu
  async getPasswordHash(accountId: string): Promise<string | null> {
    const [rows]: any = await pool.query(
      `SELECT password_hash FROM account WHERE account_id = ?`,
      [accountId]
    );
    return rows.length > 0 ? rows[0].password_hash : null;
  }

  // Hàm cập nhật mật khẩu
  async updatePassword(accountId: string, newHash: string): Promise<void> {
    await pool.query(
      `UPDATE account SET password_hash = ?, updated_at = NOW() WHERE account_id = ?`,
      [newHash, accountId]
    );
  }

  // Hàm xóa refresh token (buộc login lại)
  async revokeRefreshTokens(accountId: string): Promise<void> {
    await pool.query(`DELETE FROM refresh_tokens WHERE account_id = ?`, [
      accountId,
    ]);
  }
}
