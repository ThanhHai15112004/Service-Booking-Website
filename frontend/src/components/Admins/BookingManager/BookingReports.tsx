import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, DollarSign, TrendingUp, Users, Hotel, XCircle, CreditCard, Filter } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface ReportStats {
  totalBookings: number;
  totalRevenue: number;
  cancelledRate: number;
  paymentMethods: Array<{ method: string; count: number; revenue: number }>;
  topCustomers: Array<{
    account_id: string;
    full_name: string;
    total_spent: number;
    booking_count: number;
  }>;
  topHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    booking_count: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  cancellationTrend: Array<{ month: string; cancelled: number; total: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const BookingReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [hotels, setHotels] = useState<Array<{ hotel_id: string; name: string }>>([]);
  const [filters, setFilters] = useState({
    period: "month" as "7days" | "month" | "quarter" | "year",
    hotel: "",
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchHotels = async () => {
    try {
      const result = await adminService.getHotels({ limit: 100 });
      if (result.success && result.data) {
        setHotels(
          result.data.hotels.map((hotel: any) => ({
            hotel_id: hotel.hotel_id,
            name: hotel.name,
          }))
        );
      }
    } catch (error: any) {
      console.error("Error fetching hotels:", error);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {
        period: filters.period,
      };
      
      if (filters.hotel) {
        params.hotelId = filters.hotel;
      }

      const result = await adminService.getBookingReports(params);
      if (result.success && result.data) {
        setStats({
          totalBookings: result.data.totalBookings || 0,
          totalRevenue: result.data.totalRevenue || 0,
          cancelledRate: result.data.cancelledRate || 0,
          paymentMethods: result.data.paymentMethods || [],
          topCustomers: result.data.topCustomers || [],
          topHotels: result.data.topHotels || [],
          revenueByMonth: result.data.revenueByMonth || [],
          cancellationTrend: result.data.cancellationTrend || [],
        });
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu báo cáo..." />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Báo cáo Booking</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu suất kinh doanh từ các booking</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="text-gray-400" size={20} />
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value as "7days" | "month" | "quarter" | "year" })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7days">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
          </select>
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg min-w-[200px]"
          >
            <option value="">Tất cả khách sạn</option>
            {hotels.map((hotel) => (
              <option key={hotel.hotel_id} value={hotel.hotel_id}>
                {hotel.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số booking</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {(stats.totalRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hủy booking</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelledRate}%</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Phương thức phổ biến</p>
              <p className="text-xl font-bold text-purple-600 mt-2">
                {stats.paymentMethods && stats.paymentMethods.length > 0 
                  ? stats.paymentMethods[0]?.method || "N/A"
                  : "N/A"}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <CreditCard className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Doanh thu theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {stats.revenueByMonth && stats.revenueByMonth.length > 0 ? (
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="text-purple-600" size={20} />
            Phương thức thanh toán phổ biến
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            {stats.paymentMethods && stats.paymentMethods.length > 0 ? (
              <PieChart>
                <Pie
                  data={stats.paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, count }) => `${method}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.paymentMethods.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Không có dữ liệu
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cancellation Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <XCircle className="text-red-600" size={20} />
          Tỷ lệ hủy đặt / hoàn tiền
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          {stats.cancellationTrend && stats.cancellationTrend.length > 0 ? (
            <LineChart data={stats.cancellationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Hủy" dot={{ fill: "#ef4444", r: 4 }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Tổng" dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Không có dữ liệu
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Top khách hàng chi tiêu cao nhất
          </h3>
          <div className="space-y-3">
            {stats.topCustomers.map((customer, index) => (
              <div key={customer.account_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{customer.full_name}</p>
                  <p className="text-sm text-gray-600">{customer.booking_count} bookings</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {(customer.total_spent / 1000000).toFixed(1)}M VNĐ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="text-green-600" size={20} />
            Top khách sạn có nhiều booking
          </h3>
          <div className="space-y-3">
            {stats.topHotels.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.hotel_name}</p>
                  <p className="text-sm text-gray-600">{hotel.booking_count} bookings</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {(hotel.revenue / 1000000).toFixed(0)}M VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReports;
