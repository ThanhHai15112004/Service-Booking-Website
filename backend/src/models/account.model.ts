export interface Account {
  account_id: string;
  full_name: string;
  username: string;
  email: string;
  password_hash: string;
  phone_number?: string | null;
  status: 'ACTIVE' | 'PENDING' | 'BANNED' | 'DELETED';
  role: 'ADMIN' | 'STAFF' | 'USER';
  created_at: Date;
  updated_at: Date;
  is_verified: boolean;
  verify_token?: string | null;
  verify_expires_at?: Date | null;
}
