import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Tag, Building2, Bed, Calendar, TrendingUp, Zap } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface PromotionDetail {
  promotion_id: string;
  name: string;
  description?: string;
  type: "PROVIDER" | "SYSTEM" | "BOTH";
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  min_purchase?: number;
  max_discount?: number;
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  applicable_hotels: Array<{ hotel_id: string; name: string }>;
  applicable_rooms: Array<{ room_id: string; room_number: string; room_type_name: string }>;
  total_schedules: number;
  total_discount_amount: number;
}

const PromotionDetail = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [promotion, setPromotion] = useState<PromotionDetail | null>(null);

  useEffect(() => {
    if (promotionId) {
      fetchPromotionDetail();
    }
  }, [promotionId]);

  const fetchPromotionDetail = async () => {
    if (!promotionId) {
      showToast("error", "Không tìm thấy promotion");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await adminService.getPromotionDetail(promotionId);
      if (result.success && result.data) {
        setPromotion(result.data);
      } else {
        showToast("error", result.message || "Không thể tải chi tiết promotion");
      }
    } catch (error: any) {
      console.error("[PromotionDetail] fetchPromotionDetail error:", error);
      showToast("error", error.message || "Không thể tải chi tiết promotion");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToSchedules = async () => {
    if (!promotionId) return;

    try {
      setApplying(true);
      const result = await adminService.applyPromotionToSchedules(promotionId);
      if (result.success) {
        showToast("success", result.message || `Đã áp dụng promotion vào ${result.affectedSchedules || 0} schedules`);
        fetchPromotionDetail();
      } else {
        showToast("error", result.message || "Không thể áp dụng promotion");
      }
    } catch (error: any) {
      console.error("[PromotionDetail] handleApplyToSchedules error:", error);
      showToast("error", error.message || "Không thể áp dụng promotion");
    } finally {
      setApplying(false);
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

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PROVIDER":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Provider</span>;
      case "SYSTEM":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">System</span>;
      case "BOTH":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">Both</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Đang tải chi tiết promotion..." />;
  }

  if (!promotion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy promotion</p>
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
            onClick={() => navigate("/admin/promotions")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{promotion.name}</h1>
              {getStatusBadge(promotion.status)}
            </div>
            <p className="text-gray-600 mt-1">Promotion ID: {promotion.promotion_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {promotion.status === "ACTIVE" && (
            <button
              onClick={handleApplyToSchedules}
              disabled={applying}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <Zap size={18} />
              {applying ? "Đang áp dụng..." : "Áp dụng vào schedules"}
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/promotions/${promotionId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Tag className="text-blue-600" size={24} />
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Tên promotion</label>
            <p className="text-gray-900 font-medium">{promotion.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Loại promotion</label>
            {getTypeBadge(promotion.type)}
          </div>
          {promotion.description && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả</label>
              <p className="text-gray-900">{promotion.description}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Loại giảm giá</label>
            <p className="text-gray-900">
              {promotion.discount_type === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Giá trị giảm giá</label>
            <p className="text-gray-900 font-medium">
              {promotion.discount_type === "PERCENTAGE"
                ? `${promotion.discount_value}%`
                : `${formatPrice(promotion.discount_value)} VNĐ`}
            </p>
          </div>
          {promotion.max_discount && promotion.discount_type === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Giảm tối đa</label>
              <p className="text-gray-900 font-medium">{formatPrice(promotion.max_discount)} VNĐ</p>
            </div>
          )}
          {promotion.min_purchase && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Giá trị đơn tối thiểu</label>
              <p className="text-gray-900 font-medium">{formatPrice(promotion.min_purchase)} VNĐ</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Ngày bắt đầu</label>
            <p className="text-gray-900">{formatDate(promotion.start_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Ngày kết thúc</label>
            <p className="text-gray-900">{formatDate(promotion.end_date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Ngày tạo</label>
            <p className="text-gray-900">{formatDate(promotion.created_at)}</p>
          </div>
          {promotion.created_by_name && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Người tạo</label>
              <p className="text-gray-900">{promotion.created_by_name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số schedules</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{promotion.total_schedules}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng tiền giảm</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {(promotion.total_discount_amount / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Applicable Hotels */}
      {promotion.applicable_hotels && promotion.applicable_hotels.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-green-600" size={24} />
            Khách sạn áp dụng
          </h2>
          <div className="flex flex-wrap gap-2">
            {promotion.applicable_hotels.map((hotel) => (
              <span
                key={hotel.hotel_id}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {hotel.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Applicable Rooms */}
      {promotion.applicable_rooms && promotion.applicable_rooms.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="text-blue-600" size={24} />
            Phòng áp dụng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotion.applicable_rooms.map((room) => (
              <div
                key={room.room_id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{room.room_number}</p>
                <p className="text-sm text-gray-600">{room.room_type_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionDetail;

