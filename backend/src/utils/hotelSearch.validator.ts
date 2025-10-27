// utils/hotelSearch.validator.ts

import { HotelSearchParams } from "../models/Hotel/hotel.model";

interface ValidationResult {
  valid: boolean;
  data?: HotelSearchParams;
  message?: string;
}

export class HotelSearchValidator {
  static validate(params: any): ValidationResult {
    const stayTypeValidation = this.validateStayType(params.stayType);
    if (!stayTypeValidation.valid) {
      return stayTypeValidation;
    }

    if (params.stayType === "overnight") {
      const overnightValidation = this.validateOvernight(params);
      if (!overnightValidation.valid) {
        return overnightValidation;
      }
    } else {
      const dayuseValidation = this.validateDayuse(params);
      if (!dayuseValidation.valid) {
        return dayuseValidation;
      }
    }

    const sanitized = this.sanitizeParams(params);
    return { valid: true, data: sanitized };
  }

  private static validateStayType(stayType: any): ValidationResult {
    if (!stayType || !["overnight", "dayuse"].includes(stayType)) {
      return {
        valid: false,
        message: "stayType phải là 'overnight' hoặc 'dayuse'",
      };
    }
    return { valid: true };
  }

  private static validateOvernight(params: any): ValidationResult {
    const { checkin, checkout } = params;

    if (!checkin || !checkout) {
      return {
        valid: false,
        message: "checkin và checkout là bắt buộc cho overnight",
      };
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
      return {
        valid: false,
        message: "checkin hoặc checkout không hợp lệ (định dạng: YYYY-MM-DD)",
      };
    }

    if (checkinDate >= checkoutDate) {
      return {
        valid: false,
        message: "checkout phải sau checkin",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkinDate < today) {
      return {
        valid: false,
        message: "checkin không được là ngày trong quá khứ",
      };
    }

    return { valid: true };
  }

  private static validateDayuse(params: any): ValidationResult {
    const { date } = params;

    if (!date) {
      return {
        valid: false,
        message: "date là bắt buộc cho dayuse",
      };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return {
        valid: false,
        message: "date không hợp lệ (định dạng: YYYY-MM-DD)",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return {
        valid: false,
        message: "date không được là ngày trong quá khứ",
      };
    }

    return { valid: true };
  }

  // ✅ FIX: Thêm bed_types và policies
  private static sanitizeParams(params: any): HotelSearchParams {
    return {
      stayType: params.stayType,
      q: this.sanitizeString(params.q, 100),
      checkin: params.checkin,
      checkout: params.checkout,
      date: params.date,
      rooms: this.toPositiveInt(params.rooms, 1),
      adults: this.toPositiveInt(params.adults, 1),
      children: this.toPositiveInt(params.children, 0),
      star_min: this.toPositiveInt(params.star_min, 0, 5),
      max_distance: this.toPositiveInt(params.max_distance, 999),
      category_id: this.sanitizeString(params.category_id, 20),
      facilities: this.sanitizeArray(params.facilities),
      bed_types: this.sanitizeArray(params.bed_types), // ✅ THÊM DÒNG NÀY
      policies: this.sanitizeArray(params.policies),   // ✅ THÊM DÒNG NÀY
      limit: this.toPositiveInt(params.limit, 10, 100),
      offset: this.toPositiveInt(params.offset, 0),
      sort: this.sanitizeSort(params.sort),
    };
  }

  private static sanitizeString(
    value: any,
    maxLength: number
  ): string | undefined {
    if (!value) return undefined;
    return String(value).trim().slice(0, maxLength) || undefined;
  }

  private static sanitizeArray(value: any): string[] | undefined {
    if (!value) return undefined;

    if (Array.isArray(value)) {
      const cleaned = value
        .map((v) => String(v).trim())
        .filter(Boolean);
      return cleaned.length > 0 ? cleaned : undefined;
    }

    const singleValue = String(value).trim();
    return singleValue ? [singleValue] : undefined;
  }

  private static sanitizeSort(
    value: any
  ): "price_asc" | "price_desc" | "star_desc" | "rating_desc" | "distance_asc" {
    const validSorts = [
      "price_asc",
      "price_desc",
      "star_desc",
      "rating_desc",
      "distance_asc",
    ] as const;
    
    return validSorts.includes(value) ? value : "price_asc";
  }

  private static toPositiveInt(
    value: any,
    defaultValue: number,
    max?: number
  ): number {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return defaultValue;
    if (max !== undefined && num > max) return max;
    return num;
  }
}