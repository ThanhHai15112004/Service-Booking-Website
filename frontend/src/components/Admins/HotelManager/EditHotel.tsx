import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, Image as ImageIcon } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import { RichTextEditor } from "../../common";
import adminApi from "../../../api/adminAxiosClient";

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
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

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
        
        // Set preview cho main image nếu có
        if (hotel.main_image) {
          const imageUrl = hotel.main_image.startsWith('http') 
            ? hotel.main_image 
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${hotel.main_image}`;
          setMainImagePreview(imageUrl);
        }
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

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("error", "Chỉ chấp nhận file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    try {
      setUploadingMainImage(true);
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await adminApi.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data?.imageUrl) {
        const imageUrl = response.data.data.imageUrl.startsWith('http')
          ? response.data.data.imageUrl
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${response.data.data.imageUrl}`;
        
        setFormData(prev => ({ ...prev, main_image: imageUrl }));
        showToast("success", "Upload ảnh chính thành công");
      } else {
        showToast("error", response.data.message || "Tải ảnh lên thất bại");
        setMainImagePreview(null);
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi tải ảnh lên");
      setMainImagePreview(null);
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleRemoveMainImage = () => {
    setMainImagePreview(null);
    setFormData(prev => ({ ...prev, main_image: "" }));
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
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
            uploadEndpoint="/api/upload/images"
            uploadFieldName="images"
            uploadApi={adminApi}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh chính</label>
              <input
                type="file"
                ref={mainImageInputRef}
                accept="image/*"
                onChange={handleMainImageUpload}
                className="hidden"
              />
              {mainImagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={mainImagePreview}
                    alt="Main hotel image preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveMainImage}
                    disabled={uploadingMainImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                  {uploadingMainImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mainImageInputRef.current?.click()}
                  disabled={uploadingMainImage}
                  className="w-full max-w-md flex flex-col items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-600">
                    {uploadingMainImage ? "Đang upload..." : "Chọn ảnh chính"}
                  </span>
                  <span className="text-xs text-gray-500">JPG, PNG, GIF (tối đa 5MB)</span>
                </button>
              )}
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

