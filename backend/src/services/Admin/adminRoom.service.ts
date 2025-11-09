import { AdminRoomRepository, AdminRoomType, AdminRoom } from "../../Repository/Admin/adminRoom.repository";

export class AdminRoomService {
  private repo = new AdminRoomRepository();

  // ========== ROOM TYPES ==========

  async getRoomTypesByHotel(hotelId: string, filters?: {
    search?: string;
    bedType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      if (!hotelId) {
        return {
          success: false,
          message: "Hotel ID là bắt buộc",
        };
      }

      const result = await this.repo.getRoomTypesByHotel(hotelId, filters);
      return {
        success: true,
        data: {
          roomTypes: result.roomTypes,
          total: result.total,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          totalPages: Math.ceil(result.total / (filters?.limit || 10)),
        },
      };
    } catch (error: any) {
      console.error("[AdminRoomService] Error getting room types:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách loại phòng",
      };
    }
  }

  async getRoomTypeById(roomTypeId: string) {
    try {
      const roomType = await this.repo.getRoomTypeById(roomTypeId);
      if (!roomType) {
        return {
          success: false,
          message: "Không tìm thấy loại phòng",
        };
      }
      return {
        success: true,
        data: roomType,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết loại phòng",
      };
    }
  }

  async createRoomType(data: {
    room_type_id: string;
    hotel_id: string;
    name: string;
    description?: string;
    bed_type?: string;
    area?: number;
    image_url?: string;
  }) {
    try {
      // Validate
      if (!data.room_type_id || !data.hotel_id || !data.name) {
        return {
          success: false,
          message: "Thiếu thông tin bắt buộc",
        };
      }

      const created = await this.repo.createRoomType(data);
      if (!created) {
        return {
          success: false,
          message: "Không thể tạo loại phòng",
        };
      }

      return {
        success: true,
        message: "Tạo loại phòng thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi tạo loại phòng",
      };
    }
  }

  async updateRoomType(roomTypeId: string, data: {
    name?: string;
    description?: string;
    bed_type?: string;
    area?: number;
    image_url?: string;
  }) {
    try {
      const updated = await this.repo.updateRoomType(roomTypeId, data);
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật loại phòng",
        };
      }

