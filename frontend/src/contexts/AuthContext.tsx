import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  account_id: number;
  full_name: string;
  username?: string;
  email: string;
  phone_number?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      try {
        setAccessToken(storedAccessToken);
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = (newUser: User, newAccessToken: string, refreshToken: string) => {
    // Update localStorage
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Update state ngay lập tức
    setAccessToken(newAccessToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clear state ngay lập tức
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
