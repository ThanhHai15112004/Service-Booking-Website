import api from "../api/axiosClient";

// ✅ Validate discount code
export interface ValidateDiscountCodeRequest {
  code: string;
  subtotal: number;
  hotelId?: string;
  roomId?: string;
  nights?: number;
  checkInDate?: string;
  accountId?: string;
}

export interface ValidateDiscountCodeResponse {
  success: boolean;
  message?: string;
  discountAmount?: number;
}

export interface DiscountCode {
  discount_id: string;
  code: string;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  max_discount?: number | null;
  description?: string | null;
  expires_at: string;
  min_purchase?: number | null;
  min_nights?: number | null;
  max_nights?: number | null;
  usage_limit?: number | null;
  usage_count?: number;
}

export interface GetAvailableDiscountCodesParams {
  hotelId?: string;
  checkInDate?: string;
  nights?: number;
  limit?: number;
}

export const validateDiscountCode = async (
  request: ValidateDiscountCodeRequest
): Promise<ValidateDiscountCodeResponse> => {
  try {
    const res = await api.post('/api/bookings/validate-discount', request);
    return res.data;
  } catch (error: any) {
    console.error('[DiscountService] validateDiscountCode error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Lỗi khi validate mã giảm giá',
      discountAmount: 0
    };
  }
};

// ✅ Get available discount codes
export const getAvailableDiscountCodes = async (
  params?: GetAvailableDiscountCodesParams
): Promise<DiscountCode[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.hotelId) queryParams.append('hotelId', params.hotelId);
    if (params?.checkInDate) queryParams.append('checkInDate', params.checkInDate);
    if (params?.nights) queryParams.append('nights', params.nights.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const res = await api.get(`/api/bookings/discount-codes/available?${queryParams.toString()}`);
    return res.data.success ? res.data.data : [];
  } catch (error: any) {
    console.error('[DiscountService] getAvailableDiscountCodes error:', error);
    return [];
  }
};