      return {
        success: true,
        message: "Cập nhật loại phòng thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật loại phòng",
      };
    }
  }

  async deleteRoomType(roomTypeId: string) {
    try {
      const deleted = await this.repo.deleteRoomType(roomTypeId);
      if (!deleted) {
        return {
          success: false,
          message: "Không thể xóa loại phòng",
        };
      }

      return {
        success: true,
        message: "Xóa loại phòng thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi xóa loại phòng",
      };
    }
  }

  // ========== ROOMS ==========

  async getRoomsByHotel(hotelId: string, filters?: {
    roomTypeId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      if (!hotelId) {
        return {
          success: false,
          message: "Hotel ID là bắt buộc",
        };
      }

      const result = await this.repo.getRoomsByHotel(hotelId, filters);
      return {
        success: true,
        data: {
          rooms: result.rooms,
          total: result.total,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          totalPages: Math.ceil(result.total / (filters?.limit || 10)),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách phòng",
      };
    }
  }

  async getRoomsByRoomType(roomTypeId: string, filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      if (!roomTypeId) {
        return {
          success: false,
          message: "Room Type ID là bắt buộc",
        };
      }

      const result = await this.repo.getRoomsByRoomType(roomTypeId, filters);
      return {
        success: true,
        data: {
          rooms: result.rooms,
          total: result.total,
          page: filters?.page || 1,
          limit: filters?.limit || 10,
          totalPages: Math.ceil(result.total / (filters?.limit || 10)),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách phòng",
      };
    }
  }

  async getRoomById(roomId: string) {
    try {
      const room = await this.repo.getRoomById(roomId);
      if (!room) {
        return {
          success: false,
          message: "Không tìm thấy phòng",
        };
      }
      return {
        success: true,
        data: room,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy chi tiết phòng",
      };
    }
  }

  async createRoom(data: {
    room_id: string;
    room_type_id: string;
    room_number?: string;
    capacity: number;
    image_url?: string;
    price_base?: number;
    status?: string;
  }) {
    try {
      // Validate
      if (!data.room_id || !data.room_type_id || !data.capacity) {
        return {
          success: false,
          message: "Thiếu thông tin bắt buộc",
        };
      }

      const created = await this.repo.createRoom(data);
      if (!created) {
        return {
          success: false,
          message: "Không thể tạo phòng",
        };
      }

      return {
        success: true,
        message: "Tạo phòng thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi tạo phòng",
      };
    }
  }

  async updateRoom(roomId: string, data: {
    room_number?: string;
    capacity?: number;
    image_url?: string;
    price_base?: number;
    status?: string;
  }) {
    try {
      const updated = await this.repo.updateRoom(roomId, data);
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật phòng",
        };
      }

      return {
        success: true,
        message: "Cập nhật phòng thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật phòng",
      };
    }
  }

  async deleteRoom(roomId: string) {
    try {
      const deleted = await this.repo.deleteRoom(roomId);
      if (!deleted) {
        return {
          success: false,
          message: "Không thể xóa phòng",
        };
      }

      return {
        success: true,
        message: "Xóa phòng thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi xóa phòng",
      };
    }
  }

  async updateRoomStatus(roomId: string, status: string) {
    try {
      const validStatuses = ["ACTIVE", "INACTIVE", "MAINTENANCE"];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: "Trạng thái không hợp lệ",
        };
      }

      const updated = await this.repo.updateRoomStatus(roomId, status);
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật trạng thái",
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

  // Helper methods
  async getBedTypes() {
    try {
      const bedTypes = await this.repo.getBedTypes();
      return {
        success: true,
        data: bedTypes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách loại giường",
      };
    }
  }

  async getRoomTypesForHotel(hotelId: string) {
    try {
      if (!hotelId) {
        return {
          success: false,
          message: "Hotel ID là bắt buộc",
        };
      }

      const roomTypes = await this.repo.getRoomTypesForHotel(hotelId);
      return {
        success: true,
        data: roomTypes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách loại phòng",
      };
    }
  }

  // ========== ROOM IMAGES ==========
  async getRoomImages(roomTypeId: string) {
    try {
      const images = await this.repo.getRoomImages(roomTypeId);
      return {
        success: true,
        data: images,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách ảnh",
      };
    }
  }

  async addRoomImage(roomTypeId: string, imageUrl: string, imageAlt?: string, isPrimary: boolean = false) {
    try {
      const added = await this.repo.addRoomImage(roomTypeId, imageUrl, imageAlt, isPrimary);
      if (!added) {
        return {
          success: false,
          message: "Không thể thêm ảnh",
        };
      }
      return {
        success: true,
        message: "Thêm ảnh thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi thêm ảnh",
      };
    }
  }

  async deleteRoomImage(imageId: string) {
    try {
      const deleted = await this.repo.deleteRoomImage(imageId);
      if (!deleted) {
        return {
          success: false,
          message: "Không thể xóa ảnh",
        };
      }
      return {
        success: true,
        message: "Xóa ảnh thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi xóa ảnh",
      };
    }
  }

  async setPrimaryRoomImage(roomTypeId: string, imageId: string) {
    try {
      const updated = await this.repo.setPrimaryRoomImage(roomTypeId, imageId);
      if (!updated) {
        return {
          success: false,
          message: "Không thể đặt ảnh chính",
        };
      }
      return {
        success: true,
        message: "Đặt ảnh chính thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi đặt ảnh chính",
      };
    }
  }

  // ========== ROOM AMENITIES ==========
  async getRoomTypeAmenities(roomTypeId: string) {
    try {
      const amenities = await this.repo.getRoomTypeAmenities(roomTypeId);
      return {
        success: true,
        data: amenities,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách tiện nghi",
      };
    }
  }

  async getAllFacilities(category: string = "ROOM") {
    try {
      const facilities = await this.repo.getAllFacilities(category);
      return {
        success: true,
        data: facilities,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách tiện nghi",
      };
    }
  }

  async addRoomTypeAmenity(roomTypeId: string, facilityId: string) {
    try {
      const added = await this.repo.addRoomTypeAmenity(roomTypeId, facilityId);
      if (!added) {
        return {
          success: false,
          message: "Không thể thêm tiện nghi",
        };
      }
      return {
        success: true,
        message: "Thêm tiện nghi thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi thêm tiện nghi",
      };
    }
  }

  async removeRoomTypeAmenity(roomTypeId: string, facilityId: string) {
    try {
      const removed = await this.repo.removeRoomTypeAmenity(roomTypeId, facilityId);
      if (!removed) {
        return {
          success: false,
          message: "Không thể xóa tiện nghi",
        };
      }
      return {
        success: true,
        message: "Xóa tiện nghi thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi xóa tiện nghi",
      };
    }
  }

  // ========== ROOM POLICIES ==========
  async getRoomTypePolicies(roomTypeId: string) {
    try {
      const policies = await this.repo.getRoomTypePolicies(roomTypeId);
      return {
        success: true,
        data: policies,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách chính sách",
      };
    }
  }

  async getAllPolicyTypes(applicableTo: string = "ROOM") {
    try {
      const policyTypes = await this.repo.getAllPolicyTypes(applicableTo);
      return {
        success: true,
        data: policyTypes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách loại chính sách",
      };
    }
  }

  async addRoomTypePolicy(roomTypeId: string, policyKey: string, value: string) {
    try {
      const added = await this.repo.addRoomTypePolicy(roomTypeId, policyKey, value);
      if (!added) {
        return {
          success: false,
          message: "Không thể thêm chính sách",
        };
      }
      return {
        success: true,
        message: "Thêm chính sách thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi thêm chính sách",
      };
    }
  }

  async updateRoomTypePolicy(roomTypeId: string, policyKey: string, value: string) {
    try {
      const updated = await this.repo.updateRoomTypePolicy(roomTypeId, policyKey, value);
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật chính sách",
        };
      }
      return {
        success: true,
        message: "Cập nhật chính sách thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật chính sách",
      };
    }
  }

  async removeRoomTypePolicy(roomTypeId: string, policyKey: string) {
    try {
      const removed = await this.repo.removeRoomTypePolicy(roomTypeId, policyKey);
      if (!removed) {
        return {
          success: false,
          message: "Không thể xóa chính sách",
        };
      }
      return {
        success: true,
        message: "Xóa chính sách thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi xóa chính sách",
      };
    }
  }

  // ========== ROOM PRICE SCHEDULES ==========
  async getRoomTypePriceSchedules(roomTypeId: string) {
    try {
      const schedules = await this.repo.getRoomTypePriceSchedules(roomTypeId);
      return {
        success: true,
        data: schedules,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy lịch giá",
      };
    }
  }

  async getRoomTypeBasePrice(roomTypeId: string) {
    try {
      const basePrice = await this.repo.getRoomTypeBasePrice(roomTypeId);
      return {
        success: true,
        data: { basePrice },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy giá cơ bản",
      };
    }
  }

  async updateRoomTypeBasePrice(roomTypeId: string, basePrice: number) {
    try {
      if (basePrice < 0) {
        return {
          success: false,
          message: "Giá cơ bản phải lớn hơn hoặc bằng 0",
        };
      }

      const updated = await this.repo.updateRoomTypeBasePrice(roomTypeId, basePrice);
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật giá cơ bản",
        };
      }

      return {
        success: true,
        message: "Cập nhật giá cơ bản thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật giá cơ bản",
      };
    }
  }

  async updateRoomTypeDateDiscount(roomTypeId: string, date: string, discountPercent: number) {
    try {
      if (discountPercent < 0 || discountPercent > 100) {
        return {
          success: false,
          message: "Phần trăm giảm giá phải từ 0 đến 100",
        };
      }

      const updated = await this.repo.updateRoomTypeDateDiscount(roomTypeId, date, discountPercent);
      
      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật khuyến mãi",
        };
      }

      return {
        success: true,
        message: "Cập nhật khuyến mãi thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật khuyến mãi",
      };
    }
  }

  async getRoomTypeDatePolicies(roomTypeId: string, date: string) {
    try {
      const policies = await this.repo.getRoomTypeDatePolicies(roomTypeId, date);
      
      if (!policies) {
        // Return default values if no schedule exists
        return {
          success: true,
          data: {
            refundable: true,
            pay_later: false,
          },
        };
      }

      return {
        success: true,
        data: policies,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thông tin chính sách",
      };
    }
  }

  async updateRoomTypeDatePolicies(
    roomTypeId: string,
    date: string,
    refundable: boolean,
    payLater: boolean
  ) {
    try {
      const updated = await this.repo.updateRoomTypeDatePolicies(
        roomTypeId,
        date,
        refundable,
        payLater
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật chính sách",
        };
      }

      return {
        success: true,
        message: "Cập nhật chính sách thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật chính sách",
      };
    }
  }

  async updateRoomTypeDateBasePrice(
    roomTypeId: string,
    date: string,
    basePrice: number
  ) {
    try {
      if (basePrice < 0) {
        return {
          success: false,
          message: "Giá cơ bản phải lớn hơn hoặc bằng 0",
        };
      }

      const updated = await this.repo.updateRoomTypeDateBasePrice(
        roomTypeId,
        date,
        basePrice
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật giá cơ bản",
        };
      }

      return {
        success: true,
        message: "Cập nhật giá cơ bản thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật giá cơ bản",
      };
    }
  }

  async updateRoomTypeDateAvailability(
    roomTypeId: string,
    date: string,
    totalAvailableRooms: number
  ) {
    try {
      if (totalAvailableRooms < 0) {
        return {
          success: false,
          message: "Số phòng trống phải lớn hơn hoặc bằng 0",
        };
      }

      const updated = await this.repo.updateRoomTypeDateAvailability(
        roomTypeId,
        date,
        totalAvailableRooms
      );

      if (!updated) {
        return {
          success: false,
          message: "Không thể cập nhật số phòng trống",
        };
      }

      return {
        success: true,
        message: "Cập nhật số phòng trống thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Lỗi khi cập nhật số phòng trống",
      };
    }
  }

  // ========== DASHBOARD STATS ==========

  async getDashboardStats() {
    try {
      const stats = await this.repo.getDashboardStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      console.error("[AdminRoomService] Error getting dashboard stats:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thống kê dashboard",
      };
    }
  }
}

