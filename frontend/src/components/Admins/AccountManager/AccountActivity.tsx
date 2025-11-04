import { useState, useEffect } from "react";
import { Activity, ShoppingBag, Star, DollarSign, User, LogIn, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Loading from "../../Loading";
import Toast from "../../Toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { adminService } from "../../../services/adminService";

interface AccountActivityProps {
  accountId: string;
  showHeader?: boolean;
}

interface ActivityStats {
  totalBookings: number;
  totalSpent: number;
  totalReviews: number;
  averageBookingValue: number;
  lastLogin: string | null;
  loginIP: string;
  loginDevice: string;
  bookingRate: number; // % users who booked vs not
}

interface ActivityHistoryItem {
  id: string;
  type: "booking" | "review" | "payment" | "login" | "profile_update";
  action: string;
  description: string;
  date: string;
  metadata?: {
    booking_id?: string;
    review_id?: string;
    payment_id?: string;
    hotel_name?: string;
    amount?: number;
    ip?: string;
    device?: string;
  };
}

const AccountActivity = ({ accountId, showHeader = true }: AccountActivityProps) => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<ActivityStats>({
    totalBookings: 0,
    totalSpent: 0,
    totalReviews: 0,
    averageBookingValue: 0,
    lastLogin: null,
    loginIP: "",
    loginDevice: "",
    bookingRate: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartPeriod, setChartPeriod] = useState<"7" | "30" | "90">("30");
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryItem[]>([]);
  const [filters, setFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchActivityData();
  }, [accountId, chartPeriod]);

  useEffect(() => {
    fetchActivityHistory();
  }, [accountId, filters, pagination.page, pagination.limit]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes] = await Promise.all([
        adminService.getAccountActivityStats(accountId),
        adminService.getAccountActivityChart(accountId, chartPeriod),
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data || []);
    } catch (error) {
      console.error("Error fetching activity data:", error);
      showToast("error", "Lỗi khi tải thông tin hoạt động");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityHistory = async () => {
    try {
      const response = await adminService.getAccountActivityHistory(accountId, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setActivityHistory(response.data || []);
      setPagination({ ...pagination, total: response.total });
    } catch (error) {
      console.error("Error fetching activity history:", error);
      showToast("error", "Lỗi khi tải lịch sử hoạt động");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      booking: ShoppingBag,
      review: Star,
      payment: DollarSign,
      login: LogIn,
      profile_update: User,
    };
    return icons[type as keyof typeof icons] || Activity;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      booking: "text-blue-600 bg-blue-100",
      review: "text-yellow-600 bg-yellow-100",
      payment: "text-green-600 bg-green-100",
      login: "text-purple-600 bg-purple-100",
      profile_update: "text-gray-600 bg-gray-100",
    };
    return colors[type as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      dateFrom: "",
      dateTo: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading && chartData.length === 0) {
    return <Loading message="Đang tải thông tin hoạt động..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Hoạt động người dùng</h2>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="text-blue-600" size={20} />
            <p className="text-sm text-gray-600">Tổng số booking</p>
          </div>
          <p className="text-2xl font-bold text-black">{stats.totalBookings}</p>
          <p className="text-xs text-gray-500 mt-1">
            Trung bình: {formatCurrency(stats.averageBookingValue)}/booking
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={20} />
            <p className="text-sm text-gray-600">Tổng tiền chi tiêu</p>
          </div>
          <p className="text-2xl font-bold text-black">{formatCurrency(stats.totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">
            Tỉ lệ đặt phòng: {stats.bookingRate}%
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-600" size={20} />
            <p className="text-sm text-gray-600">Số review đã viết</p>
          </div>
          <p className="text-2xl font-bold text-black">{stats.totalReviews}</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalBookings > 0 ? Math.round((stats.totalReviews / stats.totalBookings) * 100) : 0}% booking có review
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <LogIn className="text-purple-600" size={20} />
            <p className="text-sm text-gray-600">Lần đăng nhập gần nhất</p>
          </div>
          <p className="text-sm font-medium text-black">
            {stats.lastLogin ? formatDate(stats.lastLogin) : "N/A"}
          </p>
          {stats.loginIP && (
            <p className="text-xs text-gray-500 mt-1">
              {stats.loginIP} • {stats.loginDevice}
            </p>
          )}
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-black">Biểu đồ hoạt động</h3>
          <div className="flex items-center gap-2">
            {(["7", "30", "90"] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  setChartPeriod(period);
                  fetchActivityData();
                }}
                className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                  chartPeriod === period
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period} ngày
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />
            <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reviews" fill="#eab308" name="Reviews" radius={[4, 4, 0, 0]} />
            <Bar dataKey="logins" fill="#a855f7" name="Logins" radius={[4, 4, 0, 0]} />
            <Bar dataKey="payments" fill="#10b981" name="Payments" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-black">Lịch sử hoạt động</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
              <Filter size={14} />
              Lọc
            </button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Loại hoạt động</label>
                <select
                  value={filters.type}
                  onChange={(e) => {
                    setFilters({ ...filters, type: e.target.value });
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="booking">Booking</option>
                  <option value="review">Review</option>
                  <option value="payment">Payment</option>
                  <option value="login">Login</option>
                  <option value="profile_update">Profile Update</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Từ ngày</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    setFilters({ ...filters, dateFrom: e.target.value });
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Đến ngày</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => {
                    setFilters({ ...filters, dateTo: e.target.value });
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                />
              </div>
              <div className="flex items-end">
                {(filters.type || filters.dateFrom || filters.dateTo) && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày & Giờ</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Loại</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Hành động</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Mô tả chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activityHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Activity size={32} className="text-gray-400" />
                      <span>Chưa có lịch sử hoạt động</span>
                    </div>
                  </td>
                </tr>
              ) : (
                activityHistory.map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(activity.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getActivityColor(activity.type)}`}>
                          <IconComponent size={14} />
                          <span className="text-xs font-medium capitalize">{activity.type.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{activity.action}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <p>{activity.description}</p>
                          {activity.metadata && (
                            <div className="text-xs text-gray-500 space-y-0.5">
                              {activity.metadata.booking_id && (
                                <p>Booking ID: <span className="font-mono">{activity.metadata.booking_id}</span></p>
                              )}
                              {activity.metadata.review_id && (
                                <p>Review ID: <span className="font-mono">{activity.metadata.review_id}</span></p>
                              )}
                              {activity.metadata.payment_id && (
                                <p>Payment ID: <span className="font-mono">{activity.metadata.payment_id}</span></p>
                              )}
                              {activity.metadata.hotel_name && (
                                <p>Khách sạn: {activity.metadata.hotel_name}</p>
                              )}
                              {activity.metadata.amount && (
                                <p>Số tiền: {formatCurrency(activity.metadata.amount)}</p>
                              )}
                              {activity.metadata.ip && (
                                <p>IP: {activity.metadata.ip}</p>
                              )}
                              {activity.metadata.device && (
                                <p>Thiết bị: {activity.metadata.device}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} hoạt động
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                      pagination.page === page
                        ? "bg-black text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            >
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
              <option value={100}>100 / trang</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountActivity;

