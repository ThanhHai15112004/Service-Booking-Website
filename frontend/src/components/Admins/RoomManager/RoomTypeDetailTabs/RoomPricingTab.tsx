import { useState, useEffect } from "react";
import { Calendar, DollarSign, Plus, Edit, Trash2, X, Copy } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";

interface PriceSchedule {
  schedule_id: string;
  start_date: string;
  end_date: string;
  base_price: number;
  discount_percent: number;
  final_price: number;
  applies_to: "ROOM_TYPE" | "HOTEL";
}

interface RoomPricingTabProps {
  roomTypeId: string;
}

const RoomPricingTab = ({ roomTypeId }: RoomPricingTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [basePrice, setBasePrice] = useState(2500000);
  const [schedules, setSchedules] = useState<PriceSchedule[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<PriceSchedule | null>(null);

  useEffect(() => {
    fetchPricing();
  }, [roomTypeId]);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setSchedules([
          {
            schedule_id: "PS001",
            start_date: "2025-12-01",
            end_date: "2025-12-31",
            base_price: 2500000,
            discount_percent: 10,
            final_price: 2250000,
            applies_to: "ROOM_TYPE",
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu giá");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateBasePrice = async () => {
    try {
      // TODO: API call
      showToast("success", "Cập nhật giá cơ bản thành công");
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật giá cơ bản");
    }
  };

  const handleSaveSchedule = async (_schedule: Partial<PriceSchedule>) => {
    try {
      // TODO: API call
      showToast("success", editingSchedule ? "Cập nhật lịch giá thành công" : "Thêm lịch giá thành công");
      fetchPricing();
      setShowScheduleModal(false);
      setEditingSchedule(null);
    } catch (error: any) {
      showToast("error", error.message || "Không thể lưu lịch giá");
    }
  };

  const handleDeleteSchedule = async (_scheduleId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch giá này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa lịch giá thành công");
      fetchPricing();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa lịch giá");
    }
  };

  const getDaysInMonth = () => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: firstDay, end: lastDay });
  };

  const getPriceForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const schedule = schedules.find(
      (s) => dateStr >= s.start_date && dateStr <= s.end_date
    );
    return schedule ? schedule.final_price : basePrice;
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu giá..." />;
  }

  const days = getDaysInMonth();
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Base Price */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="text-green-600" size={20} />
          Giá cơ bản
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleUpdateBasePrice}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Cập nhật
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Giá này sẽ được áp dụng cho tất cả các ngày không có lịch giá đặc biệt
        </p>
      </div>

      {/* Price Schedules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Lịch giá động
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* TODO: Copy schedule */}}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy size={18} />
              Copy từ room type khác
            </button>
            <button
              onClick={() => {
                setEditingSchedule(null);
                setShowScheduleModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Thêm lịch giá
            </button>
          </div>
        </div>

        {schedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có lịch giá nào</p>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.schedule_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {schedule.start_date} → {schedule.end_date}
                  </p>
                  <p className="text-sm text-gray-600">
                    Giá gốc: {new Intl.NumberFormat("vi-VN").format(schedule.base_price)} VNĐ
                    {schedule.discount_percent > 0 && (
                      <span className="ml-2 text-green-600">
                        Giảm {schedule.discount_percent}% → {new Intl.NumberFormat("vi-VN").format(schedule.final_price)} VNĐ
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingSchedule(schedule);
                      setShowScheduleModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.schedule_id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar Giá</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ←
            </button>
            <span className="px-4 py-1 font-medium text-gray-900">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const price = getPriceForDate(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={day.toISOString()}
                className={`p-2 border rounded-lg text-center ${
                  isCurrentMonth ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="text-sm font-medium text-gray-900">{format(day, "d")}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {(price / 1000).toFixed(0)}K
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          schedule={editingSchedule}
          onClose={() => {
            setShowScheduleModal(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
};

// Schedule Modal Component
const ScheduleModal = ({
  schedule,
  onClose,
  onSave,
}: {
  schedule: PriceSchedule | null;
  onClose: () => void;
  onSave: (schedule: Partial<PriceSchedule>) => void;
}) => {
  const [form, setForm] = useState({
    start_date: schedule?.start_date || "",
    end_date: schedule?.end_date || "",
    base_price: schedule?.base_price?.toString() || "",
    discount_percent: schedule?.discount_percent?.toString() || "0",
    applies_to: schedule?.applies_to || "ROOM_TYPE",
  });

  const finalPrice = form.base_price && form.discount_percent
    ? parseInt(form.base_price) * (1 - parseInt(form.discount_percent) / 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{schedule ? "Chỉnh sửa" : "Thêm"} lịch giá</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ)</label>
            <input
              type="number"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">% Giảm giá</label>
            <input
              type="number"
              value={form.discount_percent}
              onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="0"
              max="100"
            />
          </div>
          {finalPrice > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-gray-600">Giá cuối cùng:</p>
              <p className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat("vi-VN").format(finalPrice)} VNĐ
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Áp dụng cho</label>
            <select
              value={form.applies_to}
              onChange={(e) => setForm({ ...form, applies_to: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ROOM_TYPE">Loại phòng này</option>
              <option value="HOTEL">Toàn khách sạn</option>
            </select>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => {
                onSave({
                  ...form,
                  base_price: parseInt(form.base_price) || 0,
                  discount_percent: parseInt(form.discount_percent) || 0,
                  final_price: finalPrice,
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPricingTab;

