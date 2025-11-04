import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Download, Filter, Building2, Calendar } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface OccupancyReport {
  averageOccupancyRate: number;
  occupancyByHotel: Array<{
    hotel_id: string;
    hotel_name: string;
    occupancy_rate: number;
  }>;
  occupancyByMonth: Array<{
    month: string;
    occupancy_rate: number;
  }>;
  occupancyByCity: Array<{
    city: string;
    occupancy_rate: number;
  }>;
  occupancyByCategory: Array<{
    category: string;
    occupancy_rate: number;
  }>;
  occupancyYearOverYear: Array<{
    period: string;
    currentYear: number;
    previousYear: number;
  }>;
  occupancyCalendar: Array<{
    date: string;
    occupancy_rate: number;
  }>;
}

const OccupancyReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [report, setReport] = useState<OccupancyReport | null>(null);
  const [filters, setFilters] = useState({
    month: "",
    city: "",
    category: "",
    year: "2024",
  });

  useEffect(() => {
    fetchOccupancyReport();
  }, [filters]);

  const fetchOccupancyReport = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setReport({
          averageOccupancyRate: 78.5,
          occupancyByHotel: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", occupancy_rate: 92.5 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", occupancy_rate: 88.3 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", occupancy_rate: 85.7 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", occupancy_rate: 82.1 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", occupancy_rate: 79.4 },
          ],
          occupancyByMonth: [
            { month: "Th1", occupancy_rate: 72.5 },
            { month: "Th2", occupancy_rate: 75.8 },
            { month: "Th3", occupancy_rate: 78.2 },
            { month: "Th4", occupancy_rate: 78.5 },
            { month: "Th5", occupancy_rate: 80.1 },
            { month: "Th6", occupancy_rate: 82.3 },
          ],
          occupancyByCity: [
            { city: "Hà Nội", occupancy_rate: 82.5 },
            { city: "TP. Hồ Chí Minh", occupancy_rate: 79.3 },
            { city: "Đà Nẵng", occupancy_rate: 75.8 },
            { city: "Khác", occupancy_rate: 68.2 },
          ],
          occupancyByCategory: [
            { category: "Resort", occupancy_rate: 85.2 },
            { category: "Boutique Hotel", occupancy_rate: 78.5 },
            { category: "Business Hotel", occupancy_rate: 72.3 },
          ],
          occupancyYearOverYear: [
            { period: "Q1", currentYear: 72.5, previousYear: 68.3 },
            { period: "Q2", currentYear: 78.2, previousYear: 74.1 },
            { period: "Q3", currentYear: 82.5, previousYear: 79.8 },
            { period: "Q4", currentYear: 80.1, previousYear: 76.5 },
          ],
          occupancyCalendar: Array.from({ length: 30 }, (_, i) => ({
            date: `${i + 1}/11`,
            occupancy_rate: 70 + Math.random() * 25,
          })),
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải báo cáo tỷ lệ lấp đầy");
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
    return <Loading message="Đang tải báo cáo tỷ lệ lấp đầy..." />;
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Tỷ lệ Lấp đầy</h1>
          <p className="text-gray-600 mt-1">Đánh giá hiệu suất khai thác phòng và tối ưu giá</p>
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

      {/* Average Occupancy Card */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-2">Tỷ lệ lấp đầy trung bình toàn hệ thống</p>
            <p className="text-4xl font-bold">{report.averageOccupancyRate}%</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <TrendingUp size={48} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <select
            value={filters.month}
            onChange={(e) => setFilters({ ...filters, month: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả tháng</option>
            <option value="1">Tháng 1</option>
            <option value="2">Tháng 2</option>
            <option value="3">Tháng 3</option>
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả thành phố</option>
            <option value="Hanoi">Hà Nội</option>
            <option value="HCM">TP. Hồ Chí Minh</option>
            <option value="DaNang">Đà Nẵng</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả category</option>
            <option value="Resort">Resort</option>
            <option value="Boutique Hotel">Boutique Hotel</option>
          </select>
        </div>
      </div>

      {/* Occupancy Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={20} />
          Tỷ lệ lấp đầy theo thời gian
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={report.occupancyByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="occupancy_rate" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Hotels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="text-purple-600" size={20} />
          Top khách sạn có tỷ lệ lấp đầy cao nhất
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={report.occupancyByHotel} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="hotel_name" type="category" width={150} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Bar dataKey="occupancy_rate" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Year Over Year */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-green-600" size={20} />
          So sánh theo năm trước (Year-over-Year)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={report.occupancyYearOverYear}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value: number) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="currentYear" stroke="#10b981" strokeWidth={3} name="Năm hiện tại" />
            <Line type="monotone" dataKey="previousYear" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Năm trước" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By City */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ lấp đầy theo thành phố</h3>
          <div className="space-y-3">
            {report.occupancyByCity.map((city) => (
              <div key={city.city}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{city.city}</span>
                  <span className="text-sm text-gray-600">{city.occupancy_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getOccupancyColor(city.occupancy_rate)}`}
                    style={{ width: `${city.occupancy_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ lấp đầy theo category</h3>
          <div className="space-y-3">
            {report.occupancyByCategory.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  <span className="text-sm text-gray-600">{category.occupancy_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getOccupancyColor(category.occupancy_rate)}`}
                    style={{ width: `${category.occupancy_rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Heatmap Calendar - Tỷ lệ lấp đầy từng ngày</h3>
        <div className="grid grid-cols-7 gap-2">
          {report.occupancyCalendar.map((day, index) => (
            <div
              key={index}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium text-white ${getOccupancyColor(day.occupancy_rate)}`}
              title={`${day.date}: ${day.occupancy_rate.toFixed(1)}%`}
            >
              {day.date.split('/')[0]}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">&lt; 60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">&gt; 80%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyReports;

