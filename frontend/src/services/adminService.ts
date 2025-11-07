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
      bookingsByStatus: Array<{ status: string; count: number; percentage: string }>;
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
    const response = await adminApi.get("/api/admin/hotels/highlights/all");
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
  getBedTypes: async (): Promise<{ success: boolean; data?: string[]; message?: string }> => {
    const response = await adminApi.get("/api/admin/rooms/bed-types");
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
    const response = await adminApi.get(`/api/admin/rooms/facilities`, { params: { category } });
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
      name: string;
      description?: string | null;
      data_type: string;
      applicable_to: string;
      icon?: string | null;
    }>;
    message?: string;
  }> => {
    const response = await adminApi.get(`/api/admin/rooms/policy-types`, { params: { applicableTo } });
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
};
