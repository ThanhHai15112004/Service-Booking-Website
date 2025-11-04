import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Lock,
  Unlock,
  X,
  ChevronDown,
  Filter,
  XCircle,
} from "lucide-react";
import { adminService, Account } from "../../../services/adminService";
import Toast from "../../Toast";
import Loading from "../../Loading";

const AccountList = () => {
  const navigate = useNavigate();
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
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "STAFF" | "USER">("USER");
  const [showFilters, setShowFilters] = useState(true);

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

  const handleViewDetail = (accountId: string) => {
    navigate(`/admin/accounts/${accountId}`);
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
      setSelectedAccount(null);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  const handleBanToggle = async () => {
    if (!selectedAccount) return;
    const newStatus = selectedAccount.status === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      await adminService.updateAccount(selectedAccount.account_id, { status: newStatus });
      showToast("success", newStatus === "BANNED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      setShowBanModal(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi thay đổi trạng thái");
    }
  };

  const handleRoleChange = async () => {
    if (!selectedAccount) return;
    try {
      await adminService.updateAccount(selectedAccount.account_id, { role: newRole });
      showToast("success", "Thay đổi vai trò thành công");
      setShowRoleModal(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi thay đổi vai trò");
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;
    try {
      await adminService.deleteAccount(selectedAccount.account_id);
      showToast("success", "Xóa tài khoản thành công");
      setShowDeleteModal(false);
      setSelectedAccount(null);
      fetchAccounts();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xóa tài khoản");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      role: "",
      status: "",
      provider: "",
      is_verified: undefined,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = () => {
    return (
      searchTerm !== "" ||
      filters.role !== "" ||
      filters.status !== "" ||
      filters.provider !== "" ||
      filters.is_verified !== undefined
    );
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

  const getProviderBadge = (provider: string | undefined) => {
    const styles = {
      LOCAL: "bg-gray-100 text-gray-800",
      GOOGLE: "bg-red-50 text-red-700 border border-red-200",
      FACEBOOK: "bg-blue-50 text-blue-700 border border-blue-200",
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[provider as keyof typeof styles] || styles.LOCAL}`}>
        {provider || "LOCAL"}
      </span>
    );
  };

  const getAvatar = (account: Account) => {
    if (account.avatar_url) {
      return (
        <img
          src={account.avatar_url}
          alt={account.full_name}
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-medium rounded-full">
        {account.full_name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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
          <h1 className="text-3xl font-bold text-black">Danh sách tài khoản</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin và quyền hạn người dùng</p>
        </div>
        <button
          onClick={() => navigate("/admin/accounts/create")}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200 rounded-lg"
        >
          <Plus size={20} />
          <span className="font-medium">Thêm tài khoản</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Bộ lọc & Tìm kiếm</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-black transition-colors duration-200"
              >
                <XCircle size={14} />
                Xóa bộ lọc
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors duration-200"
            >
              <ChevronDown size={16} className={`text-gray-600 transition-transform duration-200 ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="p-4 space-y-4">
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Vai trò</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value || "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200 text-sm"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF">STAFF</option>
                  <option value="USER">USER</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value || "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200 text-sm"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="BANNED">BANNED</option>
                  <option value="DELETED">DELETED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Provider</label>
                <select
                  value={filters.provider}
                  onChange={(e) => handleFilterChange("provider", e.target.value || "")}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200 text-sm"
                >
                  <option value="">Tất cả Provider</option>
                  <option value="LOCAL">LOCAL</option>
                  <option value="GOOGLE">GOOGLE</option>
                  <option value="FACEBOOK">FACEBOOK</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Xác thực</label>
                <select
                  value={filters.is_verified === undefined ? "" : filters.is_verified ? "true" : "false"}
                  onChange={(e) =>
                    handleFilterChange("is_verified", e.target.value === "" ? undefined : e.target.value === "true")
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200 text-sm"
                >
                  <option value="">Tất cả trạng thái xác thực</option>
                  <option value="true">Đã xác thực</option>
                  <option value="false">Chưa xác thực</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Limit Selector */}
      <div className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Hiển thị:</span>
          <select
            value={pagination.limit}
            onChange={(e) => {
              setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }));
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200 text-sm"
          >
            <option value={10}>10 bản ghi</option>
            <option value={15}>15 bản ghi</option>
            <option value={20}>20 bản ghi</option>
          </select>
          <span className="text-sm text-gray-600">mỗi trang</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    Avatar
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("full_name")}>
                  <div className="flex items-center gap-2">
                    Họ tên
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-gray-100" onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-2">
                    Email
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-center">Xác minh</th>
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
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.account_id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      {getAvatar(account)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-black">{account.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">ID: {account.account_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        <span>{account.email}</span>
                      </div>
                      {account.phone_number && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Phone size={12} />
                          <span>{account.phone_number}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(account.role)}</td>
                    <td className="px-6 py-4">{getProviderBadge(account.provider)}</td>
                    <td className="px-6 py-4">{getStatusBadge(account.status)}</td>
                    <td className="px-6 py-4 text-center">
                      {account.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-green-600" title="Đã xác minh">
                          <CheckCircle size={16} />
                          <span className="text-xs">Đã xác minh</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-600" title="Chưa xác minh">
                          <X size={16} />
                          <span className="text-xs">Chưa xác minh</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(account.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <button
                          onClick={() => handleViewDetail(account.account_id)}
                          className="p-2 hover:bg-blue-50 transition-colors duration-200 rounded"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowRoleModal(true);
                            setNewRole(account.role);
                          }}
                          className="p-2 hover:bg-purple-50 transition-colors duration-200 rounded"
                          title="Thay đổi role"
                        >
                          <Edit size={16} className="text-purple-600" />
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
                            setShowBanModal(true);
                          }}
                          className="p-2 hover:bg-red-50 transition-colors duration-200 rounded"
                          title={account.status === "BANNED" ? "Mở khóa" : "Khóa"}
                        >
                          {account.status === "BANNED" ? (
                            <Unlock size={16} className="text-green-600" />
                          ) : (
                            <Lock size={16} className="text-red-600" />
                          )}
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

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResetPasswordModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">Reset mật khẩu</h2>
              <button onClick={() => setShowResetPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
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
                    setSelectedAccount(null);
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

      {/* Ban/Unban Modal */}
      {showBanModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBanModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-black mb-4">
              {selectedAccount.status === "BANNED" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn {selectedAccount.status === "BANNED" ? "mở khóa" : "khóa"} tài khoản{" "}
              <strong>{selectedAccount.full_name}</strong> ({selectedAccount.email}) không?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleBanToggle}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  selectedAccount.status === "BANNED"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {selectedAccount.status === "BANNED" ? "Mở khóa" : "Khóa"}
              </button>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedAccount(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowRoleModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">Thay đổi vai trò</h2>
              <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Thay đổi vai trò cho tài khoản <strong>{selectedAccount.full_name}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò mới *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "ADMIN" | "STAFF" | "USER")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                >
                  <option value="USER">USER</option>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-600">
                  Vai trò hiện tại: <span className="font-medium">{selectedAccount.role}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Vai trò mới: <span className="font-medium">{newRole}</span>
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleRoleChange}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Thay đổi
                </button>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedAccount(null);
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
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAccount(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountList;
