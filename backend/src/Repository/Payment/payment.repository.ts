import pool from "../../config/db";
import { Payment, CreatePaymentRequest, PaymentStatus } from "../../models/Payment/payment.model";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class PaymentRepository {
  // Hàm generate payment ID
  generatePaymentId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PM${timestamp.slice(-9)}${random}`;
  }

  // Hàm tạo payment record
  async createPayment(payment: Omit<Payment, 'created_at' | 'updated_at'>): Promise<boolean> {
    const sql = `
      INSERT INTO payment (
        payment_id,
        booking_id,
        method,
        status,
        amount_due,
        amount_paid
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, [
        payment.payment_id,
        payment.booking_id,
        payment.method,
        payment.status,
        payment.amount_due,
        payment.amount_paid
      ]);

      return (result as ResultSetHeader).affectedRows > 0;
    } catch (error: any) {
      console.error("[PaymentRepository] createPayment error:", error.message);
      console.error("[PaymentRepository] Payment data:", {
        payment_id: payment.payment_id,
        booking_id: payment.booking_id,
        method: payment.method,
        status: payment.status,
        amount_due: payment.amount_due,
        amount_paid: payment.amount_paid
      });
      throw error;
    } finally {
      conn.release();
    }
  }

  // Hàm lấy payment theo booking_id
  async getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
    const sql = `
      SELECT * FROM payment
      WHERE booking_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [bookingId]);
      const payments = rows as RowDataPacket[];
      return payments.length > 0 ? payments[0] as Payment : null;
    } finally {
      conn.release();
    }
  }

  // Hàm lấy payment theo payment_id
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const sql = `
      SELECT * FROM payment
      WHERE payment_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query(sql, [paymentId]);
      const payments = rows as RowDataPacket[];
      return payments.length > 0 ? payments[0] as Payment : null;
    } finally {
      conn.release();
    }
  }

  // Hàm cập nhật payment status
  async updatePaymentStatus(paymentId: string, status: PaymentStatus, amountPaid?: number): Promise<boolean> {
    const updateFields: string[] = ['status = ?'];
    const values: any[] = [status];

    if (amountPaid !== undefined) {
      updateFields.push('amount_paid = ?');
      values.push(amountPaid);
    }

    values.push(paymentId);

    const sql = `
      UPDATE payment
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE payment_id = ?
    `;

    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(sql, values);
      return (result as ResultSetHeader).affectedRows > 0;
    } finally {
      conn.release();
    }
  }
}

