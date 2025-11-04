import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Eye, ChevronLeft, ChevronRight, MapPin, Building2, X } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface Room {
  room_id: string;
  room_number: string;
  room_type_id: string;
  room_type_name: string;
  hotel_id: string;
  hotel_name: string;
  floor?: number;
  view?: string;
  status: "AVAILABLE" | "MAINTENANCE" | "OUT_OF_SERVICE" | "OCCUPIED";
  created_at: string;
}

const RoomsList = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    hotel: "",
    roomType: "",
    view: "",
    status: "",
  });
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchTerm, filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setRooms([
          {
            room_id: "R001",
            room_number: "101",
            room_type_id: "RT001",
            room_type_name: "Deluxe Sea View",
            hotel_id: "H002",
            hotel_name: "My Khe Beach Resort",
            floor: 1,
            view: "Sea View",
            status: "AVAILABLE",
            created_at: "2025-10-20",
          },
          {
            room_id: "R002",
            room_number: "201",
            room_type_id: "RT002",
            room_type_name: "Executive Suite",
            hotel_id: "H004",
            hotel_name: "Sofitel Metropole",
            floor: 2,
            view: "City View",
            status: "OCCUPIED",
            created_at: "2025-10-27",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách phòng");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...rooms];

    if (searchTerm) {
      result = result.filter(
        (room) =>
          room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.room_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.hotel_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.hotel) {
      result = result.filter((room) => room.hotel_id === filters.hotel);
    }

    if (filters.roomType) {
      result = result.filter((room) => room.room_type_id === filters.roomType);
    }

    if (filters.view) {
      result = result.filter((room) => room.view === filters.view);
    }

    if (filters.status) {
      result = result.filter((room) => room.status === filters.status);
    }

    setFilteredRooms(result);
    setCurrentPage(1);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa phòng thành công");
      fetchRooms();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa phòng");
    }
  };

  const handleToggleStatus = async (roomId: string, currentStatus: string) => {
    try {
      const statusMap: Record<string, string> = {
        AVAILABLE: "MAINTENANCE",
        MAINTENANCE: "AVAILABLE",
        OUT_OF_SERVICE: "AVAILABLE",
        OCCUPIED: "AVAILABLE",
      };
      const newStatus = statusMap[currentStatus] || "AVAILABLE";
      // TODO: API call
      showToast("success", `Đã đổi trạng thái sang ${newStatus}`);
      fetchRooms();
    } catch (error: any) {
      showToast("error", error.message || "Không thể thay đổi trạng thái");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Còn trống</span>;
      case "MAINTENANCE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Bảo trì</span>;
      case "OUT_OF_SERVICE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Ngừng phục vụ</span>;
      case "OCCUPIED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đang sử dụng</span>;
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
          <p className="text-gray-600 mt-1">Quản lý các phòng thực tế trong hệ thống</p>
        </div>
        <button
          onClick={() => {/* TODO: Navigate to create room */}}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm phòng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo số phòng, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
            <option value="H003">Saigon Riverside Hotel</option>
            <option value="H004">Sofitel Metropole</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Còn trống</option>
            <option value="MAINTENANCE">Bảo trì</option>
            <option value="OUT_OF_SERVICE">Ngừng phục vụ</option>
            <option value="OCCUPIED">Đang sử dụng</option>
          </select>

          <select
            value={filters.view}
            onChange={(e) => setFilters({ ...filters, view: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả view</option>
            <option value="Sea View">Sea View</option>
            <option value="City View">City View</option>
            <option value="Garden View">Garden View</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách sạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tầng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hướng nhìn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy phòng nào
                  </td>
                </tr>
              ) : (
                currentRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{room.room_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.room_type_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{room.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.room_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.floor || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.view || "-"}</td>
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
                          onClick={() => {/* TODO: Edit */}}
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
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRooms.length)} trong tổng số {filteredRooms.length} phòng
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tầng</label>
                  <p className="text-gray-900">{selectedRoom.floor || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hướng nhìn</label>
                  <p className="text-gray-900">{selectedRoom.view || "-"}</p>
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
                  setSelectedRoom(null);
                  // TODO: Navigate to edit page
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsList;

