import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Edit, Trash2, Lock, Unlock, MoreVertical, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface Hotel {
  hotel_id: string;
  name: string;
  category: string;
  city: string;
  star_rating: number;
  avg_rating: number;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  booking_count: number;
  main_image?: string;
  created_at: string;
}

interface HotelListProps {
  onViewDetail?: (hotelId: string) => void;
}

const HotelList = ({ onViewDetail }: HotelListProps = {}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    city: "",
    starRating: "",
  });
  const [sortBy, setSortBy] = useState<"name" | "rating" | "bookings" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [hotels, searchTerm, filters, sortBy, sortOrder]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await adminService.getHotels();
      // setHotels(response.data);

      // Mock data
      setTimeout(() => {
        setHotels([
          {
            hotel_id: "H001",
            name: "Hanoi Old Quarter Hotel",
            category: "Khách sạn",
            city: "Hà Nội",
            star_rating: 3,
            avg_rating: 8.2,
            status: "ACTIVE",
            booking_count: 342,
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-20",
          },
          {
            hotel_id: "H002",
            name: "My Khe Beach Resort",
            category: "Resort",
            city: "Đà Nẵng",
            star_rating: 5,
            avg_rating: 8.7,
            status: "ACTIVE",
            booking_count: 289,
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-20",
          },
          {
            hotel_id: "H003",
            name: "Saigon Riverside Hotel",
            category: "Khách sạn",
            city: "Hồ Chí Minh",
            star_rating: 5,
            avg_rating: 8.5,
            status: "ACTIVE",
            booking_count: 256,
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-20",
          },
          {
            hotel_id: "H004",
            name: "Sofitel Legend Metropole",
            category: "Khách sạn",
            city: "Hà Nội",
            star_rating: 5,
            avg_rating: 9.3,
            status: "ACTIVE",
            booking_count: 234,
            main_image: "https://via.placeholder.com/150",
            created_at: "2025-10-27",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách khách sạn");
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...hotels];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.hotel_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((hotel) => hotel.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      result = result.filter((hotel) => hotel.category === filters.category);
    }

    // City filter
    if (filters.city) {
      result = result.filter((hotel) => hotel.city === filters.city);
    }

    // Star rating filter
    if (filters.starRating) {
      result = result.filter((hotel) => hotel.star_rating === parseInt(filters.starRating));
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "rating":
          aValue = a.avg_rating;
          bValue = b.avg_rating;
          break;
        case "bookings":
          aValue = a.booking_count;
          bValue = b.booking_count;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
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

    setFilteredHotels(result);
    setCurrentPage(1);
  };

  const handleDelete = async (hotelId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách sạn này?")) return;

    try {
      // TODO: API call
      // await adminService.deleteHotel(hotelId);
      showToast("success", "Xóa khách sạn thành công");
      fetchHotels();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa khách sạn");
    }
  };

  const handleToggleStatus = async (hotelId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      // TODO: API call
      // await adminService.updateHotelStatus(hotelId, newStatus);
      showToast("success", `Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} khách sạn`);
      fetchHotels();
    } catch (error: any) {
      showToast("error", error.message || "Không thể thay đổi trạng thái");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Không hoạt động</span>;
      case "PENDING":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      default:
        return null;
    }
  };

  const getStarRating = (rating: number) => {
    return "⭐".repeat(Math.floor(rating));
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách khách sạn..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách khách sạn</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả khách sạn trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate("/admin/hotels/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm khách sạn
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
                placeholder="Tìm kiếm theo tên, ID, thành phố..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
            <option value="PENDING">Chờ duyệt</option>
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Khách sạn">Khách sạn</option>
            <option value="Resort">Resort</option>
            <option value="Homestay">Homestay</option>
          </select>

          {/* City Filter */}
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
            <option value="Nha Trang">Nha Trang</option>
            <option value="Phú Quốc">Phú Quốc</option>
          </select>

          {/* Star Rating Filter */}
          <select
            value={filters.starRating}
            onChange={(e) => setFilters({ ...filters, starRating: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="name">Tên</option>
            <option value="rating">Rating</option>
            <option value="bookings">Số booking</option>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách sạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành phố</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentHotels.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy khách sạn nào
                  </td>
                </tr>
              ) : (
                currentHotels.map((hotel) => (
                  <tr key={hotel.hotel_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hotel.main_image ? (
                        <img src={hotel.main_image} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                      <div className="text-sm text-gray-500">ID: {hotel.hotel_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{getStarRating(hotel.star_rating)}</span>
                        <span className="text-sm font-medium text-gray-900">{hotel.avg_rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(hotel.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hotel.booking_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hotel.created_at}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (onViewDetail) {
                              onViewDetail(hotel.hotel_id);
                            } else {
                              navigate(`/admin/hotels/${hotel.hotel_id}`);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/hotels/${hotel.hotel_id}/edit`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(hotel.hotel_id, hotel.status)}
                          className={`${hotel.status === "ACTIVE" ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"} p-1 rounded hover:bg-gray-50`}
                          title={hotel.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                        >
                          {hotel.status === "ACTIVE" ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(hotel.hotel_id)}
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredHotels.length)} trong tổng số {filteredHotels.length} khách sạn
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

export default HotelList;

