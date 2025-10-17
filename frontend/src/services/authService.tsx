import api from "../api/axiosClient";

// Gửi lại email xác thực
export async function resendVerificationEmail(email: string) {
  try {
    const res = await api.post('/api/auth/resend-verification', { email });
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Gửi lại email thất bại!' };
  }
}

export const checkEmailExists = async (email: string) => {
  const res = await api.get('/api/auth/check-email', { params: { email } });
  return { exists: res.data.exists, isValid: res.data.isValid, message: res.data.message };
};

export const registerAccount = async (data: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}) => {
  const res = await api.post('/api/auth/register', data);
  return res.data;
};



export const login = async (email: string, password: string) => {
  const res = await api.post('/api/auth/login', { email, password });
  // Nếu đăng nhập thành công, lưu accessToken vào localStorage
  if (res.data.success && res.data.data?.tokens?.access_token) {
    localStorage.setItem("accessToken", res.data.data.tokens.access_token);
    localStorage.setItem("refreshToken", res.data.data.tokens.refresh_token);
    localStorage.setItem("user", JSON.stringify(res.data.data.user));
  }
  return res.data;
};

export const logout = async (refreshToken: string) => {
  const res = await api.post('/api/auth/logout', { refresh_token: refreshToken });
  return res.data;
};

// Quên mật khẩu - Gửi email reset
export const forgotPassword = async (email: string) => {
  try {
    const res = await api.post('/api/auth/forgot-password', { email });
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Gửi email thất bại!' };
  }
};

// Xác thực token reset
export const verifyResetToken = async (token: string) => {
  try {
    const res = await api.get('/api/auth/verify-reset-token', { params: { token } });
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Token không hợp lệ!' };
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (token: string, newPassword: string) => {
  try {
    const res = await api.post('/api/auth/reset-password', { token, new_password: newPassword });
    return res.data;
  } catch (error: any) {
    return { success: false, message: error?.response?.data?.message || 'Đặt lại mật khẩu thất bại!' };
  }
};