import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
});

// Request interceptor để thêm Authorization header cho admin
adminApi.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('adminAccessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor để xử lý token refresh cho admin
adminApi.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        // ✅ Handle both 401 (Unauthorized) and 403 (Forbidden - Token expired/invalid)
        // ✅ FIX: Chỉ trigger refresh token cho các API calls thực sự cần auth
        // Không trigger cho các public endpoints
        const isPublicEndpoint = originalRequest.url?.includes('/api/auth/') ||
                                  originalRequest.url?.includes('/api/upload/');
        
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isPublicEndpoint) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('adminRefreshToken');
                if (!refreshToken) {
                    // No refresh token, dispatch event để AdminAuthContext logout
                    localStorage.removeItem('adminAccessToken');
                    localStorage.removeItem('adminRefreshToken');
                    localStorage.removeItem('adminUser');
                    // Dispatch custom event để AdminAuthContext logout
                    window.dispatchEvent(new CustomEvent('adminLogoutRequired'));
                    throw new Error('No admin refresh token');
                }

                const refreshUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/api/auth/refresh-token`;
                console.log('🔄 Attempting to refresh admin token...');
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
                    localStorage.setItem('adminAccessToken', accessToken);
                    console.log('✅ Admin token refreshed successfully');
                    
                    // Dispatch event để AdminAuthContext update token
                    window.dispatchEvent(new CustomEvent('adminTokenRefreshed', { detail: { accessToken } }));
                    
                    // Retry original request với token mới
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    }
                    return adminApi(originalRequest);
                } else {
                    console.error('❌ Invalid admin refresh token response:', response.data);
                    throw new Error('Failed to refresh admin token: Invalid response');
                }
            } catch (refreshError) {
                // Refresh failed, dispatch event để AdminAuthContext logout
                console.error('Admin token refresh failed:', refreshError);
                localStorage.removeItem('adminAccessToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminUser');
                // Dispatch custom event để AdminAuthContext logout (không reload trang)
                window.dispatchEvent(new CustomEvent('adminLogoutRequired'));
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default adminApi;

