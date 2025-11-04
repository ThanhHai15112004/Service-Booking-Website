import { useState } from "react";
import { Edit, Mail, Phone, Calendar, CheckCircle, X } from "lucide-react";
import { Account, adminService } from "../../../../services/adminService";
import Toast from "../../../Toast";

interface AccountInfoTabProps {
  account: Account;
  onUpdate: () => void;
}

const AccountInfoTab = ({ account, onUpdate }: AccountInfoTabProps) => {
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editForm, setEditForm] = useState<Partial<Account>>({
    full_name: account.full_name,
    email: account.email,
    phone_number: account.phone_number || "",
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
      await adminService.updateAccount(account.account_id, {
        ...editForm,
        phone_number: editForm.phone_number || undefined,
      });
      showToast("success", "Cập nhật thông tin thành công");
      setEditMode(false);
      onUpdate();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi cập nhật thông tin");
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

  const getAvatar = () => {
    if (account.avatar_url) {
      return (
        <img
          src={account.avatar_url}
          alt={account.full_name}
          className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
        />
      );
    }
    return (
      <div className="w-24 h-24 bg-black text-white flex items-center justify-center font-bold rounded-full text-3xl border-4 border-gray-200">
        {account.full_name.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Avatar Section */}
      <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
        {getAvatar()}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-black mb-2">{account.full_name}</h2>
          <div className="flex items-center gap-4 flex-wrap">
            {getRoleBadge(account.role)}
            {getStatusBadge(account.status)}
            {account.is_verified ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={16} />
                <span className="text-sm">Đã xác minh</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-yellow-600">
                <X size={16} />
                <span className="text-sm">Chưa xác minh</span>
              </span>
            )}
          </div>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Họ tên</label>
          {editMode ? (
            <input
              type="text"
              value={editForm.full_name || ""}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          ) : (
            <p className="text-black font-medium">{account.full_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
          {editMode ? (
            <input
              type="email"
              value={editForm.email || ""}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          ) : (
            <div className="flex items-center gap-2 text-black">
              <Mail size={16} />
              <span>{account.email}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Số điện thoại</label>
          {editMode ? (
            <input
              type="text"
              value={editForm.phone_number || ""}
              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          ) : (
            <div className="flex items-center gap-2 text-black">
              <Phone size={16} />
              <span>{account.phone_number || "N/A"}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Vai trò</label>
          {editMode ? (
            <select
              value={editForm.role || ""}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="USER">USER</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          ) : (
            <div>{getRoleBadge(account.role)}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Trạng thái</label>
          {editMode ? (
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
          ) : (
            <div>{getStatusBadge(account.status)}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Xác thực email</label>
          {editMode ? (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.is_verified || false}
                onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                className="rounded"
              />
              <span>Đã xác thực</span>
            </label>
          ) : (
            <p className={account.is_verified ? "text-green-600" : "text-yellow-600"}>
              {account.is_verified ? "Đã xác thực" : "Chưa xác thực"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Provider</label>
          <p className="text-black">{account.provider || "LOCAL"}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Account ID</label>
          <p className="text-black font-mono text-sm">{account.account_id}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Ngày tạo</label>
          <div className="flex items-center gap-2 text-black">
            <Calendar size={16} />
            <span>{formatDate(account.created_at)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Ngày cập nhật</label>
          <div className="flex items-center gap-2 text-black">
            <Calendar size={16} />
            <span>{formatDate(account.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Edit Actions */}
      {editMode && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Lưu thay đổi
          </button>
          <button
            onClick={() => {
              setEditMode(false);
              setEditForm({
                full_name: account.full_name,
                email: account.email,
                phone_number: account.phone_number || "",
                role: account.role,
                status: account.status,
                is_verified: account.is_verified,
              });
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Hủy
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountInfoTab;

