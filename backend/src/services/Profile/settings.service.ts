import { SettingsRepository } from "../../Repository/Profile/settings.repository";

export class SettingsService {
  private repo = new SettingsRepository();

  async getSettings(accountId: string) {
    return await this.repo.getSettingsByAccountId(accountId);
  }

  async updateSettings(accountId: string, data: any) {
    const updateData: any = {};

    if (data.language !== undefined) {
      updateData.language = data.language;
    }
    if (data.timezone !== undefined) {
      updateData.timezone = data.timezone;
    }
    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }
    if (data.two_factor_auth !== undefined) {
      updateData.two_factor_auth = Boolean(data.two_factor_auth);
    }
    if (data.email_notifications !== undefined) {
      updateData.email_notifications = data.email_notifications;
    }
    if (data.sms_notifications !== undefined) {
      updateData.sms_notifications = data.sms_notifications;
    }

    await this.repo.updateSettings(accountId, updateData);
    return await this.repo.getSettingsByAccountId(accountId);
  }
}


