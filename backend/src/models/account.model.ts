export interface Account {
  account_id: string;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  phone_number?: string | null;

  status: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
  role: "ADMIN" | "STAFF" | "USER";

  created_at: Date;
  updated_at: Date;

  is_verified: boolean;
  verify_token?: string | null;
  verify_expires_at?: Date | null;

  last_verification_email_at?: Date | null;
  resend_count: number;                  
  last_resend_reset_at?: Date | null;

  // forgot/reset password
  reset_token?: string | null;
  reset_expires_at?: Date | null;

  // change password (logged-in)
  last_password_change_at?: Date | null;
  pwd_change_count: number;            
  last_pwd_change_reset_at?: Date | null;
}
