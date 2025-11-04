import { useState } from "react";
import { 
  LayoutDashboard, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users, 
  Star, 
  UserCheck, 
  Package,
  Download,
} from "lucide-react";
import MainDashboard from "./MainDashboard";
import RevenueReports from "./RevenueReports";
import BookingReports from "./BookingReports";
import OccupancyReports from "./OccupancyReports";
import CustomerInsights from "./CustomerInsights";
import ReviewAnalytics from "./ReviewAnalytics";
import StaffReports from "./StaffReports";
import PackageReports from "./PackageReports";
import ReportsExportCenter from "./ReportsExportCenter";

type ReportView = "main" | "revenue" | "booking" | "occupancy" | "customer" | "review" | "staff" | "package" | "export";

const ReportsManager = () => {
  const [currentView, setCurrentView] = useState<ReportView>("main");

  const reportViews = {
    main: <MainDashboard />,
    revenue: <RevenueReports />,
    booking: <BookingReports />,
    occupancy: <OccupancyReports />,
    customer: <CustomerInsights />,
    review: <ReviewAnalytics />,
    staff: <StaffReports />,
    package: <PackageReports />,
    export: <ReportsExportCenter />,
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentView("main")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "main"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard tổng quan
          </button>
          <button
            onClick={() => setCurrentView("revenue")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "revenue"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <DollarSign size={18} />
            Doanh thu
          </button>
          <button
            onClick={() => setCurrentView("booking")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "booking"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Calendar size={18} />
            Booking
          </button>
          <button
            onClick={() => setCurrentView("occupancy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "occupancy"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <TrendingUp size={18} />
            Tỷ lệ lấp đầy
          </button>
          <button
            onClick={() => setCurrentView("customer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "customer"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Users size={18} />
            Khách hàng
          </button>
          <button
            onClick={() => setCurrentView("review")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "review"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Star size={18} />
            Đánh giá
          </button>
          <button
            onClick={() => setCurrentView("staff")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "staff"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <UserCheck size={18} />
            Nhân viên
          </button>
          <button
            onClick={() => setCurrentView("package")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "package"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Package size={18} />
            Gói tài khoản
          </button>
          <button
            onClick={() => setCurrentView("export")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentView === "export"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Current View */}
      {reportViews[currentView]}
    </div>
  );
};

export default ReportsManager;
