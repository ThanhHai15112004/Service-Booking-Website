import { AdminHotelRepository, AdminHotel, HotelDashboardStats, HotelReportData } from "../../Repository/Admin/adminHotel.repository";

export class AdminHotelService {
  private repo = new AdminHotelRepository();

  // Lấy danh sách hotels
  async getHotels(filters: {
    search?: string;
    status?: string;
    category?: string;
    city?: string;
    starRating?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data?: { hotels: AdminHotel[]; total: number; page: number; limit: number; totalPages: number }; message?: string }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const result = await this.repo.getHotels({ ...filters, page, limit });

      return {
        success: true,
        data: {
          hotels: result.hotels,
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách khách sạn",
      };
    }
  }

  // Lấy chi tiết hotel
  async getHotelById(hotelId: string): Promise<{ success: boolean; data?: AdminHotel; message?: string }> {
    try {
      const hotel = await this.repo.getHotelById(hotelId);
      if (!hotel) {
        return {
          success: false,
          message: "Không tìm thấy khách sạn",
        };
      }
      return {
        success: true,
        data: hotel,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thông tin khách sạn",
      };
    }
  }

  // Cập nhật trạng thái hotel
  async updateHotel(hotelId: string, data: {
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
  }): Promise<{ success: boolean; message?: string }> {
    try {
      await this.repo.updateHotel(hotelId, data);
      return { success: true, message: "Cập nhật khách sạn thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi cập nhật khách sạn" };
    }
  }

  async updateHotelStatus(hotelId: string, status: string): Promise<{ success: boolean; message?: string }> {
    try {
      const validStatuses = ["ACTIVE", "INACTIVE", "PENDING"];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: "Trạng thái không hợp lệ",
        };
      }

      const updated = await this.repo.updateHotelStatus(hotelId, status);
      if (!updated) {
        return {
          success: false,
          message: "Không tìm thấy khách sạn để cập nhật",
        };
      }

      return {
        success: true,
        message: "Cập nhật trạng thái thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật trạng thái",
      };
    }
  }

  // Xóa hotel
  async deleteHotel(hotelId: string, hardDelete: boolean = false): Promise<{ success: boolean; message?: string }> {
    try {
      const deleted = await this.repo.deleteHotel(hotelId, hardDelete);
      if (!deleted) {
        return {
          success: false,
          message: "Không tìm thấy khách sạn để xóa",
        };
      }

      return {
        success: true,
        message: hardDelete ? "Xóa khách sạn thành công" : "Vô hiệu hóa khách sạn thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi xóa khách sạn",
      };
    }
  }

  // Lấy dashboard stats
  async getDashboardStats(): Promise<{ success: boolean; data?: HotelDashboardStats; message?: string }> {
    try {
      const stats = await this.repo.getDashboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê dashboard",
      };
    }
  }

  // Lấy report data
  async getReportData(filters: {
    period?: string;
    city?: string;
    category?: string;
  }): Promise<{ success: boolean; data?: HotelReportData; message?: string }> {
    try {
      const reportData = await this.repo.getReportData(filters);
      return {
        success: true,
        data: reportData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy báo cáo",
      };
    }
  }

  // ========== Hotel Facilities ==========
  async getHotelFacilities(hotelId: string) {
    try {
      const facilities = await this.repo.getHotelFacilities(hotelId);
      return { success: true, data: facilities };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy danh sách tiện nghi" };
    }
  }

  async addHotelFacility(hotelId: string, facilityId: string) {
    try {
      await this.repo.addHotelFacility(hotelId, facilityId);
      return { success: true, message: "Thêm tiện nghi thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi thêm tiện nghi" };
    }
  }

  async removeHotelFacility(hotelId: string, facilityId: string) {
    try {
      await this.repo.removeHotelFacility(hotelId, facilityId);
      return { success: true, message: "Xóa tiện nghi thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi xóa tiện nghi" };
    }
  }

  // ========== Hotel Highlights ==========
  async getAllHighlights() {
    try {
      const highlights = await this.repo.getAllHighlights();
      return { success: true, data: highlights };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy danh sách highlights" };
    }
  }

  async getHotelHighlights(hotelId: string) {
    try {
      const highlights = await this.repo.getHotelHighlights(hotelId);
      return { success: true, data: highlights };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy danh sách highlights" };
    }
  }

  async addHotelHighlight(hotelId: string, highlightId: string, customText?: string, sortOrder?: number) {
    try {
      await this.repo.addHotelHighlight(hotelId, highlightId, customText, sortOrder);
      return { success: true, message: "Thêm highlight thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi thêm highlight" };
    }
  }

  async updateHotelHighlight(hotelId: string, highlightId: string, customText?: string, sortOrder?: number) {
    try {
      await this.repo.updateHotelHighlight(hotelId, highlightId, customText, sortOrder);
      return { success: true, message: "Cập nhật highlight thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi cập nhật highlight" };
    }
  }

  async removeHotelHighlight(hotelId: string, highlightId: string) {
    try {
      await this.repo.removeHotelHighlight(hotelId, highlightId);
      return { success: true, message: "Xóa highlight thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi xóa highlight" };
    }
  }

  // ========== Hotel Policies ==========
  async getHotelPolicies(hotelId: string) {
    try {
      const policies = await this.repo.getHotelPolicies(hotelId);
      return { success: true, data: policies };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy danh sách chính sách" };
    }
  }

  async getPolicyTypes() {
    try {
      const types = await this.repo.getPolicyTypes();
      return { success: true, data: types };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy danh sách loại chính sách" };
    }
  }

  async setHotelPolicy(hotelId: string, policyKey: string, value: string) {
    try {
      await this.repo.setHotelPolicy(hotelId, policyKey, value);
      return { success: true, message: "Cập nhật chính sách thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi cập nhật chính sách" };
    }
  }

  async removeHotelPolicy(hotelId: string, policyKey: string) {
    try {
      await this.repo.removeHotelPolicy(hotelId, policyKey);
      return { success: true, message: "Xóa chính sách thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi xóa chính sách" };
    }
  }

  // ========== Hotel Images ==========
  async getHotelImages(hotelId: string) {
    try {
      const images = await this.repo.getHotelImages(hotelId);
      return { success: true, data: images };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy danh sách ảnh" };
    }
  }

  async addHotelImage(hotelId: string, imageUrl: string, sortOrder?: number, isPrimary?: boolean) {
    try {
      await this.repo.addHotelImage(hotelId, imageUrl, sortOrder || 0, isPrimary || false);
      return { success: true, message: "Thêm ảnh thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi thêm ảnh" };
    }
  }

  async deleteHotelImage(imageId: string) {
    try {
      await this.repo.deleteHotelImage(imageId);
      return { success: true, message: "Xóa ảnh thành công" };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi xóa ảnh" };
    }
  }

  // ========== Hotel Reviews ==========
  async getHotelReviews(hotelId: string, filters: {
    rating?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const result = await this.repo.getHotelReviews(hotelId, filters);
      return {
        success: true,
        data: result.reviews,
        total: result.total,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách review",
        data: [],
        total: 0,
      };
    }
  }

  // ========== Hotel Statistics ==========
  async getHotelStatistics(hotelId: string) {
    try {
      const stats = await this.repo.getHotelStatistics(hotelId);
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, message: error.message || "Lỗi khi lấy thống kê" };
    }
  }
}

