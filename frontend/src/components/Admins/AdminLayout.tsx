import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import Loading from "../Loading";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { user, logout, isLoggedIn, isLoading } = useAuth();

  // ✅ Double check: Nếu chưa đăng nhập (sau khi đã load xong), redirect về admin login
  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !user)) {
      navigate("/admin/login", { replace: true, state: { from: window.location.pathname } });
    }
  }, [isLoggedIn, user, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  // ✅ Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return <Loading message="Đang kiểm tra quyền truy cập..." />;
  }

  // ✅ Nếu chưa đăng nhập, không render (sẽ redirect ở useEffect)
  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 transition-all duration-300">
        <AdminHeader 
          onLogout={handleLogout} 
          adminName={user?.full_name || user?.email || "Admin"} 
        />
        <main className="pt-16">
          <div className="p-8 animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
