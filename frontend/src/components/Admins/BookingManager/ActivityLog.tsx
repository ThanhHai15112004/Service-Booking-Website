import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, History, User, Calendar, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface ActivityLog {
  id: number;
  date: string;
  admin_name: string;
  admin_id: string;
  booking_id: string;
  action: string;
  old_value?: string;
  new_value?: string;
  note?: string;
}

const ActivityLog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState<Array<{ account_id: string; full_name: string }>>([]);
  const [filters, setFilters] = useState({
    admin: "",
    action: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  const fetchAdmins = async () => {
    try {
      const result = await adminService.getAccounts({ 
        limit: 100, 
        role: "ADMIN" 
      });
      if (result.success && result.data) {
        setAdmins(
          result.data.accounts.map((acc: any) => ({
            account_id: acc.account_id,
            full_name: acc.full_name,
          }))
        );
      }
    } catch (error: any) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filters.admin) {
        params.adminId = filters.admin;
      }
      if (filters.action) {
        params.action = filters.action;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }

      const result = await adminService.getBookingActivityLogs(params);
      if (result.success && result.data) {
        // Map backend format to frontend format
        const mappedLogs = (result.data.logs || []).map((log: any, index: number) => {
          // Parse change_details để lấy old_value và new_value
          let oldValue = "";
          let newValue = "";
          if (log.change_details) {
            // Format: "old_value → new_value" hoặc "old_value->new_value" hoặc "old_value -> new_value"
            // Sử dụng multiple separators: →, ->, hoặc ->
            const arrowRegex = /\s*(?:→|->|->)\s*/;
            const parts = log.change_details.split(arrowRegex);
            if (parts.length >= 2) {
              oldValue = parts[0]?.trim() || "";
              newValue = parts[1]?.trim() || "";
            }
          }

          return {
            id: log.id || index + 1,
            date: log.time || log.date || new Date().toISOString(),
            admin_name: log.user || log.admin_name || "Hệ thống",
            admin_id: log.admin_id || log.user_id || "",
            booking_id: log.booking_id || "",
            action: log.action || log.action_type || "",
            old_value: log.old_value || oldValue,
            new_value: log.new_value || newValue,
            note: log.note || "",
          };
        });
        setLogs(mappedLogs);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotal(result.data.pagination?.total || 0);
      } else {
        showToast("error", result.message || "Không thể tải lịch sử hoạt động");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải lịch sử hoạt động");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const currentLogs = logs;

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getActionBadge = (action: string) => {
    const colorMap: Record<string, string> = {
      "Tạo booking": "bg-gray-100 text-gray-800",
      "Thay đổi trạng thái": "bg-blue-100 text-blue-800",
      "Hủy booking": "bg-red-100 text-red-800",
      "Cập nhật thông tin": "bg-green-100 text-green-800",
      "Thêm ghi chú": "bg-purple-100 text-purple-800",
      "Chờ thanh toán": "bg-yellow-100 text-yellow-800",
      "Thanh toán thành công": "bg-green-100 text-green-800",
      "Check-in": "bg-blue-100 text-blue-800",
      "Check-out": "bg-purple-100 text-purple-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[action] || "bg-gray-100 text-gray-800"}`}>
        {action}
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
          <h1 className="text-3xl font-bold text-gray-900">Nhật ký thay đổi & hoạt động admin</h1>
          <p className="text-gray-600 mt-1">Theo dõi toàn bộ thay đổi và thao tác của nhân viên</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo booking ID, admin, hành động..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.admin}
            onChange={(e) => {
              setFilters({ ...filters, admin: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả admin</option>
            {admins.map((admin) => (
              <option key={admin.account_id} value={admin.account_id}>
                {admin.full_name}
              </option>
            ))}
          </select>

          <select
            value={filters.action}
            onChange={(e) => {
              setFilters({ ...filters, action: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả hành động</option>
            <option value="Tạo booking">Tạo booking</option>
            <option value="Thay đổi trạng thái">Thay đổi trạng thái</option>
            <option value="Hủy booking">Hủy booking</option>
            <option value="Cập nhật thông tin">Cập nhật thông tin</option>
            <option value="Thêm ghi chú">Thêm ghi chú</option>
            <option value="Chờ thanh toán">Chờ thanh toán</option>
            <option value="Thanh toán thành công">Thanh toán thành công</option>
            <option value="Check-in">Check-in</option>
            <option value="Check-out">Check-out</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => {
                setFilters({ ...filters, dateFrom: e.target.value });
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => {
                setFilters({ ...filters, dateTo: e.target.value });
                setCurrentPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Đến ngày"
            />
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thay đổi</th>
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
                        onClick={() => navigate(`/admin/bookings/${log.booking_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        {log.booking_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      {log.old_value && log.new_value ? (
                        <div className="text-sm text-gray-900">
                          <span className="text-gray-600">{log.old_value}</span>
                          <span className="mx-2">→</span>
                          <span className="font-medium">{log.new_value}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">{log.note || "-"}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/admin/bookings/${log.booking_id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Xem booking"
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
                Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, total)} trong tổng số {total} hoạt động
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

export default ActivityLog;

