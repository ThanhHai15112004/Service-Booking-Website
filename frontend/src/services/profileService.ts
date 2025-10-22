import api from "../api/axiosClient";

// Lấy thông tin profile
export const getProfile = async () => {
  try {
    const res = await api.get('/api/profile');
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Lỗi khi lấy thông tin profile!' };
  }
};

// Cập nhật thông tin profile
export const updateProfile = async (data: {
  full_name?: string;
  phone_number?: string;
  avatar_url?: string;
}) => {
  try {
    const res = await api.put('/api/profile', data);
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Cập nhật profile thất bại!' };
  }
};

// Đổi mật khẩu
export const changePassword = async (data: {
  old_password: string;
  new_password: string;
}) => {
  try {
    const res = await api.post('/api/profile/change-password', data);
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Đổi mật khẩu thất bại!' };
  }
};
