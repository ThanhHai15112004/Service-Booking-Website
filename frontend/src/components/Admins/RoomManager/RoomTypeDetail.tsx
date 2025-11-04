import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, DollarSign, Image as ImageIcon, Settings, Bed, MapPin } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import RoomTypeInfoTab from "./RoomTypeDetailTabs/RoomTypeInfoTab";
import RoomImagesTab from "./RoomTypeDetailTabs/RoomImagesTab";
import RoomAmenitiesTab from "./RoomTypeDetailTabs/RoomAmenitiesTab";
import RoomPoliciesTab from "./RoomTypeDetailTabs/RoomPoliciesTab";
import RoomPricingTab from "./RoomTypeDetailTabs/RoomPricingTab";

type TabType = "info" | "images" | "amenities" | "policies" | "pricing";

interface RoomType {
  room_type_id: string;
  name: string;
  description?: string;
  hotel_id: string;
  hotel_name: string;
  bed_type: string;
  area: number;
  capacity: number;
  price_base: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  main_image?: string;
  created_at: string;
  updated_at: string;
}

interface RoomTypeDetailProps {
  roomTypeId?: string;
  onBack?: () => void;
}

const RoomTypeDetail = ({ roomTypeId: propRoomTypeId, onBack }: RoomTypeDetailProps) => {
  const { roomTypeId: paramRoomTypeId } = useParams<{ roomTypeId: string }>();
  const roomTypeId = propRoomTypeId || paramRoomTypeId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (roomTypeId) {
      fetchRoomTypeDetail();
    }
  }, [roomTypeId]);

  const fetchRoomTypeDetail = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setRoomType({
          room_type_id: roomTypeId || "RT001",
          name: "Deluxe Sea View",
          description: "Phòng sang trọng với view biển tuyệt đẹp...",
          hotel_id: "H002",
          hotel_name: "My Khe Beach Resort",
          bed_type: "King",
          area: 45,
          capacity: 2,
          price_base: 2500000,
          status: "ACTIVE",
          main_image: "https://via.placeholder.com/800x400",
          created_at: "2025-10-20",
          updated_at: "2025-11-04",
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Lỗi khi tải thông tin loại phòng");
      if (onBack) {
        onBack();
      } else {
        navigate("/admin/rooms/types");
      }
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!roomType) return;
    try {
      // TODO: API call
      showToast("success", "Xóa loại phòng thành công");
      setTimeout(() => navigate("/admin/rooms/types"), 1500);
    } catch (error: any) {
      showToast("error", error.message || "Lỗi khi xóa loại phòng");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Không hoạt động</span>;
      case "MAINTENANCE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Bảo trì</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Đang tải thông tin loại phòng..." />;
  }

  if (!roomType) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy loại phòng</p>
      </div>
    );
  }

  const tabs = [
    { id: "info" as TabType, label: "Thông tin cơ bản", icon: Bed },
    { id: "images" as TabType, label: "Ảnh phòng", icon: ImageIcon },
    { id: "amenities" as TabType, label: "Tiện nghi", icon: Settings },
    { id: "policies" as TabType, label: "Chính sách", icon: Settings },
    { id: "pricing" as TabType, label: "Quản lý giá", icon: DollarSign },
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
              navigate("/admin/rooms/types");
            }
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại danh sách</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/rooms/types/${roomType.room_type_id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Chỉnh sửa
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

      {/* Room Type Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-6">
          {roomType.main_image && (
            <img src={roomType.main_image} alt={roomType.name} className="w-32 h-32 rounded-xl object-cover" />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{roomType.name}</h1>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(roomType.status)}
                  <span className="text-gray-500">ID: {roomType.room_type_id}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-400" size={18} />
                <span className="text-sm text-gray-600">{roomType.hotel_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="text-gray-400" size={18} />
                <span className="text-sm text-gray-600">{roomType.bed_type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{roomType.area} m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {new Intl.NumberFormat("vi-VN").format(roomType.price_base)} VNĐ
                </span>
              </div>
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
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "info" && <RoomTypeInfoTab roomType={roomType} onUpdate={fetchRoomTypeDetail} />}
          {activeTab === "images" && <RoomImagesTab roomTypeId={roomType.room_type_id} />}
          {activeTab === "amenities" && <RoomAmenitiesTab roomTypeId={roomType.room_type_id} />}
          {activeTab === "policies" && <RoomPoliciesTab roomTypeId={roomType.room_type_id} />}
          {activeTab === "pricing" && <RoomPricingTab roomTypeId={roomType.room_type_id} />}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa loại phòng</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa loại phòng <strong>{roomType.name}</strong>? Hành động này không thể hoàn tác.
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

export default RoomTypeDetail;

