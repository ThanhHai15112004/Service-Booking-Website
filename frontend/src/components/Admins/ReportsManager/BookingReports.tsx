import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, Download, Filter, Building2, TrendingUp, Users } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface BookingReport {
  totalBookings: number;
  bookingsByStatus: Array<{ status: string; count: number; percentage: number }>;
  cancellationRate: number;
  completionRate: number;
  averageBookingValue: number;
  bookingsByHotel: Array<{
    hotel_id: string;
    hotel_name: string;
    bookings: number;
  }>;
  bookingsByCity: Array<{
    city: string;
    bookings: number;
  }>;
  bookingsByCategory: Array<{
    category: string;
    bookings: number;
  }>;
  bookingsByTime: Array<{
    date: string;
    count: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const BookingReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [report, setReport] = useState<BookingReport | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    hotel: "",
    city: "",
    status: "",
  });

  useEffect(() => {
    fetchBookingReport();
  }, [filters]);

  const fetchBookingReport = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setReport({
          totalBookings: 15678,
          bookingsByStatus: [
            { status: "PAID", count: 8567, percentage: 54.7 },
            { status: "CONFIRMED", count: 4234, percentage: 27.0 },
            { status: "CREATED", count: 1876, percentage: 12.0 },
            { status: "CANCELLED", count: 1001, percentage: 6.3 },
          ],
          cancellationRate: 8.2,
          completionRate: 91.8,
          averageBookingValue: 2900000,
          bookingsByHotel: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", bookings: 456 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", bookings: 389 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", bookings: 298 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", bookings: 234 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", bookings: 187 },
          ],
          bookingsByCity: [
            { city: "Hà Nội", bookings: 6234 },
            { city: "TP. Hồ Chí Minh", bookings: 5123 },
            { city: "Đà Nẵng", bookings: 2678 },
            { city: "Khác", bookings: 1643 },
          ],
          bookingsByCategory: [
            { category: "Resort", bookings: 5234 },
            { category: "Boutique Hotel", bookings: 4123 },
            { category: "Business Hotel", bookings: 3567 },
            { category: "Khác", bookings: 2754 },
          ],
          bookingsByTime: [
            { date: "01/11", count: 45 },
            { date: "02/11", count: 52 },
            { date: "03/11", count: 48 },
            { date: "04/11", count: 61 },
            { date: "05/11", count: 58 },
            { date: "06/11", count: 55 },
            { date: "07/11", count: 62 },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải báo cáo booking");
      setLoading(false);
    }
  };

  const handleExport = async (format: "EXCEL" | "PDF") => {
    try {
      // TODO: API call to export
      showToast("success", `Đang xuất báo cáo ${format}...`);
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất báo cáo");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải báo cáo booking..." />;
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Booking</h1>
          <p className="text-gray-600 mt-1">Theo dõi hoạt động đặt phòng và hành vi người dùng</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("EXCEL")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Excel
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tổng số booking</p>
          <p className="text-3xl font-bold text-blue-600">{report.totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ hủy</p>
          <p className="text-3xl font-bold text-red-600">{report.cancellationRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ hoàn thành</p>
          <p className="text-3xl font-bold text-green-600">{report.completionRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Giá trị booking trung bình</p>
          <p className="text-3xl font-bold text-purple-600">{formatPrice(report.averageBookingValue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Đến ngày"
          />
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="CREATED">Đã tạo</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Tỷ lệ trạng thái booking
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={report.bookingsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {report.bookingsByStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Số lượng booking theo thời gian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.bookingsByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings by Hotel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="text-purple-600" size={20} />
          Booking theo khách sạn
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={report.bookingsByHotel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hotel_name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by City */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking theo thành phố</h3>
          <div className="space-y-3">
            {report.bookingsByCity.map((city) => (
              <div key={city.city}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{city.city}</span>
                  <span className="text-sm text-gray-600">{city.bookings} bookings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(city.bookings / report.totalBookings) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking theo category</h3>
          <div className="space-y-3">
            {report.bookingsByCategory.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.bookings} bookings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(category.bookings / report.totalBookings) * 100}%` }}
                  />
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

