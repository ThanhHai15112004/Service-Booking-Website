import adminApi from "../api/adminAxiosClient";

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
    const response = await adminApi.get("/api/admin/accounts", { params });
    return response.data;
  },

  // Lấy chi tiết account
  getAccountDetail: async (accountId: string): Promise<AccountDetailResponse> => {
    const response = await adminApi.get(`/api/admin/accounts/${accountId}`);
    return response.data;
  },

  // Cập nhật account
  updateAccount: async (
    accountId: string,
    data: UpdateAccountData
  ): Promise<{ success: boolean; message: string; data: Account }> => {
    const response = await adminApi.put(`/api/admin/accounts/${accountId}`, data);
    return response.data;
  },

  // Xóa account (soft delete)
  deleteAccount: async (accountId: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.delete(`/api/admin/accounts/${accountId}`);
    return response.data;
  },

  // Force verify email
  forceVerifyEmail: async (accountId: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.post(`/api/admin/accounts/${accountId}/verify`);
    return response.data;
  },

  // Reset password
  resetPassword: async (
    accountId: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.post(`/api/admin/accounts/${accountId}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  // Tạo tài khoản User
  createUserAccount: async (
    data: CreateUserAccountData
  ): Promise<{ success: boolean; message: string; data: Account }> => {
    const response = await adminApi.post("/api/admin/accounts/user/create", data);
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
        const response = await adminApi.post("/api/admin/accounts/create", data);
        return response.data;
      },

  // Main Dashboard Stats (Comprehensive)
  getMainDashboardStats: async (): Promise<{
    success: boolean;
    data?: {
      bookings: {
        today: number;
        week: number;
        month: number;
        total: number;
      };
      revenue: {
        today: number;
        week: number;
        month: number;
        total: number;
      };
      newUsers: number;
      totalHotels: number;
      activeRooms: number;
      occupancyRate: number;
      cancellationRate: number;
      revenueByDate: Array<{ date: string; revenue: number }>;
      bookingsByStatus: Array<{ status: string; count: number; percentage: string | number }>;
      topBookedHotels: Array<{ hotel_id: string; hotel_name: string; bookings: number }>;
      newUsersTrend: Array<{ date: string; count: number }>;
      recentBookings: Array<{
        booking_id: string;
        customer_name: string;
        hotel_name: string;
        status: string;
        created_at: string;
      }>;
      upcomingCheckIns: Array<{
        booking_id: string;
        customer_name: string;
        hotel_name: string;
        check_in_date: string;
      }>;
      maintenanceRooms: Array<{
        room_id: string;
        room_number: string;
        hotel_name: string;
        room_type: string;
        maintenance_start: string;
      }>;
      pendingRequests: {
        newReviews: number;
        refunds: number;
        emailVerifications: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/dashboard/main/stats");
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
    const response = await adminApi.get("/api/admin/dashboard/stats");
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
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/bookings`, { params });
    return response.data;
  },

  getBookingDetail: async (bookingId: string): Promise<{ success: boolean; data: any }> => {
    const response = await adminApi.get(`/api/admin/bookings/${bookingId}`);
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
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/reviews`, { params });
    return response.data;
  },

  toggleReviewVisibility: async (
    reviewId: string,
    status: "ACTIVE" | "HIDDEN"
  ): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.put(`/api/admin/reviews/${reviewId}/visibility`, { status });
    return response.data;
  },

  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.delete(`/api/admin/reviews/${reviewId}`);
    return response.data;
  },

  // ========== Review Manager APIs ==========
  // Dashboard stats
  getReviewDashboardStats: async (): Promise<{
    success: boolean;
    data?: {
      totalReviews: number;
      monthlyNewReviews: number;
      averageRating: number;
      fiveStarRate: number;
      pendingReviews: number;
      reviewsByMonth: Array<{ month: string; count: number }>;
      ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
      averageRatingTrend: Array<{ date: string; rating: number }>;
      topRatedHotels: Array<{
        hotel_id: string;
        hotel_name: string;
        average_rating: number;
        review_count: number;
      }>;
      topComplainedHotels: Array<{
        hotel_id: string;
        hotel_name: string;
        low_rating_count: number;
        average_rating: number;
      }>;
      recentReviews: Array<{
        review_id: string;
        customer_name: string;
        hotel_name: string;
        rating: number;
        title: string;
        created_at: string;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reviews/dashboard");
    return response.data;
  },

  // Get reviews list (Review Manager)
  getReviewManagerReviews: async (params?: {
    search?: string;
    hotel_id?: string;
    rating?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    pendingOnly?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: any[];
    total?: number;
    page?: number;
    limit?: number;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reviews", { params });
    return response.data;
  },

  // Get review detail
  getReviewDetail: async (reviewId: string): Promise<{
    success: boolean;
    data?: {
      review_id: string;
      account_id: string;
      customer_name: string;
      customer_email: string;
      provider: string;
      customer_total_reviews: number;
      hotel_id: string;
      hotel_name: string;
      hotel_address: string;
      hotel_average_rating: number;
      overall_rating: number;
      location_rating: number | null;
      service_rating: number | null;
      facilities_rating: number | null;
      cleanliness_rating: number | null;
      value_rating: number | null;
      title: string | null;
      comment: string | null;
      status: string;
      created_at: string;
      updated_at: string | null;
      booking_id: string | null;
      reply?: {
        reply_id: string;
        reply_text: string;
        replied_by: string;
        replied_by_name: string;
        replied_at: string;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/reviews/${reviewId}`);
    return response.data;
  },

  // Update review status
  updateReviewStatus: async (
    reviewId: string,
    status: "ACTIVE" | "HIDDEN"
  ): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.put(`/api/admin/reviews/${reviewId}/status`, { status });
    return response.data;
  },

  // Create/Update reply
  createReviewReply: async (
    reviewId: string,
    reply_text: string
  ): Promise<{ success: boolean; message: string; data?: { reply_id: string } }> => {
    const response = await adminApi.post(`/api/admin/reviews/${reviewId}/reply`, { reply_text });
    return response.data;
  },

  // Get review activity log
  getReviewActivityLog: async (reviewId: string): Promise<{
    success: boolean;
    data?: Array<{
      id: number;
      date: string;
      action: string;
      admin_name: string;
      admin_id: string;
      note?: string;
      violation_type?: string;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/reviews/${reviewId}/activity-log`);
    return response.data;
  },

  // Get review reports
  getReviewReports: async (params?: {
    period?: string;
    city?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalReviews: number;
      averageRating: number;
      averageRatingByHotel: Array<{
        hotel_id: string;
        hotel_name: string;
        average_rating: number;
        review_count: number;
      }>;
      averageRatingByCity: Array<{
        city: string;
        average_rating: number;
        review_count: number;
      }>;
      ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
      reviewsByMonth: Array<{ month: string; count: number }>;
      positiveRate: number;
      negativeRate: number;
      topRatedHotels: Array<{
        hotel_id: string;
        hotel_name: string;
        average_rating: number;
        review_count: number;
      }>;
      topComplainedHotels: Array<{
        hotel_id: string;
        hotel_name: string;
        average_rating: number;
        low_rating_count: number;
      }>;
      ratingByCriteria: Array<{
        criteria: string;
        average_rating: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reviews/reports/stats", { params });
    return response.data;
  },

  // Get all activity logs
  getAllReviewActivityLogs: async (params?: {
    search?: string;
    admin?: string;
    action?: string;
    violationType?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: Array<{
      id: number | string;
      date: string;
      admin_name: string;
      admin_id: string;
      review_id: string;
      action: string;
      note?: string;
      violation_type?: string;
    }>;
    total?: number;
    page?: number;
    limit?: number;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reviews/activity-logs/all", { params });
    return response.data;
  },

  // Account Addresses
  getAccountAddresses: async (accountId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/addresses`);
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
    const response = await adminApi.post(`/api/admin/accounts/${accountId}/addresses`, data);
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
    const response = await adminApi.put(`/api/admin/accounts/${accountId}/addresses/${addressId}`, data);
    return response.data;
  },

  deleteAddress: async (
    accountId: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.delete(`/api/admin/accounts/${accountId}/addresses/${addressId}`);
    return response.data;
  },

  setDefaultAddress: async (
    accountId: string,
    addressId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await adminApi.post(`/api/admin/accounts/${accountId}/addresses/${addressId}/set-default`);
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
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/packages`);
    return response.data;
  },

  getAccountSubscriptions: async (accountId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/subscriptions`);
    return response.data;
  },

  getAccountPaymentCards: async (accountId: string): Promise<{ success: boolean; data: any[] }> => {
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/payment-cards`);
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
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/payments`, { params });
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
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/activity/stats`);
    return response.data;
  },

  getAccountActivityChart: async (
    accountId: string,
    period: "7" | "30" | "90" = "30"
  ): Promise<{ success: boolean; data: any[] }> => {
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/activity/chart`, {
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
    const response = await adminApi.get(`/api/admin/accounts/${accountId}/activity/history`, { params });
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
    const response = await adminApi.get("/api/admin/hotels", { params });
    return response.data;
  },

  createHotel: async (data: {
    hotel_id?: string;
    name: string;
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
    status?: string;
  }): Promise<{ success: boolean; data?: { hotel_id: string }; message?: string }> => {
    const response = await adminApi.post("/api/admin/hotels/create", data);
    return response.data;
  },

  getHotelDetail: async (hotelId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}`);
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
    const response = await adminApi.put(`/api/admin/hotels/${hotelId}`, data);
    return response.data;
  },

  updateHotelStatus: async (
    hotelId: string,
    status: "ACTIVE" | "INACTIVE" | "PENDING"
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/hotels/${hotelId}/status`, { status });
    return response.data;
  },

  deleteHotel: async (
    hotelId: string,
    hardDelete: boolean = false
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/hotels/${hotelId}`, {
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
    const response = await adminApi.get("/api/admin/hotels/dashboard/stats");
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
    const response = await adminApi.get("/api/admin/hotels/reports", { params });
    return response.data;
  },

  // ========== Categories APIs ==========
  getCategories: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get("/api/admin/categories");
    return response.data;
  },
  getCategoryById: async (categoryId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/categories/${categoryId}`);
    return response.data;
  },
  createCategory: async (data: { category_id: string; name: string; description?: string; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.post("/api/admin/categories", data);
    return response.data;
  },
  updateCategory: async (categoryId: string, data: { name?: string; description?: string; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.put(`/api/admin/categories/${categoryId}`, data);
    return response.data;
  },
  deleteCategory: async (categoryId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/categories/${categoryId}`);
    return response.data;
  },

  // ========== Locations APIs ==========
  getLocations: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get("/api/admin/locations");
    return response.data;
  },
  getLocationById: async (locationId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/locations/${locationId}`);
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
    const response = await adminApi.post("/api/admin/locations", data);
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
    const response = await adminApi.put(`/api/admin/locations/${locationId}`, data);
    return response.data;
  },
  deleteLocation: async (locationId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/locations/${locationId}`);
    return response.data;
  },

  // ========== Hotel Facilities APIs ==========
  getHotelFacilities: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/facilities`);
    return response.data;
  },
  addHotelFacility: async (hotelId: string, facilityId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/hotels/${hotelId}/facilities`, { facilityId });
    return response.data;
  },
  removeHotelFacility: async (hotelId: string, facilityId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/hotels/${hotelId}/facilities/${facilityId}`);
    return response.data;
  },

  // ========== Hotel Highlights APIs ==========
  getAllHighlights: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get("/api/admin/highlights");
    return response.data;
  },
  getHighlightById: async (highlightId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/highlights/${highlightId}`);
    return response.data;
  },
  createHighlight: async (data: { highlight_id: string; name: string; icon_url?: string; description?: string; category?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.post("/api/admin/highlights", data);
    return response.data;
  },
  updateHighlight: async (highlightId: string, data: { name?: string; icon_url?: string; description?: string; category?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.put(`/api/admin/highlights/${highlightId}`, data);
    return response.data;
  },
  deleteHighlight: async (highlightId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/highlights/${highlightId}`);
    return response.data;
  },
  getHotelHighlights: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/highlights`);
    return response.data;
  },
  addHotelHighlight: async (hotelId: string, data: { highlightId: string; customText?: string; sortOrder?: number }): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/hotels/${hotelId}/highlights`, data);
    return response.data;
  },
  updateHotelHighlight: async (hotelId: string, highlightId: string, data: { customText?: string; sortOrder?: number }): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/hotels/${hotelId}/highlights/${highlightId}`, data);
    return response.data;
  },
  removeHotelHighlight: async (hotelId: string, highlightId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/hotels/${hotelId}/highlights/${highlightId}`);
    return response.data;
  },

  // ========== Hotel Policies APIs ==========
  getPolicyTypes: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get("/api/admin/hotels/policies/types");
    return response.data;
  },
  getHotelPolicies: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/policies`);
    return response.data;
  },
  setHotelPolicy: async (hotelId: string, policyKey: string, value: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/hotels/${hotelId}/policies`, { policyKey, value });
    return response.data;
  },
  removeHotelPolicy: async (hotelId: string, policyKey: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/hotels/${hotelId}/policies/${policyKey}`);
    return response.data;
  },

  // ========== Hotel Images APIs ==========
  getHotelImages: async (hotelId: string): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/images`);
    return response.data;
  },
  addHotelImage: async (hotelId: string, data: { imageUrl: string; sortOrder?: number; isPrimary?: boolean }): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/hotels/${hotelId}/images`, data);
    return response.data;
  },
  deleteHotelImage: async (imageId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/hotels/images/${imageId}`);
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
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/reviews`, { params: filters });
    return response.data;
  },

  // ========== Hotel Statistics API ==========
  getHotelStatistics: async (hotelId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/statistics`);
    return response.data;
  },

  // ========== Hotel Bookings APIs ==========
  getHotelBookings: async (
    hotelId: string,
    filters?: {
      status?: string;
      accountId?: string;
      accountName?: string;
      accountEmail?: string;
      dateFrom?: string;
      dateTo?: string;
      checkinFrom?: string;
      checkinTo?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data?: {
      bookings: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/bookings`, { params: filters });
    return response.data;
  },

  getHotelBookingDetail: async (
    hotelId: string,
    bookingId: string
  ): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/bookings/${bookingId}`);
    return response.data;
  },

  updateHotelBookingStatus: async (
    hotelId: string,
    bookingId: string,
    status: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/hotels/${hotelId}/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  // ========== Room Types Management APIs ==========
  getRoomTypesByHotel: async (
    hotelId: string,
    params?: {
      search?: string;
      bedType?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data?: {
      roomTypes: Array<{
        room_type_id: string;
        hotel_id: string;
        hotel_name: string;
        name: string;
        description?: string | null;
        bed_type?: string | null;
        area?: number | null;
        image_url?: string | null;
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/hotels/${hotelId}/room-types/list`, { params });
    return response.data;
  },

  getRoomTypeById: async (roomTypeId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}`);
    return response.data;
  },

  createRoomType: async (data: {
    room_type_id: string;
    hotel_id: string;
    name: string;
    description?: string;
    bed_type?: string;
    area?: number;
    image_url?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post("/api/admin/rooms/room-types", data);
    return response.data;
  },

  updateRoomType: async (
    roomTypeId: string,
    data: {
      name?: string;
      description?: string;
      bed_type?: string;
      area?: number;
      image_url?: string;
    }
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}`, data);
    return response.data;
  },

  deleteRoomType: async (roomTypeId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/rooms/room-types/${roomTypeId}`);
    return response.data;
  },

  // ========== Rooms Management APIs ==========
  getRoomsByHotel: async (
    hotelId: string,
    params?: {
      roomTypeId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data?: {
      rooms: Array<{
        room_id: string;
        room_type_id: string;
        room_type_name: string;
        hotel_id: string;
        hotel_name: string;
        room_number?: string | null;
        capacity: number;
        image_url?: string | null;
        price_base?: number | null;
        status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/hotels/${hotelId}/rooms`, { params });
    return response.data;
  },

  getRoomsByRoomType: async (
    roomTypeId: string,
    params?: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    success: boolean;
    data?: {
      rooms: Array<{
        room_id: string;
        room_type_id: string;
        room_type_name: string;
        hotel_id: string;
        hotel_name: string;
        room_number?: string | null;
        capacity: number;
        image_url?: string | null;
        price_base?: number | null;
        status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/rooms`, { params });
    return response.data;
  },

  getRoomById: async (roomId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/rooms/${roomId}`);
    return response.data;
  },

  createRoom: async (data: {
    room_id: string;
    room_type_id: string;
    room_number?: string;
    capacity: number;
    image_url?: string;
    price_base?: number;
    status?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post("/api/admin/rooms/rooms", data);
    return response.data;
  },

  updateRoom: async (
    roomId: string,
    data: {
      room_number?: string;
      capacity?: number;
      image_url?: string;
      price_base?: number;
      status?: string;
    }
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/rooms/${roomId}`, data);
    return response.data;
  },

  deleteRoom: async (roomId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/rooms/rooms/${roomId}`);
    return response.data;
  },

  updateRoomStatus: async (roomId: string, status: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/rooms/${roomId}/status`, { status });
    return response.data;
  },

  // Helper APIs
  getBedTypes: async (): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get("/api/admin/bed-types");
    return response.data;
  },
  getBedTypeById: async (bedTypeKey: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/bed-types/${bedTypeKey}`);
    return response.data;
  },
  createBedType: async (data: { bed_type_key: string; name_vi: string; name_en?: string; description?: string; icon?: string; display_order?: number }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.post("/api/admin/bed-types", data);
    return response.data;
  },
  updateBedType: async (bedTypeKey: string, data: { name_vi?: string; name_en?: string; description?: string; icon?: string; display_order?: number }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.put(`/api/admin/bed-types/${bedTypeKey}`, data);
    return response.data;
  },
  deleteBedType: async (bedTypeKey: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/bed-types/${bedTypeKey}`);
    return response.data;
  },

  getRoomTypesForHotel: async (hotelId: string): Promise<{
    success: boolean;
    data?: Array<{ room_type_id: string; name: string }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/hotels/${hotelId}/room-types`);
    return response.data;
  },

  getHotelBookingStats: async (hotelId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/bookings/stats`);
    return response.data;
  },

  checkInBooking: async (
    hotelId: string,
    bookingId: string,
    staffName?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/hotels/${hotelId}/bookings/${bookingId}/checkin`, { staffName });
    return response.data;
  },

  checkOutBooking: async (
    hotelId: string,
    bookingId: string,
    staffName?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/hotels/${hotelId}/bookings/${bookingId}/checkout`, { staffName });
    return response.data;
  },

  updateBookingAdminNote: async (
    hotelId: string,
    bookingId: string,
    adminNote: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/hotels/${hotelId}/bookings/${bookingId}/admin-note`, { adminNote });
    return response.data;
  },

  updateBookingSpecialRequests: async (
    hotelId: string,
    bookingId: string,
    specialRequests: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/hotels/${hotelId}/bookings/${bookingId}/special-requests`, { specialRequests });
    return response.data;
  },

  getBookingActivityLog: async (
    hotelId: string,
    bookingId: string
  ): Promise<{ success: boolean; data?: any[]; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/${hotelId}/bookings/${bookingId}/activity-log`);
    return response.data;
  },

  getTotalPendingBookingCount: async (): Promise<{ success: boolean; data?: number; message?: string }> => {
    const response = await adminApi.get(`/api/admin/hotels/bookings/pending-count`);
    return response.data;
  },

  // ========== ROOM IMAGES ==========
  getRoomImages: async (roomTypeId: string): Promise<{
    success: boolean;
    data?: Array<{
      image_id: string;
      room_type_id: string;
      image_url: string;
      image_alt?: string | null;
      is_primary: boolean;
      sort_order: number;
      created_at: string;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/images`);
    return response.data;
  },

  addRoomImage: async (
    roomTypeId: string,
    imageUrl: string,
    imageAlt?: string,
    isPrimary?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/rooms/room-types/${roomTypeId}/images`, {
      imageUrl,
      imageAlt,
      isPrimary,
    });
    return response.data;
  },

  deleteRoomImage: async (imageId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/rooms/images/${imageId}`);
    return response.data;
  },

  setPrimaryRoomImage: async (
    roomTypeId: string,
    imageId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/images/${imageId}/primary`);
    return response.data;
  },

  // ========== ROOM AMENITIES ==========
  getRoomTypeAmenities: async (roomTypeId: string): Promise<{
    success: boolean;
    data?: Array<{
      facility_id: string;
      name: string;
      category: string;
      icon?: string | null;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/amenities`);
    return response.data;
  },

  getAllFacilities: async (category?: string): Promise<{
    success: boolean;
    data?: Array<{
      facility_id: string;
      name: string;
      category: string;
      icon?: string | null;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/facilities`, { params: { category } });
    return response.data;
  },
  getFacilityById: async (facilityId: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/facilities/${facilityId}`);
    return response.data;
  },
  createFacility: async (data: { facility_id: string; name: string; category: "HOTEL" | "ROOM"; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.post("/api/admin/facilities", data);
    return response.data;
  },
  updateFacility: async (facilityId: string, data: { name?: string; category?: "HOTEL" | "ROOM"; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.put(`/api/admin/facilities/${facilityId}`, data);
    return response.data;
  },
  deleteFacility: async (facilityId: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/facilities/${facilityId}`);
    return response.data;
  },

  addRoomTypeAmenity: async (
    roomTypeId: string,
    facilityId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/rooms/room-types/${roomTypeId}/amenities`, { facilityId });
    return response.data;
  },

  removeRoomTypeAmenity: async (
    roomTypeId: string,
    facilityId: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/rooms/room-types/${roomTypeId}/amenities/${facilityId}`);
    return response.data;
  },

  // ========== ROOM POLICIES ==========
  getRoomTypePolicies: async (roomTypeId: string): Promise<{
    success: boolean;
    data?: Array<{
      id: number;
      policy_key: string;
      name: string;
      value: string;
      data_type: string;
      icon?: string | null;
      updated_at: string;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/policies`);
    return response.data;
  },

  getAllPolicyTypes: async (applicableTo?: string): Promise<{
    success: boolean;
    data?: Array<{
      policy_key: string;
      name_vi: string;
      name_en?: string;
      description?: string | null;
      data_type: string;
      applicable_to: string;
      icon?: string | null;
      display_order?: number;
      is_active?: boolean;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/policy-types`, { params: { applicableTo } });
    return response.data;
  },
  getPolicyTypeById: async (policyKey: string): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.get(`/api/admin/policy-types/${policyKey}`);
    return response.data;
  },
  createPolicyType: async (data: { policy_key: string; name_vi: string; name_en?: string; description?: string; data_type?: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT"; applicable_to?: "HOTEL" | "ROOM" | "BOTH"; icon?: string; display_order?: number; is_active?: boolean }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.post("/api/admin/policy-types", data);
    return response.data;
  },
  updatePolicyType: async (policyKey: string, data: { name_vi?: string; name_en?: string; description?: string; data_type?: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT"; applicable_to?: "HOTEL" | "ROOM" | "BOTH"; icon?: string; display_order?: number; is_active?: boolean }): Promise<{ success: boolean; data?: any; message?: string }> => {
    const response = await adminApi.put(`/api/admin/policy-types/${policyKey}`, data);
    return response.data;
  },
  deletePolicyType: async (policyKey: string): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/policy-types/${policyKey}`);
    return response.data;
  },

  addRoomTypePolicy: async (
    roomTypeId: string,
    policyKey: string,
    value: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.post(`/api/admin/rooms/room-types/${roomTypeId}/policies`, {
      policyKey,
      value,
    });
    return response.data;
  },

  updateRoomTypePolicy: async (
    roomTypeId: string,
    policyKey: string,
    value: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/policies/${policyKey}`, {
      value,
    });
    return response.data;
  },

  removeRoomTypePolicy: async (
    roomTypeId: string,
    policyKey: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.delete(`/api/admin/rooms/room-types/${roomTypeId}/policies/${policyKey}`);
    return response.data;
  },

  // ========== ROOM PRICE SCHEDULES ==========
  getRoomTypePriceSchedules: async (roomTypeId: string): Promise<{
    success: boolean;
    data?: Array<{
      date: string;
      avg_base_price: number;
      min_base_price: number;
      max_base_price: number;
      avg_discount_percent: number;
      total_available_rooms: number;
      total_rooms: number;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/price-schedules`);
    return response.data;
  },

  getRoomTypeBasePrice: async (roomTypeId: string): Promise<{
    success: boolean;
    data?: { basePrice: number | null };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/base-price`);
    return response.data;
  },

  updateRoomTypeBasePrice: async (
    roomTypeId: string,
    basePrice: number
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/base-price`, {
      basePrice,
    });
    return response.data;
  },

  updateRoomTypeDateDiscount: async (
    roomTypeId: string,
    date: string,
    discountPercent: number
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/discount`, {
      date,
      discountPercent,
    });
    return response.data;
  },

  // Get policies for a specific date
  getRoomTypeDatePolicies: async (
    roomTypeId: string,
    date: string
  ): Promise<{
    success: boolean;
    data?: {
      refundable: boolean;
      pay_later: boolean;
    };
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/room-types/${roomTypeId}/date-policies`, {
      params: { date },
    });
    return response.data;
  },

  // Update policies for a specific date
  updateRoomTypeDatePolicies: async (
    roomTypeId: string,
    date: string,
    refundable: boolean,
    payLater: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/date-policies`, {
      date,
      refundable,
      payLater,
    });
    return response.data;
  },

  // Update base price for a specific date
  updateRoomTypeDateBasePrice: async (
    roomTypeId: string,
    date: string,
    basePrice: number
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/date-base-price`, {
      date,
      basePrice,
    });
    return response.data;
  },

  // Update available rooms for a specific date
  updateRoomTypeDateAvailability: async (
    roomTypeId: string,
    date: string,
    totalAvailableRooms: number
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await adminApi.put(`/api/admin/rooms/room-types/${roomTypeId}/date-availability`, {
      date,
      totalAvailableRooms,
    });
    return response.data;
  },

  // ========== ROOM DASHBOARD ==========
  
  getRoomDashboardStats: async (): Promise<{
    success: boolean;
    data?: {
      totalRoomTypes: number;
      totalRooms: number;
      activeRooms: number;
      maintenanceRooms: number;
      inactiveRooms: number;
      fullRooms: number;
      availableRooms: number;
      avgBasePrice: number;
      avgOccupancyRate: number;
      roomsByHotel: Array<{ hotel: string; count: number }>;
      bedsByType: Array<{ bedType: string; count: number }>;
      occupancyTrends: Array<{ month: string; rate: number }>;
      topRevenueRoomTypes: Array<{
        room_type_id: string;
        name: string;
        revenue: number;
        hotel_name: string;
      }>;
      topBookedRooms: Array<{
        room_id: string;
        room_number: string;
        room_type: string;
        booking_count: number;
        hotel_name: string;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/rooms/dashboard");
    return response.data;
  },

  // ========== BOOKING MANAGER APIs ==========
  
  // Dashboard Stats
  getBookingDashboardStats: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalBookings: number;
      activeBookings: number;
      paidBookings: number;
      cancelledBookings: number;
      monthlyRevenue: number;
      bookingsByMonth: Array<{ month: string; count: number }>;
      bookingsByStatus: Array<{ status: string; count: number }>;
      revenueTrend: Array<{ date: string; revenue: number }>;
      topCustomers: Array<{
        account_id: string;
        full_name: string;
        email: string;
        booking_count: number;
        total_spent: number;
      }>;
      topHotels: Array<{
        hotel_id: string;
        hotel_name: string;
        booking_count: number;
        revenue: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/bookings/dashboard", { params });
    return response.data;
  },

  // Reports
  // ========== Reports APIs ==========
  getBookingReports: async (params?: {
    startDate?: string;
    endDate?: string;
    hotel_id?: string;
    city?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalBookings: number;
      bookingsByStatus: Array<{ status: string; count: number; percentage: number }>;
      cancellationRate: number;
      completionRate: number;
      averageBookingValue: number;
      bookingsByHotel: Array<{ hotel_id: string; hotel_name: string; bookings: number }>;
      bookingsByCity: Array<{ city: string; bookings: number }>;
      bookingsByCategory: Array<{ category: string; bookings: number }>;
      bookingsByTime: Array<{ date: string; count: number }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reports/bookings", { params });
    return response.data;
  },

  getRevenueReports: async (params?: {
    startDate?: string;
    endDate?: string;
    hotel_id?: string;
    paymentMethod?: string;
    viewType?: "daily" | "weekly" | "monthly" | "yearly";
  }): Promise<{
    success: boolean;
    data?: {
      totalRevenue: number;
      revenueByPeriod: {
        daily: Array<{ date: string; revenue: number }>;
        weekly: Array<{ week: string; revenue: number }>;
        monthly: Array<{ month: string; revenue: number }>;
        yearly: Array<{ year: string; revenue: number }>;
      };
      revenueByHotel: Array<{ hotel_id: string; hotel_name: string; revenue: number; percentage: number }>;
      revenueByCity: Array<{ city: string; revenue: number; percentage: number }>;
      revenueByRoomType: Array<{ room_type: string; revenue: number; percentage: number }>;
      revenueByPaymentMethod: Array<{ method: string; revenue: number; percentage: number }>;
      revenueByPackage: Array<{ package_name: string; revenue: number; percentage: number }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reports/revenue", { params });
    return response.data;
  },

  getOccupancyReports: async (params?: {
    month?: string;
    city?: string;
    category?: string;
    year?: string;
  }): Promise<{
    success: boolean;
    data?: {
      averageOccupancyRate: number;
      occupancyByHotel: Array<{ hotel_id: string; hotel_name: string; occupancy_rate: number }>;
      occupancyByMonth: Array<{ month: string; occupancy_rate: number }>;
      occupancyByCity: Array<{ city: string; occupancy_rate: number }>;
      occupancyByCategory: Array<{ category: string; occupancy_rate: number }>;
      occupancyYearOverYear: Array<{ period: string; currentYear: number; previousYear: number }>;
      occupancyCalendar: Array<{ date: string; occupancy_rate: number }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reports/occupancy", { params });
    return response.data;
  },

  getCustomerInsights: async (): Promise<{
    success: boolean;
    data?: {
      totalCustomers: number;
      newCustomers: number;
      returningCustomers: number;
      activeCustomers: number;
      inactiveCustomers: number;
      returnRate: number;
      customerLifetimeValue: number;
      topSpendingCustomers: Array<{ customer_id: string; customer_name: string; total_spent: number; booking_count: number }>;
      newCustomersTrend: Array<{ date: string; count: number }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reports/customers");
    return response.data;
  },

  getPackageReports: async (params?: {
    startDate?: string;
    endDate?: string;
    package?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalUsersByPackage: Array<{ package_name: string; user_count: number; percentage: number }>;
      revenueByPackage: Array<{ package_name: string; revenue: number; percentage: number }>;
      monthlyRecurringRevenue: Array<{ month: string; revenue: number }>;
      mostPopularPackage: { package_name: string; user_count: number; revenue: number };
      renewalRate: number;
      cancellationRate: number;
      packageStats: Array<{ package_name: string; total_users: number; active_users: number; cancelled_users: number; total_revenue: number; monthly_revenue: number }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reports/packages", { params });
    return response.data;
  },

  getStaffReports: async (params?: {
    startDate?: string;
    endDate?: string;
    staff?: string;
    actionType?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalActions: number;
      actionsByType: Array<{ type: string; count: number; percentage: number }>;
      actionsByStaff: Array<{ staff_id: string; staff_name: string; action_count: number; actions_by_type: { create: number; update: number; delete: number; approve: number } }>;
      actionsByTime: Array<{ date: string; count: number }>;
      peakHours: Array<{ hour: string; count: number }>;
      actionLogs: Array<{ id: number; date: string; staff_name: string; staff_id: string; action_type: string; action_description: string; entity_type: string; entity_id: string }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reports/staff", { params });
    return response.data;
  },

  getReviewAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
    hotel?: string;
    city?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalReviews: number;
      averageRating: number;
      averageRatingByHotel: Array<{ hotel_id: string; hotel_name: string; average_rating: number; review_count: number }>;
      averageRatingByCity: Array<{ city: string; average_rating: number; review_count: number }>;
      ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
      positiveRate: number;
      negativeRate: number;
      ratingByCriteria: Array<{ criteria: string; average_rating: number }>;
      topRatedHotels: Array<{ hotel_id: string; hotel_name: string; average_rating: number; review_count: number }>;
      reviewsByMonth: Array<{ month: string; count: number }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/reviews/reports/stats", { params });
    return response.data;
  },

  // Get All Bookings
  getBookings: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "created_at" | "total_amount" | "status";
    sortOrder?: "ASC" | "DESC";
  }): Promise<{
    success: boolean;
    data?: {
      bookings: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/bookings/", { params });
    return response.data;
  },

  // Get Booking Detail
  getBookingDetailForAdmin: async (bookingId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/bookings/${bookingId}`);
    return response.data;
  },

  // Update Booking Status
  updateBookingStatus: async (
    bookingId: string,
    status: string,
    reason?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/bookings/${bookingId}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  // Update Booking
  updateBooking: async (
    bookingId: string,
    data: {
      specialRequests?: string;
      checkIn?: string;
      checkOut?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/bookings/${bookingId}`, data);
    return response.data;
  },

  // Add Internal Note
  addBookingInternalNote: async (
    bookingId: string,
    note: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.post(`/api/admin/bookings/${bookingId}/notes`, {
      note,
    });
    return response.data;
  },

  // Send Confirmation Email
  sendBookingConfirmationEmail: async (bookingId: string): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.post(`/api/admin/bookings/${bookingId}/send-email`);
    return response.data;
  },

  // Create Manual Booking
  createManualBooking: async (data: {
    accountId: string;
    hotelId: string;
    roomIds: string[];
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    paymentMethod: string;
    specialRequests?: string;
    skipAvailabilityCheck?: boolean;
  }): Promise<{
    success: boolean;
    data?: {
      bookingId: string;
      bookingCode: string;
    };
    message?: string;
  }> => {
    const response = await adminApi.post("/api/admin/bookings/", data);
    return response.data;
  },

  // Get Payments List
  getBookingPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      payments: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      statistics?: {
        totalRevenue: number;
        pendingAmount: number;
        refundedAmount: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/bookings/payments/list", { params });
    return response.data;
  },

  // Update Payment Status
  updatePaymentStatus: async (
    paymentId: string,
    status: string,
    note?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/payments/${paymentId}/status`, {
      status,
      note,
    });
    return response.data;
  },

  // ============================================
  // PAYMENT MANAGER APIs
  // ============================================

  // Get Payment Dashboard Stats
  getPaymentDashboardStats: async (): Promise<{
    success: boolean;
    data?: {
      totalRevenue: number;
      todayRevenue: number;
      monthlyRevenue: number;
      totalTransactions: number;
      failedTransactions: number;
      refundedTransactions: number;
      revenueByMonth: Array<{ month: string; revenue: number }>;
      paymentMethods: Array<{ method: string; count: number; revenue: number; percentage: number }>;
      revenueTrend: Array<{ date: string; revenue: number }>;
      topCustomers: Array<{
        account_id: string;
        full_name: string;
        total_spent: number;
      }>;
      topHotels: Array<{
        hotel_id: string;
        hotel_name: string;
        revenue: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/dashboard");
    return response.data;
  },

  // Get Payments List
  getPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: string;
    status?: string;
    hotelId?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: "created_at" | "amount_due" | "status";
    sortOrder?: "ASC" | "DESC";
  }): Promise<{
    success: boolean;
    data?: {
      payments: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      statistics?: {
        totalRevenue: number;
        pendingAmount: number;
        refundedAmount: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/list", { params });
    return response.data;
  },

  // Get Payment Detail
  getPaymentDetail: async (paymentId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/payments/${paymentId}`);
    return response.data;
  },

  // Get Failed Payments
  getFailedPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data?: {
      payments: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/failed/list", { params });
    return response.data;
  },

  // Get Manual Payments
  getManualPayments: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data?: {
      payments: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/manual/list", { params });
    return response.data;
  },

  // Retry Payment
  retryPayment: async (
    paymentId: string,
    newMethod?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.post(`/api/admin/payments/${paymentId}/retry`, {
      newMethod,
    });
    return response.data;
  },

  // Confirm Manual Payment
  confirmManualPayment: async (
    paymentId: string,
    data: {
      admin_name: string;
      received_date: string;
      note?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.post(`/api/admin/payments/${paymentId}/confirm-manual`, data);
    return response.data;
  },

  // Get Refunds
  getRefunds: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    paymentMethod?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      refunds: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/refunds/list", { params });
    return response.data;
  },

  // Create Refund
  createRefund: async (
    paymentId: string,
    data: {
      amount: number;
      reason?: string;
      refund_date?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.post(`/api/admin/payments/${paymentId}/refund`, data);
    return response.data;
  },

  // Get Payment Reports
  getPaymentReports: async (params?: {
    period?: "7days" | "month" | "quarter" | "year";
    paymentMethod?: string;
    hotelId?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalRevenue: number;
      todayRevenue: number;
      monthlyRevenue: number;
      successRate: number;
      failureRate: number;
      refundCount: number;
      refundAmount: number;
      paymentMethods: Array<{ method: string; count: number; revenue: number; percentage: number }>;
      revenueByDay: Array<{ date: string; revenue: number }>;
      revenueByMonth: Array<{ month: string; revenue: number }>;
      failureRateTrend: Array<{ date: string; rate: number }>;
      revenueByHotel: Array<{ hotel_id: string; hotel_name: string; revenue: number }>;
      topCustomers: Array<{
        account_id: string;
        full_name: string;
        total_spent: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/reports", { params });
    return response.data;
  },

  // Get Payment Activity Logs
  getPaymentActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    admin?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      logs: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/payments/activity-logs", { params });
    return response.data;
  },

  // Export Invoice
  exportInvoice: async (
    paymentId: string,
    format: "PDF" | "EMAIL"
  ): Promise<{
    success: boolean;
    message?: string;
    data?: any;
  }> => {
    const response = await adminApi.post(`/api/admin/payments/${paymentId}/export-invoice`, {
      format,
    });
    return response.data;
  },

  // Get Discount Usage
  getBookingDiscountUsage: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    discountType?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      discounts: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/bookings/discounts/list", { params });
    return response.data;
  },

  // Get Activity Logs
  getBookingActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    adminId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      logs: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/bookings/activity/list", { params });
    return response.data;
  },

  // Get Available Rooms by Room Type with dates
  getAvailableRoomsByRoomType: async (
    roomTypeId: string,
    checkIn: string,
    checkOut: string,
    roomsNeeded?: number
  ): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
  }> => {
    const response = await adminApi.get("/api/rooms/available", {
      params: {
        roomTypeId,
        checkIn,
        checkOut,
        roomsNeeded: roomsNeeded || 1,
      },
    });
    return response.data;
  },

  // ============================================
  // DISCOUNT MANAGER APIs
  // ============================================

  // Get Discount Dashboard Stats
  getDiscountDashboardStats: async (): Promise<{
    success: boolean;
    data?: {
      totalActive: number;
      expiringSoon: number;
      expiredDisabled: number;
      monthlyUsage: number;
      totalDiscountAmount: number;
      codesCreatedByMonth: Array<{ month: string; count: number }>;
      discountTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
      discountRevenueTrend: Array<{ date: string; amount: number }>;
      topCodes: Array<{
        code: string;
        usage_count: number;
        discount_amount: number;
      }>;
      topUsers: Array<{
        account_id: string;
        full_name: string;
        usage_count: number;
        total_saved: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/dashboard");
    return response.data;
  },

  // Get All Discount Codes
  getAllDiscountCodes: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    discountType?: string;
    expiryDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<{
    success: boolean;
    data?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/list", { params });
    return response.data;
  },

  // Get Discount Code Detail
  getDiscountCodeDetail: async (discountId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/discounts/${discountId}`);
    return response.data;
  },

  // Create Discount Code
  createDiscountCode: async (data: {
    code: string;
    discount_type: "PERCENT" | "FIXED";
    discount_value: number;
    max_discount?: number;
    min_purchase?: number;
    usage_limit?: number;
    per_user_limit?: number;
    start_date: string;
    expiry_date: string;
    applicable_start_date?: string;
    applicable_end_date?: string;
    min_nights?: number;
    max_nights?: number;
    applicable_hotels?: string[];
    applicable_categories?: string[];
    status: "ACTIVE" | "INACTIVE";
  }): Promise<{
    success: boolean;
    discountId?: string;
    message?: string;
  }> => {
    const response = await adminApi.post("/api/admin/discounts/create", data);
    return response.data;
  },

  // Update Discount Code
  updateDiscountCode: async (
    discountId: string,
    data: Partial<{
      code: string;
      discount_type: "PERCENT" | "FIXED";
      discount_value: number;
      max_discount?: number;
      min_purchase?: number;
      usage_limit?: number;
      per_user_limit?: number;
      start_date: string;
      expiry_date: string;
      applicable_start_date?: string;
      applicable_end_date?: string;
      min_nights?: number;
      max_nights?: number;
      applicable_hotels?: string[];
      applicable_categories?: string[];
      status: "ACTIVE" | "INACTIVE" | "EXPIRED";
    }>
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/discounts/${discountId}`, data);
    return response.data;
  },

  // Delete Discount Code
  deleteDiscountCode: async (discountId: string): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.delete(`/api/admin/discounts/${discountId}`);
    return response.data;
  },

  // Toggle Discount Code Status
  toggleDiscountCodeStatus: async (discountId: string): Promise<{
    success: boolean;
    status?: string;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/discounts/${discountId}/toggle-status`);
    return response.data;
  },

  // Extend Discount Code Expiry
  extendDiscountCodeExpiry: async (
    discountId: string,
    days: number
  ): Promise<{
    success: boolean;
    newExpiry?: string;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/discounts/${discountId}/extend`, { days });
    return response.data;
  },

  // Get Discount Usage Analytics
  getDiscountUsageAnalytics: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalUsage: number;
      totalDiscountAmount: number;
      usageRate: number;
      topCodesByUsage: Array<{
        code: string;
        usage_count: number;
        discount_amount: number;
      }>;
      topCodesByRevenue: Array<{
        code: string;
        usage_count: number;
        discount_amount: number;
      }>;
      usageByType: Array<{
        type: string;
        usage_count: number;
        percentage: number;
      }>;
      usageByDay: Array<{
        date: string;
        usage_count: number;
      }>;
      discountByCode: Array<{
        code: string;
        discount_amount: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/usage-analytics", { params });
    return response.data;
  },

  // Get Discount Reports
  getDiscountReports: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<{
    success: boolean;
    data?: {
      totalUsageByCode: Array<{
        code: string;
        usage_count: number;
        discount_amount: number;
      }>;
      totalDiscountRevenue: number;
      topCodeByBooking: Array<{
        code: string;
        booking_count: number;
      }>;
      expiredUnusedCodes: Array<{
        code: string;
        expiry_date: string;
        usage_count: number;
      }>;
      refundRateWithCode: number;
      usageByCustomer: Array<{
        customer_name: string;
        usage_count: number;
        total_saved: number;
      }>;
      usageByHotel: Array<{
        hotel_name: string;
        usage_count: number;
        discount_amount: number;
      }>;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/reports", { params });
    return response.data;
  },

  // Get Discount Users
  getDiscountUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    discountCode?: string;
    customerEmail?: string;
    dateFrom?: string;
    dateTo?: string;
    bookingStatus?: string;
  }): Promise<{
    success: boolean;
    data?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/users", { params });
    return response.data;
  },

  // Get Applicable Hotels
  getApplicableHotels: async (): Promise<{
    success: boolean;
    data?: Array<{ hotel_id: string; name: string }>;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/applicable-hotels");
    return response.data;
  },

  // Get Applicable Categories
  getApplicableCategories: async (): Promise<{
    success: boolean;
    data?: Array<{ category_id: string; name: string }>;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/discounts/applicable-categories");
    return response.data;
  },

  // Export Discount Report
  exportDiscountReport: async (data: {
    format: "CSV" | "EXCEL" | "PDF";
    period?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: string;
  }): Promise<{
    success: boolean;
    data?: {
      format: string;
      content?: string;
      filename?: string;
      data?: any;
      message?: string;
    };
    message?: string;
  }> => {
    const response = await adminApi.post("/api/admin/discounts/export-report", data, {
      responseType: data.format === "CSV" ? "blob" : "json",
    });
    
    if (data.format === "CSV" && response.data instanceof Blob) {
      // Handle CSV download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `discount-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: "Đã xuất file CSV thành công",
      };
    }
    
    return response.data;
  },

  // ============================================
  // PROMOTION MANAGER
  // ============================================

  // Get Promotion Dashboard Stats
  getPromotionDashboardStats: async (): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/promotions/dashboard");
    return response.data;
  },

  // Get All Promotions
  getAllPromotions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    discountType?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<{
    success: boolean;
    data?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/promotions/list", { params });
    return response.data;
  },

  // Get Promotion Detail
  getPromotionDetail: async (promotionId: string): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/promotions/${promotionId}`);
    return response.data;
  },

  // Create Promotion
  createPromotion: async (data: {
    name: string;
    description?: string;
    type: "PROVIDER" | "SYSTEM" | "BOTH";
    discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
    discount_value: number;
    min_purchase?: number;
    max_discount?: number;
    start_date: string;
    end_date: string;
    applicable_hotels?: string[];
    applicable_rooms?: string[];
    applicable_dates?: string[];
    day_of_week?: number[];
    status?: "ACTIVE" | "INACTIVE" | "EXPIRED";
  }): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.post("/api/admin/promotions/create", data);
    return response.data;
  },

  // Update Promotion
  updatePromotion: async (
    promotionId: string,
    data: {
      name?: string;
      description?: string;
      type?: "PROVIDER" | "SYSTEM" | "BOTH";
      discount_type?: "PERCENTAGE" | "FIXED_AMOUNT";
      discount_value?: number;
      min_purchase?: number;
      max_discount?: number;
      start_date?: string;
      end_date?: string;
      applicable_hotels?: string[];
      applicable_rooms?: string[];
      applicable_dates?: string[];
      day_of_week?: number[];
      status?: "ACTIVE" | "INACTIVE" | "EXPIRED";
    }
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/promotions/${promotionId}`, data);
    return response.data;
  },

  // Delete Promotion
  deletePromotion: async (promotionId: string): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const response = await adminApi.delete(`/api/admin/promotions/${promotionId}`);
    return response.data;
  },

  // Toggle Promotion Status
  togglePromotionStatus: async (promotionId: string): Promise<{
    success: boolean;
    status?: string;
    message?: string;
  }> => {
    const response = await adminApi.put(`/api/admin/promotions/${promotionId}/toggle-status`);
    return response.data;
  },

  // Apply Promotion to Schedules
  applyPromotionToSchedules: async (promotionId: string): Promise<{
    success: boolean;
    affectedSchedules?: number;
    message?: string;
  }> => {
    const response = await adminApi.post(`/api/admin/promotions/${promotionId}/apply-to-schedules`);
    return response.data;
  },

  // Get Promotion Reports
  getPromotionReports: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/promotions/reports", { params });
    return response.data;
  },

  // Get Promotion Activity Logs
  getPromotionActivityLogs: async (params?: {
    page?: number;
    limit?: number;
    promotionId?: string;
    adminId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/promotions/activity-logs", { params });
    return response.data;
  },

  // Get Applicable Hotels for Promotions
  getPromotionApplicableHotels: async (): Promise<{
    success: boolean;
    data?: Array<{ hotel_id: string; name: string }>;
    message?: string;
  }> => {
    const response = await adminApi.get("/api/admin/promotions/applicable-hotels");
    return response.data;
  },

  // Get Applicable Rooms for Promotions
  getPromotionApplicableRooms: async (hotelIds?: string[]): Promise<{
    success: boolean;
    data?: Array<{
      room_id: string;
      room_number: string;
      room_type_name: string;
      hotel_id: string;
      hotel_name: string;
    }>;
    message?: string;
  }> => {
    const params = hotelIds && hotelIds.length > 0 ? { hotelIds: hotelIds.join(',') } : {};
    const response = await adminApi.get("/api/admin/promotions/applicable-rooms", { params });
    return response.data;
  },
};
