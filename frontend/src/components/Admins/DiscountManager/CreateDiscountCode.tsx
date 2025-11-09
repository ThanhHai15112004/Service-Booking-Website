import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, FileText, X, CheckCircle, AlertCircle, Tag, DollarSign, Calendar, Users, Building2, Hotel } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

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
  const { codeId } = useParams<{ codeId?: string }>();
  const isEditMode = !!codeId;
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
    applicable_start_date: "", // Ngày bắt đầu áp dụng mã (trong khoảng start_date đến expiry_date)
    applicable_end_date: "", // Ngày kết thúc áp dụng mã (trong khoảng start_date đến expiry_date)
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
    if (isEditMode && codeId) {
      fetchDiscountCode(codeId);
    }
  }, [codeId, isEditMode]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const result = await adminService.getApplicableHotels();
      if (result.success && result.data) {
        setHotels(result.data);
      } else {
        showToast("error", result.message || "Không thể tải danh sách khách sạn");
      }
    } catch (error: any) {
      console.error("[CreateDiscountCode] fetchHotels error:", error);
      showToast("error", error.message || "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const result = await adminService.getApplicableCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        showToast("error", result.message || "Không thể tải danh sách category");
      }
    } catch (error: any) {
      console.error("[CreateDiscountCode] fetchCategories error:", error);
      showToast("error", error.message || "Không thể tải danh sách category");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscountCode = async (id: string) => {
    setLoading(true);
    try {
      const result = await adminService.getDiscountCodeDetail(id);
      if (result.success && result.data) {
        const code = result.data;
        // Format dates for input fields (YYYY-MM-DD)
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        setForm({
          code: code.code || "",
          discount_type: code.discount_type || "PERCENT",
          discount_value: code.discount_value?.toString() || "",
          max_discount: code.max_discount?.toString() || "",
          min_purchase: code.min_purchase?.toString() || "",
          usage_limit: code.usage_limit?.toString() || "",
          per_user_limit: code.per_user_limit?.toString() || "",
          start_date: formatDateForInput(code.start_date || code.created_at || ""),
          expiry_date: formatDateForInput(code.expiry_date || ""),
          applicable_start_date: formatDateForInput(code.applicable_start_date || ""),
          applicable_end_date: formatDateForInput(code.applicable_end_date || ""),
          min_nights: code.min_nights?.toString() || "",
          max_nights: code.max_nights?.toString() || "",
          applicable_hotels: code.applicable_hotels?.map((h: any) => h.hotel_id || h) || [],
          applicable_categories: code.applicable_categories?.map((c: any) => c.category_id || c) || [],
          status: code.status === "DISABLED" ? "INACTIVE" : (code.status || "ACTIVE"),
        });
      } else {
        showToast("error", result.message || "Không thể tải thông tin mã giảm giá");
        navigate("/admin/discounts");
      }
    } catch (error: any) {
      console.error("[CreateDiscountCode] fetchDiscountCode error:", error);
      showToast("error", error.message || "Không thể tải thông tin mã giảm giá");
      navigate("/admin/discounts");
    } finally {
      setLoading(false);
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
    // Validate required fields
    if (!form.code || !form.code.trim()) {
      showToast("error", "Vui lòng nhập mã giảm giá");
      return;
    }

    if (!form.discount_value || Number(form.discount_value) <= 0) {
      showToast("error", "Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }

    if (form.discount_type === "PERCENT" && Number(form.discount_value) > 100) {
      showToast("error", "Giảm giá phần trăm không được vượt quá 100%");
      return;
    }

    if (form.discount_type === "FIXED" && Number(form.discount_value) < 1000) {
      showToast("error", "Giảm giá cố định phải tối thiểu 1,000 VNĐ");
      return;
    }

    if (!form.start_date || !form.expiry_date) {
      showToast("error", "Vui lòng chọn ngày bắt đầu và ngày hết hạn");
      return;
    }

    const startDate = new Date(form.start_date);
    const expiryDate = new Date(form.expiry_date);

    if (expiryDate <= startDate) {
      showToast("error", "Ngày hết hạn phải sau ngày bắt đầu");
      return;
    }

    // Validate applicable dates
    if (form.applicable_start_date || form.applicable_end_date) {
      if (!form.applicable_start_date || !form.applicable_end_date) {
        showToast("error", "Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc áp dụng mã");
        return;
      }

      const applicableStartDate = new Date(form.applicable_start_date);
      const applicableEndDate = new Date(form.applicable_end_date);

      if (applicableEndDate <= applicableStartDate) {
        showToast("error", "Ngày kết thúc áp dụng phải sau ngày bắt đầu áp dụng");
        return;
      }

      if (applicableStartDate < startDate) {
        showToast("error", "Ngày bắt đầu áp dụng không được trước ngày bắt đầu của mã");
        return;
      }

      if (applicableEndDate > expiryDate) {
        showToast("error", "Ngày kết thúc áp dụng không được sau ngày hết hạn của mã");
        return;
      }
    }

    if (form.min_nights && form.max_nights && Number(form.min_nights) > Number(form.max_nights)) {
      showToast("error", "Số đêm tối thiểu không được lớn hơn số đêm tối đa");
      return;
    }

    if (form.max_discount && form.discount_type === "PERCENT" && Number(form.max_discount) < 1000) {
      showToast("error", "Giảm tối đa phải tối thiểu 1,000 VNĐ");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_discount: form.max_discount ? Number(form.max_discount) : undefined,
        min_purchase: form.min_purchase ? Number(form.min_purchase) : undefined,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
        per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : undefined,
        start_date: form.start_date,
        expiry_date: form.expiry_date,
        applicable_start_date: form.applicable_start_date || undefined,
        applicable_end_date: form.applicable_end_date || undefined,
        min_nights: form.min_nights ? Number(form.min_nights) : undefined,
        max_nights: form.max_nights ? Number(form.max_nights) : undefined,
        applicable_hotels: form.applicable_hotels.length > 0 ? form.applicable_hotels : undefined,
        applicable_categories: form.applicable_categories.length > 0 ? form.applicable_categories : undefined,
        status: isDraft ? "INACTIVE" : form.status,
      };

      let result;
      if (isEditMode && codeId) {
        result = await adminService.updateDiscountCode(codeId, submitData);
      } else {
        result = await adminService.createDiscountCode(submitData);
      }

      if (result.success) {
        showToast("success", result.message || (isEditMode ? "Cập nhật mã giảm giá thành công" : (isDraft ? "Đã lưu bản nháp" : "Tạo mã giảm giá thành công")));
        setTimeout(() => navigate("/admin/discounts"), 1500);
      } else {
        showToast("error", result.message || (isEditMode ? "Không thể cập nhật mã giảm giá" : "Không thể tạo mã giảm giá"));
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error("[CreateDiscountCode] handleSubmit error:", error);
      showToast("error", error.message || (isEditMode ? "Không thể cập nhật mã giảm giá" : "Không thể tạo mã giảm giá"));
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
          <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h1>
          <p className="text-gray-600 mt-1">{isEditMode ? "Cập nhật thông tin mã giảm giá" : "Tạo và cấu hình mã giảm giá cho hệ thống"}</p>
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

      {/* Applicable Dates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Calendar className="text-blue-600" size={24} />
          Ngày áp dụng mã (Tùy chọn)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Nếu không chọn, mã sẽ áp dụng trong toàn bộ khoảng thời gian từ ngày bắt đầu đến ngày hết hạn.
          Nếu chọn, mã chỉ có hiệu lực trong khoảng thời gian được chỉ định (phải nằm trong khoảng từ ngày bắt đầu đến ngày hết hạn).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu áp dụng mã
            </label>
            <input
              type="date"
              value={form.applicable_start_date}
              onChange={(e) => setForm({ ...form, applicable_start_date: e.target.value })}
              min={form.start_date}
              max={form.expiry_date}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Phải từ ngày bắt đầu ({form.start_date || "chưa chọn"}) trở đi</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc áp dụng mã
            </label>
            <input
              type="date"
              value={form.applicable_end_date}
              onChange={(e) => setForm({ ...form, applicable_end_date: e.target.value })}
              min={form.applicable_start_date || form.start_date}
              max={form.expiry_date}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Phải trước ngày hết hạn ({form.expiry_date || "chưa chọn"})</p>
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
          {submitting ? (isEditMode ? "Đang cập nhật..." : "Đang tạo...") : (isEditMode ? "Cập nhật" : "Lưu và kích hoạt")}
        </button>
      </div>
    </div>
  );
};

export default CreateDiscountCode;

