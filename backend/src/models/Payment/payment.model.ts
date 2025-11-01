export type PaymentMethod = 'VNPAY' | 'MOMO' | 'CASH' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  payment_id: string;
  booking_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_due: number;
  amount_paid: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePaymentRequest {
  booking_id: string;
  method: PaymentMethod;
  amount_due: number;
}

export interface PaymentResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

