import pool from "../../config/db";
import { Account } from "../../models/Auth/account.model";

export class AccountRepository {
  // Hàm đếm số lượng email tồn tại
  async countByEmail(email: string): Promise<number> {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE email = ?",
      [email]
    );
    return rows[0]?.count || 0;
  }

  // ✅ Whitelist allowed columns để prevent SQL injection
  private readonly ALLOWED_ACCOUNT_FIELDS = [
    'account_id',
    'full_name',
    'email',
    'password_hash',
    'phone_number',
    'status',
    'role',
    'is_verified',
    'provider',
    'provider_id',
    'avatar_url',
    'verify_token',
    'verify_expires_at',
    'reset_token',
    'reset_expires_at',
    'resend_count',
    'last_resend_reset_at',
    'last_verification_email_at',
    'package_id'
  ];

  // Hàm tạo mới tài khoản
  async create(account: Partial<Account>): Promise<void> {
    // ✅ Filter chỉ các fields được phép để prevent SQL injection
    const allowedKeys = Object.keys(account).filter(key => 
      this.ALLOWED_ACCOUNT_FIELDS.includes(key)
    );
    
    if (allowedKeys.length === 0) {
      throw new Error('No valid account fields provided');
    }

    const values = allowedKeys.map(key => (account as any)[key]);
    const columns = allowedKeys.join(", ");
    const placeholders = allowedKeys.map(() => "?").join(", ");

    const sql = `INSERT INTO account (${columns}) VALUES (${placeholders})`;
    await pool.query(sql, values);
  }

  // Hàm tìm tài khoản theo email
  async findByEmail(email: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
      "SELECT * FROM account WHERE email = ? LIMIT 1",
      [email]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  // Hàm tìm tài khoản bằng verify_token
  async findByVerifyToken(token: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
      `SELECT * 
       FROM account 
       WHERE verify_token = ? 
         AND status = 'PENDING'
         AND (is_verified = FALSE OR is_verified IS NULL)
       LIMIT 1`,
      [token]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  // Hàm cập nhật tài khoản thành verified
  async markVerified(account_id: string): Promise<void> {
    await pool.query(
      `UPDATE account 
       SET is_verified = TRUE,
           verify_token = NULL,
           verify_expires_at = NULL,
           status = 'ACTIVE'
       WHERE account_id = ?`,
      [account_id]
    );
  }

  // Hàm cập nhật token xác minh mới (resend)
  async updateVerificationEmail(
    account_id: string,
    newToken: string
  ): Promise<void> {
    await pool.query(
      `UPDATE account
       SET verify_token = ?,
           verify_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE),
           last_verification_email_at = NOW(),
           resend_count = resend_count + 1,
           status = 'PENDING'
       WHERE account_id = ?`,
      [newToken, account_id]
    );
  }

  // Hàm lấy thông tin xác minh để giới hạn resend
  async getVerificationStats(email: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
      `SELECT account_id, full_name, is_verified, status,
              last_verification_email_at, resend_count, last_resend_reset_at
       FROM account
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  // Hàm reset lại giới hạn resend
  async resetResendLimit(account_id: string): Promise<void> {
    await pool.query(
      `UPDATE account 
       SET resend_count = 0, last_resend_reset_at = NOW()
       WHERE account_id = ?`,
      [account_id]
    );
  }

  // Hàm đếm số tài khoản tạo trong ngày hiện tại
  async countAccountsCreatedToday(): Promise<number> {
    const [rows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM account WHERE DATE(created_at) = CURDATE()"
    );
    return rows[0]?.count || 0;
  }

  // Hàm lấy email theo account_id
  async getEmailByAccountId(accountId: string): Promise<string | null> {
    const [rows]: any = await pool.query(
      "SELECT email FROM account WHERE account_id = ?",
      [accountId]
    );
    return rows?.[0]?.email || null;
  }

  // Hàm update provider info khi link tài khoản Google
  async updateProviderInfo(
    accountId: string,
    provider: string,
    providerId: string,
    isVerified: boolean
  ) {
    await pool.query(
      "UPDATE account SET provider=?, provider_id=?, is_verified=? WHERE account_id=?",
      [provider, providerId, isVerified, accountId]
    );
  }

  // Hàm tìm tài khoản theo account_id
  async findById(account_id: string): Promise<Account | null> {
    const [rows]: any = await pool.query(
        "SELECT * FROM account WHERE account_id = ? LIMIT 1",
        [account_id]
    );
    return rows.length > 0 ? (rows[0] as Account) : null;
  }

  // ✅ Hàm lấy tất cả accounts với pagination, search, filter
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: "ADMIN" | "STAFF" | "USER";
    status?: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
    provider?: "GOOGLE" | "FACEBOOK" | "LOCAL";
    is_verified?: boolean;
    sortBy?: "created_at" | "full_name" | "email";
    sortOrder?: "ASC" | "DESC";
  }): Promise<{ accounts: Account[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let queryParams: any[] = [];

    // Search by email, full_name, or account_id
    if (params.search) {
      whereConditions.push(
        `(email LIKE ? OR full_name LIKE ? OR account_id LIKE ?)`
      );
      const searchPattern = `%${params.search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by role
    if (params.role) {
      whereConditions.push(`role = ?`);
      queryParams.push(params.role);
    }

    // Filter by status
    if (params.status) {
      whereConditions.push(`status = ?`);
      queryParams.push(params.status);
    }

    // Filter by provider
    if (params.provider) {
      whereConditions.push(`provider = ?`);
      queryParams.push(params.provider);
    }

    // Filter by verified status
    if (params.is_verified !== undefined) {
      whereConditions.push(`is_verified = ?`);
      queryParams.push(params.is_verified ? 1 : 0);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Sort
    const sortBy = params.sortBy || "created_at";
    const sortOrder = params.sortOrder || "DESC";
    const orderBy = `ORDER BY ${sortBy} ${sortOrder}`;

    // Get total count
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM account ${whereClause}`,
      queryParams
    );
    const total = countRows[0]?.total || 0;

    // Get accounts
    const [rows]: any = await pool.query(
      `SELECT 
        account_id, full_name, email, phone_number, status, role, 
        created_at, updated_at, is_verified, provider, provider_id, avatar_url
       FROM account 
       ${whereClause}
       ${orderBy}
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return {
      accounts: rows.map((row: any) => ({
        ...row,
        is_verified: Boolean(row.is_verified === 1 || row.is_verified === true),
      })),
      total,
    };
  }

  // ✅ Hàm cập nhật account (sử dụng whitelist để prevent SQL injection)
  async update(accountId: string, updates: Partial<Account>): Promise<boolean> {
    const allowedFields = [
      "full_name",
      "email",
      "phone_number",
      "status",
      "role",
      "is_verified",
      "avatar_url",
    ];
    // ✅ Filter chỉ các fields được phép
    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      return false;
    }

    // ✅ Sử dụng whitelist để build SQL safely
    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map((field) => {
      const value = (updates as any)[field];
      // Convert boolean to 1/0 for MySQL
      if (field === "is_verified" && typeof value === "boolean") {
        return value ? 1 : 0;
      }
      return value;
    });

    await pool.query(
      `UPDATE account SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE account_id = ?`,
      [...values, accountId]
    );

    return true;
  }

  // ✅ Hàm soft delete account
  async softDelete(accountId: string): Promise<boolean> {
    await pool.query(
      `UPDATE account SET status = 'DELETED', updated_at = CURRENT_TIMESTAMP WHERE account_id = ?`,
      [accountId]
    );
    return true;
  }

  // ✅ Hàm force verify email
  async forceVerify(accountId: string): Promise<boolean> {
    await pool.query(
      `UPDATE account SET is_verified = TRUE, verify_token = NULL, verify_expires_at = NULL, status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE account_id = ?`,
      [accountId]
    );
    return true;
  }

  // ✅ Hàm reset password (set password_hash mới)
  async resetPassword(accountId: string, passwordHash: string): Promise<boolean> {
    await pool.query(
      `UPDATE account SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE account_id = ?`,
      [passwordHash, accountId]
    );
    return true;
  }
}
