import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Plus, AlertCircle, Building2, X, Upload, Image as ImageIcon } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import SearchableHotelSelector from "./SearchableHotelSelector";
import adminApi from "../../../api/adminAxiosClient";

interface RoomType {
  room_type_id: string;
  name: string;
  hotel_id: string;
  hotel_name: string;
  bed_type?: string | null;
  area?: number | null;
  min_capacity?: number | null;
  max_capacity?: number | null;
  avg_capacity?: number | null;
  min_price_base?: number | null;
  max_price_base?: number | null;
  avg_price_base?: number | null;
  room_count?: number;
  status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  image_url?: string | null;
  created_at: string;
}

interface RoomTypesListProps {
  selectedHotelId?: string | null;
  onHotelChange?: (hotelId: string) => void;
  onViewDetail?: (roomTypeId: string) => void;
}

const RoomTypesList = ({ selectedHotelId, onHotelChange, onViewDetail }: RoomTypesListProps = {}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bedTypes, setBedTypes] = useState<string[]>([]);
  const [filteredRoomTypes, setFilteredRoomTypes] = useState<RoomType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    bedType: "",
    priceMin: "",
    priceMax: "",
    capacity: "",
  });
  const [sortBy, setSortBy] = useState<"name" | "price" | "area" | "capacity">("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [currentHotelId, setCurrentHotelId] = useState<string>(selectedHotelId || "");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    bed_type: "",
    area: "",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchParams] = useSearchParams();

  // Fetch bed types
  useEffect(() => {
    fetchBedTypes();
  }, []);

  // Update current hotel when prop changes
  useEffect(() => {
    if (selectedHotelId) {
      setCurrentHotelId(selectedHotelId);
    } else {
      // Check URL params
      const hotelIdFromUrl = searchParams.get("hotelId");
      if (hotelIdFromUrl) {
        setCurrentHotelId(hotelIdFromUrl);
      }
    }
  }, [selectedHotelId, searchParams]);

  // Check if we should show create modal from URL
  useEffect(() => {
    const shouldShowCreate = window.location.pathname.includes("/create");
    if (shouldShowCreate && currentHotelId) {
      setShowCreateModal(true);
      // Clean URL
      window.history.replaceState({}, "", `/admin/rooms/types?hotelId=${currentHotelId}`);
    }
  }, [currentHotelId]);

  // Fetch room types when hotel changes
  useEffect(() => {
    if (currentHotelId) {
      fetchRoomTypes();
    } else {
      setRoomTypes([]);
      setFilteredRoomTypes([]);
    }
  }, [currentHotelId, currentPage, itemsPerPage, filters.bedType]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [roomTypes, searchTerm, filters, sortBy, sortOrder]);


  const fetchBedTypes = async () => {
    try {
      const response = await adminService.getBedTypes();
      if (response.success && response.data) {
        setBedTypes(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching bed types:", error);
    }
  };

  const fetchRoomTypes = async () => {
    if (!currentHotelId) return;

    setLoading(true);
    try {
      const response = await adminService.getRoomTypesByHotel(currentHotelId, {
        search: searchTerm || undefined,
        bedType: filters.bedType || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (response.success && response.data) {
        setRoomTypes(response.data.roomTypes);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        showToast("error", response.message || "Không thể tải danh sách loại phòng");
        setRoomTypes([]);
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải danh sách loại phòng");
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...roomTypes];

    // Search filter (client-side for instant feedback)
    if (searchTerm) {
      result = result.filter(
        (roomType) =>
          roomType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          roomType.room_type_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (roomType.bed_type && roomType.bed_type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Bed type filter (already applied server-side, but keep for consistency)
    if (filters.bedType) {
      result = result.filter((roomType) => roomType.bed_type === filters.bedType);
    }

    // Price filter
    if (filters.priceMin) {
      result = result.filter((roomType) => (roomType.avg_price_base || roomType.min_price_base || 0) >= parseInt(filters.priceMin));
    }
    if (filters.priceMax) {
      result = result.filter((roomType) => (roomType.avg_price_base || roomType.max_price_base || 0) <= parseInt(filters.priceMax));
    }

    // Capacity filter
    if (filters.capacity) {
      result = result.filter((roomType) => {
        const capacity = roomType.avg_capacity || roomType.min_capacity || roomType.max_capacity || 0;
        return capacity === parseInt(filters.capacity);
      });
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
          aValue = a.avg_price_base || a.min_price_base || 0;
          bValue = b.avg_price_base || b.min_price_base || 0;
          break;
        case "area":
          aValue = a.area || 0;
          bValue = b.area || 0;
          break;
        case "capacity":
          aValue = a.avg_capacity || a.min_capacity || 0;
          bValue = b.avg_capacity || b.min_capacity || 0;
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
  };

  const handleHotelChange = (hotelId: string) => {
    setCurrentHotelId(hotelId);
    setCurrentPage(1);
    if (onHotelChange) {
      onHotelChange(hotelId);
    }
  };

  const handleDelete = async (roomTypeId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại phòng này?")) return;

    try {
      const response = await adminService.deleteRoomType(roomTypeId);
      if (response.success) {
        showToast("success", response.message || "Xóa loại phòng thành công");
        fetchRoomTypes();
      } else {
        showToast("error", response.message || "Không thể xóa loại phòng");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa loại phòng");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("error", "Vui lòng chọn file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (): Promise<string | null> => {
    if (!imageFile) return createFormData.image_url || null;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("image", imageFile);

      const response = await adminApi.post("/api/upload/single", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data.url || response.data.data.imageUrl;
        return imageUrl;
      } else {
        showToast("error", response.data.message || "Lỗi khi upload ảnh");
        return null;
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi upload ảnh");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const generateRoomTypeId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `RT${timestamp}${random}`;
  };

  const handleCreateRoomType = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentHotelId) {
      showToast("error", "Vui lòng chọn khách sạn trước");
      return;
    }

    if (!createFormData.name.trim()) {
      showToast("error", "Vui lòng nhập tên loại phòng");
      return;
    }

    if (createFormData.area && parseFloat(createFormData.area) < 0) {
      showToast("error", "Diện tích phải lớn hơn hoặc bằng 0");
      return;
    }

    setCreateLoading(true);

    try {
      // Upload image first if there's a new image
      let imageUrl = createFormData.image_url;
      if (imageFile) {
        const uploadedUrl = await handleUploadImage();
        if (!uploadedUrl) {
          setCreateLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const roomTypeId = generateRoomTypeId();
      const createData: any = {
        room_type_id: roomTypeId,
        hotel_id: currentHotelId,
        name: createFormData.name.trim(),
        description: createFormData.description.trim() || null,
        bed_type: createFormData.bed_type || null,
        area: createFormData.area ? parseFloat(createFormData.area) : null,
      };

      if (imageUrl) {
        createData.image_url = imageUrl;
      }

      const response = await adminService.createRoomType(createData);
      if (response.success) {
        showToast("success", response.message || "Tạo loại phòng thành công");
        setShowCreateModal(false);
        setCreateFormData({
          name: "",
          description: "",
          bed_type: "",
          area: "",
          image_url: "",
        });
        setImagePreview(null);
        setImageFile(null);
        fetchRoomTypes();
      } else {
        showToast("error", response.message || "Lỗi khi tạo loại phòng");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Đã xảy ra lỗi");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách loại phòng..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách loại phòng</h1>
          <p className="text-gray-600 mt-1">Quản lý loại phòng theo khách sạn</p>
        </div>
        <button
          onClick={() => {
            if (!currentHotelId) {
              showToast("error", "Vui lòng chọn khách sạn trước");
              return;
            }
            setShowCreateModal(true);
          }}
          disabled={!currentHotelId}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Thêm loại phòng
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
              <span className="text-sm">Vui lòng chọn khách sạn để xem danh sách loại phòng</span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {currentHotelId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Trigger fetch when search changes (with debounce would be better)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchRoomTypes();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Bed Type Filter */}
            <select
              value={filters.bedType}
              onChange={(e) => {
                setFilters({ ...filters, bedType: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả loại giường</option>
              {bedTypes.map((bedType) => (
                <option key={bedType} value={bedType}>
                  {bedType}
                </option>
              ))}
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
      )}

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
              {!currentHotelId ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="text-gray-400" size={48} />
                      <p className="text-lg font-medium">Vui lòng chọn khách sạn để xem danh sách loại phòng</p>
                    </div>
                  </td>
                </tr>
              ) : currentRoomTypes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy loại phòng nào
                  </td>
                </tr>
              ) : (
                currentRoomTypes.map((roomType) => {
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

                  const imageUrl = formatImageUrl(roomType.image_url);

                  return (
                    <tr key={roomType.room_type_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={roomType.name}
                            className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x64?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                      </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{roomType.name}</div>
                      <div className="text-sm text-gray-500">ID: {roomType.room_type_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.bed_type || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{roomType.area ? `${roomType.area} m²` : "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {roomType.min_capacity && roomType.max_capacity ? (
                        roomType.min_capacity === roomType.max_capacity ? (
                          `${roomType.min_capacity} người`
                        ) : (
                          `${roomType.min_capacity}-${roomType.max_capacity} người`
                        )
                      ) : roomType.avg_capacity ? (
                        `~${roomType.avg_capacity} người`
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {roomType.min_price_base && roomType.max_price_base ? (
                        roomType.min_price_base === roomType.max_price_base ? (
                          formatPrice(roomType.min_price_base)
                        ) : (
                          `${formatPrice(roomType.min_price_base)} - ${formatPrice(roomType.max_price_base)}`
                        )
                      ) : roomType.avg_price_base ? (
                        `~${formatPrice(roomType.avg_price_base)}`
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(roomType.status || "ACTIVE")}</td>
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
                          onClick={() => navigate(`/admin/rooms/types/${roomType.room_type_id}?edit=info`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentHotelId && totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredRoomTypes.length)} trong tổng số {total} loại phòng
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

      {/* Create Room Type Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !createLoading && !uploading) {
              setShowCreateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Thêm loại phòng mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading || uploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateRoomType} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên loại phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  placeholder="VD: Phòng Deluxe, Suite VIP..."
                  required
                  disabled={createLoading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  placeholder="Mô tả về loại phòng..."
                  rows={4}
                  disabled={createLoading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Bed Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại giường</label>
                <select
                  value={createFormData.bed_type}
                  onChange={(e) => setCreateFormData({ ...createFormData, bed_type: e.target.value })}
                  disabled={createLoading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn loại giường</option>
                  {bedTypes.map((bedType) => (
                    <option key={bedType} value={bedType}>
                      {bedType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={createFormData.area}
                  onChange={(e) => setCreateFormData({ ...createFormData, area: e.target.value })}
                  placeholder="VD: 25.5"
                  disabled={createLoading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Room type preview"
                          className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setCreateFormData({ ...createFormData, image_url: "" });
                          }}
                          disabled={createLoading || uploading}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <ImageIcon className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={createLoading || uploading}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Upload size={18} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {imagePreview ? "Thay đổi ảnh" : "Chọn ảnh"}
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createLoading || uploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLoading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createLoading || uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploading ? "Đang upload..." : "Đang tạo..."}
                    </>
                  ) : (
                    "Tạo loại phòng"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypesList;

