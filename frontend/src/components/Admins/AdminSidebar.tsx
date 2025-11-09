import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  Building2,
  Bed,
  Calendar,
  CreditCard,
  Tags,
  Star,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import logo from "../../assets/imgs/logos/logo1.png";
import { adminService } from "../../services/adminService";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { label: string; path: string; badge?: number }[];
  badge?: number;
}

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [totalPendingBookings, setTotalPendingBookings] = useState(0);
  const [bookingBadgeCount, setBookingBadgeCount] = useState(0);

  // Auto-expand menu items based on current route
  useEffect(() => {
    const shouldExpand: string[] = [];
    
    if (location.pathname.startsWith("/admin/accounts")) {
      shouldExpand.push("accounts");
    }
    if (location.pathname.startsWith("/admin/hotels")) {
      shouldExpand.push("hotels");
    }
    if (location.pathname.startsWith("/admin/rooms")) {
      shouldExpand.push("rooms");
    }
    if (location.pathname.startsWith("/admin/bookings")) {
      shouldExpand.push("bookings");
    }
    if (location.pathname.startsWith("/admin/payments")) {
      shouldExpand.push("payments");
    }
    if (location.pathname.startsWith("/admin/discounts")) {
      shouldExpand.push("discounts");
    }
    if (location.pathname.startsWith("/admin/reviews")) {
      shouldExpand.push("reviews");
    }
    if (location.pathname.startsWith("/admin/reports")) {
      shouldExpand.push("reports");
    }

    // Only update if different to prevent unnecessary re-renders
    setExpandedItems((prev) => {
      const sortedPrev = [...prev].sort().join(",");
      const sortedShould = [...shouldExpand].sort().join(",");
      if (sortedPrev !== sortedShould) {
        return shouldExpand;
      }
      return prev;
    });
  }, [location.pathname]);

  // Fetch total pending bookings count
  useEffect(() => {
    const fetchPendingBookings = async () => {
      try {
        const response = await adminService.getTotalPendingBookingCount();
        if (response.success && response.data !== undefined) {
          setTotalPendingBookings(response.data);
        }
      } catch (error) {
        console.error("Error fetching pending bookings count:", error);
      }
    };

    fetchPendingBookings();
    // Auto-refresh mỗi 60 giây - giảm tần suất để tránh spam log
    const interval = setInterval(fetchPendingBookings, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch booking badge count (PENDING_CONFIRMATION + CHECKED_IN)
  useEffect(() => {
    const fetchBookingBadgeCount = async () => {
      try {
        const response = await adminService.getBookingDashboardStats();
        if (response.success && response.data) {
          // Tổng số booking cần xử lý: PENDING_CONFIRMATION (đỏ) + CHECKED_IN (vàng - chờ checkout)
          const pendingConfirmation = response.data.bookingsByStatus?.find(
            (s: any) => s.status === "PENDING_CONFIRMATION"
          )?.count || 0;
          const checkedIn = response.data.bookingsByStatus?.find(
            (s: any) => s.status === "CHECKED_IN"
          )?.count || 0;
          setBookingBadgeCount(pendingConfirmation + checkedIn);
        }
      } catch (error) {
        console.error("Error fetching booking badge count:", error);
      }
    };

    fetchBookingBadgeCount();
    // Auto-refresh mỗi 60 giây
    const interval = setInterval(fetchBookingBadgeCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: "reports",
      label: "Dashboard & Báo cáo",
      icon: <BarChart3 size={20} />,
      subItems: [
        { label: "Dashboard tổng quan", path: "/admin/reports?tab=main" },
        { label: "Doanh thu", path: "/admin/reports?tab=revenue" },
        { label: "Booking", path: "/admin/reports?tab=booking" },
        { label: "Tỷ lệ lấp đầy", path: "/admin/reports?tab=occupancy" },
        { label: "Khách hàng", path: "/admin/reports?tab=customer" },
        { label: "Đánh giá", path: "/admin/reports?tab=review" },
        { label: "Nhân viên", path: "/admin/reports?tab=staff" },
        { label: "Gói tài khoản", path: "/admin/reports?tab=package" },
        { label: "Xuất báo cáo", path: "/admin/reports?tab=export" },
      ],
    },
    {
      id: "accounts",
      label: "Quản lý tài khoản",
      icon: <Users size={20} />,
      subItems: [
        { label: "Dashboard", path: "/admin/accounts/dashboard" },
        { label: "Danh sách tài khoản", path: "/admin/accounts" },
        { label: "Thêm tài khoản", path: "/admin/accounts/create" },
      ],
    },
    {
      id: "hotels",
      label: "Quản lý khách sạn",
      icon: <Building2 size={20} />,
      subItems: [
        { label: "Dashboard", path: "/admin/hotels/dashboard" },
        { label: "Danh sách khách sạn", path: "/admin/hotels" },
        { label: "Danh mục & Vị trí", path: "/admin/hotels/categories" },
        { label: "Thống kê & Báo cáo", path: "/admin/hotels/reports" },
      ],
      badge: totalPendingBookings > 0 ? totalPendingBookings : undefined,
    },
    {
      id: "rooms",
      label: "Quản lý phòng",
      icon: <Bed size={20} />,
      subItems: [
        { label: "Dashboard", path: "/admin/rooms/dashboard" },
        { label: "Danh sách loại phòng", path: "/admin/rooms/types" },
        { label: "Danh sách phòng vật lý", path: "/admin/rooms" },
        { label: "Danh sách phòng trống", path: "/admin/rooms/availability" },
      ],
    },
    {
      id: "bookings",
      label: "Quản lý booking",
      icon: <Calendar size={20} />,
      subItems: [
        { 
          label: "Dashboard", 
          path: "/admin/bookings/dashboard",
          badge: bookingBadgeCount > 0 ? bookingBadgeCount : undefined,
        },
        { 
          label: "Danh sách booking", 
          path: "/admin/bookings",
          badge: bookingBadgeCount > 0 ? bookingBadgeCount : undefined,
        },
        { label: "Tạo booking", path: "/admin/bookings/create" },
        { label: "Thanh toán", path: "/admin/bookings/payments" },
        { label: "Mã giảm giá", path: "/admin/bookings/discounts" },
        { label: "Thống kê & Báo cáo", path: "/admin/bookings/reports" },
        { label: "Nhật ký hoạt động", path: "/admin/bookings/activity" },
      ],
      badge: bookingBadgeCount > 0 ? bookingBadgeCount : undefined,
    },
    {
      id: "payments",
      label: "Quản lý thanh toán",
      icon: <CreditCard size={20} />,
      subItems: [
        { label: "Dashboard", path: "/admin/payments/dashboard" },
        { label: "Danh sách thanh toán", path: "/admin/payments" },
        { label: "Xác nhận thủ công", path: "/admin/payments/manual" },
        { label: "Hoàn tiền", path: "/admin/payments/refunds" },
        { label: "Thử lại thanh toán", path: "/admin/payments/retry" },
        { label: "Xuất hóa đơn", path: "/admin/payments/invoice" },
        { label: "Thống kê & Báo cáo", path: "/admin/payments/reports" },
        { label: "Nhật ký giao dịch", path: "/admin/payments/activity" },
      ],
    },
    {
      id: "discounts",
      label: "Quản lý mã giảm giá",
      icon: <Tags size={20} />,
      subItems: [
        { label: "Dashboard", path: "/admin/discounts/dashboard" },
        { label: "Danh sách mã giảm giá", path: "/admin/discounts" },
        { label: "Tạo mã mới", path: "/admin/discounts/create" },
        { label: "Thống kê hiệu suất", path: "/admin/discounts/analytics" },
        { label: "Người dùng đã sử dụng", path: "/admin/discounts/users" },
        { label: "Báo cáo & Xuất dữ liệu", path: "/admin/discounts/reports" },
      ],
    },
    {
      id: "reviews",
      label: "Quản lý đánh giá",
      icon: <Star size={20} />,
      subItems: [
        { label: "Dashboard", path: "/admin/reviews/dashboard" },
        { label: "Danh sách review", path: "/admin/reviews" },
        { label: "Duyệt review", path: "/admin/reviews/approval" },
        { label: "Thống kê & Báo cáo", path: "/admin/reviews/reports" },
        { label: "Nhật ký thao tác", path: "/admin/reviews/activity" },
      ],
    },
    
  ];

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => {
    if (path.includes("?tab=")) {
      const [basePath, tabParam] = path.split("?tab=");
      const currentTab = new URLSearchParams(location.search).get("tab");
      return location.pathname === basePath && currentTab === tabParam;
    }
    return location.pathname === path;
  };

  const isParentActive = (subItems?: { path: string }[]) => {
    if (!subItems) return false;
    return subItems.some((item) => {
      if (item.path.includes("?tab=")) {
        const [basePath, tabParam] = item.path.split("?tab=");
        const currentTab = new URLSearchParams(location.search).get("tab");
        return location.pathname === basePath && currentTab === tabParam;
      }
      return location.pathname === item.path;
    });
  };

  return (
    <aside className="w-64 bg-black text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Link to="/admin/reports" className="flex items-center">
          <img 
            src={logo} 
            alt="Admin Logo" 
            className="h-10 w-auto"
          />
        </Link>
      </div>

      {/* Menu */}
      <nav className="py-6">
        {menuItems.map((item) => (
          <div key={item.id} className="mb-1">
            {item.subItems ? (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpand(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200 ${
                    isParentActive(item.subItems)
                      ? "bg-white text-black"
                      : "hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="relative inline-flex items-center justify-center">
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      </span>
                    )}
                  </div>
                  {expandedItems.includes(item.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                {expandedItems.includes(item.id) && (
                  <div className="bg-gray-950">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        onClick={(e) => {
                          // Prevent event bubbling to parent button
                          e.stopPropagation();
                        }}
                        className={`block px-14 py-2.5 text-sm transition-colors duration-200 relative ${
                          isActive(subItem.path)
                            ? "text-white font-medium bg-gray-900"
                            : "text-gray-400 hover:text-white hover:bg-gray-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{subItem.label}</span>
                          {subItem.badge && subItem.badge > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {subItem.badge > 99 ? "99+" : subItem.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path!}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                  isActive(item.path!)
                    ? "bg-white text-black font-medium"
                    : "hover:bg-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
