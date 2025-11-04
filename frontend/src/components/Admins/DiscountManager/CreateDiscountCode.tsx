import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, FileText, X, CheckCircle, AlertCircle, Tag, DollarSign, Calendar, Users, Building2, Hotel } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface HotelOption {
  hotel_id: string;
  name: string;
}

interface CategoryOption {
  category_id: string;
  name: string;
}

const CreateDiscountCode = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState({
    code: "",
    discount_type: "PERCENT" as "PERCENT" | "FIXED",
    discount_value: "",
    max_discount: "",
    min_purchase: "",
    usage_limit: "",
    per_user_limit: "",
    start_date: "",
    expiry_date: "",
    min_nights: "",
    max_nights: "",
    applicable_hotels: [] as string[],
    applicable_categories: [] as string[],
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    fetchHotels();
    fetchCategories();
  }, []);

  const fetchHotels = async () => {
    try {
      // TODO: API call
      setTimeout(() => {
        setHotels([
          { hotel_id: "H001", name: "Hanoi Old Quarter Hotel" },
          { hotel_id: "H002", name: "My Khe Beach Resort" },
          { hotel_id: "H003", name: "Saigon Riverside Hotel" },
        ]);
      }, 300);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách khách sạn");
    }
  };

  const fetchCategories = async () => {
    try {
      // TODO: API call
      setTimeout(() => {
        setCategories([
          { category_id: "CAT001", name: "Resort" },
          { category_id: "CAT002", name: "Boutique Hotel" },
          { category_id: "CAT003", name: "Business Hotel" },
        ]);
      }, 300);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách category");
    }
  };

  const handleHotelToggle = (hotelId: string) => {
    setForm({
      ...form,
      applicable_hotels: form.applicable_hotels.includes(hotelId)
        ? form.applicable_hotels.filter((id) => id !== hotelId)
        : [...form.applicable_hotels, hotelId],
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setForm({
      ...form,
      applicable_categories: form.applicable_categories.includes(categoryId)
        ? form.applicable_categories.filter((id) => id !== categoryId)
        : [...form.applicable_categories, categoryId],
    });
  };

  const handleSubmit = async () => {
    if (!form.code || !form.discount_value || !form.start_date || !form.expiry_date) {
      showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: API call
      showToast("success", isDraft ? "Đã lưu bản nháp" : "Tạo mã giảm giá thành công");
      setTimeout(() => navigate("/admin/discounts"), 1500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tạo mã giảm giá");
      setSubmitting(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải dữ liệu..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo mã giảm giá mới</h1>
          <p className="text-gray-600 mt-1">Tạo và cấu hình mã giảm giá cho hệ thống</p>
        </div>
        <button
          onClick={() => navigate("/admin/discounts")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={20} />
          Hủy
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Tag className="text-blue-600" size={24} />
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã giảm giá (Code) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="Ví dụ: SUMMER2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Mã phải là duy nhất và không có khoảng trắng</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as "PERCENT" | "FIXED" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="PERCENT">Phần trăm (%)</option>
              <option value="FIXED">Số tiền cố định (VNĐ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá trị giảm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                placeholder={form.discount_type === "PERCENT" ? "10" : "100000"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {form.discount_type === "PERCENT" ? "%" : "VNĐ"}
              </span>
            </div>
          </div>

          {form.discount_type === "PERCENT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                value={form.max_discount}
                onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                placeholder="500000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={form.expiry_date}
              onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              min={form.start_date}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <AlertCircle className="text-orange-600" size={24} />
          Điều kiện áp dụng
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị đơn hàng tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={form.min_purchase}
              onChange={(e) => setForm({ ...form, min_purchase: e.target.value })}
              placeholder="1000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lần sử dụng tối đa</label>
            <input
              type="number"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
              placeholder="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Để trống = không giới hạn</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn mỗi user</label>
            <input
              type="number"
              value={form.per_user_limit}
              onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Số lần một user có thể dùng mã này</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số đêm tối thiểu</label>
            <input
              type="number"
              value={form.min_nights}
              onChange={(e) => setForm({ ...form, min_nights: e.target.value })}
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số đêm tối đa</label>
            <input
              type="number"
              value={form.max_nights}
              onChange={(e) => setForm({ ...form, max_nights: e.target.value })}
              placeholder="30"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Applicable Hotels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="text-green-600" size={24} />
          Áp dụng cho khách sạn
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {form.applicable_hotels.length === 0
            ? "Để trống = áp dụng cho tất cả khách sạn"
            : `Đã chọn ${form.applicable_hotels.length} khách sạn`}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hotels.map((hotel) => (
            <label
              key={hotel.hotel_id}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={form.applicable_hotels.includes(hotel.hotel_id)}
                onChange={() => handleHotelToggle(hotel.hotel_id)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-900">{hotel.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Applicable Categories */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Tag className="text-purple-600" size={24} />
          Áp dụng cho category
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {form.applicable_categories.length === 0
            ? "Để trống = áp dụng cho tất cả category"
            : `Đã chọn ${form.applicable_categories.length} category`}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <label
              key={category.category_id}
              className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={form.applicable_categories.includes(category.category_id)}
                onChange={() => handleCategoryToggle(category.category_id)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-900">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => {
            setIsDraft(true);
            handleSubmit();
          }}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <FileText size={18} />
          Lưu bản nháp
        </button>
        <button
          onClick={() => {
            setIsDraft(false);
            handleSubmit();
          }}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <CheckCircle size={18} />
          {submitting ? "Đang tạo..." : "Lưu và kích hoạt"}
        </button>
      </div>
    </div>
  );
};

export default CreateDiscountCode;

