import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  KeyRound,
  CheckCircle,
  UserCheck,
  Package,
  ShoppingBag,
  Star,
  MapPin,
  Activity,
  Shield,
  Lock,
  Unlock,
  X,
} from "lucide-react";
import { adminService, Account } from "../../../services/adminService";
import Toast from "../../Toast";
import Loading from "../../Loading";
import AccountInfoTab from "./AccountDetailTabs/AccountInfoTab";
import AccountPackagesTab from "./AccountDetailTabs/AccountPackagesTab";
import AccountBookingsTab from "./AccountDetailTabs/AccountBookingsTab";
import AccountReviewsTab from "./AccountDetailTabs/AccountReviewsTab";
import AccountAddressesTab from "./AccountDetailTabs/AccountAddressesTab";
import AccountActivityTab from "./AccountDetailTabs/AccountActivityTab";
import AccountPermissionsTab from "./AccountDetailTabs/AccountPermissionsTab";

type TabType = "info" | "packages" | "bookings" | "reviews" | "addresses" | "activity" | "permissions";

const AccountDetail = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [account, setAccount] = useState<Account | null>(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState("");

  useEffect(() => {
    if (accountId) {
      fetchAccountDetail();
    }
  }, [accountId]);

  const fetchAccountDetail = async () => {
    try {
      const response = await adminService.getAccountDetail(accountId!);
      setAccount(response.data);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi tải thông tin tài khoản");
      navigate("/admin/accounts");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async () => {
    if (!account) return;
    try {
      await adminService.deleteAccount(account.account_id);
      showToast("success", "Xóa tài khoản thành công");
      setTimeout(() => navigate("/admin/accounts"), 1500);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xóa tài khoản");
    }
  };

  const handleForceVerify = async () => {
    if (!account) return;
    try {
      await adminService.forceVerifyEmail(account.account_id);
      showToast("success", "Xác thực email thành công");
      fetchAccountDetail();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xác thực email");
    }
  };

  const handleResetPassword = async () => {
    if (!account || !resetPasswordValue) {
      showToast("error", "Vui lòng nhập mật khẩu mới");
      return;
    }
    try {
      await adminService.resetPassword(account.account_id, resetPasswordValue);
      showToast("success", "Đặt lại mật khẩu thành công");
      setShowResetPasswordModal(false);
      setResetPasswordValue("");
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  const handleBanToggle = async () => {
    if (!account) return;
    const newStatus = account.status === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      await adminService.updateAccount(account.account_id, { status: newStatus });
      showToast("success", newStatus === "BANNED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchAccountDetail();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi thay đổi trạng thái");
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

  const getAvatar = () => {
    if (!account) return null;
    if (account.avatar_url) {
      return (
        <img
          src={account.avatar_url}
          alt={account.full_name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }
    return (
      <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-bold rounded-full text-xl border-2 border-gray-200">
        {account.full_name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return <Loading message="Đang tải thông tin tài khoản..." />;
  }

  if (!account) {
    return null;
  }

  const tabs = [
    { id: "info" as TabType, label: "Thông tin chính", icon: <UserCheck size={18} /> },
    { id: "packages" as TabType, label: "Gói & Thanh toán", icon: <Package size={18} /> },
    { id: "bookings" as TabType, label: "Booking & Đặt phòng", icon: <ShoppingBag size={18} /> },
    { id: "reviews" as TabType, label: "Đánh giá & Nhận xét", icon: <Star size={18} /> },
    { id: "addresses" as TabType, label: "Địa chỉ", icon: <MapPin size={18} /> },
    { id: "activity" as TabType, label: "Hoạt động", icon: <Activity size={18} /> },
    { id: "permissions" as TabType, label: "Phân quyền & Trạng thái", icon: <Shield size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/accounts")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            {getAvatar()}
            <div>
              <h1 className="text-3xl font-bold text-black">{account.full_name}</h1>
              <p className="text-gray-600 mt-1">{account.email}</p>
            </div>
            <div className="flex gap-2">
              {getRoleBadge(account.role)}
              {getStatusBadge(account.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!account.is_verified && (
            <button
              onClick={handleForceVerify}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <CheckCircle size={16} />
              Xác thực email
            </button>
          )}
          <button
            onClick={handleBanToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              account.status === "BANNED"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {account.status === "BANNED" ? <Unlock size={16} /> : <Lock size={16} />}
            {account.status === "BANNED" ? "Mở khóa" : "Khóa"}
          </button>
          <button
            onClick={() => setShowResetPasswordModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            <KeyRound size={16} />
            Reset mật khẩu
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <Trash2 size={16} />
            Xóa
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {activeTab === "info" && account && (
          <AccountInfoTab account={account} onUpdate={fetchAccountDetail} />
        )}
        {activeTab === "packages" && account && (
          <AccountPackagesTab accountId={account.account_id} />
        )}
        {activeTab === "bookings" && account && (
          <AccountBookingsTab accountId={account.account_id} />
        )}
        {activeTab === "reviews" && account && (
          <AccountReviewsTab accountId={account.account_id} />
        )}
        {activeTab === "addresses" && account && (
          <AccountAddressesTab accountId={account.account_id} />
        )}
        {activeTab === "activity" && account && (
          <AccountActivityTab accountId={account.account_id} />
        )}
        {activeTab === "permissions" && account && (
          <AccountPermissionsTab account={account} onUpdate={fetchAccountDetail} />
        )}
      </div>

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowResetPasswordModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">Đặt lại mật khẩu</h2>
              <button onClick={() => setShowResetPasswordModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Đặt lại mật khẩu cho tài khoản <strong>{account.full_name}</strong>
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

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-black mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{account.full_name}</strong> ({account.email}) không?
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
    </div>
  );
};

export default AccountDetail;
