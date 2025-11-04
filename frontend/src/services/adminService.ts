import api from "../api/axiosClient";

export interface Account {
  account_id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  status: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
  role: "ADMIN" | "STAFF" | "USER";
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  provider?: "GOOGLE" | "FACEBOOK" | "LOCAL";
  provider_id?: string | null;
  avatar_url?: string | null;
}

export interface GetAccountsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "STAFF" | "USER";
  status?: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
  provider?: "GOOGLE" | "FACEBOOK" | "LOCAL";
  is_verified?: boolean;
  sortBy?: "created_at" | "full_name" | "email";
  sortOrder?: "ASC" | "DESC";
}

export interface GetAccountsResponse {
  success: boolean;
  data: {
    accounts: Account[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AccountDetailResponse {
  success: boolean;
  data: Account;
}

export interface UpdateAccountData {
  full_name?: string;
  email?: string;
  phone_number?: string;
  status?: "ACTIVE" | "PENDING" | "BANNED" | "DELETED";
  role?: "ADMIN" | "STAFF" | "USER";
  is_verified?: boolean;
}

export interface CreateUserAccountData {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  avatar_url?: string;
}

export const adminService = {
  // Lấy danh sách accounts
  getAccounts: async (params: GetAccountsParams): Promise<GetAccountsResponse> => {
    const response = await api.get("/api/admin/accounts", { params });
    return response.data;
  },

  // Lấy chi tiết account
  getAccountDetail: async (accountId: string): Promise<AccountDetailResponse> => {
    const response = await api.get(`/api/admin/accounts/${accountId}`);
    return response.data;
  },

  // Cập nhật account
  updateAccount: async (
    accountId: string,
    data: UpdateAccountData
  ): Promise<{ success: boolean; message: string; data: Account }> => {
    const response = await api.put(`/api/admin/accounts/${accountId}`, data);
    return response.data;
  },

  // Xóa account (soft delete)
  deleteAccount: async (accountId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/admin/accounts/${accountId}`);
    return response.data;
  },

  // Force verify email
  forceVerifyEmail: async (accountId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/api/admin/accounts/${accountId}/verify`);
    return response.data;
  },

  // Reset password
  resetPassword: async (
    accountId: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/api/admin/accounts/${accountId}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  // Tạo tài khoản User
  createUserAccount: async (
    data: CreateUserAccountData
  ): Promise<{ success: boolean; message: string; data: Account }> => {
    const response = await api.post("/api/admin/accounts/user/create", data);
    return response.data;
  },

      // Tạo tài khoản Admin/Staff
      createAdminAccount: async (data: {
        full_name: string;
        email: string;
        password: string;
        phone_number?: string;
        role?: "ADMIN" | "STAFF";
        avatar_url?: string;
      }): Promise<{ success: boolean; message: string; data: Account }> => {
        const response = await api.post("/api/admin/accounts/create", data);
        return response.data;
      },

  // Dashboard Stats
  getDashboardStats: async (): Promise<{
    success: boolean;
    data: {
      stats: {
        totalAccounts: number;
        totalStaffAdmin: number;
        verifiedEmails: number;
        bannedAccounts: number;
      };
      monthlyRegistrations: Array<{ month: string; count: number }>;
      roleDistribution: Array<{ role: string; count: number }>;
      recentRegistrations: Array<{
        account_id: string;
        full_name: string;
        email: string;
        created_at: string;
        avatar_url?: string | null;
      }>;
      recentLogins: Array<{
        account_id: string;
        full_name: string;
        email: string;
        avatar_url?: string | null;
        last_login: string;
      }>;
    };
  }> => {
    const response = await api.get("/api/admin/dashboard/stats");
    return response.data;
  },

  // Account Bookings
  getAccountBookings: async (
    accountId: string,
    params?: {
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      hotelName?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ success: boolean; data: any[]; total: number }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/bookings`, { params });
    return response.data;
  },

  getBookingDetail: async (bookingId: string): Promise<{ success: boolean; data: any }> => {
    const response = await api.get(`/api/admin/bookings/${bookingId}`);
    return response.data;
  },

  // Account Reviews
  getAccountReviews: async (
    accountId: string,
    params?: {
      hotelName?: string;
      rating?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ success: boolean; data: any[]; total: number }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/reviews`, { params });
    return response.data;
  },

  toggleReviewVisibility: async (
    reviewId: string,
    status: "ACTIVE" | "HIDDEN"
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/api/admin/reviews/${reviewId}/visibility`, { status });
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
  },

  // Account Addresses
  getAccountAddresses: async (accountId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/addresses`);
    return response.data;
  },

  createAddress: async (
    accountId: string,
    data: {
      name: string;
      phone: string;
      house_number?: string;
      street_name?: string;
      district?: string;
      city: string;
      country?: string;
      is_default?: boolean;
    }
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.post(`/api/admin/accounts/${accountId}/addresses`, data);
    return response.data;
  },

  updateAddress: async (
    accountId: string,
    addressId: string,
    data: {
      name?: string;
      phone?: string;
      house_number?: string;
      street_name?: string;
      district?: string;
      city?: string;
      country?: string;
      is_default?: boolean;
    }
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.put(`/api/admin/accounts/${accountId}/addresses/${addressId}`, data);
    return response.data;
  },

  deleteAddress: async (
    accountId: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/admin/accounts/${accountId}/addresses/${addressId}`);
    return response.data;
  },

  setDefaultAddress: async (
    accountId: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/api/admin/accounts/${accountId}/addresses/${addressId}/set-default`);
    return response.data;
  },

  // Account Packages & Payments
  getAccountPackages: async (accountId: string): Promise<{
    success: boolean;
    data: {
      currentPackage: any;
      currentSubscription: any;
    };
  }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/packages`);
    return response.data;
  },

  getAccountSubscriptions: async (accountId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/subscriptions`);
    return response.data;
  },

  getAccountPaymentCards: async (accountId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/payment-cards`);
    return response.data;
  },

  getAccountPayments: async (
    accountId: string,
    params?: {
      status?: string;
      method?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ success: boolean; data: any[]; total: number }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/payments`, { params });
    return response.data;
  },

  // Account Activity
  getAccountActivityStats: async (accountId: string): Promise<{
    success: boolean;
    data: {
      totalBookings: number;
      totalSpent: number;
      totalReviews: number;
      averageBookingValue: number;
      lastLogin: string | null;
      loginIP: string;
      loginDevice: string;
      bookingRate: number;
    };
  }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/activity/stats`);
    return response.data;
  },

  getAccountActivityChart: async (
    accountId: string,
    period: "7" | "30" | "90" = "30"
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/activity/chart`, {
      params: { period },
    });
    return response.data;
  },

  getAccountActivityHistory: async (
    accountId: string,
    params?: {
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ success: boolean; data: any[]; total: number }> => {
    const response = await api.get(`/api/admin/accounts/${accountId}/activity/history`, { params });
    return response.data;
  },
};
