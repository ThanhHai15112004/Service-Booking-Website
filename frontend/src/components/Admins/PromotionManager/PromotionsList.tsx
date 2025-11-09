import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Edit, Lock, Unlock, Trash2, Tag, ChevronLeft, ChevronRight, Filter, Plus, Zap } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface Promotion {
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
  created_at: string;
  created_by_name?: string;
}

const PromotionsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    discountType: "",
  });
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applyingPromotionId, setApplyingPromotionId] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchPromotions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, filters.status, filters.type, filters.discountType]);

  // Separate effect for search term (after debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPromotions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.type) {
        params.type = filters.type;
      }

      if (filters.discountType) {
        params.discountType = filters.discountType;
      }

      const result = await adminService.getAllPromotions(params);
      if (result.success && result.data) {
        setPromotions(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotal(result.pagination.total);
        }
      } else {
        showToast("error", result.message || "Không thể tải danh sách promotion");
      }
    } catch (error: any) {
      console.error("[PromotionsList] fetchPromotions error:", error);
      showToast("error", error.message || "Không thể tải danh sách promotion");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (promotionId: string) => {
    try {
      setLoading(true);
      const result = await adminService.togglePromotionStatus(promotionId);
      if (result.success) {
        showToast("success", result.message || "Đã thay đổi trạng thái promotion");
        fetchPromotions();
      } else {
        showToast("error", result.message || "Không thể thay đổi trạng thái");
      }
    } catch (error: any) {
      console.error("[PromotionsList] handleToggleStatus error:", error);
      showToast("error", error.message || "Không thể thay đổi trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPromotion) return;

    try {
      setLoading(true);
      const result = await adminService.deletePromotion(selectedPromotion.promotion_id);
      if (result.success) {
        showToast("success", result.message || `Đã xóa promotion ${selectedPromotion.name}`);
        setShowDeleteModal(false);
        setSelectedPromotion(null);
        fetchPromotions();
      } else {
        showToast("error", result.message || "Không thể xóa promotion");
      }
    } catch (error: any) {
      console.error("[PromotionsList] handleDelete error:", error);
      showToast("error", error.message || "Không thể xóa promotion");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToSchedules = async (promotionId: string) => {
    try {
      setApplyingPromotionId(promotionId);
      const result = await adminService.applyPromotionToSchedules(promotionId);
      if (result.success) {
        showToast("success", result.message || `Đã áp dụng promotion vào ${result.affectedSchedules || 0} schedules`);
      } else {
        showToast("error", result.message || "Không thể áp dụng promotion");
      }
    } catch (error: any) {
      console.error("[PromotionsList] handleApplyToSchedules error:", error);
      showToast("error", error.message || "Không thể áp dụng promotion");
    } finally {
      setApplyingPromotionId(null);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Tạm ngưng</span>;
      case "EXPIRED":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Hết hạn</span>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "PROVIDER":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Provider</span>;
      case "SYSTEM":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">System</span>;
      case "BOTH":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">Both</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách chiến dịch khuyến mãi</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả các chiến dịch khuyến mãi</p>
        </div>
        <button
          onClick={() => navigate("/admin/promotions/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Tạo promotion mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => {
              setFilters({ ...filters, type: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại</option>
            <option value="PROVIDER">Provider</option>
            <option value="SYSTEM">System</option>
            <option value="BOTH">Both</option>
          </select>

          <select
            value={filters.discountType}
            onChange={(e) => {
              setFilters({ ...filters, discountType: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại giảm giá</option>
            <option value="PERCENTAGE">Phần trăm</option>
            <option value="FIXED_AMOUNT">Số tiền cố định</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loading message="Đang tải danh sách promotion..." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên promotion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm giá</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày kết thúc</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Không có promotion nào
                    </td>
                  </tr>
                ) : (
                  promotions.map((promo) => (
                    <tr key={promo.promotion_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{promo.name}</p>
                          {promo.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{promo.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{getTypeBadge(promo.type)}</td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">
                          {promo.discount_type === "PERCENTAGE" ? `${promo.discount_value}%` : `${formatPrice(promo.discount_value)} VNĐ`}
                        </span>
                        {promo.max_discount && promo.discount_type === "PERCENTAGE" && (
                          <p className="text-xs text-gray-500">Tối đa: {formatPrice(promo.max_discount)} VNĐ</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(promo.start_date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(promo.end_date)}</td>
                      <td className="px-4 py-3">{getStatusBadge(promo.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/promotions/${promo.promotion_id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/promotions/${promo.promotion_id}/edit`)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={18} />
                          </button>
                          {promo.status === "ACTIVE" && (
                            <button
                              onClick={() => handleApplyToSchedules(promo.promotion_id)}
                              disabled={applyingPromotionId === promo.promotion_id}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Áp dụng vào schedules"
                            >
                              <Zap size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(promo.promotion_id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title={promo.status === "ACTIVE" ? "Tạm ngưng" : "Kích hoạt"}
                          >
                            {promo.status === "ACTIVE" ? <Lock size={18} /> : <Unlock size={18} />}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPromotion(promo);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, total)} của {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedPromotion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xác nhận xóa</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa promotion <strong>{selectedPromotion.name}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedPromotion(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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

export default PromotionsList;

