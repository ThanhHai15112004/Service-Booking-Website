import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, XCircle, CheckCircle, Tag, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface DiscountUsage {
  id: number;
  booking_id: string;
  discount_code?: string;
  discount_type: "DISCOUNT_CODE" | "PROMOTION";
  discount_value: number;
  discount_percent?: number;
  status: "ACTIVE" | "USED" | "EXPIRED" | "DISABLED";
  used_at?: string;
  promotion_name?: string;
}

const Discounts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [discounts, setDiscounts] = useState<DiscountUsage[]>([]);
  const [filteredDiscounts, setFilteredDiscounts] = useState<DiscountUsage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    discountType: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [discounts, searchTerm, filters]);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filters.discountType) {
        params.discountType = filters.discountType;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }

      const result = await adminService.getBookingDiscountUsage(params);
      if (result.success && result.data) {
        setDiscounts(result.data.discounts || []);
        // Update pagination if available
      } else {
        showToast("error", result.message || "Không thể tải danh sách mã giảm giá");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...discounts];

    if (searchTerm) {
      result = result.filter(
        (discount) =>
          discount.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.discount_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          discount.promotion_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.discountType) {
      result = result.filter((discount) => discount.discount_type === filters.discountType);
    }

    if (filters.status) {
      result = result.filter((discount) => discount.status === filters.status);
    }

    if (filters.dateFrom) {
      result = result.filter((discount) => discount.used_at && discount.used_at >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((discount) => discount.used_at && discount.used_at <= filters.dateTo);
    }

    setFilteredDiscounts(result);
    setCurrentPage(1);
  };

  const handleDisableDiscount = async (_discountId: number) => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa mã giảm giá này?")) return;

    try {
      // TODO: API call với discountId
      showToast("success", "Đã vô hiệu hóa mã giảm giá");
      fetchDiscounts();
    } catch (error: any) {
      showToast("error", error.message || "Không thể vô hiệu hóa mã giảm giá");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredDiscounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDiscounts = filteredDiscounts.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đang hoạt động</span>;
      case "USED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đã sử dụng</span>;
      case "EXPIRED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Hết hạn</span>;
      case "DISABLED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã vô hiệu hóa</span>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Statistics
  const totalUsed = discounts.filter(d => d.status === "USED").length;
  const totalActive = discounts.filter(d => d.status === "ACTIVE").length;
  const totalSavings = discounts.filter(d => d.status === "USED").reduce((sum, d) => sum + d.discount_value, 0);

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách mã giảm giá..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý mã giảm giá</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý việc sử dụng mã giảm giá</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng mã đã sử dụng</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{totalUsed}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{totalActive}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Tag className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng tiền tiết kiệm</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{formatPrice(totalSavings)} VNĐ</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã booking, mã giảm giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.discountType}
            onChange={(e) => setFilters({ ...filters, discountType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại</option>
            <option value="DISCOUNT_CODE">Mã giảm giá</option>
            <option value="PROMOTION">Khuyến mãi</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="USED">Đã sử dụng</option>
            <option value="EXPIRED">Hết hạn</option>
            <option value="DISABLED">Đã vô hiệu hóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã giảm giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sử dụng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy mã giảm giá nào
                  </td>
                </tr>
              ) : (
                currentDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/bookings/${discount.booking_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        {discount.booking_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {discount.discount_code || discount.promotion_name || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {discount.discount_type === "DISCOUNT_CODE" ? "Mã giảm giá" : "Khuyến mãi"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {discount.discount_percent ? (
                        <span className="text-sm font-medium text-gray-900">{discount.discount_percent}%</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{formatPrice(discount.discount_value)} VNĐ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(discount.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(discount.used_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/bookings/${discount.booking_id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem booking"
                        >
                          <Eye size={18} />
                        </button>
                        {discount.status === "ACTIVE" && (
                          <button
                            onClick={() => handleDisableDiscount(discount.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Vô hiệu hóa"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredDiscounts.length)} trong tổng số {filteredDiscounts.length} mã giảm giá
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

export default Discounts;

