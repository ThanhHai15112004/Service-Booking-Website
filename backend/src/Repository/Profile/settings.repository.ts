import pool from "../../config/db";

export interface UserSettings {
  settings_id: string;
  account_id: string;
  language: string;
  timezone: string;
  currency: string;
  two_factor_auth: boolean;
  email_notifications: {
    promotions: boolean;
    bookingConfirmations: boolean;
    postTripReviews: boolean;
  } | null;
  sms_notifications: {
    promotions: boolean;
    bookingConfirmations: boolean;
    postTripReviews: boolean;
  } | null;
  created_at: Date;
  updated_at: Date;
}

export class SettingsRepository {
  // Lấy settings của user
  async getSettingsByAccountId(accountId: string): Promise<UserSettings | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM user_settings WHERE account_id = ?`,
      [accountId]
    );
    if (rows.length === 0) {
      // Tạo settings mặc định nếu chưa có
      return await this.createDefaultSettings(accountId);
    }

    const settings = rows[0];
    // Parse JSON fields
    if (settings.email_notifications) {
      settings.email_notifications = JSON.parse(settings.email_notifications);
    }
    if (settings.sms_notifications) {
      settings.sms_notifications = JSON.parse(settings.sms_notifications);
    }
    settings.two_factor_auth = Boolean(settings.two_factor_auth);

    return settings;
  }

  // Tạo settings mặc định
  async createDefaultSettings(accountId: string): Promise<UserSettings> {
    // Tạo settings_id (format giống booking_id: ST + timestamp 9 chữ số + random 3 chữ số)
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const settingsId = `ST${timestamp.slice(-9)}${random}`;
    const defaultEmailNotifications = JSON.stringify({
      promotions: true,
      bookingConfirmations: true,
      postTripReviews: true
    });
    const defaultSmsNotifications = JSON.stringify({
      promotions: false,
      bookingConfirmations: true,
      postTripReviews: false
    });

    await pool.query(
      `INSERT INTO user_settings (settings_id, account_id, language, timezone, currency, two_factor_auth, email_notifications, sms_notifications)
       VALUES (?, ?, 'vi', 'Asia/Ho_Chi_Minh', 'VND', 0, ?, ?)`,
      [settingsId, accountId, defaultEmailNotifications, defaultSmsNotifications]
    );

    return await this.getSettingsByAccountId(accountId) as UserSettings;
  }

  // Cập nhật settings
  async updateSettings(accountId: string, data: Partial<Omit<UserSettings, 'settings_id' | 'account_id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (data.language !== undefined) {
      updateFields.push('language = ?');
      updateValues.push(data.language);
    }
    if (data.timezone !== undefined) {
      updateFields.push('timezone = ?');
      updateValues.push(data.timezone);
    }
    if (data.currency !== undefined) {
      updateFields.push('currency = ?');
      updateValues.push(data.currency);
    }
    if (data.two_factor_auth !== undefined) {
      updateFields.push('two_factor_auth = ?');
      updateValues.push(data.two_factor_auth ? 1 : 0);
    }
    if (data.email_notifications !== undefined) {
      updateFields.push('email_notifications = ?');
      updateValues.push(JSON.stringify(data.email_notifications));
    }
    if (data.sms_notifications !== undefined) {
      updateFields.push('sms_notifications = ?');
      updateValues.push(JSON.stringify(data.sms_notifications));
    }

    if (updateFields.length > 0) {
      // Đảm bảo settings tồn tại
      await this.getSettingsByAccountId(accountId);
      
      updateValues.push(accountId);
      await pool.query(
        `UPDATE user_settings SET ${updateFields.join(', ')}, updated_at = NOW() WHERE account_id = ?`,
        updateValues
      );
    }
  }
}

