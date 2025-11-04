import { useState, useEffect } from "react";
import { Activity, TrendingUp, Calendar, ShoppingBag, Star, DollarSign } from "lucide-react";
import Loading from "../../../Loading";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { adminService } from "../../../../services/adminService";

interface AccountActivityTabProps {
  accountId: string;
}

const AccountActivityTab = ({ accountId }: AccountActivityTabProps) => {
  const [loading, setLoading] = useState(true);
  const [activityStats, setActivityStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    totalReviews: 0,
    lastLogin: null as string | null,
    loginIP: "",
    loginDevice: "",
  });
  const [activityChart, setActivityChart] = useState<any[]>([]);
  const [activityHistory, setActivityHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchActivityData();
  }, [accountId]);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes, historyRes] = await Promise.all([
        adminService.getAccountActivityStats(accountId),
        adminService.getAccountActivityChart(accountId, "30"),
        adminService.getAccountActivityHistory(accountId, { page: 1, limit: 100 }),
      ]);

      setActivityStats(statsRes.data);
      setActivityChart(chartRes.data || []);
      setActivityHistory(historyRes.data || []);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return <Loading message="Đang tải thông tin hoạt động..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="text-blue-600" size={20} />
            <p className="text-sm text-gray-600">Tổng số booking</p>
          </div>
          <p className="text-2xl font-bold text-black">{activityStats.totalBookings}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={20} />
            <p className="text-sm text-gray-600">Tổng tiền chi tiêu</p>
          </div>
          <p className="text-2xl font-bold text-black">{formatCurrency(activityStats.totalSpent)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Star className="text-yellow-600" size={20} />
            <p className="text-sm text-gray-600">Số review đã viết</p>
          </div>
          <p className="text-2xl font-bold text-black">{activityStats.totalReviews}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-600" size={20} />
            <p className="text-sm text-gray-600">Lần đăng nhập gần nhất</p>
          </div>
          <p className="text-sm font-medium text-black">
            {activityStats.lastLogin ? new Date(activityStats.lastLogin).toLocaleDateString("vi-VN") : "N/A"}
          </p>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-black mb-4">Biểu đồ hoạt động 30 ngày gần đây</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityChart}>
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
            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} name="Bookings" />
            <Line type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={2} name="Logins" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-black">Lịch sử hoạt động</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Hành động</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Mô tả chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activityHistory.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Activity size={32} className="text-gray-400" />
                      <span>Chưa có lịch sử hoạt động.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                activityHistory.map((activity, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-medium">{activity.action}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{activity.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountActivityTab;

