import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { logout as logoutAPI } from '../services/authService';
import adminApi from '../api/adminAxiosClient';

interface AdminUser {
  account_id: string;
  full_name: string;
  username?: string;
  email: string;
  phone_number?: string;
  role: 'ADMIN' | 'STAFF';
  status: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  avatar_url?: string;
}

interface AdminAuthContextType {
  isLoggedIn: boolean;
  user: AdminUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: AdminUser, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (newAccessToken: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    // Gọi API logout để revoke refresh token
    const refreshToken = localStorage.getItem('adminRefreshToken');
    if (refreshToken) {
      try {
        await logoutAPI(refreshToken);
      } catch (error) {
        console.error('Error during admin logout:', error);
      }
    }

    // Clear localStorage
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');

    // Clear state ngay lập tức
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // Function để update access token khi refresh
  const updateAccessToken = useCallback((newAccessToken: string) => {
    localStorage.setItem('adminAccessToken', newAccessToken);
    setAccessToken(newAccessToken);
  }, []);

  // Kiểm tra trạng thái đăng nhập admin khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedAccessToken = localStorage.getItem('adminAccessToken');
      const storedRefreshToken = localStorage.getItem('adminRefreshToken');
      const storedUser = localStorage.getItem('adminUser');

      if (storedAccessToken && storedUser && storedRefreshToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Chỉ set nếu là ADMIN hoặc STAFF
          if (parsedUser.role === 'ADMIN' || parsedUser.role === 'STAFF') {
            // Kiểm tra refresh token có còn tồn tại trong DB không
            try {
              const tokenCheck = await adminApi.post('/api/auth/check-refresh-token', {
                refresh_token: storedRefreshToken
              });
              if (!tokenCheck.data.success || !tokenCheck.data.valid) {
                // Refresh token không hợp lệ → logout
                console.log('Admin refresh token không hợp lệ, tự động logout');
                await logout(); // Use the logout function
                setIsLoading(false);
                return;
              }
            } catch (error) {
              // Nếu API call fail (network error, etc.), không logout ngay
              // Chỉ logout nếu chắc chắn token không hợp lệ
              console.error('Error checking admin refresh token:', error);
              // Vẫn set auth state từ localStorage để không mất login
              setAccessToken(storedAccessToken);
              setUser(parsedUser);
              setIsLoggedIn(true);
              setIsLoading(false);
              return;
            }

            setAccessToken(storedAccessToken);
            setUser(parsedUser);
            setIsLoggedIn(true);
          } else {
            // Nếu không phải admin, clear
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('Error parsing stored admin user:', error);
          localStorage.removeItem('adminAccessToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminUser');
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Check refresh token định kỳ mỗi 5 phút
    const interval = setInterval(async () => {
      const storedRefreshToken = localStorage.getItem('adminRefreshToken');
      if (storedRefreshToken && isLoggedIn) {
        try {
          const tokenCheck = await adminApi.post('/api/auth/check-refresh-token', {
            refresh_token: storedRefreshToken
          });
          if (!tokenCheck.data.success || !tokenCheck.data.valid) {
            // Refresh token không hợp lệ → logout
            console.log('Admin refresh token không hợp lệ, tự động logout');
            await logout();
          }
        } catch (error) {
          // Nếu API call fail, không logout ngay (có thể là network error)
          console.error('Error checking admin refresh token:', error);
          // Chỉ log error, không logout để tránh mất login khi network có vấn đề
        }
      }
    }, 5 * 60 * 1000); // 5 phút

    return () => clearInterval(interval);
  }, [isLoggedIn, logout, updateAccessToken]);

  const login = (newUser: AdminUser, newAccessToken: string, refreshToken: string) => {
    // Chỉ cho phép ADMIN hoặc STAFF
    if (newUser.role !== 'ADMIN' && newUser.role !== 'STAFF') {
      throw new Error('Chỉ ADMIN và STAFF mới được phép đăng nhập');
    }

    // Update localStorage với keys riêng cho admin
    localStorage.setItem('adminAccessToken', newAccessToken);
    localStorage.setItem('adminRefreshToken', refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(newUser));

    // Update state ngay lập tức
    setAccessToken(newAccessToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  // Listen for custom events from axios interceptors
  useEffect(() => {
    const handleLogoutRequired = () => {
      console.log('Admin logout required event received');
      logout();
    };

    const handleTokenRefreshed = (event: CustomEvent<{ accessToken: string }>) => {
      console.log('Admin token refreshed event received');
      updateAccessToken(event.detail.accessToken);
    };

    window.addEventListener('adminLogoutRequired', handleLogoutRequired as EventListener);
    window.addEventListener('adminTokenRefreshed', handleTokenRefreshed as EventListener);

    return () => {
      window.removeEventListener('adminLogoutRequired', handleLogoutRequired as EventListener);
      window.removeEventListener('adminTokenRefreshed', handleTokenRefreshed as EventListener);
    };
  }, [logout, updateAccessToken]);

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, user, accessToken, isLoading, login, updateAccessToken, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook để sử dụng AdminAuthContext
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
