import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, X, AlertCircle, Building2 } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import SearchableHotelSelector from "./SearchableHotelSelector";
import RoomModal from "./RoomModal";

interface Room {
  room_id: string;
  room_number?: string | null;
  room_type_id: string;
  room_type_name: string;
  hotel_id: string;
  hotel_name: string;
  capacity: number;
  image_url?: string | null;
  price_base?: number | null;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  created_at: string;
  updated_at: string;
}

interface RoomsListProps {
  selectedHotelId?: string | null;
  onHotelChange?: (hotelId: string) => void;
}

const RoomsList = ({ selectedHotelId, onHotelChange }: RoomsListProps = {}) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<Array<{ room_type_id: string; name: string }>>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    roomType: "",
    status: "",
  });
  const [currentHotelId, setCurrentHotelId] = useState<string>(selectedHotelId || "");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");

  // Update current hotel when prop changes
  useEffect(() => {
    if (selectedHotelId) {
      setCurrentHotelId(selectedHotelId);
    }
  }, [selectedHotelId]);

  // Fetch room types when hotel changes
  useEffect(() => {
    if (currentHotelId) {
      fetchRoomTypes();
      fetchRooms();
    } else {
      setRooms([]);
      setFilteredRooms([]);
      setRoomTypes([]);
    }
  }, [currentHotelId, currentPage, itemsPerPage, filters.roomType, filters.status]);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, filters]);

  const fetchRoomTypes = async () => {
    if (!currentHotelId) return;

    try {
      const response = await adminService.getRoomTypesForHotel(currentHotelId);
      if (response.success && response.data) {
        setRoomTypes(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching room types:", error);
    }
  };

  const fetchRooms = async () => {
    if (!currentHotelId) return;

    setLoading(true);
    try {
      const response = await adminService.getRoomsByHotel(currentHotelId, {
        roomTypeId: filters.roomType || undefined,
        status: filters.status || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (response.success && response.data) {
        setRooms(response.data.rooms);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        showToast("error", response.message || "Không thể tải danh sách phòng");
        setRooms([]);
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải danh sách phòng");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...rooms];

    // Search filter (client-side for instant feedback)
    if (searchTerm) {
      result = result.filter(
        (room) =>
          (room.room_number && room.room_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
          room.room_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.room_type_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Room type filter (already applied server-side, but keep for consistency)
    if (filters.roomType) {
      result = result.filter((room) => room.room_type_id === filters.roomType);
    }

    // Status filter (already applied server-side, but keep for consistency)
    if (filters.status) {
      result = result.filter((room) => room.status === filters.status);
    }

    setFilteredRooms(result);
  };

  const handleHotelChange = (hotelId: string) => {
    setCurrentHotelId(hotelId);
    setCurrentPage(1);
    setFilters({ roomType: "", status: "" });
    if (onHotelChange) {
      onHotelChange(hotelId);
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      const response = await adminService.deleteRoom(roomId);
      if (response.success) {
        showToast("success", response.message || "Xóa phòng thành công");
        fetchRooms();
      } else {
        showToast("error", response.message || "Không thể xóa phòng");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa phòng");
    }
  };

  const handleToggleStatus = async (roomId: string, currentStatus: string) => {
    try {
      const statusMap: Record<string, string> = {
        ACTIVE: "MAINTENANCE",
        MAINTENANCE: "ACTIVE",
        INACTIVE: "ACTIVE",
      };
      const newStatus = statusMap[currentStatus] || "ACTIVE";
      
      const response = await adminService.updateRoomStatus(roomId, newStatus);
      if (response.success) {
        showToast("success", response.message || `Đã đổi trạng thái sang ${newStatus}`);
        fetchRooms();
      } else {
        showToast("error", response.message || "Không thể thay đổi trạng thái");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể thay đổi trạng thái");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "MAINTENANCE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Bảo trì</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Không hoạt động</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách phòng..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách phòng vật lý</h1>
          <p className="text-gray-600 mt-1">Quản lý các phòng thực tế theo khách sạn</p>
        </div>
        <button
          onClick={() => {
            if (!currentHotelId) {
              showToast("error", "Vui lòng chọn khách sạn trước");
              return;
            }
            if (roomTypes.length === 0) {
              showToast("error", "Khách sạn này chưa có loại phòng nào. Vui lòng tạo loại phòng trước");
              return;
            }
            // Show room type selection or create modal
            setShowCreateModal(true);
          }}
          disabled={!currentHotelId || roomTypes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Thêm phòng
        </button>
      </div>

      {/* Hotel Selection - Required */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-gray-900">Chọn khách sạn *</label>
            {currentHotelId && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Đã chọn
              </span>
            )}
          </div>
          <SearchableHotelSelector
            value={currentHotelId}
            onChange={handleHotelChange}
            placeholder="Tìm kiếm khách sạn theo tên hoặc ID..."
            className="w-full"
          />
          {!currentHotelId && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle size={18} />
              <span className="text-sm">Vui lòng chọn khách sạn để xem danh sách phòng</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {currentHotelId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số phòng, ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchRooms();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Room Type Filter */}
            <div className="w-[200px]">
              <select
                value={filters.roomType}
                onChange={(e) => {
                  setFilters({ ...filters, roomType: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả loại phòng</option>
                {roomTypes.map((roomType) => (
                  <option key={roomType.room_type_id} value={roomType.room_type_id}>
                    {roomType.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-[180px]">
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="INACTIVE">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ảnh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách sạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sức chứa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá cơ bản</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!currentHotelId ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="text-gray-400" size={48} />
                      <p className="text-lg font-medium">Vui lòng chọn khách sạn để xem danh sách phòng</p>
                    </div>
                  </td>
                </tr>
              ) : currentRooms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy phòng nào
                  </td>
                </tr>
              ) : (
                currentRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {room.image_url ? (
                        <img
                          src={room.image_url.startsWith("http") ? room.image_url : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${room.image_url}`}
                          alt={room.room_number || room.room_id}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{room.room_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.room_type_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.room_number || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.capacity} người</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {room.price_base ? new Intl.NumberFormat("vi-VN").format(room.price_base) + " VNĐ" : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(room.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setSelectedRoomTypeId(room.room_type_id);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(room.room_id, room.status)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Đổi trạng thái"
                        >
                          <Building2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(room.room_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentHotelId && totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} trong tổng số {total} phòng
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRoom && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailModal(false);
              setSelectedRoom(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết phòng vật lý</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRoom(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image */}
              {selectedRoom.image_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh phòng</label>
                  <img
                    src={selectedRoom.image_url.startsWith("http") ? selectedRoom.image_url : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${selectedRoom.image_url}`}
                    alt={selectedRoom.room_number || selectedRoom.room_id}
                    className="w-full h-64 rounded-lg object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x256?text=Image+Error";
                    }}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã phòng</label>
                  <p className="text-gray-900">{selectedRoom.room_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng</label>
                  <p className="text-gray-900">{selectedRoom.room_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                  <p className="text-gray-900">{selectedRoom.room_type_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn</label>
                  <p className="text-gray-900">{selectedRoom.hotel_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                  <p className="text-gray-900">{selectedRoom.capacity} người</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản</label>
                  <p className="text-gray-900">
                    {selectedRoom.price_base ? new Intl.NumberFormat("vi-VN").format(selectedRoom.price_base) + " VNĐ" : "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(selectedRoom.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <p className="text-gray-900">{selectedRoom.created_at}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRoom(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRoomTypeId(selectedRoom.room_type_id);
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal - Room Type Selection */}
      {showCreateModal && !selectedRoomTypeId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chọn loại phòng</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Vui lòng chọn loại phòng để thêm phòng vật lý:</p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {roomTypes.map((roomType) => (
                <button
                  key={roomType.room_type_id}
                  onClick={() => {
                    setSelectedRoomTypeId(roomType.room_type_id);
                  }}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                >
                  <div className="font-medium text-gray-900">{roomType.name}</div>
                  <div className="text-xs text-gray-500 mt-1">ID: {roomType.room_type_id}</div>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 justify-end mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Room Modal */}
      {selectedRoomTypeId && (showCreateModal || showEditModal) && (
        <RoomModal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedRoom(null);
            setSelectedRoomTypeId("");
          }}
          onSuccess={() => {
            fetchRooms();
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedRoom(null);
            setSelectedRoomTypeId("");
          }}
          roomTypeId={selectedRoomTypeId}
          room={showEditModal ? selectedRoom : null}
        />
      )}
    </div>
  );
};

export default RoomsList;

