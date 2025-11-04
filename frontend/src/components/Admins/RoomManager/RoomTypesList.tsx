import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Edit, Trash2, DollarSign, MoreVertical, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface RoomType {
  room_type_id: string;
  name: string;
  hotel_id: string;
  hotel_name: string;
  bed_type: string;
  area: number;
  capacity: number;
  price_base: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  main_image?: string;
  created_at: string;
}

interface RoomTypesListProps {
  onViewDetail?: (roomTypeId: string) => void;
}

const RoomTypesList = ({ onViewDetail }: RoomTypesListProps = {}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState<RoomType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    hotel: "",
    bedType: "",
    priceMin: "",
    priceMax: "",
    capacity: "",
  });
  const [sortBy, setSortBy] = useState<"name" | "price" | "area" | "capacity">("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [roomTypes, searchTerm, filters, sortBy, sortOrder]);

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setRoomTypes([
          {
            room_type_id: "RT001",
            name: "Deluxe Sea View",
            hotel_id: "H002",
            hotel_name: "My Khe Beach Resort",
            bed_type: "King",
            area: 45,
            capacity: 2,
            price_base: 2500000,
            status: "ACTIVE",
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-20",
          },
          {
            room_type_id: "RT002",
            name: "Executive Suite",
            hotel_id: "H004",
            hotel_name: "Sofitel Metropole",
            bed_type: "King",
            area: 60,
            capacity: 3,
            price_base: 3500000,
            status: "ACTIVE",
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-27",
          },
          {
            room_type_id: "RT003",
            name: "Superior Garden",
            hotel_id: "H001",
            hotel_name: "Hanoi Old Quarter Hotel",
            bed_type: "Double",
            area: 30,
            capacity: 2,
            price_base: 1200000,
            status: "ACTIVE",
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-20",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách loại phòng");
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...roomTypes];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (roomType) =>
          roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roomType.room_type_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roomType.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roomType.bed_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Hotel filter
    if (filters.hotel) {
      result = result.filter((roomType) => roomType.hotel_id === filters.hotel);
    }

    // Bed type filter
    if (filters.bedType) {
      result = result.filter((roomType) => roomType.bed_type === filters.bedType);
    }

    // Price filter
    if (filters.priceMin) {
      result = result.filter((roomType) => roomType.price_base >= parseInt(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter((roomType) => roomType.price_base <= parseInt(filters.priceMax));
    }

    // Capacity filter
    if (filters.capacity) {
      result = result.filter((roomType) => roomType.capacity === parseInt(filters.capacity));
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.price_base;
          bValue = b.price_base;
          break;
        case "area":
          aValue = a.area;
          bValue = b.area;
          break;
        case "capacity":
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        default:
          return 0;
      }

      if (sortOrder === "ASC") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredRoomTypes(result);
    setCurrentPage(1);
  };

  const handleDelete = async (roomTypeId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa loại phòng thành công");
      fetchRoomTypes();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa loại phòng");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredRoomTypes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRoomTypes = filteredRoomTypes.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Không hoạt động</span>;
      case "MAINTENANCE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Bảo trì</span>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách loại phòng..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách loại phòng</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả loại phòng trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate("/admin/rooms/types/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm loại phòng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, ID, khách sạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Hotel Filter */}
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

          {/* Bed Type Filter */}
          <select
            value={filters.bedType}
            onChange={(e) => setFilters({ ...filters, bedType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại giường</option>
            <option value="Single">Single</option>
            <option value="Double">Double</option>
            <option value="King">King</option>
            <option value="Twin">Twin</option>
          </select>

          {/* Capacity Filter */}
          <select
            value={filters.capacity}
            onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả sức chứa</option>
            <option value="1">1 người</option>
            <option value="2">2 người</option>
            <option value="3">3 người</option>
            <option value="4">4 người</option>
            <option value="5">5+ người</option>
          </select>

          {/* Price Range */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Giá min"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Giá max"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Tên</option>
            <option value="price">Giá</option>
            <option value="area">Diện tích</option>
            <option value="capacity">Sức chứa</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === "ASC" ? "↑ Tăng dần" : "↓ Giảm dần"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách sạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại giường</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diện tích (m²)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sức chứa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá cơ bản</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRoomTypes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy loại phòng nào
                  </td>
                </tr>
              ) : (
                currentRoomTypes.map((roomType) => (
                  <tr key={roomType.room_type_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {roomType.main_image ? (
                        <img src={roomType.main_image} alt={roomType.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{roomType.name}</div>
                      <div className="text-sm text-gray-500">ID: {roomType.room_type_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.bed_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.area} m²</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.capacity} người</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(roomType.price_base)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(roomType.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onViewDetail) {
                              onViewDetail(roomType.room_type_id);
                            } else {
                              navigate(`/admin/rooms/types/${roomType.room_type_id}`);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/rooms/types/${roomType.room_type_id}/edit`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/rooms/types/${roomType.room_type_id}/pricing`)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Quản lý giá"
                        >
                          <DollarSign size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(roomType.room_type_id)}
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRoomTypes.length)} trong tổng số {filteredRoomTypes.length} loại phòng
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
    </div>
  );
};

export default RoomTypesList;

