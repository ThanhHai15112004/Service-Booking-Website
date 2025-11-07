import { useState } from "react";
import { Shield, Lock, Unlock, KeyRound, CheckCircle, AlertCircle, Save } from "lucide-react";
import { Account, adminService } from "../../../../services/adminService";
import Toast from "../../../Toast";

interface AccountPermissionsTabProps {
  account: Account;
  onUpdate: () => void;
}

const AccountPermissionsTab = ({ account, onUpdate }: AccountPermissionsTabProps) => {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    role: account.role,
    status: account.status,
    is_verified: account.is_verified,
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    try {
      await adminService.updateAccount(account.account_id, form);
      showToast("success", "Cập nhật phân quyền và trạng thái thành công");
      onUpdate();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleForceVerify = async () => {
    try {
      await adminService.forceVerifyEmail(account.account_id);
      showToast("success", "Xác thực email thành công");
      setForm({ ...form, is_verified: true });
      onUpdate();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xác thực email");
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

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Role Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="text-purple-600" size={24} />
          <h3 className="text-lg font-bold text-black">Quản lý Vai trò</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò hiện tại</label>
            <div className="mb-3">{getRoleBadge(account.role)}</div>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="USER">USER</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của người dùng
            </p>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          {form.status === "BANNED" ? (
            <Lock className="text-red-600" size={24} />
          ) : (
            <Unlock className="text-green-600" size={24} />
          )}
          <h3 className="text-lg font-bold text-black">Quản lý Trạng thái</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái hiện tại</label>
            <div className="mb-3">{getStatusBadge(account.status)}</div>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="BANNED">BANNED</option>
              <option value="DELETED">DELETED</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {form.status === "BANNED" && "⚠️ Tài khoản bị khóa sẽ không thể đăng nhập"}
              {form.status === "DELETED" && "⚠️ Tài khoản đã bị xóa (soft delete)"}
            </p>
          </div>
        </div>
      </div>

      {/* Email Verification */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="text-green-600" size={24} />
          <h3 className="text-lg font-bold text-black">Xác thực Email</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-black">Trạng thái xác thực</p>
              <p className="text-sm text-gray-600 mt-1">
                {account.is_verified ? "Email đã được xác thực" : "Email chưa được xác thực"}
              </p>
            </div>
            {account.status === "PENDING" && (
              <button
                onClick={handleForceVerify}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <CheckCircle size={16} />
                Force Verify
              </button>
            )}
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-700">Đánh dấu email đã xác thực</span>
          </label>
        </div>
      </div>

      {/* Password Reset */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <KeyRound className="text-yellow-600" size={24} />
          <h3 className="text-lg font-bold text-black">Reset Mật khẩu</h3>
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-black mb-1">Thay đổi mật khẩu</p>
              <p className="text-xs text-gray-600">
                Sử dụng nút "Reset mật khẩu" ở header để đặt lại mật khẩu cho tài khoản này.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
        >
          <Save size={16} />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default AccountPermissionsTab;

