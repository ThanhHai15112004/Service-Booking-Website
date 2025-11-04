import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, DollarSign, Download } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface CustomerInsight {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  returnRate: number;
  topSpendingCustomers: Array<{
    customer_id: string;
    customer_name: string;
    total_spent: number;
    booking_count: number;
  }>;
  newCustomersTrend: Array<{ date: string; count: number }>;
  customerLifetimeValue: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const CustomerInsights = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [insight, setInsight] = useState<CustomerInsight | null>(null);

  useEffect(() => {
    fetchCustomerInsight();
  }, []);

  const fetchCustomerInsight = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setInsight({
          totalCustomers: 12456,
          newCustomers: 5234,
          returningCustomers: 7222,
          activeCustomers: 8567,
          inactiveCustomers: 3889,
          returnRate: 58.0,
          customerLifetimeValue: 3670000,
          topSpendingCustomers: [
            { customer_id: "C001", customer_name: "Nguyễn Văn A", total_spent: 45000000, booking_count: 12 },
            { customer_id: "C002", customer_name: "Trần Thị B", total_spent: 38000000, booking_count: 9 },
            { customer_id: "C003", customer_name: "Lê Văn C", total_spent: 32000000, booking_count: 8 },
            { customer_id: "C004", customer_name: "Phạm Thị D", total_spent: 28000000, booking_count: 7 },
            { customer_id: "C005", customer_name: "Hoàng Văn E", total_spent: 25000000, booking_count: 6 },
          ],
          newCustomersTrend: [
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
      showToast("error", error.message || "Không thể tải dữ liệu khách hàng");
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
    return <Loading message="Đang tải dữ liệu khách hàng..." />;
  }

  if (!insight) {
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

  const customerDistribution = [
    { name: "Khách quay lại", value: insight.returningCustomers, percentage: (insight.returningCustomers / insight.totalCustomers) * 100 },
    { name: "Khách mới", value: insight.newCustomers, percentage: (insight.newCustomers / insight.totalCustomers) * 100 },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Khách hàng</h1>
          <p className="text-gray-600 mt-1">Phân tích hành vi khách hàng để hỗ trợ marketing & chăm sóc</p>
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
          <p className="text-sm text-gray-600 mb-2">Tổng số khách hàng</p>
          <p className="text-3xl font-bold text-blue-600">{insight.totalCustomers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ khách quay lại</p>
          <p className="text-3xl font-bold text-green-600">{insight.returnRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Customer Lifetime Value</p>
          <p className="text-3xl font-bold text-purple-600">{formatPrice(insight.customerLifetimeValue)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Khách hàng hoạt động</p>
          <p className="text-3xl font-bold text-orange-600">{insight.activeCustomers.toLocaleString()}</p>
        </div>
      </div>

      {/* Customer Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New vs Returning */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Tỉ lệ user quay lại
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {customerDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* New Customers Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            User mới theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insight.newCustomersTrend}>
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

      {/* Top Spending Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="text-purple-600" size={20} />
          Top khách hàng chi tiêu cao nhất
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={insight.topSpendingCustomers} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="customer_name" type="category" width={150} />
            <Tooltip formatter={(value: number) => formatPrice(value)} />
            <Legend />
            <Bar dataKey="total_spent" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Stats Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết khách hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Khách hàng mới</span>
              <span className="text-sm font-bold text-blue-600">{insight.newCustomers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Khách quay lại</span>
              <span className="text-sm font-bold text-green-600">{insight.returningCustomers.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Khách hàng hoạt động</span>
              <span className="text-sm font-bold text-purple-600">{insight.activeCustomers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Khách hàng không hoạt động</span>
              <span className="text-sm font-bold text-gray-600">{insight.inactiveCustomers.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;

