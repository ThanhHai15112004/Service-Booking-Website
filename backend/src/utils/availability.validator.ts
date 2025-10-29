// utils/availability.validator.ts
// Validator cho Availability module

import {
  AvailabilityCheckParams,
  AvailabilityUpdateParams
} from "../models/Hotel/availability.model";

interface ValidationResult {
  valid: boolean;
  message?: string;
}

interface CheckParamsValidationResult extends ValidationResult {
  data?: AvailabilityCheckParams;
}

interface UpdateParamsValidationResult extends ValidationResult {
  data?: AvailabilityUpdateParams;
}

export class AvailabilityValidator {
  /**
   * Validate params cho check availability
   */
  static validateCheckParams(params: any): CheckParamsValidationResult {
    const { startDate, endDate } = params;

    // Kiểm tra required fields
    if (!startDate || !endDate) {
      return {
        valid: false,
        message: "Thiếu startDate hoặc endDate"
      };
    }

    // Validate date format và logic
    const dateValidation = this.validateDates(startDate, endDate);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    return {
      valid: true,
      data: {
        startDate: String(startDate).trim(),
        endDate: String(endDate).trim()
      }
    };
  }

  /**
   * Validate params cho update availability (reduce/increase)
   */
  static validateUpdateParams(params: any): UpdateParamsValidationResult {
    const { roomId, startDate, endDate, roomsCount } = params;

    // Kiểm tra required fields
    if (!roomId) {
      return {
        valid: false,
        message: "Thiếu roomId"
      };
    }

    if (!startDate || !endDate) {
      return {
        valid: false,
        message: "Thiếu startDate hoặc endDate"
      };
    }

    if (roomsCount === undefined || roomsCount === null) {
      return {
        valid: false,
        message: "Thiếu roomsCount"
      };
    }

    // Validate roomsCount
    const count = Number(roomsCount);
    if (isNaN(count) || count <= 0 || !Number.isInteger(count)) {
      return {
        valid: false,
        message: "roomsCount phải là số nguyên dương"
      };
    }

    if (count > 100) {
      return {
        valid: false,
        message: "roomsCount không được vượt quá 100"
      };
    }

    // Validate roomId format
    const roomIdStr = String(roomId).trim();
    if (roomIdStr.length === 0 || roomIdStr.length > 20) {
      return {
        valid: false,
        message: "roomId không hợp lệ"
      };
    }

    // Validate dates
    const dateValidation = this.validateDates(startDate, endDate);
    if (!dateValidation.valid) {
      return dateValidation;
    }

    return {
      valid: true,
      data: {
        roomId: roomIdStr,
        startDate: String(startDate).trim(),
        endDate: String(endDate).trim(),
        roomsCount: count
      }
    };
  }

  /**
   * Validate date format và business rules
   */
  private static validateDates(startDate: any, endDate: any): ValidationResult {
    // Validate format
    const startDateStr = String(startDate).trim();
    const endDateStr = String(endDate).trim();

    // Check ISO format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDateStr)) {
      return {
        valid: false,
        message: "startDate phải có định dạng YYYY-MM-DD"
      };
    }

    if (!dateRegex.test(endDateStr)) {
      return {
        valid: false,
        message: "endDate phải có định dạng YYYY-MM-DD"
      };
    }

    // Parse dates
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    // Check valid dates
    if (isNaN(start.getTime())) {
      return {
        valid: false,
        message: "startDate không phải là ngày hợp lệ"
      };
    }

    if (isNaN(end.getTime())) {
      return {
        valid: false,
        message: "endDate không phải là ngày hợp lệ"
      };
    }

    // Check startDate < endDate
    if (start >= end) {
      return {
        valid: false,
        message: "startDate phải nhỏ hơn endDate"
      };
    }

    // Check không quá xa trong tương lai (max 2 năm)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    if (end > maxDate) {
      return {
        valid: false,
        message: "endDate không được quá 2 năm trong tương lai"
      };
    }

    // Check khoảng thời gian không quá dài (max 365 ngày)
    const diffTime = end.getTime() - start.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 365) {
      return {
        valid: false,
        message: "Khoảng thời gian không được vượt quá 365 ngày"
      };
    }

    return { valid: true };
  }

  /**
   * Validate roomId format
   */
  static validateRoomId(roomId: any): ValidationResult {
    if (!roomId) {
      return {
        valid: false,
        message: "Thiếu roomId"
      };
    }

    const roomIdStr = String(roomId).trim();
    
    if (roomIdStr.length === 0) {
      return {
        valid: false,
        message: "roomId không được rỗng"
      };
    }

    if (roomIdStr.length > 20) {
      return {
        valid: false,
        message: "roomId không được vượt quá 20 ký tự"
      };
    }

    // Check format (chỉ cho phép chữ, số, underscore, hyphen)
    if (!/^[a-zA-Z0-9_-]+$/.test(roomIdStr)) {
      return {
        valid: false,
        message: "roomId chỉ được chứa chữ, số, gạch dưới và gạch ngang"
      };
    }

    return { valid: true };
  }

  /**
   * Validate hotelId format
   */
  static validateHotelId(hotelId: any): ValidationResult {
    if (!hotelId) {
      return {
        valid: false,
        message: "Thiếu hotelId"
      };
    }

    const hotelIdStr = String(hotelId).trim();
    
    if (hotelIdStr.length === 0) {
      return {
        valid: false,
        message: "hotelId không được rỗng"
      };
    }

    if (hotelIdStr.length > 20) {
      return {
        valid: false,
        message: "hotelId không được vượt quá 20 ký tự"
      };
    }

    // Check format
    if (!/^[a-zA-Z0-9_-]+$/.test(hotelIdStr)) {
      return {
        valid: false,
        message: "hotelId chỉ được chứa chữ, số, gạch dưới và gạch ngang"
      };
    }

    return { valid: true };
  }
}

