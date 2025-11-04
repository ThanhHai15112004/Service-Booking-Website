import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Lock, Unlock, Calendar, Tag, DollarSign, Users, History, Building2, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface DiscountCodeDetail {
  discount_code_id: string;
  code: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_discount?: number;
  min_purchase?: number;
  usage_count: number;
  usage_limit?: number;
  per_user_limit?: number;
  start_date: string;
  expiry_date: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  min_nights?: number;
  max_nights?: number;
  applicable_hotels: Array<{ hotel_id: string; name: string }>;
  applicable_categories: Array<{ category_id: string; name: string }>;
  total_discount_amount: number;
  top_customers: Array<{
    account_id: string;
    full_name: string;
    usage_count: number;
    total_saved: number;
  }>;
  history: Array<{
    id: number;
    date: string;
    admin_name: string;
    action: string;
    note?: string;
  }>;
}

const DiscountCodeDetail = () => {
  const { codeId } = useParams<{ codeId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [code, setCode] = useState<DiscountCodeDetail | null>(null);

  useEffect(() => {
    if (codeId) {
      fetchDiscountCodeDetail();
    }
  }, [codeId]);

  const fetchDiscountCodeDetail = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setCode({
          discount_code_id: codeId || "DC001",
          code: "SUMMER2025",
          discount_type: "PERCENT",
          discount_value: 15,
          max_discount: 500000,
          min_purchase: 1000000,
          usage_count: 456,
          usage_limit: 1000,
          per_user_limit: 1,
          start_date: "2025-06-01",
          expiry_date: "2025-12-31",
          status: "ACTIVE",
          min_nights: 2,
          max_nights: 30,
          applicable_hotels: [
            { hotel_id: "H001", name: "Hanoi Old Quarter Hotel" },
            { hotel_id: "H002", name: "My Khe Beach Resort" },
          ],
          applicable_categories: [
            { category_id: "CAT001", name: "Resort" },
          ],
          total_discount_amount: 68000000,
          top_customers: [
            { account_id: "ACC001", full_name: "Nguyễn Văn A", usage_count: 1, total_saved: 450000 },
            { account_id: "ACC002", full_name: "Trần Thị B", usage_count: 1, total_saved: 320000 },
          ],
          history: [
            {
              id: 1,
              date: "2025-11-04T10:00:00",
              admin_name: "admin01",
              action: "Gia hạn mã",
              note: "Thêm 10 ngày",
            },
            {
              id: 2,
              date: "2025-11-03T14:30:00",
              admin_name: "staff02",
              action: "Đổi giá trị giảm",
              note: "15% → 20%",
            },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải chi tiết mã giảm giá");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Tạm ngưng</span>;
      case "EXPIRED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Hết hạn</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Đang tải chi tiết mã giảm giá..." />;
  }

  if (!code) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy mã giảm giá</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/discounts")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 font-mono">{code.code}</h1>
              {getStatusBadge(code.status)}
            </div>
            <p className="text-gray-600 mt-1">Discount Code ID: {code.discount_code_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/discounts/${codeId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Tag className="text-blue-600" size={24} />
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
              <p className="text-gray-900 font-mono text-lg">{code.code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
              <p className="text-gray-900">{code.discount_type === "PERCENT" ? "Phần trăm" : "Số tiền cố định"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm</label>
              <p className="text-gray-900 font-bold text-lg">
                {code.discount_type === "PERCENT" ? `${code.discount_value}%` : `${formatPrice(code.discount_value)} VNĐ`}
              </p>
            </div>
            {code.max_discount && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa</label>
                <p className="text-gray-900">{formatPrice(code.max_discount)} VNĐ</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <p className="text-gray-900">{formatDate(code.start_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
              <p className="text-gray-900">{formatDate(code.expiry_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lần sử dụng</label>
              <p className="text-gray-900">
                <span className="font-medium">{code.usage_count}</span>
                {code.usage_limit && <span className="text-gray-500"> / {code.usage_limit}</span>}
              </p>
            </div>
            {code.min_purchase && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị đơn tối thiểu</label>
                <p className="text-gray-900">{formatPrice(code.min_purchase)} VNĐ</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicable To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {code.applicable_hotels.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="text-green-600" size={20} />
              Khách sạn được áp dụng
            </h3>
            <div className="space-y-2">
              {code.applicable_hotels.map((hotel) => (
                <p key={hotel.hotel_id} className="text-sm text-gray-900">{hotel.name}</p>
              ))}
            </div>
          </div>
        )}
        {code.applicable_categories.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="text-purple-600" size={20} />
              Category được áp dụng
            </h3>
            <div className="space-y-2">
              {code.applicable_categories.map((category) => (
                <p key={category.category_id} className="text-sm text-gray-900">{category.name}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={24} />
          Thống kê
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Tổng lượt dùng</p>
            <p className="text-3xl font-bold mt-2">{code.usage_count}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Tổng tiền giảm</p>
            <p className="text-3xl font-bold mt-2">{(code.total_discount_amount / 1000000).toFixed(0)}M</p>
            <p className="text-xs opacity-90 mt-1">VNĐ</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Giảm trung bình</p>
            <p className="text-3xl font-bold mt-2">
              {code.usage_count > 0 ? formatPrice(Math.round(code.total_discount_amount / code.usage_count)) : "0"}
            </p>
            <p className="text-xs opacity-90 mt-1">VNĐ/lượt</p>
          </div>
        </div>
      </div>

      {/* Top Customers */}
      {code.top_customers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Top khách hàng sử dụng mã
          </h3>
          <div className="space-y-3">
            {code.top_customers.map((customer) => (
              <div key={customer.account_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{customer.full_name}</p>
                  <p className="text-sm text-gray-600">{customer.usage_count} lượt sử dụng</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatPrice(customer.total_saved)} VNĐ</p>
                  <p className="text-xs text-gray-500">Tiết kiệm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <History className="text-orange-600" size={24} />
          Lịch sử thay đổi
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {code.history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Không có lịch sử thay đổi
                  </td>
                </tr>
              ) : (
                code.history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(item.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.admin_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.note || "-"}</td>
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

export default DiscountCodeDetail;

