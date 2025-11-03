import { ReactNode } from "react";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  adminName?: string;
}

const AdminLayout = ({ children, onLogout, adminName }: AdminLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 transition-all duration-300">
        <AdminHeader onLogout={onLogout} adminName={adminName} />
        <main className="pt-16">
          <div className="p-8 animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
