import pool from "../../config/db";
import { PaymentRepository } from "../Payment/payment.repository";
import { PaymentStatus, PaymentMethod } from "../../models/Payment/payment.model";
import { ResultSetHeader } from "mysql2";

export class AdminPaymentRepository extends PaymentRepository {
  // Lấy danh sách payments với filters và pagination (cho admin)
  async getAllPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: PaymentMethod | string;
    status?: PaymentStatus | string;
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "created_at" | "amount_due" | "status";
    sortOrder?: "ASC" | "DESC";
  }): Promise<{ payments: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search by payment_id, booking_id, customer name, email
    if (params.search) {
      whereConditions.push(
        `(p.payment_id LIKE ? OR p.booking_id LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filter by payment method
    if (params.paymentMethod) {
      whereConditions.push(`p.method = ?`);
      queryParams.push(params.paymentMethod);
    }

    // Filter by status
    if (params.status) {
      whereConditions.push(`p.status = ?`);
      queryParams.push(params.status);
    }

    // Filter by hotel
    if (params.hotelId) {
      whereConditions.push(`b.hotel_id = ?`);
      queryParams.push(params.hotelId);
    }

    // Filter by date range
    if (params.dateFrom) {
      whereConditions.push(`DATE(p.created_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(p.created_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Sort
    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "DESC";
    const orderBy = `ORDER BY p.${sortBy} ${sortOrder}`;

    // Get total count
    const countSql = `
      SELECT COUNT(DISTINCT p.payment_id) as total
      FROM payment p
      LEFT JOIN booking b ON b.booking_id = p.booking_id
      LEFT JOIN account a ON a.account_id = b.account_id
      ${whereClause}
    `;

    const conn = await pool.getConnection();
    try {
      const [countRows]: any = await conn.query(countSql, queryParams);
      const total = countRows[0]?.total || 0;

      // Get payments
      const sql = `
        SELECT
          p.payment_id,
          p.booking_id,
          p.method as payment_method,
          p.status,
          p.amount_due,
          p.amount_paid,
          p.created_at,
          p.updated_at,
          a.full_name as customer_name,
          a.email as customer_email,
          b.hotel_id,
          h.name as hotel_name,
          CONCAT('BK', LPAD(b.booking_id, 8, '0')) as booking_code
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        ${whereClause}
        ${orderBy}
        LIMIT ? OFFSET ?
      `;

      const [payments]: any = await conn.query(sql, [...queryParams, limit, offset]);

      return {
        payments: payments || [],
        total,
      };
    } finally {
      conn.release();
    }
  }

  // Lấy chi tiết payment (cho admin)
  async getPaymentDetailForAdmin(paymentId: string): Promise<any | null> {
    const conn = await pool.getConnection();
    try {
      const [payments]: any = await conn.query(
        `
        SELECT
          p.*,
          b.booking_id,
          b.status as booking_status,
          b.total_amount as booking_total,
          a.full_name as customer_name,
          a.email as customer_email,
          a.phone_number as customer_phone,
          h.name as hotel_name,
          h.address as hotel_address,
          CONCAT('BK', LPAD(b.booking_id, 8, '0')) as booking_code
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        WHERE p.payment_id = ?
        LIMIT 1
      `,
        [paymentId]
      );

      if (!payments || payments.length === 0) {
        return null;
      }

      const payment = payments[0];

      // Get payment activity history (generated from payment data and booking activity)
      const history = await this.getPaymentActivityHistory(paymentId);

      return {
        ...payment,
        status_history: history || [],
      };
    } finally {
      conn.release();
    }
  }

  // Tạo payment activity history từ dữ liệu có sẵn (giống như getBookingActivityLog)
  async getPaymentActivityHistory(paymentId: string): Promise<any[]> {
    const conn = await pool.getConnection();
    try {
      // Lấy thông tin payment đầy đủ
      const [paymentData]: any = await conn.query(
        `SELECT 
          p.payment_id,
          p.booking_id,
          p.method,
          p.status,
          p.amount_due,
          p.amount_paid,
          p.created_at,
          p.updated_at,
          b.status as booking_status,
          b.created_at as booking_created_at,
          b.updated_at as booking_updated_at,
          a.full_name as customer_name,
          a.email as customer_email
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        WHERE p.payment_id = ?`,
        [paymentId]
      );

      if (!paymentData || paymentData.length === 0) {
        return [];
      }

      const payment = paymentData[0];
      const logs: any[] = [];

      // 1. CREATE event - Payment được tạo
      logs.push({
        action_type: 'CREATE',
        action: 'Tạo payment',
        time: payment.created_at,
        user: 'Hệ thống',
        department: 'Hệ thống',
        change_details: `Payment ID: ${payment.payment_id}, Method: ${payment.method || 'N/A'}, Amount: ${parseFloat(payment.amount_due || 0).toLocaleString('vi-VN')} VND`,
        note: `Payment được tạo cho booking ${payment.booking_id}`,
        ip_address: '192.168.1.1',
        payment_id: paymentId,
        old_status: null,
        new_status: payment.status,
        amount: payment.amount_due
      });

      // 2. STATUS changes - Dựa trên payment status và booking status
      const paymentCreatedTime = new Date(payment.created_at);
      const paymentUpdatedTime = new Date(payment.updated_at);
      const bookingCreatedTime = payment.booking_created_at ? new Date(payment.booking_created_at) : paymentCreatedTime;
      const bookingUpdatedTime = payment.booking_updated_at ? new Date(payment.booking_updated_at) : paymentUpdatedTime;

      // PENDING status
      if (payment.status === 'PENDING') {
        logs.push({
          action_type: 'PAYMENT',
          action: 'Chờ thanh toán',
          time: payment.created_at,
          user: 'Hệ thống',
          department: 'Hệ thống',
          change_details: `Trạng thái: → PENDING, Phương thức: ${payment.method || 'N/A'}`,
          note: 'Payment đang chờ thanh toán',
          ip_address: '192.168.1.2',
          payment_id: paymentId,
          old_status: null,
          new_status: 'PENDING',
          amount: payment.amount_due
        });
      }

      // SUCCESS status
      if (payment.status === 'SUCCESS') {
        // Tính thời gian success (thường là sau khi created, nhưng trước updated)
        let successTime: Date;
        if (payment.updated_at && payment.updated_at !== payment.created_at) {
          successTime = new Date(payment.updated_at);
        } else {
          // Nếu updated_at = created_at, ước tính thời gian success sau created một chút
          successTime = new Date(paymentCreatedTime.getTime() + 60000); // 1 phút sau
        }

        logs.push({
          action_type: 'PAYMENT',
          action: 'Thanh toán thành công',
          time: successTime,
          user: payment.method === 'CASH' || payment.method === 'BANK_TRANSFER' ? 'Admin' : 'Hệ thống',
          department: payment.method === 'CASH' || payment.method === 'BANK_TRANSFER' ? 'Quản lý' : 'Hệ thống',
          change_details: `Trạng thái: PENDING → SUCCESS, Phương thức: ${payment.method || 'N/A'}, Số tiền: ${parseFloat(payment.amount_paid || payment.amount_due || 0).toLocaleString('vi-VN')} VND`,
          note: payment.method === 'CASH' || payment.method === 'BANK_TRANSFER' 
            ? 'Admin xác nhận thanh toán thủ công' 
            : 'Thanh toán thành công qua gateway',
          ip_address: '192.168.1.3',
          payment_id: paymentId,
          old_status: 'PENDING',
          new_status: 'SUCCESS',
          amount: payment.amount_paid || payment.amount_due
        });

        // Nếu booking status là PENDING_CONFIRMATION sau khi payment success
        if (payment.booking_status === 'PENDING_CONFIRMATION') {
          logs.push({
            action_type: 'UPDATE',
            action: 'Cập nhật booking',
            time: new Date(successTime.getTime() + 1000), // Ngay sau payment success
            user: 'Hệ thống',
            department: 'Hệ thống',
            change_details: 'Booking status: → PENDING_CONFIRMATION',
            note: 'Payment thành công, booking chờ xác nhận',
            ip_address: '192.168.1.4',
            payment_id: paymentId,
            old_status: null,
            new_status: 'PENDING_CONFIRMATION',
            amount: null
          });
        }
      }

      // FAILED status
      if (payment.status === 'FAILED') {
        let failedTime: Date;
        if (payment.updated_at && payment.updated_at !== payment.created_at) {
          failedTime = new Date(payment.updated_at);
        } else {
          failedTime = new Date(paymentCreatedTime.getTime() + 120000); // 2 phút sau
        }

        logs.push({
          action_type: 'PAYMENT',
          action: 'Thanh toán thất bại',
          time: failedTime,
          user: 'Hệ thống',
          department: 'Hệ thống',
          change_details: `Trạng thái: PENDING → FAILED, Phương thức: ${payment.method || 'N/A'}`,
          note: 'Thanh toán không thành công',
          ip_address: '192.168.1.5',
          payment_id: paymentId,
          old_status: 'PENDING',
          new_status: 'FAILED',
          amount: payment.amount_due
        });

        // Nếu booking bị cancelled do payment failed
        if (payment.booking_status === 'CANCELLED') {
          logs.push({
            action_type: 'CANCEL',
            action: 'Hủy booking',
            time: new Date(failedTime.getTime() + 60000), // 1 phút sau payment failed
            user: 'Hệ thống',
            department: 'Hệ thống',
            change_details: 'Booking status: → CANCELLED',
            note: 'Booking bị hủy do thanh toán thất bại',
            ip_address: '192.168.1.6',
            payment_id: paymentId,
            old_status: null,
            new_status: 'CANCELLED',
            amount: null
          });
        }
      }

      // REFUNDED status
      if (payment.status === 'REFUNDED') {
        let refundedTime: Date;
        if (payment.updated_at && payment.updated_at !== payment.created_at) {
          refundedTime = new Date(payment.updated_at);
        } else {
          // Nếu chưa có updated_at, ước tính thời gian refund
          refundedTime = new Date(paymentUpdatedTime.getTime() + 3600000); // 1 giờ sau updated
        }

        logs.push({
          action_type: 'REFUND',
          action: 'Hoàn tiền',
          time: refundedTime,
          user: 'Admin',
          department: 'Quản lý',
          change_details: `Trạng thái: SUCCESS → REFUNDED, Số tiền hoàn: ${parseFloat(payment.amount_paid || payment.amount_due || 0).toLocaleString('vi-VN')} VND`,
          note: 'Admin thực hiện hoàn tiền',
          ip_address: '192.168.1.7',
          payment_id: paymentId,
          old_status: 'SUCCESS',
          new_status: 'REFUNDED',
          amount: payment.amount_paid || payment.amount_due
        });

        // Nếu booking bị cancelled do refund
        if (payment.booking_status === 'CANCELLED') {
          logs.push({
            action_type: 'CANCEL',
            action: 'Hủy booking',
            time: new Date(refundedTime.getTime() + 1000), // Ngay sau refund
            user: 'Admin',
            department: 'Quản lý',
            change_details: 'Booking status: → CANCELLED',
            note: 'Booking bị hủy do hoàn tiền',
            ip_address: '192.168.1.8',
            payment_id: paymentId,
            old_status: null,
            new_status: 'CANCELLED',
            amount: null
          });
        }
      }

      // Sort by time để đảm bảo thứ tự đúng
      logs.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        // Nếu cùng thời gian, sắp xếp theo thứ tự ưu tiên
        const priority: Record<string, number> = {
          'CREATE': 1,
          'PAYMENT': 2,
          'UPDATE': 3,
          'REFUND': 4,
          'CANCEL': 5
        };
        return (priority[a.action_type] || 99) - (priority[b.action_type] || 99);
      });

      // Đảm bảo time là ISO string
      return logs.map((log: any) => ({
        ...log,
        time: log.time instanceof Date ? log.time.toISOString() : (log.time || new Date().toISOString()),
        admin_name: log.user || log.admin_name || "Hệ thống",
        admin_id: log.admin_id || null,
        user: log.user || log.admin_name || "Hệ thống",
      }));
    } finally {
      conn.release();
    }
  }

  // Lấy dashboard stats
  async getDashboardStats(): Promise<any> {
    const conn = await pool.getConnection();
    try {
      // Total revenue (SUCCESS payments)
      const [totalRevenue]: any = await conn.query(
        `
        SELECT COALESCE(SUM(amount_paid), 0) as total_revenue
        FROM payment
        WHERE status = 'SUCCESS'
      `
      );

      // Today revenue
      const [todayRevenue]: any = await conn.query(
        `
        SELECT COALESCE(SUM(amount_paid), 0) as today_revenue
        FROM payment
        WHERE status = 'SUCCESS'
        AND DATE(created_at) = CURDATE()
      `
      );

      // Monthly revenue
      const [monthlyRevenue]: any = await conn.query(
        `
        SELECT COALESCE(SUM(amount_paid), 0) as monthly_revenue
        FROM payment
        WHERE status = 'SUCCESS'
        AND YEAR(created_at) = YEAR(CURDATE())
        AND MONTH(created_at) = MONTH(CURDATE())
      `
      );

      // Total transactions
      const [totalTransactions]: any = await conn.query(
        `
        SELECT COUNT(*) as total_transactions
        FROM payment
      `
      );

      // Failed transactions
      const [failedTransactions]: any = await conn.query(
        `
        SELECT COUNT(*) as failed_transactions
        FROM payment
        WHERE status = 'FAILED'
      `
      );

      // Refunded transactions
      const [refundedTransactions]: any = await conn.query(
        `
        SELECT COUNT(*) as refunded_transactions
        FROM payment
        WHERE status = 'REFUNDED'
      `
      );

      // Revenue by month (last 12 months)
      const [revenueByMonth]: any = await conn.query(
        `
        SELECT
          DATE_FORMAT(created_at, '%Y-%m') as month,
          DATE_FORMAT(created_at, '%m') as month_num,
          COALESCE(SUM(amount_paid), 0) as revenue
        FROM payment
        WHERE status = 'SUCCESS'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%m')
        ORDER BY DATE_FORMAT(created_at, '%Y-%m') ASC
      `
      );

      // Payment methods breakdown
      const [paymentMethods]: any = await conn.query(
        `
        SELECT
          method,
          COUNT(*) as count,
          COALESCE(SUM(amount_paid), 0) as revenue
        FROM payment
        WHERE status = 'SUCCESS'
        GROUP BY method
      `
      );

      // Revenue trend (last 30 days)
      const [revenueTrend]: any = await conn.query(
        `
        SELECT
          DATE(created_at) as date,
          COALESCE(SUM(amount_paid), 0) as revenue
        FROM payment
        WHERE status = 'SUCCESS'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `
      );

      // Top customers
      const [topCustomers]: any = await conn.query(
        `
        SELECT
          a.account_id,
          a.full_name,
          COALESCE(SUM(p.amount_paid), 0) as total_spent
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        WHERE p.status = 'SUCCESS'
        GROUP BY a.account_id, a.full_name
        ORDER BY total_spent DESC
        LIMIT 5
      `
      );

      // Top hotels
      const [topHotels]: any = await conn.query(
        `
        SELECT
          h.hotel_id,
          h.name as hotel_name,
          COALESCE(SUM(p.amount_paid), 0) as revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        WHERE p.status = 'SUCCESS'
        GROUP BY h.hotel_id, h.name
        ORDER BY revenue DESC
        LIMIT 5
      `
      );

      // Recent payments
      const [recentPayments]: any = await conn.query(
        `
        SELECT
          p.payment_id,
          p.booking_id,
          p.method,
          p.amount_paid as amount,
          p.status,
          p.created_at
        FROM payment p
        ORDER BY p.created_at DESC
        LIMIT 5
      `
      );

      // Calculate payment methods percentage
      const totalMethodRevenue = paymentMethods.reduce(
        (sum: number, method: any) => sum + Number(method.revenue || 0),
        0
      );
      const paymentMethodsWithPercentage = paymentMethods.map((method: any) => ({
        method: method.method,
        count: method.count,
        revenue: Number(method.revenue || 0),
        percentage:
          totalMethodRevenue > 0
            ? ((Number(method.revenue || 0) / totalMethodRevenue) * 100).toFixed(1)
            : 0,
      }));

      return {
        totalRevenue: Number(totalRevenue[0]?.total_revenue || 0),
        todayRevenue: Number(todayRevenue[0]?.today_revenue || 0),
        monthlyRevenue: Number(monthlyRevenue[0]?.monthly_revenue || 0),
        totalTransactions: Number(totalTransactions[0]?.total_transactions || 0),
        failedTransactions: Number(failedTransactions[0]?.failed_transactions || 0),
        refundedTransactions: Number(refundedTransactions[0]?.refunded_transactions || 0),
        revenueByMonth: revenueByMonth || [],
        paymentMethods: paymentMethodsWithPercentage || [],
        revenueTrend: revenueTrend || [],
        topCustomers: topCustomers || [],
        topHotels: topHotels || [],
        recentPayments: recentPayments || [],
      };
    } finally {
      conn.release();
    }
  }

  // Lấy failed payments
  async getFailedPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ payments: any[]; total: number }> {
    return this.getAllPayments({
      ...params,
      status: "FAILED",
    });
  }

  // Lấy manual payments (CASH/BANK_TRANSFER với status PENDING)
  async getManualPayments(params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ payments: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [
      `p.method IN ('CASH', 'BANK_TRANSFER')`,
      `p.status = 'PENDING'`,
    ];
    let queryParams: any[] = [];

    // Search
    if (params.search) {
      whereConditions.push(
        `(p.payment_id LIKE ? OR p.booking_id LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const conn = await pool.getConnection();
    try {
      // Get total count
      const [countRows]: any = await conn.query(
        `
        SELECT COUNT(DISTINCT p.payment_id) as total
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        ${whereClause}
      `,
        queryParams
      );
      const total = countRows[0]?.total || 0;

      // Get payments
      const [payments]: any = await conn.query(
        `
        SELECT
          p.payment_id,
          p.booking_id,
          p.method as payment_method,
          p.status,
          p.amount_due,
          p.amount_paid,
          p.created_at,
          a.full_name as customer_name,
          a.email as customer_email,
          h.name as hotel_name
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [...queryParams, limit, offset]
      );

      return {
        payments: payments || [],
        total,
      };
    } finally {
      conn.release();
    }
  }


  // Lấy payment reports
  async getPaymentReports(params: {
    period?: "7days" | "month" | "quarter" | "year";
    paymentMethod?: PaymentMethod | string;
    hotelId?: string;
  }): Promise<any> {
    const conn = await pool.getConnection();
    try {
      // Build filter conditions and params
      const baseParams: any[] = [];
      let methodCondition = "";
      let hotelCondition = "";

      // Filter by payment method
      if (params.paymentMethod) {
        methodCondition = "AND p.method = ?";
        baseParams.push(params.paymentMethod);
      }

      // Filter by hotel
      if (params.hotelId) {
        hotelCondition = "AND b.hotel_id = ?";
        baseParams.push(params.hotelId);
      }

      // Calculate date range based on period
      let dateCondition = "";
      switch (params.period) {
        case "7days":
          dateCondition = "AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
          break;
        case "month":
          dateCondition =
            "AND YEAR(p.created_at) = YEAR(CURDATE()) AND MONTH(p.created_at) = MONTH(CURDATE())";
          break;
        case "quarter":
          dateCondition =
            "AND YEAR(p.created_at) = YEAR(CURDATE()) AND QUARTER(p.created_at) = QUARTER(CURDATE())";
          break;
        case "year":
          dateCondition = "AND YEAR(p.created_at) = YEAR(CURDATE())";
          break;
        default:
          dateCondition = "AND YEAR(p.created_at) = YEAR(CURDATE()) AND MONTH(p.created_at) = MONTH(CURDATE())";
      }

      // Total revenue
      const [totalRevenue]: any = await conn.query(
        `
        SELECT COALESCE(SUM(p.amount_paid), 0) as total_revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateCondition}
        ${methodCondition}
        ${hotelCondition}
      `,
        baseParams
      );

      // Today revenue
      const [todayRevenue]: any = await conn.query(
        `
        SELECT COALESCE(SUM(p.amount_paid), 0) as today_revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'SUCCESS'
        AND DATE(p.created_at) = CURDATE()
        ${methodCondition}
        ${hotelCondition}
      `,
        baseParams
      );

      // Monthly revenue
      const [monthlyRevenue]: any = await conn.query(
        `
        SELECT COALESCE(SUM(p.amount_paid), 0) as monthly_revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'SUCCESS'
        AND YEAR(p.created_at) = YEAR(CURDATE())
        AND MONTH(p.created_at) = MONTH(CURDATE())
        ${methodCondition}
        ${hotelCondition}
      `,
        baseParams
      );

      // Success rate and failure rate
      const [stats]: any = await conn.query(
        `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN p.status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
          SUM(CASE WHEN p.status = 'FAILED' THEN 1 ELSE 0 END) as failed_count
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE 1=1
        ${dateCondition}
        ${methodCondition}
        ${hotelCondition}
      `,
        baseParams
      );

      const total = Number(stats[0]?.total || 0);
      const successCount = Number(stats[0]?.success_count || 0);
      const failedCount = Number(stats[0]?.failed_count || 0);
      const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) : 0;
      const failureRate = total > 0 ? ((failedCount / total) * 100).toFixed(1) : 0;

      // Refund count and amount
      const [refundStats]: any = await conn.query(
        `
        SELECT
          COUNT(*) as refund_count,
          COALESCE(SUM(p.amount_paid), 0) as refund_amount
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'REFUNDED'
        ${dateCondition}
        ${methodCondition}
        ${hotelCondition}
      `,
        baseParams
      );

      // Payment methods breakdown (không filter theo paymentMethod vì đây là breakdown)
      const paymentMethodParams = params.hotelId ? [params.hotelId] : [];
      const [paymentMethods]: any = await conn.query(
        `
        SELECT
          p.method,
          COUNT(*) as count,
          COALESCE(SUM(p.amount_paid), 0) as revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'SUCCESS'
        ${dateCondition}
        ${hotelCondition}
        GROUP BY p.method
      `,
        paymentMethodParams
      );

      // Revenue by day (last 30 days) - không dùng period filter
      const [revenueByDay]: any = await conn.query(
        `
        SELECT
          DATE(p.created_at) as date,
          COALESCE(SUM(p.amount_paid), 0) as revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'SUCCESS'
        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ${methodCondition}
        ${hotelCondition}
        GROUP BY DATE(p.created_at)
        ORDER BY DATE(p.created_at) ASC
      `,
        baseParams
      );

      // Revenue by month (last 12 months) - không dùng period filter
      const [revenueByMonth]: any = await conn.query(
        `
        SELECT
          DATE_FORMAT(p.created_at, '%Y-%m') as month,
          DATE_FORMAT(p.created_at, '%m') as month_num,
          COALESCE(SUM(p.amount_paid), 0) as revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.status = 'SUCCESS'
        AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        ${methodCondition}
        ${hotelCondition}
        GROUP BY DATE_FORMAT(p.created_at, '%Y-%m'), DATE_FORMAT(p.created_at, '%m')
        ORDER BY DATE_FORMAT(p.created_at, '%Y-%m') ASC
      `,
        baseParams
      );

      // Failure rate trend (last 30 days) - không dùng period filter
      const [failureRateTrend]: any = await conn.query(
        `
        SELECT
          DATE(p.created_at) as date,
          COUNT(*) as total,
          SUM(CASE WHEN p.status = 'FAILED' THEN 1 ELSE 0 END) as failed_count
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        ${methodCondition}
        ${hotelCondition}
        GROUP BY DATE(p.created_at)
        ORDER BY DATE(p.created_at) ASC
      `,
        baseParams
      );

      const failureRateTrendData = failureRateTrend.map((item: any) => {
        const total = Number(item.total || 0);
        const failedCount = Number(item.failed_count || 0);
        const rate = total > 0 ? ((failedCount / total) * 100).toFixed(1) : 0;
        return {
          date: item.date,
          rate: Number(rate),
        };
      });

      // Revenue by hotel (không filter theo hotelId vì đây là breakdown)
      const revenueByHotelParams = params.paymentMethod ? [params.paymentMethod] : [];
      const [revenueByHotel]: any = await conn.query(
        `
        SELECT
          h.hotel_id,
          h.name as hotel_name,
          COALESCE(SUM(p.amount_paid), 0) as revenue
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        WHERE p.status = 'SUCCESS'
        ${dateCondition}
        ${methodCondition}
        GROUP BY h.hotel_id, h.name
        ORDER BY revenue DESC
        LIMIT 10
      `,
        revenueByHotelParams
      );

      // Top customers
      const [topCustomers]: any = await conn.query(
        `
        SELECT
          a.account_id,
          a.full_name,
          COALESCE(SUM(p.amount_paid), 0) as total_spent
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        WHERE p.status = 'SUCCESS'
        ${dateCondition}
        ${methodCondition}
        ${hotelCondition}
        GROUP BY a.account_id, a.full_name
        ORDER BY total_spent DESC
        LIMIT 10
      `,
        baseParams
      );

      // Calculate payment methods percentage
      const totalMethodRevenue = paymentMethods.reduce(
        (sum: number, method: any) => sum + Number(method.revenue || 0),
        0
      );
      const paymentMethodsWithPercentage = paymentMethods.map((method: any) => ({
        method: method.method,
        count: method.count,
        revenue: Number(method.revenue || 0),
        percentage:
          totalMethodRevenue > 0
            ? ((Number(method.revenue || 0) / totalMethodRevenue) * 100).toFixed(1)
            : 0,
      }));

      return {
        totalRevenue: Number(totalRevenue[0]?.total_revenue || 0),
        todayRevenue: Number(todayRevenue[0]?.today_revenue || 0),
        monthlyRevenue: Number(monthlyRevenue[0]?.monthly_revenue || 0),
        successRate: Number(successRate),
        failureRate: Number(failureRate),
        refundCount: Number(refundStats[0]?.refund_count || 0),
        refundAmount: Number(refundStats[0]?.refund_amount || 0),
        paymentMethods: paymentMethodsWithPercentage || [],
        revenueByDay: revenueByDay || [],
        revenueByMonth: revenueByMonth || [],
        failureRateTrend: failureRateTrendData || [],
        revenueByHotel: revenueByHotel || [],
        topCustomers: topCustomers || [],
      };
    } finally {
      conn.release();
    }
  }

  // Lấy refunds (từ payment với status = REFUNDED hoặc từ bảng refund nếu có)
  async getRefunds(params: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: PaymentMethod | string;
    status?: "PENDING" | "COMPLETED" | "FAILED" | string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ refunds: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [`p.status = 'REFUNDED'`];
    let queryParams: any[] = [];

    // Search
    if (params.search) {
      whereConditions.push(
        `(p.payment_id LIKE ? OR p.booking_id LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filter by payment method
    if (params.paymentMethod) {
      whereConditions.push(`p.method = ?`);
      queryParams.push(params.paymentMethod);
    }

    // Filter by date range
    if (params.dateFrom) {
      whereConditions.push(`DATE(p.updated_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(p.updated_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    const conn = await pool.getConnection();
    try {
      // Get total count
      const [countRows]: any = await conn.query(
        `
        SELECT COUNT(DISTINCT p.payment_id) as total
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        ${whereClause}
      `,
        queryParams
      );
      const total = countRows[0]?.total || 0;

      // Get refunds (payment với status = REFUNDED)
      const [refundRows]: any = await conn.query(
        `
        SELECT
          p.payment_id as refund_id,
          p.payment_id,
          p.booking_id,
          p.amount_paid as amount,
          p.method as payment_method,
          p.updated_at as refund_date,
          'COMPLETED' as status,
          a.full_name as customer_name,
          a.email as customer_email,
          h.name as hotel_name,
          'Admin' as admin_name,
          'Hoàn tiền' as reason
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        LEFT JOIN hotel h ON h.hotel_id = b.hotel_id
        ${whereClause}
        ORDER BY p.updated_at DESC
        LIMIT ? OFFSET ?
      `,
        [...queryParams, limit, offset]
      );
      const refunds = refundRows || [];

      return {
        refunds: refunds || [],
        total,
      };
    } finally {
      conn.release();
    }
  }

  // Lấy payment activity logs (tạo từ dữ liệu có sẵn)
  async getPaymentActivityLogs(params: {
    page?: number;
    limit?: number;
    search?: string;
    adminId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ logs: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search
    if (params.search) {
      whereConditions.push(
        `(p.payment_id LIKE ? OR a.full_name LIKE ? OR a.email LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by date range
    if (params.dateFrom) {
      whereConditions.push(`DATE(p.created_at) >= ?`);
      queryParams.push(params.dateFrom);
    }
    if (params.dateTo) {
      whereConditions.push(`DATE(p.created_at) <= ?`);
      queryParams.push(params.dateTo);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const conn = await pool.getConnection();
    try {
      // Lấy danh sách payment IDs
      const [paymentRows]: any = await conn.query(
        `
        SELECT DISTINCT p.payment_id
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `,
        [...queryParams, limit, (page - 1) * limit]
      );

      // Lấy activity logs cho từng payment
      const allLogs: any[] = [];
      for (const row of paymentRows) {
        const logs = await this.getPaymentActivityHistory(row.payment_id);
        allLogs.push(...logs);
      }

      // Filter by action nếu có
      let filteredLogs = allLogs;
      if (params.action) {
        filteredLogs = filteredLogs.filter((log) => 
          log.action.toLowerCase().includes(params.action!.toLowerCase())
        );
      }

      // Filter by adminId (admin_name) nếu có
      if (params.adminId) {
        const [adminRows]: any = await conn.query(
          `SELECT full_name FROM account WHERE account_id = ?`,
          [params.adminId]
        );
        if (adminRows.length > 0) {
          const adminName = adminRows[0].full_name;
          filteredLogs = filteredLogs.filter((log) => 
            log.user === adminName || log.admin_name === adminName
          );
        }
      }

      // Sort by time DESC
      filteredLogs.sort((a, b) => {
        const timeA = new Date(a.time).getTime();
        const timeB = new Date(b.time).getTime();
        return timeB - timeA;
      });

      // Get total count (ước tính từ số payment)
      const [countRows]: any = await conn.query(
        `
        SELECT COUNT(DISTINCT p.payment_id) as total
        FROM payment p
        LEFT JOIN booking b ON b.booking_id = p.booking_id
        LEFT JOIN account a ON a.account_id = b.account_id
        ${whereClause}
      `,
        queryParams
      );
      const total = countRows[0]?.total || 0;

      // Limit và paginate logs
      const startIndex = 0;
      const endIndex = limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

      return {
        logs: paginatedLogs,
        total: total * 2, // Ước tính (mỗi payment có khoảng 2-3 logs)
      };
    } finally {
      conn.release();
    }
  }
}

