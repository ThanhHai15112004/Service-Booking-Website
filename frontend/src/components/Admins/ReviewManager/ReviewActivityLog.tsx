import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, History, User, Calendar, ChevronLeft, ChevronRight, Filter, Download } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface ReviewActivityLog {
  id: number;
  date: string;
  admin_name: string;
  admin_id: string;
  review_id: string;
  action: string;
  note?: string;
  violation_type?: string;
}

const ReviewActivityLog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [logs, setLogs] = useState<ReviewActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ReviewActivityLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    admin: "",
    action: "",
    violationType: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, filters]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setLogs([
          {
            id: 1,
            date: "2025-11-04T14:30:00",
            admin_name: "admin01",
            admin_id: "ADM001",
            review_id: "RV1023",
            action: "Ẩn review",
            note: "Ngôn từ không phù hợp",
            violation_type: "TOXIC",
          },
          {
            id: 2,
            date: "2025-11-03T16:45:00",
            admin_name: "staff02",
            admin_id: "STAFF002",
            review_id: "RV0999",
            action: "Duyệt review",
            note: "Kiểm tra nội dung ổn",
          },
          {
            id: 3,
            date: "2025-11-03T10:20:00",
            admin_name: "admin01",
            admin_id: "ADM001",
            review_id: "RV0756",
            action: "Xóa review",
            note: "Spam content",
            violation_type: "SPAM",
          },
          {
            id: 4,
            date: "2025-11-02T15:10:00",
            admin_name: "staff02",
            admin_id: "STAFF002",
            review_id: "RV0543",
            action: "Đánh dấu vi phạm",
            note: "Duplicate review",
            violation_type: "DUPLICATE",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải nhật ký hoạt động");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...logs];

    if (searchTerm) {
      result = result.filter(
        (log) =>
          log.review_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.note?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.admin) {
      result = result.filter((log) => log.admin_id === filters.admin);
    }

    if (filters.action) {
      result = result.filter((log) => log.action === filters.action);
    }

    if (filters.violationType) {
      result = result.filter((log) => log.violation_type === filters.violationType);
    }

    if (filters.dateFrom) {
      result = result.filter((log) => log.date >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((log) => log.date <= filters.dateTo);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredLogs(result);
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      // TODO: API call to export log
      showToast("success", "Đang xuất nhật ký hoạt động...");
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất nhật ký");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      "Duyệt review": "bg-green-100 text-green-800",
      "Ẩn review": "bg-yellow-100 text-yellow-800",
      "Xóa review": "bg-red-100 text-red-800",
      "Đánh dấu vi phạm": "bg-purple-100 text-purple-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[action] || "bg-gray-100 text-gray-800"}`}>
        {action}
      </span>
    );
  };

  const getViolationBadge = (type?: string) => {
    if (!type) return null;
    const colorMap: Record<string, string> = {
      SPAM: "bg-red-100 text-red-800",
      TOXIC: "bg-orange-100 text-orange-800",
      DUPLICATE: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[type] || "bg-gray-100 text-gray-800"}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải nhật ký hoạt động..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nhật ký thao tác & quản lý vi phạm</h1>
          <p className="text-gray-600 mt-1">Theo dõi các hành động của admin/staff đối với review</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Xuất báo cáo
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
                placeholder="Tìm kiếm theo review ID, admin, hành động..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.admin}
            onChange={(e) => setFilters({ ...filters, admin: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả admin</option>
            <option value="ADM001">admin01</option>
            <option value="STAFF002">staff02</option>
          </select>

          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả hành động</option>
            <option value="Duyệt review">Duyệt review</option>
            <option value="Ẩn review">Ẩn review</option>
            <option value="Xóa review">Xóa review</option>
            <option value="Đánh dấu vi phạm">Đánh dấu vi phạm</option>
          </select>

          <select
            value={filters.violationType}
            onChange={(e) => setFilters({ ...filters, violationType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại vi phạm</option>
            <option value="SPAM">Spam</option>
            <option value="TOXIC">Toxic</option>
            <option value="DUPLICATE">Duplicate</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại vi phạm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy hoạt động nào
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(log.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="text-blue-600" size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.admin_name}</p>
                          <p className="text-xs text-gray-500">{log.admin_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/reviews/${log.review_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        {log.review_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getViolationBadge(log.violation_type)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{log.note || "-"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/reviews/${log.review_id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem review"
                      >
                        <Eye size={18} />
                      </button>
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} trong tổng số {filteredLogs.length} hoạt động
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

export default ReviewActivityLog;

