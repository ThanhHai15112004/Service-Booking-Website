import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, Lock, Unlock, Image as ImageIcon, Settings, Star, MapPin, Phone, Mail, Calendar } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import HotelInfoTab from "./HotelDetailTabs/HotelInfoTab";
import HotelImagesTab from "./HotelDetailTabs/HotelImagesTab";
import HotelFacilitiesTab from "./HotelDetailTabs/HotelFacilitiesTab";
import HotelHighlightsTab from "./HotelDetailTabs/HotelHighlightsTab";
import HotelPoliciesTab from "./HotelDetailTabs/HotelPoliciesTab";
import HotelReviewsTab from "./HotelDetailTabs/HotelReviewsTab";
import HotelStatsTab from "./HotelDetailTabs/HotelStatsTab";
import HotelBookingsTab from "./HotelDetailTabs/HotelBookingsTab";

type TabType = "info" | "images" | "facilities" | "highlights" | "policies" | "reviews" | "stats" | "bookings";

interface Hotel {
  hotel_id: string;
  name: string;
  description?: string;
  category: string;
  city: string;
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  star_rating: number;
  avg_rating: number;
  review_count: number;
  checkin_time: string;
  checkout_time: string;
  phone_number?: string;
  email?: string;
  website?: string;
  total_rooms: number;
  main_image?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  created_at: string;
  updated_at: string;
}

interface HotelDetailProps {
  hotelId?: string;
  onBack?: () => void;
}

const HotelDetail = ({ hotelId: propHotelId, onBack }: HotelDetailProps) => {
  const { hotelId: paramHotelId } = useParams<{ hotelId: string }>();
  const hotelId = propHotelId || paramHotelId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("bookings");
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);

  useEffect(() => {
    if (hotelId) {
      fetchHotelDetail();
      fetchPendingBookingCount();
      // Auto-refresh mỗi 60 giây để cập nhật số lượng booking chờ xác nhận
      const interval = setInterval(() => {
        fetchPendingBookingCount();
      }, 60000); // 60 giây - giảm tần suất để tránh spam log

      return () => clearInterval(interval);
    }
  }, [hotelId]);

  const fetchHotelDetail = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelDetail(hotelId!);
      if (response.success && response.data) {
        setHotel(response.data);
      } else {
        showToast("error", response.message || "Không tìm thấy khách sạn");
        navigate("/admin/hotels");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi tải thông tin khách sạn");
      navigate("/admin/hotels");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookingCount = async () => {
    if (!hotelId) return;
    try {
      const response = await adminService.getHotelBookings(hotelId, {
        status: "PENDING_CONFIRMATION",
        page: 1,
        limit: 1,
      });
      if (response.success && response.data) {
        setPendingBookingCount(response.data.total || 0);
      }
    } catch (error) {
      // Silently fail, không hiển thị lỗi
      console.error("Error fetching pending booking count:", error);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!hotel) return;
    try {
      const response = await adminService.deleteHotel(hotel.hotel_id, false);
      if (response.success) {
        showToast("success", response.message || "Xóa khách sạn thành công");
        setTimeout(() => navigate("/admin/hotels"), 1500);
      } else {
        showToast("error", response.message || "Lỗi khi xóa khách sạn");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi xóa khách sạn");
    }
  };

  const handleToggleStatus = async () => {
    if (!hotel) return;
    try {
      const newStatus = hotel.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const response = await adminService.updateHotelStatus(hotel.hotel_id, newStatus);
      if (response.success) {
        showToast("success", response.message || `Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} khách sạn`);
        fetchHotelDetail();
      } else {
        showToast("error", response.message || "Lỗi khi thay đổi trạng thái");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi thay đổi trạng thái");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Không hoạt động</span>;
      case "PENDING":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Đang tải thông tin khách sạn..." />;
  }

  if (!hotel) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy khách sạn</p>
      </div>
    );
  }

  const tabs = [
    { id: "bookings" as TabType, label: "Bookings", icon: Calendar },
    { id: "info" as TabType, label: "Thông tin cơ bản", icon: MapPin },
    { id: "images" as TabType, label: "Ảnh khách sạn", icon: ImageIcon },
    { id: "facilities" as TabType, label: "Tiện nghi", icon: Settings },
    { id: "highlights" as TabType, label: "Điểm nổi bật", icon: Star },
    { id: "policies" as TabType, label: "Chính sách", icon: Settings },
    { id: "reviews" as TabType, label: "Đánh giá", icon: Star },
    { id: "stats" as TabType, label: "Thống kê", icon: Star },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
            } else {
              navigate("/admin/hotels");
            }
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại danh sách</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/hotels/${hotel.hotel_id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
          <button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hotel.status === "ACTIVE"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {hotel.status === "ACTIVE" ? <Lock size={18} /> : <Unlock size={18} />}
            {hotel.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            <Trash2 size={18} />
            Xóa
          </button>
        </div>
      </div>

      {/* Hotel Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {hotel.main_image && (
            <img src={hotel.main_image} alt={hotel.name} className="w-32 h-32 rounded-xl object-cover" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(hotel.status)}
                  <span className="text-gray-500">ID: {hotel.hotel_id}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-400" size={18} />
                <span className="text-sm text-gray-600">{hotel.city}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500 fill-yellow-500" size={18} />
                <span className="text-sm font-medium text-gray-900">{hotel.avg_rating}</span>
                <span className="text-sm text-gray-500">({hotel.review_count} reviews)</span>
              </div>
              {hotel.phone_number && (
                <div className="flex items-center gap-2">
                  <Phone className="text-gray-400" size={18} />
                  <span className="text-sm text-gray-600">{hotel.phone_number}</span>
                </div>
              )}
              {hotel.email && (
                <div className="flex items-center gap-2">
                  <Mail className="text-gray-400" size={18} />
                  <span className="text-sm text-gray-600">{hotel.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const showBadge = tab.id === "bookings" && pendingBookingCount > 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "bookings") {
                      // Refresh booking count when switching to bookings tab
                      fetchPendingBookingCount();
                    }
                  }}
                  className={`relative flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {showBadge && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {pendingBookingCount > 99 ? "99+" : pendingBookingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "info" && <HotelInfoTab hotel={hotel} onUpdate={fetchHotelDetail} />}
          {activeTab === "images" && <HotelImagesTab hotelId={hotel.hotel_id} />}
          {activeTab === "facilities" && <HotelFacilitiesTab hotelId={hotel.hotel_id} />}
          {activeTab === "highlights" && <HotelHighlightsTab hotelId={hotel.hotel_id} />}
          {activeTab === "policies" && <HotelPoliciesTab hotelId={hotel.hotel_id} />}
          {activeTab === "reviews" && <HotelReviewsTab hotelId={hotel.hotel_id} />}
          {activeTab === "bookings" && (
            <HotelBookingsTab 
              hotelId={hotel.hotel_id} 
              onBookingUpdate={() => {
                fetchPendingBookingCount();
              }}
            />
          )}
          {activeTab === "stats" && <HotelStatsTab hotelId={hotel.hotel_id} />}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa khách sạn</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa khách sạn <strong>{hotel.name}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;
