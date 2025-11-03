import { PaymentCardRepository } from "../../Repository/Payment/paymentCard.repository";

export class PaymentCardService {
  private repo = new PaymentCardRepository();

  async getCards(accountId: string) {
    try {
      return await this.repo.getCardsByAccountId(accountId);
    } catch (error: any) {
      // Nếu bảng chưa tồn tại, trả về mảng rỗng
      if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes("doesn't exist")) {
        console.error('[PaymentCardService] Table payment_card does not exist. Please run migration.');
        return [];
      }
      throw error;
    }
  }

  async getCardById(cardId: string, accountId: string) {
    const card = await this.repo.getCardById(cardId, accountId);
    if (!card) throw new Error("Không tìm thấy thẻ.");
    return card;
  }

  async createCard(accountId: string, data: any) {
    const { card_type, last_four_digits, cardholder_name, expiry_month, expiry_year, is_default } = data;
    
    if (!card_type || !last_four_digits || !cardholder_name || !expiry_month || !expiry_year) {
      throw new Error("Thiếu thông tin thẻ.");
    }

    // Validate expiry
    if (expiry_month < 1 || expiry_month > 12) {
      throw new Error("Tháng hết hạn không hợp lệ.");
    }

    if (expiry_year < new Date().getFullYear()) {
      throw new Error("Năm hết hạn không hợp lệ.");
    }

    // Validate last 4 digits (phải là số, đúng 4 ký tự)
    if (!/^\d{4}$/.test(last_four_digits)) {
      throw new Error("4 số cuối thẻ không hợp lệ.");
    }

    // Validate card type
    const validCardTypes = ['VISA', 'MASTERCARD', 'AMEX', 'JCB'];
    if (!validCardTypes.includes(card_type.toUpperCase())) {
      throw new Error("Loại thẻ không hợp lệ.");
    }

    return await this.repo.createCard({
      account_id: accountId,
      card_type: card_type.toUpperCase(),
      last_four_digits: last_four_digits,
      cardholder_name: cardholder_name,
      expiry_month: parseInt(expiry_month),
      expiry_year: parseInt(expiry_year),
      is_default: is_default || false,
      status: 'ACTIVE'
    });
  }

  async updateCard(cardId: string, accountId: string, data: any) {
    const card = await this.repo.getCardById(cardId, accountId);
    if (!card) throw new Error("Không tìm thấy thẻ.");

    // Validate nếu có update expiry
    if (data.expiry_month !== undefined && (data.expiry_month < 1 || data.expiry_month > 12)) {
      throw new Error("Tháng hết hạn không hợp lệ.");
    }

    if (data.expiry_year !== undefined && data.expiry_year < new Date().getFullYear()) {
      throw new Error("Năm hết hạn không hợp lệ.");
    }

    // Validate card type nếu có update
    if (data.card_type) {
      const validCardTypes = ['VISA', 'MASTERCARD', 'AMEX', 'JCB'];
      if (!validCardTypes.includes(data.card_type.toUpperCase())) {
        throw new Error("Loại thẻ không hợp lệ.");
      }
      data.card_type = data.card_type.toUpperCase();
    }

    await this.repo.updateCard(cardId, accountId, data);
  }

  async deleteCard(cardId: string, accountId: string) {
    const card = await this.repo.getCardById(cardId, accountId);
    if (!card) throw new Error("Không tìm thấy thẻ.");
    await this.repo.deleteCard(cardId, accountId);
  }

  async setDefaultCard(cardId: string, accountId: string) {
    const card = await this.repo.getCardById(cardId, accountId);
    if (!card) throw new Error("Không tìm thấy thẻ.");
    await this.repo.updateCard(cardId, accountId, { is_default: true });
  }
}

