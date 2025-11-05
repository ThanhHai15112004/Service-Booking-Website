import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Eye,
  KeyRound,
  CheckCircle,
  ArrowUpDown,
  X,
} from "lucide-react";
import { adminService, Account } from "../../services/adminService";
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";

const UserList = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    role: "" as "" | "ADMIN" | "STAFF" | "USER",
    status: "" as "" | "ACTIVE" | "PENDING" | "BANNED" | "DELETED",
    provider: "" as "" | "GOOGLE" | "FACEBOOK" | "LOCAL",
    is_verified: undefined as boolean | undefined,
  });
  const [sortBy, setSortBy] = useState<"created_at" | "full_name" | "email">("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Form states
  const [editForm, setEditForm] = useState<Partial<Account>>({});
  const [createForm, setCreateForm] = useState({
    full_name: "",
    email: "",
    password: "",
    phone_number: "",
    role: "USER" as "ADMIN" | "STAFF" | "USER",
  });
  const [resetPasswordValue, setResetPasswordValue] = useState("");

  useEffect(() => {
    fetchAccounts();
  }, [pagination.page, filters, sortBy, sortOrder, searchTerm]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...filters,
      };
      if (searchTerm) params.search = searchTerm;
      if (filters.is_verified !== undefined) params.is_verified = filters.is_verified;

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined) delete params[key];
      });

      const response = await adminService.getAccounts(params);
      setAccounts(response.data.accounts);
      setPagination(response.data.pagination);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field: "created_at" | "full_name" | "email") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  const handleViewDetail = async (accountId: string) => {
    try {
      const response = await adminService.getAccountDetail(accountId);
      setSelectedAccount(response.data);
      setShowDetailModal(true);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi tải chi tiết tài khoản");
    }
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setEditForm({
      full_name: account.full_name,
      email: account.email,
      phone_number: account.phone_number || "",
      role: account.role,
      status: account.status,
      is_verified: account.is_verified,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAccount) return;
    try {
      // Convert null to undefined for phone_number to match UpdateAccountData type
      const updateData = {
        ...editForm,
        phone_number: editForm.phone_number === null ? undefined : editForm.phone_number,
      };
      await adminService.updateAccount(selectedAccount.account_id, updateData);
      showToast("success", "Cập nhật tài khoản thành công");
      setShowEditModal(false);
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi cập nhật tài khoản");
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    try {
      await adminService.deleteAccount(selectedAccount.account_id);
      showToast("success", "Xóa tài khoản thành công");
      setShowDeleteModal(false);
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xóa tài khoản");
    }
  };

  const handleForceVerify = async (accountId: string) => {
    try {
      await adminService.forceVerifyEmail(accountId);
      showToast("success", "Xác thực email thành công");
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xác thực email");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedAccount || !resetPasswordValue) {
      showToast("error", "Vui lòng nhập mật khẩu mới");
      return;
    }
    try {
      await adminService.resetPassword(selectedAccount.account_id, resetPasswordValue);
      showToast("success", "Đặt lại mật khẩu thành công");
      setShowResetPasswordModal(false);
      setResetPasswordValue("");
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  const handleCreateAccount = async () => {
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      showToast("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    try {
      if (createForm.role === "USER") {
        await adminService.createUserAccount({
          full_name: createForm.full_name,
          email: createForm.email,
          password: createForm.password,
          phone_number: createForm.phone_number || undefined,
        });
      } else {
        await adminService.createAdminAccount({
          full_name: createForm.full_name,
          email: createForm.email,
          password: createForm.password,
          phone_number: createForm.phone_number || undefined,
          role: createForm.role,
        });
      }
      showToast("success", "Tạo tài khoản thành công");
      setShowCreateModal(false);
      setCreateForm({
        full_name: "",
        email: "",
        password: "",
        phone_number: "",
        role: "USER",
      });
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi tạo tài khoản");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      BANNED: "bg-red-100 text-red-800",
      DELETED: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.ACTIVE}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-black text-white",
      STAFF: "bg-blue-100 text-blue-800",
      USER: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[role as keyof typeof styles] || styles.USER}`}>
        {role}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && accounts.length === 0) {
    return <Loading message="Đang tải danh sách tài khoản..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Quản lý tài khoản</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và quyền hạn người dùng</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200 rounded-lg"
        >
          <Plus size={20} />
          <span className="font-medium">Thêm tài khoản</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value || "")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
            >
              <option value="">Tất cả vai trò</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
              <option value="USER">USER</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value || "")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="BANNED">BANNED</option>
              <option value="DELETED">DELETED</option>
            </select>

            <select
              value={filters.provider}
              onChange={(e) => handleFilterChange("provider", e.target.value || "")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
            >
              <option value="">Tất cả Provider</option>
              <option value="LOCAL">LOCAL</option>
              <option value="GOOGLE">GOOGLE</option>
              <option value="FACEBOOK">FACEBOOK</option>
            </select>

            <select
              value={filters.is_verified === undefined ? "" : filters.is_verified ? "true" : "false"}
              onChange={(e) =>
                handleFilterChange("is_verified", e.target.value === "" ? undefined : e.target.value === "true")
              }
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
            >
              <option value="">Tất cả trạng thái xác thực</option>
              <option value="true">Đã xác thực</option>
              <option value="false">Chưa xác thực</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("full_name")}>
                  <div className="flex items-center gap-2">
                    Người dùng
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-2">
                    Liên hệ
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center gap-2">
                    Ngày tạo
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.account_id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-medium rounded-full">
                          {account.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">{account.full_name}</p>
                          <p className="text-xs text-gray-500">ID: {account.account_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <span>{account.email}</span>
                        </div>
                        {account.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            <span>{account.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(account.role)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(account.status)}
                        {!account.is_verified && (
                          <span className="text-xs text-yellow-600">Chưa xác thực</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(account.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(account.account_id)}
                          className="p-2 hover:bg-blue-50 transition-colors duration-200 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-2 hover:bg-gray-100 transition-colors duration-200 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} className="text-gray-600" />
                        </button>
                        {!account.is_verified && (
                          <button
                            onClick={() => handleForceVerify(account.account_id)}
                            className="p-2 hover:bg-green-50 transition-colors duration-200 rounded"
                            title="Xác thực email"
                          >
                            <CheckCircle size={16} className="text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowResetPasswordModal(true);
                          }}
                          className="p-2 hover:bg-yellow-50 transition-colors duration-200 rounded"
                          title="Reset mật khẩu"
                        >
                          <KeyRound size={16} className="text-yellow-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-red-50 transition-colors duration-200 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 0 && (
        <div className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            của <span className="font-medium">{pagination.total}</span> tài khoản
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              let page: number;
              if (pagination.totalPages <= 5) {
                page = i + 1;
              } else if (pagination.page <= 3) {
                page = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                page = pagination.totalPages - 4 + i;
              } else {
                page = pagination.page - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
                    pagination.page === page
                      ? "bg-black text-white"
                      : "hover:bg-gray-50 transition-colors duration-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">Chi tiết tài khoản</h2>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Họ tên</label>
                <p className="text-black">{selectedAccount.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-black">{selectedAccount.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                <p className="text-black">{selectedAccount.phone_number || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Vai trò</label>
                <p>{getRoleBadge(selectedAccount.role)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                <p>{getStatusBadge(selectedAccount.status)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Xác thực email</label>
                <p className={selectedAccount.is_verified ? "text-green-600" : "text-yellow-600"}>
                  {selectedAccount.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Provider</label>
                <p className="text-black">{selectedAccount.provider || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                <p className="text-black">{formatDate(selectedAccount.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Ngày cập nhật</label>
                <p className="text-black">{formatDate(selectedAccount.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">Chỉnh sửa tài khoản</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  value={editForm.full_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone_number || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <select
                  value={editForm.role || ""}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={editForm.status || ""}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="BANNED">BANNED</option>
                  <option value="DELETED">DELETED</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_verified || false}
                    onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Đã xác thực email</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">Tạo tài khoản mới</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                <input
                  type="text"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="text"
                  value={createForm.phone_number}
                  onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Tạo
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-black mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedAccount.full_name}</strong> ({selectedAccount.email}) không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResetPasswordModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-black">Đặt lại mật khẩu</h2>
              <button onClick={() => setShowResetPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Đặt lại mật khẩu cho tài khoản <strong>{selectedAccount.full_name}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(e) => setResetPasswordValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Đặt lại
                </button>
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResetPasswordValue("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList; 