import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SearchProvider } from "./contexts/SearchContext";

// ✅ FIX: Xóa searchParams cũ từ localStorage (chỉ chạy 1 lần khi app load)
localStorage.removeItem('searchParams');

// ✅ Kiểm tra Google Client ID - ưu tiên VITE_GOOGLE_CLIENT_ID, fallback về GOOGLE_CLIENT_ID
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.GOOGLE_CLIENT_ID;
if (!googleClientId) {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_ID chưa được cấu hình trong file .env. Tính năng đăng nhập Google sẽ không hoạt động.');
} else {
  console.log('✅ Google Client ID đã được cấu hình:', googleClientId.substring(0, 20) + '...');
}

const AppContent = () => {
  // ✅ Nếu có Google Client ID, wrap với GoogleOAuthProvider
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <AdminAuthProvider>
            <ThemeProvider>
              <SearchProvider>
                <App />
              </SearchProvider>
            </ThemeProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    );
  }
  
  // ✅ Nếu không có, render App mà không có GoogleOAuthProvider
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <ThemeProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </ThemeProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppContent />
  </React.StrictMode>
);
