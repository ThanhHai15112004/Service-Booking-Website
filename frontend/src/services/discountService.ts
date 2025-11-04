import api from "../api/axiosClient";

// ✅ Validate discount code
export interface ValidateDiscountCodeRequest {
  code: string;
  subtotal: number;
  hotelId?: string;
  roomId?: string;
  nights?: number;
}

export interface ValidateDiscountCodeResponse {
  success: boolean;
  message?: string;
  discountAmount?: number;
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

