import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true,
});

// Request interceptor để thêm Authorization header cho user
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('userAccessToken');
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
        // ✅ FIX: Chỉ trigger refresh token cho các API calls thực sự cần auth
        // Không trigger cho các public endpoints như /api/hotels/search, /api/hotels/:id, etc.
        const isPublicEndpoint = originalRequest.url?.includes('/api/hotels/search') || 
                                  (originalRequest.url?.includes('/api/hotels/') && !originalRequest.url?.includes('/api/hotels/bookings')) ||
                                  originalRequest.url?.includes('/api/auth/') ||
                                  originalRequest.url?.includes('/api/upload/');
        
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isPublicEndpoint) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('userRefreshToken');
                if (!refreshToken) {
                    // No refresh token, dispatch event để AuthContext logout
                    localStorage.removeItem('userAccessToken');
                    localStorage.removeItem('userRefreshToken');
                    localStorage.removeItem('userInfo');
                    // Dispatch custom event để AuthContext logout
                    window.dispatchEvent(new CustomEvent('userLogoutRequired'));
                    throw new Error('No user refresh token');
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
                    localStorage.setItem('userAccessToken', accessToken);
                    console.log('✅ User token refreshed successfully');
                    
                    // Dispatch event để AuthContext update token
                    window.dispatchEvent(new CustomEvent('userTokenRefreshed', { detail: { accessToken } }));
                    
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
                // Refresh failed, dispatch event để AuthContext logout
                console.error('User token refresh failed:', refreshError);
                localStorage.removeItem('userAccessToken');
                localStorage.removeItem('userRefreshToken');
                localStorage.removeItem('userInfo');
                // Dispatch custom event để AuthContext logout (không reload trang)
                window.dispatchEvent(new CustomEvent('userLogoutRequired'));
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
