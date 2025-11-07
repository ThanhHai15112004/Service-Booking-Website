import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, DollarSign, Image as ImageIcon, Settings, Bed, MapPin, DoorOpen } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import RoomTypeInfoTab from "./RoomTypeDetailTabs/RoomTypeInfoTab";
import RoomImagesTab from "./RoomTypeDetailTabs/RoomImagesTab";
import RoomAmenitiesTab from "./RoomTypeDetailTabs/RoomAmenitiesTab";
import RoomPoliciesTab from "./RoomTypeDetailTabs/RoomPoliciesTab";
import RoomPricingTab from "./RoomTypeDetailTabs/RoomPricingTab";
import RoomRoomsTab from "./RoomTypeDetailTabs/RoomRoomsTab";

type TabType = "info" | "images" | "amenities" | "policies" | "pricing" | "rooms";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("pricing");
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Check if edit=info is in URL params
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam === "info") {
      setActiveTab("info");
      setIsEditingInfo(true);
      // Clean up URL param after setting state
      searchParams.delete("edit");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (roomTypeId) {
      fetchRoomTypeDetail();
    }
  }, [roomTypeId]);

  const fetchRoomTypeDetail = async () => {
    if (!roomTypeId) return;

    setLoading(true);
    try {
      const response = await adminService.getRoomTypeById(roomTypeId);
      if (response.success && response.data) {
        const data = response.data;
        // Calculate capacity: prefer avg_capacity, fallback to min/max
        const capacity = data.avg_capacity || data.min_capacity || data.max_capacity || 0;
        // Calculate price_base: prefer avg_price_base, fallback to min/max
        const price_base = data.avg_price_base || data.min_price_base || data.max_price_base || 0;
        
        setRoomType({
          room_type_id: data.room_type_id,
          name: data.name,
          description: data.description || "",
          hotel_id: data.hotel_id,
          hotel_name: data.hotel_name,
          bed_type: data.bed_type || "",
          area: data.area || 0,
          capacity: capacity,
          price_base: price_base,
          status: "ACTIVE", // Not returned from API
          main_image: data.image_url || undefined,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      } else {
        showToast("error", response.message || "Không tìm thấy loại phòng");
        if (onBack) {
          onBack();
        } else {
          navigate("/admin/rooms/types");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi tải thông tin loại phòng");
      if (onBack) {
        onBack();
      } else {
        navigate("/admin/rooms/types");
      }
    } finally {
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
      const response = await adminService.deleteRoomType(roomType.room_type_id);
      if (response.success) {
        showToast("success", response.message || "Xóa loại phòng thành công");
        setTimeout(() => {
          if (onBack) {
            onBack();
          } else {
            navigate("/admin/rooms/types");
          }
        }, 1500);
      } else {
        showToast("error", response.message || "Lỗi khi xóa loại phòng");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi xóa loại phòng");
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
    { id: "pricing" as TabType, label: "Quản lý giá", icon: DollarSign },
    { id: "info" as TabType, label: "Thông tin cơ bản", icon: Bed },
    { id: "rooms" as TabType, label: "Phòng vật lý", icon: DoorOpen },
    { id: "images" as TabType, label: "Ảnh phòng", icon: ImageIcon },
    { id: "amenities" as TabType, label: "Tiện nghi", icon: Settings },
    { id: "policies" as TabType, label: "Chính sách", icon: Settings },
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
          {!isEditingInfo && (
            <button
              onClick={() => {
                setActiveTab("info");
                setIsEditingInfo(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} />
              Chỉnh sửa
            </button>
          )}
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
          {roomType.main_image && (() => {
            // Helper function to format image URL
            const formatImageUrl = (url: string | null | undefined): string => {
              if (!url) return '';
              if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
              }
              // Relative path - add base URL
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
              return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
            };
            const imageUrl = formatImageUrl(roomType.main_image);
            return (
              <img
                src={imageUrl}
                alt={roomType.name}
                className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x128?text=No+Image';
                }}
              />
            );
          })()}
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
          {activeTab === "info" && (
            <RoomTypeInfoTab
              roomType={roomType}
              onUpdate={fetchRoomTypeDetail}
              isEditing={isEditingInfo}
              onToggleEdit={() => setIsEditingInfo(!isEditingInfo)}
            />
          )}
          {activeTab === "rooms" && <RoomRoomsTab roomTypeId={roomType.room_type_id} />}
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

