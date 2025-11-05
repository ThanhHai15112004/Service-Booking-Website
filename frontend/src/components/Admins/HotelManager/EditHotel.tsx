import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import RichTextEditor from "./RichTextEditor";

interface HotelFormData {
  name: string;
  description: string;
  category_id: string;
  location_id: string;
  address: string;
  latitude: number | "";
  longitude: number | "";
  star_rating: number;
  checkin_time: string;
  checkout_time: string;
  phone_number: string;
  email: string;
  website: string;
  total_rooms: number;
  main_image: string;
}

const EditHotel = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState<HotelFormData>({
    name: "",
    description: "",
    category_id: "",
    location_id: "",
    address: "",
    latitude: "",
    longitude: "",
    star_rating: 1,
    checkin_time: "14:00",
    checkout_time: "12:00",
    phone_number: "",
    email: "",
    website: "",
    total_rooms: 0,
    main_image: "",
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (hotelId) {
      fetchHotelData();
      fetchCategoriesAndLocations();
    }
  }, [hotelId]);

  const fetchHotelData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelDetail(hotelId!);
      if (response.success && response.data) {
        const hotel = response.data;
        setFormData({
          name: hotel.name || "",
          description: hotel.description || "",
          category_id: hotel.category_id || "",
          location_id: hotel.location_id || "",
          address: hotel.address || "",
          latitude: hotel.latitude || "",
          longitude: hotel.longitude || "",
          star_rating: hotel.star_rating || 1,
          checkin_time: hotel.checkin_time || "14:00",
          checkout_time: hotel.checkout_time || "12:00",
          phone_number: hotel.phone_number || "",
          email: hotel.email || "",
          website: hotel.website || "",
          total_rooms: hotel.total_rooms || 0,
          main_image: hotel.main_image || "",
        });
      } else {
        showToast("error", response.message || "Không tìm thấy khách sạn");
        navigate("/admin/hotels");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi tải thông tin khách sạn");
      navigate("/admin/hotels");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndLocations = async () => {
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getLocations(),
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (locationsRes.success && locationsRes.data) {
        setLocations(locationsRes.data);
      }
    } catch (error: any) {
      console.error("Error fetching categories/locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id || undefined,
        location_id: formData.location_id || undefined,
        address: formData.address,
        star_rating: formData.star_rating,
        checkin_time: formData.checkin_time,
        checkout_time: formData.checkout_time,
        phone_number: formData.phone_number || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        total_rooms: formData.total_rooms,
        main_image: formData.main_image || undefined,
      };

      if (formData.latitude !== "") {
        updateData.latitude = Number(formData.latitude);
      }
      if (formData.longitude !== "") {
        updateData.longitude = Number(formData.longitude);
      }

      const response = await adminService.updateHotel(hotelId!, updateData);
      if (response.success) {
        showToast("success", response.message || "Cập nhật khách sạn thành công");
        setTimeout(() => navigate(`/admin/hotels/${hotelId}`), 1500);
      } else {
        showToast("error", response.message || "Không thể cập nhật khách sạn");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi cập nhật khách sạn");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải thông tin khách sạn..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/hotels/${hotelId}`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa khách sạn</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách sạn *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xếp hạng sao *</label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData.star_rating}
                onChange={(e) => setFormData({ ...formData, star_rating: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số phòng</label>
              <input
                type="number"
                min="0"
                value={formData.total_rooms}
                onChange={(e) => setFormData({ ...formData, total_rooms: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="Nhập mô tả khách sạn..."
            minHeight="200px"
          />
        </div>

        {/* Location */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Địa chỉ & Vị trí</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
              <select
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Chọn vị trí</option>
                {locations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.city} - {loc.district || loc.ward || loc.area_name || ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value === "" ? "" : Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value === "" ? "" : Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh chính (URL)</label>
              <input
                type="url"
                value={formData.main_image}
                onChange={(e) => setFormData({ ...formData, main_image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Check-in/Check-out */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thời gian nhận/trả phòng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ nhận phòng</label>
              <input
                type="time"
                value={formData.checkin_time}
                onChange={(e) => setFormData({ ...formData, checkin_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ trả phòng</label>
              <input
                type="time"
                value={formData.checkout_time}
                onChange={(e) => setFormData({ ...formData, checkout_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/admin/hotels/${hotelId}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : (
              <>
                <Save size={18} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditHotel;

