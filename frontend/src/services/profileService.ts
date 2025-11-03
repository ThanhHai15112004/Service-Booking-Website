import api from '../api/axiosClient';

// Profile Services (existing)
export const getProfile = async () => {
  try {
    const res = await api.get('/api/profile');
    return res.data;
  } catch (error: any) {
    console.error('Error getting profile:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể lấy thông tin profile'
    };
  }
};

export const updateProfile = async (data: any) => {
  try {
    const res = await api.put('/api/profile', data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể cập nhật profile'
    };
  }
};

export const changePassword = async (data: { old_password: string; new_password: string }) => {
  try {
    const res = await api.put('/api/profile/password', data);
    return res.data;
  } catch (error: any) {
    console.error('Error changing password:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể đổi mật khẩu'
    };
  }
};

// Address Services
export const getAddresses = async () => {
  try {
    const res = await api.get('/api/profile/addresses');
    return res.data;
  } catch (error: any) {
    console.error('Error getting addresses:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể lấy danh sách địa chỉ'
    };
  }
};

export const createAddress = async (data: any) => {
  try {
    const res = await api.post('/api/profile/addresses', data);
    return res.data;
  } catch (error: any) {
    console.error('Error creating address:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tạo địa chỉ'
    };
  }
};

export const updateAddress = async (addressId: string, data: any) => {
  try {
    const res = await api.put(`/api/profile/addresses/${addressId}`, data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating address:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể cập nhật địa chỉ'
    };
  }
};

export const deleteAddress = async (addressId: string) => {
  try {
    const res = await api.delete(`/api/profile/addresses/${addressId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể xóa địa chỉ'
    };
  }
};

// Review Services
export const getReviews = async () => {
  try {
    const res = await api.get('/api/profile/reviews');
    return res.data;
  } catch (error: any) {
    console.error('Error getting reviews:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể lấy danh sách đánh giá'
    };
  }
};

export const createReview = async (data: any) => {
  try {
    const res = await api.post('/api/profile/reviews', data);
    return res.data;
  } catch (error: any) {
    console.error('Error creating review:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể tạo đánh giá'
    };
  }
};

export const updateReview = async (reviewId: string, data: any) => {
  try {
    const res = await api.put(`/api/profile/reviews/${reviewId}`, data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating review:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể cập nhật đánh giá'
    };
  }
};

export const deleteReview = async (reviewId: string) => {
  try {
    const res = await api.delete(`/api/profile/reviews/${reviewId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể xóa đánh giá'
    };
  }
};

export const getUserHotelReview = async (hotelId: string) => {
  try {
    const res = await api.get(`/api/profile/reviews/hotel/${hotelId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error getting user hotel review:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Không thể lấy đánh giá'
    };
  }
};

// Settings Services
export const getSettings = async () => {
  try {
    const res = await api.get('/api/profile/settings');
    return res.data;
  } catch (error: any) {
    console.error('Error getting settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể lấy cài đặt'
    };
  }
};

export const updateSettings = async (data: any) => {
  try {
    const res = await api.put('/api/profile/settings', data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể cập nhật cài đặt'
    };
  }
};

// Payment Cards Services
export const getPaymentCards = async () => {
  try {
    const res = await api.get('/api/profile/cards');
    return res.data;
  } catch (error: any) {
    console.error('Error getting payment cards:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể lấy danh sách thẻ'
    };
  }
};

export const createPaymentCard = async (data: any) => {
  try {
    const res = await api.post('/api/profile/cards', data);
    return res.data;
  } catch (error: any) {
    console.error('Error creating payment card:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể thêm thẻ'
    };
  }
};

export const updatePaymentCard = async (cardId: string, data: any) => {
  try {
    const res = await api.put(`/api/profile/cards/${cardId}`, data);
    return res.data;
  } catch (error: any) {
    console.error('Error updating payment card:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể cập nhật thẻ'
    };
  }
};

export const deletePaymentCard = async (cardId: string) => {
  try {
    const res = await api.delete(`/api/profile/cards/${cardId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error deleting payment card:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể xóa thẻ'
    };
  }
};

export const setDefaultPaymentCard = async (cardId: string) => {
  try {
    const res = await api.put(`/api/profile/cards/${cardId}/default`);
    return res.data;
  } catch (error: any) {
    console.error('Error setting default payment card:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Không thể đặt thẻ mặc định'
    };
  }
};

// Upload Image Service
export const uploadImage = async (file: File) => {
  try {
    // Validate file before sending
    if (!file || !file.type || !file.name) {
      return {
        success: false,
        message: 'File không hợp lệ'
      };
    }

    // Validate file type - chỉ cho phép JPEG, PNG, GIF, WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const mimeType = file.type.toLowerCase();
    
    // Kiểm tra cả mimetype và extension
    const isValidMimeType = allowedTypes.includes(mimeType);
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (!isValidMimeType || !isValidExtension) {
      return {
        success: false,
        message: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.'
      };
    }

    const formData = new FormData();
    // Use the original file, not a copy
    formData.append('image', file, file.name);
    
    const res = await api.post('/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    console.error('File details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });
    
    // Extract error message from response
    let errorMessage = 'Không thể upload ảnh';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
      // Check if it's a format error
      if (errorMessage.includes('JPEG') || errorMessage.includes('PNG') || errorMessage.includes('GIF') || errorMessage.includes('WebP') || errorMessage.includes('định dạng')) {
        errorMessage = 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};
