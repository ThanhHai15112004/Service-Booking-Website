import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Edit, Lock, Unlock, Trash2, Calendar, Tag, ChevronLeft, ChevronRight, Filter, Plus, Download } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface DiscountCode {
  discount_code_id: string;
  code: string;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  max_discount?: number;
  usage_count: number;
  usage_limit?: number;
  expiry_date: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  created_at: string;
}

const DiscountCodesList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<DiscountCode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    discountType: "",
    expiryDate: "",
    isHot: false,
  });
  const [selectedCode, setSelectedCode] = useState<DiscountCode | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(7);

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [codes, searchTerm, filters]);

  const fetchDiscountCodes = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setCodes([
          {
            discount_code_id: "DC001",
            code: "SUMMER2025",
            discount_type: "PERCENT",
            discount_value: 15,
            max_discount: 500000,
            usage_count: 456,
            usage_limit: 1000,
            expiry_date: "2025-12-31",
            status: "ACTIVE",
            created_at: "2025-06-01",
          },
          {
            discount_code_id: "DC002",
            code: "WELCOME10",
            discount_type: "PERCENT",
            discount_value: 10,
            usage_count: 389,
            usage_limit: 500,
            expiry_date: "2025-11-15",
            status: "ACTIVE",
            created_at: "2025-08-01",
          },
          {
            discount_code_id: "DC003",
            code: "BLACKFRIDAY",
            discount_type: "FIXED",
            discount_value: 200000,
            usage_count: 298,
            usage_limit: 1000,
            expiry_date: "2025-11-30",
            status: "ACTIVE",
            created_at: "2025-10-01",
          },
          {
            discount_code_id: "DC004",
            code: "OLDCODE",
            discount_type: "PERCENT",
            discount_value: 20,
            usage_count: 45,
            expiry_date: "2025-01-01",
            status: "EXPIRED",
            created_at: "2024-12-01",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách mã giảm giá");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...codes];

    if (searchTerm) {
      result = result.filter((code) =>
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.discount_code_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      result = result.filter((code) => code.status === filters.status);
    }

    if (filters.discountType) {
      result = result.filter((code) => code.discount_type === filters.discountType);
    }

    if (filters.expiryDate) {
      const today = new Date();
      const filterDate = new Date(filters.expiryDate);
      if (filters.expiryDate === "before") {
        result = result.filter((code) => new Date(code.expiry_date) < filterDate);
      } else {
        result = result.filter((code) => new Date(code.expiry_date) > filterDate);
      }
    }

    if (filters.isHot) {
      result = result.filter((code) => code.usage_count > 100);
    }

    setFilteredCodes(result);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (codeId: string, currentStatus: string) => {
    try {
      // TODO: API call
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      showToast("success", `Đã ${newStatus === "ACTIVE" ? "kích hoạt" : "vô hiệu hóa"} mã giảm giá`);
      fetchDiscountCodes();
    } catch (error: any) {
      showToast("error", error.message || "Không thể thay đổi trạng thái");
    }
  };

  const handleDelete = async () => {
    if (!selectedCode) return;

    try {
      // TODO: API call to soft delete
      showToast("success", `Đã xóa mã giảm giá ${selectedCode.code}`);
      setShowDeleteModal(false);
      setSelectedCode(null);
      fetchDiscountCodes();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa mã giảm giá");
    }
  };

  const handleExtend = async () => {
    if (!selectedCode || !extendDays) return;

    try {
      // TODO: API call to extend expiry date
      showToast("success", `Đã gia hạn mã ${selectedCode.code} thêm ${extendDays} ngày`);
      setShowExtendModal(false);
      setSelectedCode(null);
      setExtendDays(7);
      fetchDiscountCodes();
    } catch (error: any) {
      showToast("error", error.message || "Không thể gia hạn mã giảm giá");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCodes = filteredCodes.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Tạm ngưng</span>;
      case "EXPIRED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Hết hạn</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách mã giảm giá..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách mã giảm giá</h1>
          <p className="text-gray-600 mt-1">Quản lý toàn bộ mã giảm giá trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate("/admin/discounts/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo mã mới
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
                placeholder="Tìm kiếm theo mã giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>

          <select
            value={filters.discountType}
            onChange={(e) => setFilters({ ...filters, discountType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại</option>
            <option value="PERCENT">Phần trăm</option>
            <option value="FIXED">Số tiền cố định</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hotCodes"
              checked={filters.isHot}
              onChange={(e) => setFilters({ ...filters, isHot: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="hotCodes" className="text-sm text-gray-700 cursor-pointer">
              Mã hot (usage &gt; 100)
            </label>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã giảm giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm tối đa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn dùng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentCodes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy mã giảm giá nào
                  </td>
                </tr>
              ) : (
                currentCodes.map((code) => (
                  <tr key={code.discount_code_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className="text-blue-600" size={18} />
                        <span className="font-mono font-medium text-gray-900">{code.code}</span>
                        {isExpiringSoon(code.expiry_date) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Sắp hết hạn
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {code.discount_type === "PERCENT" ? "Phần trăm" : "Số tiền cố định"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {code.discount_type === "PERCENT" ? (
                        <span className="text-sm font-medium text-gray-900">{code.discount_value}%</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(code.discount_value)} VNĐ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {code.max_discount ? (
                        <span className="text-sm text-gray-900">
                          {new Intl.NumberFormat("vi-VN").format(code.max_discount)} VNĐ
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{code.usage_count}</span>
                        {code.usage_limit && (
                          <span className="text-gray-500"> / {code.usage_limit}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(code.expiry_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(code.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/discounts/${code.discount_code_id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/discounts/${code.discount_code_id}/edit`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        {code.status === "ACTIVE" ? (
                          <button
                            onClick={() => handleToggleStatus(code.discount_code_id, code.status)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="Vô hiệu hóa"
                          >
                            <Lock size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(code.discount_code_id, code.status)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Kích hoạt"
                          >
                            <Unlock size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedCode(code);
                            setShowExtendModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Gia hạn"
                        >
                          <Calendar size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCode(code);
                            setShowDeleteModal(true);
                          }}
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCodes.length)} trong tổng số {filteredCodes.length} mã
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

      {/* Delete Modal */}
      {showDeleteModal && selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa mã giảm giá</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa mã <span className="font-mono font-bold">{selectedCode.code}</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCode(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Gia hạn mã giảm giá</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá</label>
                <p className="text-gray-900 font-mono">{selectedCode.code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn dùng hiện tại</label>
                <p className="text-gray-900">{formatDate(selectedCode.expiry_date)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gia hạn thêm (ngày)</label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={(e) => setExtendDays(Number(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedCode(null);
                  setExtendDays(7);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleExtend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Gia hạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodesList;

