import api from "../api/axiosClient";

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

export const resendVerification = async (email: string) => {
  const res = await api.post('/api/auth/resend-verification', { email });
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