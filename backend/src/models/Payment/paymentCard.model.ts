export interface PaymentCard {
  card_id: string;
  account_id: string;
  card_type: string; // VISA, MASTERCARD, AMEX, JCB
  last_four_digits: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'DELETED';
  created_at: Date;
  updated_at: Date;
}


