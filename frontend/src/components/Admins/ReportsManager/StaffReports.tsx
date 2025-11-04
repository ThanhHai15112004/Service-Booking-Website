import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserCheck, Download, Filter, TrendingUp, Calendar, FileText, Edit, Trash2, CheckCircle } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface StaffReport {
  totalActions: number;
  actionsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  actionsByStaff: Array<{
    staff_id: string;
    staff_name: string;
    action_count: number;
    actions_by_type: {
      create: number;
      update: number;
      delete: number;
      approve: number;
    };
  }>;
  actionsByTime: Array<{
    date: string;
    count: number;
  }>;
  peakHours: Array<{
    hour: string;
    count: number;
  }>;
  actionLogs: Array<{
    id: number;
    date: string;
    staff_name: string;
    staff_id: string;
    action_type: string;
    action_description: string;
    entity_type: string;
    entity_id: string;
  }>;
}

const StaffReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [report, setReport] = useState<StaffReport | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    staff: "",
    actionType: "",
    entityType: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchStaffReport();
  }, [filters]);

  const fetchStaffReport = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setReport({
          totalActions: 15678,
          actionsByType: [
            { type: "CREATE", count: 5234, percentage: 33.4 },
            { type: "UPDATE", count: 6234, percentage: 39.8 },
            { type: "DELETE", count: 1876, percentage: 12.0 },
            { type: "APPROVE", count: 2334, percentage: 14.9 },
          ],
          actionsByStaff: [
            {
              staff_id: "STAFF001",
              staff_name: "Nguyễn Văn A",
              action_count: 2456,
              actions_by_type: { create: 856, update: 1234, delete: 234, approve: 132 },
            },
            {
              staff_id: "STAFF002",
              staff_name: "Trần Thị B",
              action_count: 2234,
              actions_by_type: { create: 745, update: 1123, delete: 198, approve: 168 },
            },
            {
              staff_id: "STAFF003",
              staff_name: "Lê Văn C",
              action_count: 1876,
              actions_by_type: { create: 623, update: 945, delete: 156, approve: 152 },
            },
          ],
          actionsByTime: [
            { date: "01/11", count: 245 },
            { date: "02/11", count: 268 },
            { date: "03/11", count: 289 },
            { date: "04/11", count: 312 },
            { date: "05/11", count: 298 },
            { date: "06/11", count: 334 },
            { date: "07/11", count: 356 },
          ],
          peakHours: [
            { hour: "08:00", count: 234 },
            { hour: "09:00", count: 456 },
            { hour: "10:00", count: 567 },
            { hour: "11:00", count: 523 },
            { hour: "14:00", count: 489 },
            { hour: "15:00", count: 512 },
            { hour: "16:00", count: 445 },
          ],
          actionLogs: [
            {
              id: 1,
              date: "2025-11-07T14:30:00",
              staff_name: "Nguyễn Văn A",
              staff_id: "STAFF001",
              action_type: "CREATE",
              action_description: "Tạo booking mới",
              entity_type: "BOOKING",
              entity_id: "BK001",
            },
            {
              id: 2,
              date: "2025-11-07T13:20:00",
              staff_name: "Trần Thị B",
              staff_id: "STAFF002",
              action_type: "UPDATE",
              action_description: "Cập nhật trạng thái booking",
              entity_type: "BOOKING",
              entity_id: "BK002",
            },
            {
              id: 3,
              date: "2025-11-07T12:15:00",
              staff_name: "Lê Văn C",
              staff_id: "STAFF003",
              action_type: "APPROVE",
              action_description: "Duyệt review",
              entity_type: "REVIEW",
              entity_id: "RV001",
            },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải báo cáo nhân viên");
      setLoading(false);
    }
  };

  const handleExport = async (format: "EXCEL" | "PDF") => {
    try {
      // TODO: API call to export
      showToast("success", `Đang xuất báo cáo ${format}...`);
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất báo cáo");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải báo cáo nhân viên..." />;
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "CREATE":
        return <FileText className="text-green-600" size={18} />;
      case "UPDATE":
        return <Edit className="text-blue-600" size={18} />;
      case "DELETE":
        return <Trash2 className="text-red-600" size={18} />;
      case "APPROVE":
        return <CheckCircle className="text-purple-600" size={18} />;
      default:
        return <FileText className="text-gray-600" size={18} />;
    }
  };

  const getActionBadge = (type: string) => {
    const badges: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800",
      UPDATE: "bg-blue-100 text-blue-800",
      DELETE: "bg-red-100 text-red-800",
      APPROVE: "bg-purple-100 text-purple-800",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[type] || "bg-gray-100 text-gray-800"}`}>
        {type}
      </span>
    );
  };

  const totalPages = Math.ceil(report.actionLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = report.actionLogs.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Hoạt động Nhân viên</h1>
          <p className="text-gray-600 mt-1">Theo dõi hiệu suất và hoạt động của nhân viên quản lý hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("EXCEL")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Excel
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium mb-2">Tổng số thao tác</p>
            <p className="text-4xl font-bold">{report.totalActions.toLocaleString()}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <UserCheck size={48} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Đến ngày"
          />
          <select
            value={filters.staff}
            onChange={(e) => setFilters({ ...filters, staff: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả nhân viên</option>
            <option value="STAFF001">Nguyễn Văn A</option>
            <option value="STAFF002">Trần Thị B</option>
            <option value="STAFF003">Lê Văn C</option>
          </select>
          <select
            value={filters.actionType}
            onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả hành động</option>
            <option value="CREATE">Tạo mới</option>
            <option value="UPDATE">Cập nhật</option>
            <option value="DELETE">Xóa</option>
            <option value="APPROVE">Duyệt</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            Phân loại theo loại hành động
          </h3>
          <div className="space-y-3">
            {report.actionsByType.map((action) => (
              <div key={action.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{action.type}</span>
                  <span className="text-sm text-gray-600">{action.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${action.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{action.count.toLocaleString()} thao tác</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions by Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Hoạt động theo thời gian
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.actionsByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actions by Staff */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck className="text-purple-600" size={20} />
          Số thao tác theo nhân viên
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={report.actionsByStaff} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="staff_name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="action_count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-orange-600" size={20} />
          Thời gian thao tác nhiều nhất
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={report.peakHours}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Action Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết hành động</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(log.date)}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{log.staff_name}</p>
                      <p className="text-xs text-gray-500">{log.staff_id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action_type)}
                      {getActionBadge(log.action_type)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{log.action_description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.entity_type}: {log.entity_id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffReports;

