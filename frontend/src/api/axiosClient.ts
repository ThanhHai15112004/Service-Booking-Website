import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
});

// Request interceptor để thêm Authorization header
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để xử lý token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // ✅ Handle both 401 (Unauthorized) and 403 (Forbidden - Token expired/invalid)
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    // No refresh token, clear everything and redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    throw new Error('No refresh token');
                }

                const refreshUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/api/auth/refresh-token`;
                console.log('🔄 Attempting to refresh token...');
                const response = await axios.post(refreshUrl, {
                    refresh_token: refreshToken
                }, {
                    // ✅ Don't send Authorization header for refresh token endpoint
                    headers: {},
                    // ✅ Don't retry refresh token request
                    withCredentials: false
                });

                // ✅ Check response structure (may have success field or direct access_token)
                const accessToken = response.data?.access_token || response.data?.accessToken;
                if (response.data && accessToken) {
                    localStorage.setItem('accessToken', accessToken);
                    console.log('✅ Token refreshed successfully');
                    
                    // Retry original request với token mới
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return api(originalRequest);
                } else {
                    console.error('❌ Invalid refresh token response:', response.data);
                    throw new Error('Failed to refresh token: Invalid response');
                }
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                // Chỉ redirect nếu không phải trang login
                if (window.location.pathname !== '/login') {
                    alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
