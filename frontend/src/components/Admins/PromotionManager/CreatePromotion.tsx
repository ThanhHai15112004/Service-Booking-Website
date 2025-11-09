import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Tag, Building2 } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface HotelOption {
  hotel_id: string;
  name: string;
}

interface RoomOption {
  room_id: string;
  room_number: string;
  room_type_name: string;
  hotel_id: string;
  hotel_name: string;
}

const CreatePromotion = () => {
  const navigate = useNavigate();
  const { promotionId } = useParams<{ promotionId?: string }>();
  const isEditMode = !!promotionId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "SYSTEM" as "PROVIDER" | "SYSTEM" | "BOTH",
    discount_type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discount_value: "",
    min_purchase: "",
    max_discount: "",
    start_date: "",
    end_date: "",
    applicable_hotels: [] as string[],
    applicable_rooms: [] as string[],
    applicable_dates: [] as string[],
    day_of_week: [] as number[],
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "EXPIRED",
  });
  const [isDraft, setIsDraft] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const daysOfWeek = [
    { value: 0, label: "Chủ Nhật" },
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
  ];

  useEffect(() => {
    fetchHotels();
    if (isEditMode && promotionId) {
      fetchPromotion(promotionId);
    }
  }, [promotionId, isEditMode]);

  // Fetch rooms when applicable_hotels changes
  useEffect(() => {
    if (form.applicable_hotels.length > 0) {
      fetchRooms(form.applicable_hotels);
    } else {
      setRooms([]);
    }
  }, [form.applicable_hotels]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const result = await adminService.getPromotionApplicableHotels();
      if (result.success && result.data) {
        setHotels(result.data);
      } else {
        showToast("error", result.message || "Không thể tải danh sách khách sạn");
      }
    } catch (error: any) {
      console.error("[CreatePromotion] fetchHotels error:", error);
      showToast("error", error.message || "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hotelIds: string[]) => {
    try {
      const result = await adminService.getPromotionApplicableRooms(hotelIds);
      if (result.success && result.data) {
        setRooms(result.data);
      } else {
        console.error("[CreatePromotion] fetchRooms error:", result.message);
      }
    } catch (error: any) {
      console.error("[CreatePromotion] fetchRooms error:", error);
    }
  };

  const fetchPromotion = async (id: string) => {
    setLoading(true);
    try {
      const result = await adminService.getPromotionDetail(id);
      if (result.success && result.data) {
        const promo = result.data;
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        const applicableHotels = promo.applicable_hotels?.map((h: any) => h.hotel_id || h) || [];
        const applicableRooms = promo.applicable_rooms?.map((r: any) => r.room_id || r) || [];

        setForm({
          name: promo.name || "",
          description: promo.description || "",
          type: promo.type || "SYSTEM",
          discount_type: promo.discount_type || "PERCENTAGE",
          discount_value: promo.discount_value?.toString() || "",
          min_purchase: promo.min_purchase?.toString() || "",
          max_discount: promo.max_discount?.toString() || "",
          start_date: formatDateForInput(promo.start_date || ""),
          end_date: formatDateForInput(promo.end_date || ""),
          applicable_hotels: applicableHotels,
          applicable_rooms: applicableRooms,
          applicable_dates: promo.applicable_dates || [],
          day_of_week: promo.day_of_week || [],
          status: promo.status || "ACTIVE",
        });

        // Fetch rooms if hotels are selected
        if (applicableHotels.length > 0) {
          await fetchRooms(applicableHotels);
        }
      } else {
        showToast("error", result.message || "Không thể tải thông tin promotion");
        navigate("/admin/promotions");
      }
    } catch (error: any) {
      console.error("[CreatePromotion] fetchPromotion error:", error);
      showToast("error", error.message || "Không thể tải thông tin promotion");
      navigate("/admin/promotions");
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

  const handleRoomToggle = (roomId: string) => {
    setForm({
      ...form,
      applicable_rooms: form.applicable_rooms.includes(roomId)
        ? form.applicable_rooms.filter((id) => id !== roomId)
        : [...form.applicable_rooms, roomId],
    });
  };

  const handleDayOfWeekToggle = (day: number) => {
    setForm({
      ...form,
      day_of_week: form.day_of_week.includes(day)
        ? form.day_of_week.filter((d) => d !== day)
        : [...form.day_of_week, day],
    });
  };

  const handleAddDate = () => {
    if (selectedDate && !form.applicable_dates.includes(selectedDate)) {
      setForm({
        ...form,
        applicable_dates: [...form.applicable_dates, selectedDate],
      });
      setSelectedDate("");
    }
  };

  const handleRemoveDate = (date: string) => {
    setForm({
      ...form,
      applicable_dates: form.applicable_dates.filter((d) => d !== date),
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.name || !form.name.trim()) {
      showToast("error", "Vui lòng nhập tên promotion");
      return;
    }

    if (!form.discount_value || Number(form.discount_value) <= 0) {
      showToast("error", "Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }

    if (form.discount_type === "PERCENTAGE" && Number(form.discount_value) > 100) {
      showToast("error", "Giảm giá phần trăm không được vượt quá 100%");
      return;
    }

    if (!form.start_date || !form.end_date) {
      showToast("error", "Vui lòng chọn ngày bắt đầu và ngày kết thúc");
      return;
    }

    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);

    if (endDate <= startDate) {
      showToast("error", "Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    setSubmitting(true);
    try {
      const submitData = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        type: form.type,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_purchase: form.min_purchase ? Number(form.min_purchase) : undefined,
        max_discount: form.max_discount ? Number(form.max_discount) : undefined,
        start_date: form.start_date,
        end_date: form.end_date,
        applicable_hotels: form.applicable_hotels.length > 0 ? form.applicable_hotels : undefined,
        applicable_rooms: form.applicable_rooms.length > 0 ? form.applicable_rooms : undefined,
        applicable_dates: form.applicable_dates.length > 0 ? form.applicable_dates : undefined,
        day_of_week: form.day_of_week.length > 0 ? form.day_of_week : undefined,
        status: isDraft ? "INACTIVE" : form.status,
      };

      let result;
      if (isEditMode && promotionId) {
        result = await adminService.updatePromotion(promotionId, submitData);
      } else {
        result = await adminService.createPromotion(submitData);
      }

      if (result.success) {
        showToast("success", result.message || (isEditMode ? "Cập nhật promotion thành công" : (isDraft ? "Đã lưu bản nháp" : "Tạo promotion thành công")));
        setTimeout(() => navigate("/admin/promotions"), 1500);
      } else {
        showToast("error", result.message || (isEditMode ? "Không thể cập nhật promotion" : "Không thể tạo promotion"));
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error("[CreatePromotion] handleSubmit error:", error);
      showToast("error", error.message || (isEditMode ? "Không thể cập nhật promotion" : "Không thể tạo promotion"));
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
          <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? "Chỉnh sửa promotion" : "Tạo promotion mới"}</h1>
          <p className="text-gray-600 mt-1">{isEditMode ? "Cập nhật thông tin promotion" : "Tạo và cấu hình promotion cho hệ thống"}</p>
        </div>
        <button
          onClick={() => navigate("/admin/promotions")}
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
              Tên promotion <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên promotion"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả promotion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại promotion <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as "PROVIDER" | "SYSTEM" | "BOTH" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PROVIDER">Provider</option>
              <option value="SYSTEM">System</option>
              <option value="BOTH">Both</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại giảm giá <span className="text-red-500">*</span>
            </label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as "PERCENTAGE" | "FIXED_AMOUNT" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PERCENTAGE">Phần trăm (%)</option>
              <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá trị giảm giá <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={form.discount_type === "PERCENTAGE" ? "Nhập % giảm giá" : "Nhập số tiền giảm"}
              min="0"
              max={form.discount_type === "PERCENTAGE" ? "100" : undefined}
            />
          </div>

          {form.discount_type === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
              <input
                type="number"
                value={form.max_discount}
                onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập giảm tối đa"
                min="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị đơn tối thiểu (VNĐ)</label>
            <input
              type="number"
              value={form.min_purchase}
              onChange={(e) => setForm({ ...form, min_purchase: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập giá trị đơn tối thiểu"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              min={form.start_date || new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Applicable Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Building2 className="text-green-600" size={24} />
          Áp dụng cho
        </h2>

        {/* Applicable Hotels */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Khách sạn (Tùy chọn - để trống = tất cả)</label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
            {hotels.map((hotel) => (
              <label
                key={hotel.hotel_id}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
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

        {/* Applicable Rooms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Phòng (Tùy chọn - để trống = tất cả)</label>
          <p className="text-xs text-gray-500 mb-2">Lưu ý: Cần chọn khách sạn trước để hiển thị phòng</p>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
            {rooms.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có phòng nào. Vui lòng chọn khách sạn trước.</p>
            ) : (
              rooms.map((room) => (
                <label
                  key={room.room_id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.applicable_rooms.includes(room.room_id)}
                    onChange={() => handleRoomToggle(room.room_id)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-900">{room.room_number} - {room.room_type_name} ({room.hotel_name})</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Applicable Dates */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày áp dụng cụ thể (Tùy chọn)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={form.start_date}
              max={form.end_date}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleAddDate}
              disabled={!selectedDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm
            </button>
          </div>
          {form.applicable_dates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.applicable_dates.map((date) => (
                <span
                  key={date}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {new Date(date).toLocaleDateString("vi-VN")}
                  <button
                    onClick={() => handleRemoveDate(date)}
                    className="hover:text-blue-600"
                  >
                    <X size={16} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Day of Week */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ngày trong tuần (Tùy chọn - để trống = tất cả)</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                onClick={() => handleDayOfWeekToggle(day.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  form.day_of_week.includes(day.value)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => navigate("/admin/promotions")}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={() => {
            setIsDraft(true);
            handleSubmit();
          }}
          disabled={submitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Lưu bản nháp
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <Save size={18} />
              {isEditMode ? "Cập nhật" : "Tạo promotion"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePromotion;

