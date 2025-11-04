import { useState, useEffect } from "react";
import { MapPin, Plus, Edit, Trash2, Star, X, Phone, User, Building, Navigation } from "lucide-react";
import Loading from "../../Loading";
import Toast from "../../Toast";
import { adminService } from "../../../services/adminService";

interface AccountAddressesProps {
  accountId: string;
  showHeader?: boolean;
}

interface Address {
  address_id: string;
  account_id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district?: string | null;
  street_name?: string | null;
  house_number?: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const AccountAddresses = ({ accountId, showHeader = true }: AccountAddressesProps) => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    house_number: "",
    street_name: "",
    district: "",
    city: "",
    country: "VN",
    is_default: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchAddresses();
  }, [accountId]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAccountAddresses(accountId);
      setAddresses(response.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      showToast("error", "Lỗi khi tải danh sách địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên người nhận không được để trống";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[\d\s\+\-\(\)]+$/.test(form.phone) || form.phone.length < 10) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!form.city.trim()) {
      newErrors.city = "Thành phố không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      house_number: "",
      street_name: "",
      district: "",
      city: "",
      country: "VN",
      is_default: false,
    });
    setErrors({});
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setForm({
      name: address.name,
      phone: address.phone,
      house_number: address.house_number || "",
      street_name: address.street_name || "",
      district: address.district || "",
      city: address.city,
      country: address.country,
      is_default: address.is_default,
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleAddAddress = async () => {
    if (!validateForm()) {
      showToast("error", "Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    if (addresses.length >= 5) {
      showToast("error", "Bạn chỉ có thể thêm tối đa 5 địa chỉ");
      return;
    }

    try {
      const response = await adminService.createAddress(accountId, form);
      showToast("success", response.message);
      setShowAddModal(false);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi thêm địa chỉ");
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress || !validateForm()) {
      showToast("error", "Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    try {
      const response = await adminService.updateAddress(accountId, editingAddress.address_id, form);
      showToast("success", response.message);
      setShowEditModal(false);
      setEditingAddress(null);
      resetForm();
      fetchAddresses();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi cập nhật địa chỉ");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này không?")) return;

    try {
      await adminService.deleteAddress(accountId, addressId);
      showToast("success", "Xóa địa chỉ thành công");
      fetchAddresses();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await adminService.setDefaultAddress(accountId, addressId);
      showToast("success", "Đã đặt địa chỉ làm mặc định");
      fetchAddresses();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi đặt địa chỉ mặc định");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading && addresses.length === 0) {
    return <Loading message="Đang tải danh sách địa chỉ..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-black">Quản lý Địa chỉ</h2>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý các địa chỉ mà người dùng đã lưu (tối đa 5 địa chỉ)
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            disabled={addresses.length >= 5}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Thêm địa chỉ
          </button>
        </div>
      )}

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
          <p className="text-sm text-gray-600 mb-4">Bắt đầu bằng cách thêm địa chỉ đầu tiên</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.address_id}
              className={`bg-white border-2 rounded-lg p-5 ${
                address.is_default ? "border-black bg-gray-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">{address.name}</h3>
                    {address.is_default && (
                      <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Star size={12} className="fill-green-600" />
                        Địa chỉ mặc định
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEditModal(address)}
                    className="p-2 hover:bg-blue-50 rounded transition-colors duration-200"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.address_id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors duration-200"
                    title="Xóa"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} />
                  <span>{address.phone}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <Navigation size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    {address.house_number && <span>{address.house_number}, </span>}
                    {address.street_name && <span>{address.street_name}, </span>}
                    {address.district && <span>{address.district}, </span>}
                    <span className="font-medium">{address.city}</span>
                    {address.country && address.country !== "VN" && <span>, {address.country}</span>}
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Tạo: {formatDate(address.created_at)}
                </div>
              </div>

              {!address.is_default && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleSetDefault(address.address_id)}
                    className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                  >
                    Đặt làm mặc định
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Thêm địa chỉ mới</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddAddress(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={14} className="inline mr-1" />
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
                    errors.name ? "border-red-500" : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="Nhập tên người nhận"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={14} className="inline mr-1" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
                    errors.phone ? "border-red-500" : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="0123456789"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhà
                  </label>
                  <input
                    type="text"
                    value={form.house_number}
                    onChange={(e) => setForm({ ...form, house_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đường
                  </label>
                  <input
                    type="text"
                    value={form.street_name}
                    onChange={(e) => setForm({ ...form, street_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                    placeholder="Đường ABC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building size={14} className="inline mr-1" />
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                  placeholder="Quận 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => {
                    setForm({ ...form, city: e.target.value });
                    if (errors.city) setErrors({ ...errors, city: "" });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
                    errors.city ? "border-red-500" : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="Hồ Chí Minh"
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quốc gia
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                >
                  <option value="VN">Việt Nam</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default_add"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_default_add" className="text-sm text-gray-700 cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Thêm địa chỉ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {showEditModal && editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Chỉnh sửa địa chỉ</h3>
              <button onClick={() => {
                setShowEditModal(false);
                setEditingAddress(null);
                resetForm();
              }} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAddress(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={14} className="inline mr-1" />
                  Tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
                    errors.name ? "border-red-500" : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="Nhập tên người nhận"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone size={14} className="inline mr-1" />
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => {
                    setForm({ ...form, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: "" });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
                    errors.phone ? "border-red-500" : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="0123456789"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số nhà
                  </label>
                  <input
                    type="text"
                    value={form.house_number}
                    onChange={(e) => setForm({ ...form, house_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                    placeholder="123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đường
                  </label>
                  <input
                    type="text"
                    value={form.street_name}
                    onChange={(e) => setForm({ ...form, street_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                    placeholder="Đường ABC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building size={14} className="inline mr-1" />
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                  placeholder="Quận 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={14} className="inline mr-1" />
                  Thành phố <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => {
                    setForm({ ...form, city: e.target.value });
                    if (errors.city) setErrors({ ...errors, city: "" });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors duration-200 ${
                    errors.city ? "border-red-500" : "border-gray-300 focus:border-black"
                  }`}
                  placeholder="Hồ Chí Minh"
                />
                {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quốc gia
                </label>
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors duration-200"
                >
                  <option value="VN">Việt Nam</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="JP">Japan</option>
                  <option value="KR">South Korea</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_default_edit"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="is_default_edit" className="text-sm text-gray-700 cursor-pointer">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountAddresses;

