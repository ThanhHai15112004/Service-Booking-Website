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

  // Hotel Management
  getHotels: async (params?: {
    search?: string;
    status?: string;
    category?: string;
    city?: string;
    starRating?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: {
      hotels: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await api.get("/api/admin/hotels", { params });
    return response.data;
  },

  getHotelDetail: async (hotelId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}`);
    return response.data;
  },

  updateHotel: async (
    hotelId: string,
    data: {
      name?: string;
      description?: string;
      category_id?: string;
      location_id?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      star_rating?: number;
      checkin_time?: string;
      checkout_time?: string;
      phone_number?: string;
      email?: string;
      website?: string;
      total_rooms?: number;
      main_image?: string;
    }
  ): Promise<{ success: boolean; message?: string; data?: any }> => {
    const response = await api.put(`/api/admin/hotels/${hotelId}`, data);
    return response.data;
  },

  updateHotelStatus: async (
    hotelId: string,
    status: "ACTIVE" | "INACTIVE" | "PENDING"
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put(`/api/admin/hotels/${hotelId}/status`, { status });
    return response.data;
  },

  deleteHotel: async (
    hotelId: string,
    hardDelete: boolean = false
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/hotels/${hotelId}`, {
      params: { hardDelete },
    });
    return response.data;
  },

  getHotelDashboardStats: async (): Promise<{
    success: boolean;
    data?: {
      totalHotels: number;
      activeHotels: number;
      inactiveHotels: number;
      pendingHotels: number;
      topRatedHotels: number;
      avgBookingsPerHotel: number;
      hotelsByCity: Array<{ city: string; count: number }>;
      hotelsByCategory: Array<{ category: string; count: number }>;
      bookingTrends: Array<{ month: string; bookings: number }>;
      topBookedHotels: Array<{
        hotel_id: string;
        name: string;
        booking_count: number;
        main_image?: string;
      }>;
      topRatedHotelsList: Array<{
        hotel_id: string;
        name: string;
        avg_rating: number;
        review_count: number;
        main_image?: string;
      }>;
    };
    message?: string;
  }> => {
    const response = await api.get("/api/admin/hotels/dashboard/stats");
    return response.data;
  },

  getHotelReports: async (params?: {
    period?: string;
    city?: string;
    category?: string;
  }): Promise<{
    success: boolean;
    data?: {
      summary: {
        totalBookings: number;
        totalRevenue: number;
        newReviews: number;
        avgRating: number;
      };
      hotelsDetail: Array<{
        hotel: string;
        bookings: number;
        reviews: number;
        avgRating: number;
        revenue: number;
      }>;
      revenueByHotel: Array<{
        hotel: string;
        revenue: number;
      }>;
      cancellationRate: Array<{
        hotel: string;
        rate: number;
      }>;
      topHotels: Array<{
        hotel: string;
        score: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await api.get("/api/admin/hotels/reports", { params });
    return response.data;
  },

  // ========== Categories APIs ==========
  getCategories: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get("/api/admin/categories");
    return response.data;
  },
  getCategoryById: async (categoryId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.get(`/api/admin/categories/${categoryId}`);
    return response.data;
  },
  createCategory: async (data: { category_id: string; name: string; description?: string; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.post("/api/admin/categories", data);
    return response.data;
  },
  updateCategory: async (categoryId: string, data: { name?: string; description?: string; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.put(`/api/admin/categories/${categoryId}`, data);
    return response.data;
  },
  deleteCategory: async (categoryId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/categories/${categoryId}`);
    return response.data;
  },

  // ========== Locations APIs ==========
  getLocations: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get("/api/admin/locations");
    return response.data;
  },
  getLocationById: async (locationId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.get(`/api/admin/locations/${locationId}`);
    return response.data;
  },
  createLocation: async (data: {
    location_id: string;
    country: string;
    city: string;
    district?: string;
    ward?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
    distance_center?: number;
    description?: string;
    is_hot?: boolean;
  }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.post("/api/admin/locations", data);
    return response.data;
  },
  updateLocation: async (locationId: string, data: {
    country?: string;
    city?: string;
    district?: string;
    ward?: string;
    area_name?: string;
    latitude?: number;
    longitude?: number;
    distance_center?: number;
    description?: string;
    is_hot?: boolean;
  }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.put(`/api/admin/locations/${locationId}`, data);
    return response.data;
  },
  deleteLocation: async (locationId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/locations/${locationId}`);
    return response.data;
  },

  // ========== Hotel Facilities APIs ==========
  getHotelFacilities: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}/facilities`);
    return response.data;
  },
  addHotelFacility: async (hotelId: string, facilityId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/api/admin/hotels/${hotelId}/facilities`, { facilityId });
    return response.data;
  },
  removeHotelFacility: async (hotelId: string, facilityId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/hotels/${hotelId}/facilities/${facilityId}`);
    return response.data;
  },

  // ========== Hotel Highlights APIs ==========
  getAllHighlights: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get("/api/admin/hotels/highlights/all");
    return response.data;
  },
  getHotelHighlights: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}/highlights`);
    return response.data;
  },
  addHotelHighlight: async (hotelId: string, data: { highlightId: string; customText?: string; sortOrder?: number }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/api/admin/hotels/${hotelId}/highlights`, data);
    return response.data;
  },
  updateHotelHighlight: async (hotelId: string, highlightId: string, data: { customText?: string; sortOrder?: number }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put(`/api/admin/hotels/${hotelId}/highlights/${highlightId}`, data);
    return response.data;
  },
  removeHotelHighlight: async (hotelId: string, highlightId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/hotels/${hotelId}/highlights/${highlightId}`);
    return response.data;
  },

  // ========== Hotel Policies APIs ==========
  getPolicyTypes: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get("/api/admin/hotels/policies/types");
    return response.data;
  },
  getHotelPolicies: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}/policies`);
    return response.data;
  },
  setHotelPolicy: async (hotelId: string, policyKey: string, value: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/api/admin/hotels/${hotelId}/policies`, { policyKey, value });
    return response.data;
  },
  removeHotelPolicy: async (hotelId: string, policyKey: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/hotels/${hotelId}/policies/${policyKey}`);
    return response.data;
  },

  // ========== Hotel Images APIs ==========
  getHotelImages: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}/images`);
    return response.data;
  },
  addHotelImage: async (hotelId: string, data: { imageUrl: string; sortOrder?: number; isPrimary?: boolean }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post(`/api/admin/hotels/${hotelId}/images`, data);
    return response.data;
  },
  deleteHotelImage: async (imageId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/api/admin/hotels/images/${imageId}`);
    return response.data;
  },

  // ========== Hotel Reviews APIs ==========
  getHotelReviews: async (
    hotelId: string,
    filters?: {
      rating?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data?: any[];
    total?: number;
    message?: string;
  }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}/reviews`, { params: filters });
    return response.data;
  },

  // ========== Hotel Statistics API ==========
  getHotelStatistics: async (hotelId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await api.get(`/api/admin/hotels/${hotelId}/statistics`);
    return response.data;
  },
};
