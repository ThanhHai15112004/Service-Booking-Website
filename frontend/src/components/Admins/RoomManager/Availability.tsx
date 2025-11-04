import { useState, useEffect } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface AvailabilityData {
  date: string;
  available_rooms: number;
  total_rooms: number;
  status: "AVAILABLE" | "FULL" | "MAINTENANCE" | "CLOSED";
}

interface RoomTypeAvailability {
  room_type_id: string;
  room_type_name: string;
  hotel_name: string;
  availability: AvailabilityData[];
}

interface AvailabilityProps {
  hotelId?: string;
  roomTypeId?: string;
}

const Availability = ({ hotelId, roomTypeId }: AvailabilityProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [roomTypes, setRoomTypes] = useState<RoomTypeAvailability[]>([]);
  const [filters, setFilters] = useState({
    hotel: hotelId || "",
    roomType: roomTypeId || "",
  });
  const [selectedCell, setSelectedCell] = useState<{ roomTypeId: string; date: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, filters]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const dates = Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
          return {
            date: date.toISOString().split("T")[0],
            available_rooms: Math.floor(Math.random() * 10) + 5,
            total_rooms: 15,
            status: (Math.random() > 0.8 ? "FULL" : "AVAILABLE") as "AVAILABLE" | "FULL" | "MAINTENANCE" | "CLOSED",
          };
        });

        setRoomTypes([
          {
            room_type_id: "RT001",
            room_type_name: "Deluxe Sea View",
            hotel_name: "My Khe Beach Resort",
            availability: dates,
          },
          {
            room_type_id: "RT002",
            room_type_name: "Executive Suite",
            hotel_name: "Sofitel Metropole",
            availability: dates,
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu availability");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCellClick = (roomTypeId: string, date: string) => {
    setSelectedCell({ roomTypeId, date });
    setShowEditModal(true);
  };

  const handleUpdateAvailability = async (roomTypeId: string, date: string, availableRooms: number) => {
    try {
      // TODO: API call with roomTypeId, date, availableRooms
      showToast("success", "Cập nhật availability thành công");
      fetchAvailability();
      setShowEditModal(false);
      setSelectedCell(null);
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật availability");
    }
  };

  const handleBulkUpdate = async (_roomTypeId: string, _dates: string[], _availableRooms: number) => {
    try {
      // TODO: API call
      showToast("success", "Bulk update thành công");
      fetchAvailability();
    } catch (error: any) {
      showToast("error", error.message || "Không thể bulk update");
    }
  };

  const getStatusColor = (status: string, available: number, total: number) => {
    if (status === "MAINTENANCE" || status === "CLOSED") {
      return "bg-gray-400 text-white";
    }
    if (status === "FULL" || available === 0) {
      return "bg-red-500 text-white";
    }
    const percentage = (available / total) * 100;
    if (percentage > 50) {
      return "bg-green-500 text-white";
    } else if (percentage > 20) {
      return "bg-yellow-500 text-white";
    } else {
      return "bg-orange-500 text-white";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1);
      return date.toISOString().split("T")[0];
    });
  };

  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  if (loading) {
    return <Loading message="Đang tải dữ liệu availability..." />;
  }

  const days = getDaysInMonth();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Availability</h1>
          <p className="text-gray-600 mt-1">Kiểm soát số lượng phòng còn trống theo ngày</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
            <option value="H003">Saigon Riverside Hotel</option>
            <option value="H004">Sofitel Metropole</option>
          </select>
          <select
            value={filters.roomType}
            onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả loại phòng</option>
            <option value="RT001">Deluxe Sea View</option>
            <option value="RT002">Executive Suite</option>
          </select>
        </div>
      </div>

      {/* Calendar View */}
      {roomTypes.map((roomType) => (
        <div key={roomType.room_type_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{roomType.room_type_name}</h3>
              <p className="text-sm text-gray-600">{roomType.hotel_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-1 font-medium text-gray-900 min-w-[150px] text-center">
                {currentMonth.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-700 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Padding days */}
                {paddingDays.map((_, index) => (
                  <div key={`pad-${index}`} className="aspect-square"></div>
                ))}

                {/* Actual days */}
                {days.map((dateStr) => {
                  const availability = roomType.availability.find((a) => a.date === dateStr);
                  const day = formatDate(dateStr);
                  const status = availability?.status || "AVAILABLE";
                  const available = availability?.available_rooms || 0;
                  const total = availability?.total_rooms || 0;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleCellClick(roomType.room_type_id, dateStr)}
                      className={`aspect-square border rounded-lg text-center p-2 hover:ring-2 hover:ring-blue-500 transition-all ${getStatusColor(status, available, total)}`}
                    >
                      <div className="text-sm font-bold">{day}</div>
                      <div className="text-xs mt-1">{available}/{total}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Còn phòng (&gt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Ít phòng (20-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Rất ít (&lt;20%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Hết phòng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span>Đóng/Bảo trì</span>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {showEditModal && selectedCell && (
        <AvailabilityEditModal
          roomTypeId={selectedCell.roomTypeId}
          date={selectedCell.date}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCell(null);
          }}
          onSave={handleUpdateAvailability}
        />
      )}
    </div>
  );
};

// Edit Modal Component
const AvailabilityEditModal = ({
  roomTypeId,
  date,
  onClose,
  onSave,
}: {
  roomTypeId: string;
  date: string;
  onClose: () => void;
  onSave: (roomTypeId: string, date: string, availableRooms: number) => void;
}) => {
  const [availableRooms, setAvailableRooms] = useState(5);
  const [totalRooms, setTotalRooms] = useState(15);
  const [status, setStatus] = useState<"AVAILABLE" | "MAINTENANCE" | "CLOSED">("AVAILABLE");

  const handleSave = () => {
    const rooms = status === "AVAILABLE" ? availableRooms : 0;
    onSave(roomTypeId, date, rooms);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Chỉnh sửa Availability</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
            <p className="text-gray-900">{new Date(date).toLocaleDateString("vi-VN")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="AVAILABLE">Mở bán</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="CLOSED">Đóng bán</option>
            </select>
          </div>
          {status === "AVAILABLE" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số phòng</label>
                <input
                  type="number"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng còn trống</label>
                <input
                  type="number"
                  value={availableRooms}
                  onChange={(e) => setAvailableRooms(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                  max={totalRooms}
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Availability;

