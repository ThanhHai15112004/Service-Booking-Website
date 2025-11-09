import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Tag, TrendingUp, CheckCircle, XCircle, Plus, ArrowRight } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface PromotionDashboardStats {
  total_promotions: number;
  active_promotions: number;
  inactive_promotions: number;
  expired_promotions: number;
  provider_promotions: number;
  system_promotions: number;
  total_discount_amount: number;
  recent_promotions: Array<{
    promotion_id: string;
    name: string;
    status: string;
    created_at: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PromotionDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<PromotionDashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await adminService.getPromotionDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu dashboard");
      }
    } catch (error: any) {
      console.error("[PromotionDashboard] fetchDashboardData error:", error);
      showToast("error", error.message || "Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Tạm ngưng</span>;
      case "EXPIRED":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Hết hạn</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu dashboard..." />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const typeDistribution = [
    { name: "Provider", value: stats.provider_promotions, color: COLORS[0] },
    { name: "System", value: stats.system_promotions, color: COLORS[1] },
  ].filter((item) => item.value > 0);

  const statusDistribution = [
    { name: "Đang hoạt động", value: stats.active_promotions, color: COLORS[1] },
    { name: "Tạm ngưng", value: stats.inactive_promotions, color: COLORS[2] },
    { name: "Hết hạn", value: stats.expired_promotions, color: COLORS[3] },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Chiến dịch khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Tổng quan hoạt động và hiệu quả của các chiến dịch khuyến mãi</p>
        </div>
        <button
          onClick={() => navigate("/admin/promotions/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tạo chiến dịch mới
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số promotion</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total_promotions}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Tag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active_promotions}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tạm ngưng</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{stats.inactive_promotions}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <XCircle className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng tiền giảm</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {(stats.total_discount_amount / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        {typeDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo loại</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Status Distribution */}
        {statusDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo trạng thái</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Promotions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Promotion gần đây</h3>
          <button
            onClick={() => navigate("/admin/promotions")}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            Xem tất cả
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {stats.recent_promotions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Chưa có promotion nào</p>
          ) : (
            stats.recent_promotions.map((promo) => (
              <div
                key={promo.promotion_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/promotions/${promo.promotion_id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Tag className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{promo.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(promo.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                {getStatusBadge(promo.status)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionDashboard;

