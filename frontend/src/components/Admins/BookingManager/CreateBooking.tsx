import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, User, Hotel, Bed, DollarSign, CreditCard, Save, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface HotelOption {
  hotel_id: string;
  name: string;
  checkin_time?: string;
  checkout_time?: string;
}

interface RoomTypeOption {
  room_type_id: string;
  name: string;
  hotel_id: string;
  price_base: number;
  available_rooms: number;
}

interface RoomOption {
  room_id: string;
  room_number: string;
  room_type_id: string;
  price_per_night?: number;
}

interface AccountOption {
  account_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

const CreateBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Form state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    account_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    hotel_id: "",
    check_in: "",
    check_out: "",
    guest_count: 2,
    special_requests: "",
    payment_method: "CASH",
    skip_availability_check: false,
  });

  const [selectedRooms, setSelectedRooms] = useState<Array<{
    room_type_id: string;
    room_id: string;
    price_per_night: number;
    nights: number;
  }>>([]);

  // Options
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [searchAccountTerm, setSearchAccountTerm] = useState("");

  useEffect(() => {
    fetchHotels();
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (form.hotel_id) {
      if (form.check_in && form.check_out) {
        fetchRoomTypes();
      } else {
        // Fetch room types without availability if no dates selected
        fetchRoomTypesWithoutDates();
      }
    } else {
      setRoomTypes([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.hotel_id, form.check_in, form.check_out]);

  useEffect(() => {
    if (form.check_in && form.check_out) {
      calculateNights();
    }
  }, [form.check_in, form.check_out]);

  const fetchHotels = async () => {
    try {
      const result = await adminService.getHotels({ limit: 100 });
      if (result.success && result.data) {
        setHotels(
          result.data.hotels.map((hotel: any) => ({
            hotel_id: hotel.hotel_id,
            name: hotel.name,
            checkin_time: hotel.checkin_time || "14:00",
            checkout_time: hotel.checkout_time || "12:00",
          }))
        );
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách khách sạn");
    }
  };

  const fetchRoomTypesWithoutDates = async () => {
    if (!form.hotel_id) {
      setRoomTypes([]);
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.getRoomTypesByHotel(form.hotel_id, { limit: 100 });
      if (result.success && result.data) {
        // Just fetch room types without availability/pricing
        const roomTypesList = result.data.roomTypes.map((rt: any) => ({
          room_type_id: rt.room_type_id,
          name: rt.name,
          hotel_id: form.hotel_id,
          price_base: rt.price_base || 0,
          available_rooms: 0, // Will be fetched when dates are selected
        }));
        setRoomTypes(roomTypesList);
      }
    } catch (error: any) {
      console.error("Error fetching room types:", error);
      showToast("error", error.message || "Không thể tải loại phòng");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    if (!form.hotel_id || !form.check_in || !form.check_out) {
      // If no dates, fetch without availability
      fetchRoomTypesWithoutDates();
      return;
    }
    setLoading(true);
    try {
      const result = await adminService.getRoomTypesByHotel(form.hotel_id, { limit: 100 });
      if (result.success && result.data) {
        // Fetch availability and pricing for each room type
        const roomTypesWithAvailability = await Promise.all(
          result.data.roomTypes.map(async (rt: any) => {
            try {
              // Fetch available rooms for this room type with dates
              const availableResult = await adminService.getAvailableRoomsByRoomType(
                rt.room_type_id,
                form.check_in,
                form.check_out,
                1
              );
              
              if (availableResult.success && availableResult.data && availableResult.data.length > 0) {
                // Get price from first available room (rooms in same room type should have similar pricing)
                const firstRoom = availableResult.data[0];
                const price = firstRoom.final_price || firstRoom.base_price || 0;
                const availableCount = availableResult.data.length;
                
                return {
                  room_type_id: rt.room_type_id,
                  name: rt.name,
                  hotel_id: form.hotel_id,
                  price_base: price,
                  available_rooms: availableCount,
                };
              } else {
                return {
                  room_type_id: rt.room_type_id,
                  name: rt.name,
                  hotel_id: form.hotel_id,
                  price_base: rt.price_base || 0,
                  available_rooms: 0,
                };
              }
            } catch (err) {
              console.error(`Error fetching availability for room type ${rt.room_type_id}:`, err);
              return {
                room_type_id: rt.room_type_id,
                name: rt.name,
                hotel_id: form.hotel_id,
                price_base: rt.price_base || 0,
                available_rooms: 0,
              };
            }
          })
        );
        
        // Show all room types, even if no availability (user can still see them)
        setRoomTypes(roomTypesWithAvailability);
      }
    } catch (error: any) {
      console.error("Error fetching room types with availability:", error);
      showToast("error", error.message || "Không thể tải loại phòng");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (roomTypeId: string) => {
    if (!form.hotel_id || !form.check_in || !form.check_out) {
      showToast("error", "Vui lòng chọn ngày check-in và check-out");
      return;
    }
    try {
      // Fetch available rooms with dates and pricing
      const result = await adminService.getAvailableRoomsByRoomType(
        roomTypeId,
        form.check_in,
        form.check_out,
        10 // Get up to 10 available rooms
      );
      
      if (result.success && result.data && result.data.length > 0) {
        setRooms(
          result.data.map((room: any) => ({
            room_id: room.room_id || room.roomId,
            room_number: room.room_number || room.roomNumber || "",
            room_type_id: roomTypeId,
            price_per_night: room.final_price || room.base_price || 0,
          }))
        );
      } else {
        setRooms([]);
        showToast("error", "Không có phòng nào khả dụng cho khoảng thời gian đã chọn");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách phòng");
      setRooms([]);
    }
  };

  const fetchAccounts = async () => {
    try {
      const result = await adminService.getAccounts({ limit: 100, role: "USER" });
      if (result.success && result.data) {
        setAccounts(
          result.data.accounts.map((acc: any) => ({
            account_id: acc.account_id,
            full_name: acc.full_name,
            email: acc.email,
            phone: acc.phone_number || "",
          }))
        );
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách tài khoản");
    }
  };

  const calculateNights = () => {
    if (form.check_in && form.check_out) {
      const checkIn = new Date(form.check_in);
      const checkOut = new Date(form.check_out);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  const handleAddRoom = (room: RoomOption, pricePerNight?: number) => {
    const nights = calculateNights();
    // Check if room is already selected
    if (selectedRooms.some(r => r.room_id === room.room_id)) {
      showToast("error", "Phòng này đã được chọn");
      return;
    }
    const price = pricePerNight || room.price_per_night || 0;
    setSelectedRooms([
      ...selectedRooms,
      {
        room_type_id: room.room_type_id,
        room_id: room.room_id,
        price_per_night: price,
        nights: nights,
      },
    ]);
    setRooms([]);
  };

  const handleRemoveRoom = (index: number) => {
    setSelectedRooms(selectedRooms.filter((_, i) => i !== index));
  };

  const handleSelectAccount = (account: AccountOption) => {
    setForm({
      ...form,
      account_id: account.account_id,
      customer_name: account.full_name,
      customer_email: account.email,
      customer_phone: account.phone || "",
    });
    setSearchAccountTerm("");
  };

  const handleSubmit = async () => {
    if (!form.account_id || !form.hotel_id || selectedRooms.length === 0 || !form.check_in || !form.check_out) {
      showToast("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminService.createManualBooking({
        accountId: form.account_id,
        hotelId: form.hotel_id,
        roomIds: selectedRooms.map((r) => r.room_id),
        checkIn: form.check_in,
        checkOut: form.check_out,
        guestsCount: form.guest_count,
        paymentMethod: form.payment_method,
        specialRequests: form.special_requests || undefined,
        skipAvailabilityCheck: form.skip_availability_check,
      });
      if (result.success) {
        showToast("success", result.message || "Tạo booking thành công");
        setTimeout(() => navigate(`/admin/bookings/${result.data?.bookingId}`), 1500);
      } else {
        showToast("error", result.message || "Không thể tạo booking");
        setSubmitting(false);
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tạo booking");
      setSubmitting(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.full_name.toLowerCase().includes(searchAccountTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchAccountTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString?: string, defaultTime: string = "00:00") => {
    if (!timeString) return defaultTime;
    // Format từ "HH:MM:SS" hoặc "HH:MM" thành "HH:MM"
    return timeString.substring(0, 5);
  };

  const totalAmount = selectedRooms.reduce((sum, room) => sum + room.price_per_night * room.nights, 0);

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải dữ liệu..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo booking thủ công</h1>
          <p className="text-gray-600 mt-1">Tạo đặt phòng cho khách hàng offline</p>
        </div>
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={20} />
          Hủy
        </button>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {step > stepNum ? <CheckCircle size={20} /> : stepNum}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step >= stepNum ? "text-blue-600" : "text-gray-600"}`}>
                  {stepNum === 1 && "Thông tin khách"}
                  {stepNum === 2 && "Chọn phòng"}
                  {stepNum === 3 && "Thanh toán"}
                  {stepNum === 4 && "Xác nhận"}
                </p>
              </div>
              {stepNum < 4 && (
                <div className={`flex-1 h-1 mx-4 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Thông tin khách hàng
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm tài khoản</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchAccountTerm}
                  onChange={(e) => setSearchAccountTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {searchAccountTerm && filteredAccounts.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {filteredAccounts.map((account) => (
                    <button
                      key={account.account_id}
                      onClick={() => handleSelectAccount(account)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-gray-900">{account.full_name}</p>
                      <p className="text-sm text-gray-600">{account.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!form.customer_name || !form.customer_email}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Rooms */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bed className="text-green-600" size={24} />
            Chọn phòng
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn *</label>
                <select
                  value={form.hotel_id}
                  onChange={(e) => setForm({ ...form, hotel_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Chọn khách sạn</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.hotel_id} value={hotel.hotel_id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số khách</label>
                <input
                  type="number"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                <input
                  type="date"
                  value={form.check_in}
                  onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                {form.hotel_id && form.check_in && (
                  <p className="text-xs text-gray-500 mt-1">
                    Giờ check-in: {formatTime(hotels.find(h => h.hotel_id === form.hotel_id)?.checkin_time, "14:00")}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                <input
                  type="date"
                  value={form.check_out}
                  onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                  min={form.check_in}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
                {form.hotel_id && form.check_out && (
                  <p className="text-xs text-gray-500 mt-1">
                    Giờ check-out: {formatTime(hotels.find(h => h.hotel_id === form.hotel_id)?.checkout_time, "12:00")}
                  </p>
                )}
              </div>
            </div>

            {/* Room Types */}
            {form.hotel_id && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loại phòng có sẵn</h3>
                {!form.check_in || !form.check_out ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      Vui lòng chọn ngày check-in và check-out để xem phòng có sẵn và giá
                    </p>
                  </div>
                ) : roomTypes.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600 text-center">Đang tải loại phòng...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomTypes.map((roomType) => (
                      <div
                        key={roomType.room_type_id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{roomType.name}</p>
                            {form.check_in && form.check_out ? (
                              <p className="text-sm text-gray-600">
                                {roomType.available_rooms > 0 
                                  ? `${roomType.available_rooms} phòng có sẵn` 
                                  : "Không có phòng khả dụng"}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">Chọn ngày để xem availability</p>
                            )}
                          </div>
                          {roomType.price_base > 0 ? (
                            <p className="font-bold text-blue-600">{new Intl.NumberFormat("vi-VN").format(roomType.price_base)} VNĐ/đêm</p>
                          ) : (
                            <p className="text-sm text-gray-500">Chọn ngày để xem giá</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (!form.check_in || !form.check_out) {
                              showToast("error", "Vui lòng chọn ngày check-in và check-out trước");
                              return;
                            }
                            fetchRooms(roomType.room_type_id);
                          }}
                          disabled={!form.check_in || !form.check_out}
                          className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {!form.check_in || !form.check_out 
                            ? "Chọn ngày để tiếp tục" 
                            : roomType.available_rooms === 0 
                            ? "Hết phòng" 
                            : "Chọn phòng"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Room Selection Modal */}
            {rooms.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Chọn phòng</h3>
                    <button onClick={() => setRooms([])} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {rooms.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">Không có phòng nào khả dụng</p>
                    ) : (
                      rooms.map((room) => {
                        const roomType = roomTypes.find((rt) => rt.room_type_id === room.room_type_id);
                        const price = room.price_per_night || roomType?.price_base || 0;
                        const isSelected = selectedRooms.some(r => r.room_id === room.room_id);
                        return (
                          <button
                            key={room.room_id}
                            onClick={() => handleAddRoom(room, price)}
                            disabled={isSelected}
                            className={`w-full text-left px-4 py-3 border rounded-lg transition-colors ${
                              isSelected
                                ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                                : "border-gray-200 hover:bg-blue-50 hover:border-blue-500"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Phòng {room.room_number || room.room_id}</p>
                                <p className="text-sm text-gray-600">{roomType?.name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-blue-600">{formatPrice(price)} VNĐ/đêm</p>
                                {isSelected && <p className="text-xs text-gray-500">Đã chọn</p>}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Rooms */}
            {selectedRooms.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phòng đã chọn</h3>
                <div className="space-y-2">
                  {selectedRooms.map((room, index) => {
                    const roomType = roomTypes.find((rt) => rt.room_type_id === room.room_type_id);
                    const roomOption = rooms.find((r) => r.room_id === room.room_id);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{roomType?.name} - Phòng {roomOption?.room_number}</p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(room.price_per_night)} VNĐ/đêm × {room.nights} đêm = {formatPrice(room.price_per_night * room.nights)} VNĐ
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveRoom(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedRooms.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="text-purple-600" size={24} />
            Thông tin thanh toán
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán *</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK">Chuyển khoản</option>
                <option value="VNPAY">VNPAY</option>
                <option value="MOMO">MOMO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu đặc biệt</label>
              <textarea
                value={form.special_requests}
                onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                placeholder="Nhập yêu cầu đặc biệt từ khách hàng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skipAvailability"
                checked={form.skip_availability_check}
                onChange={(e) => setForm({ ...form, skip_availability_check: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="skipAvailability" className="text-sm text-gray-700">
                Bỏ qua kiểm tra availability (overbooking)
              </label>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(totalAmount)} VNĐ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xem lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Xác nhận thông tin
          </h2>
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Tên:</span> {form.customer_name}</p>
                <p><span className="font-medium">Email:</span> {form.customer_email}</p>
                {form.customer_phone && <p><span className="font-medium">SĐT:</span> {form.customer_phone}</p>}
              </div>
            </div>

            {/* Booking Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thông tin booking</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Khách sạn:</span> {hotels.find(h => h.hotel_id === form.hotel_id)?.name}</p>
                <p><span className="font-medium">Check-in:</span> {formatDate(form.check_in)} {formatTime(hotels.find(h => h.hotel_id === form.hotel_id)?.checkin_time, "14:00")}</p>
                <p><span className="font-medium">Check-out:</span> {formatDate(form.check_out)} {formatTime(hotels.find(h => h.hotel_id === form.hotel_id)?.checkout_time, "12:00")}</p>
                <p><span className="font-medium">Số khách:</span> {form.guest_count}</p>
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Phòng đã chọn</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {selectedRooms.map((room, index) => {
                  const roomType = roomTypes.find((rt) => rt.room_type_id === room.room_type_id);
                  return (
                    <p key={index}>
                      {roomType?.name} - {formatPrice(room.price_per_night * room.nights)} VNĐ
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between text-xl font-bold text-blue-900">
                <span>Tổng cộng:</span>
                <span>{formatPrice(totalAmount)} VNĐ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                {submitting ? "Đang tạo..." : "Tạo booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function để format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

export default CreateBooking;
