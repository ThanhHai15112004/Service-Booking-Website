import { useState, useEffect } from "react";
import { Bed, Users, Maximize2, DollarSign, Edit, X, Upload, Image as ImageIcon } from "lucide-react";
import Toast from "../../../Toast";
import { adminService } from "../../../../services/adminService";
import adminApi from "../../../../api/adminAxiosClient";

interface RoomType {
  room_type_id: string;
  name: string;
  description?: string;
  hotel_id: string;
  hotel_name: string;
  bed_type: string;
  area: number;
  capacity: number;
  price_base: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  main_image?: string;
  created_at: string;
  updated_at: string;
}

interface RoomTypeInfoTabProps {
  roomType: RoomType;
  onUpdate: () => void;
  isEditing?: boolean;
  onToggleEdit?: () => void;
}

const RoomTypeInfoTab = ({ roomType, onUpdate, isEditing: propIsEditing, onToggleEdit }: RoomTypeInfoTabProps) => {
  const [internalEditModal, setInternalEditModal] = useState(false);
  const isEditing = propIsEditing !== undefined ? propIsEditing : internalEditModal;
  
  const handleToggleEdit = () => {
    if (propIsEditing !== undefined && onToggleEdit) {
      onToggleEdit();
    } else {
      setInternalEditModal(!internalEditModal);
    }
  };
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [bedTypes, setBedTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: roomType.name,
    description: roomType.description || "",
    bed_type: roomType.bed_type || "",
    area: roomType.area?.toString() || "",
    image_url: roomType.main_image || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(roomType.main_image || null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBedTypes();
  }, []);

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: roomType.name,
        description: roomType.description || "",
        bed_type: roomType.bed_type || "",
        area: roomType.area?.toString() || "",
        image_url: roomType.main_image || "",
      });
      setImagePreview(roomType.main_image || null);
      setImageFile(null);
    }
  }, [isEditing, roomType]);

  const fetchBedTypes = async () => {
    try {
      const response = await adminService.getBedTypes();
      if (response.success && response.data) {
        setBedTypes(response.data);
      }
    } catch (error) {
      console.error("Error fetching bed types:", error);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showToast("error", "Vui lòng chọn file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("image", imageFile);

      const response = await adminApi.post("/api/upload/single", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data.url || response.data.data.imageUrl;
        return imageUrl;
      } else {
        showToast("error", response.data.message || "Lỗi khi upload ảnh");
        return null;
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Lỗi khi upload ảnh");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("error", "Vui lòng nhập tên loại phòng");
      return;
    }

    if (formData.area && parseFloat(formData.area) < 0) {
      showToast("error", "Diện tích phải lớn hơn hoặc bằng 0");
      return;
    }

    setLoading(true);

    try {
      // Upload image first if there's a new image
      let imageUrl = formData.image_url;
      if (imageFile) {
        const uploadedUrl = await handleUploadImage();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const updateData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        bed_type: formData.bed_type || null,
        area: formData.area ? parseFloat(formData.area) : null,
      };

      if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      const response = await adminService.updateRoomType(roomType.room_type_id, updateData);
      if (response.success) {
        showToast("success", response.message || "Cập nhật thông tin thành công");
        setTimeout(() => {
          onUpdate();
          handleToggleEdit(); // Close edit mode
        }, 500);
      } else {
        showToast("error", response.message || "Lỗi khi cập nhật thông tin");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
        {!isEditing && (
          <button
            onClick={handleToggleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Basic Information */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng</label>
            <p className="text-gray-900">{roomType.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn</label>
            <p className="text-gray-900">{roomType.hotel_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giường</label>
            <div className="flex items-center gap-2">
              <Bed className="text-gray-400" size={18} />
              <span className="text-gray-900">{roomType.bed_type || "-"}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích</label>
            <div className="flex items-center gap-2">
              <Maximize2 className="text-gray-400" size={18} />
              <span className="text-gray-900">{roomType.area ? `${roomType.area} m²` : "-"}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
            <div className="flex items-center gap-2">
              <Users className="text-gray-400" size={18} />
              <span className="text-gray-900">{roomType.capacity} người</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản</label>
            <div className="flex items-center gap-2">
              <DollarSign className="text-gray-400" size={18} />
              <span className="text-gray-900 font-medium">
                {new Intl.NumberFormat("vi-VN").format(roomType.price_base)} VNĐ/phòng/đêm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {roomType.description && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{roomType.description}</p>
        </div>
      )}

      {/* Timestamps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
            <p className="text-gray-900">{new Date(roomType.created_at).toLocaleString("vi-VN")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
            <p className="text-gray-900">{new Date(roomType.updated_at).toLocaleString("vi-VN")}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading && !uploading) {
              handleToggleEdit();
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa thông tin loại phòng</h2>
              <button
                onClick={handleToggleEdit}
                disabled={loading || uploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên loại phòng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Phòng Deluxe, Suite VIP..."
                  required
                  disabled={loading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về loại phòng..."
                  rows={4}
                  disabled={loading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Bed Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại giường</label>
                <select
                  value={formData.bed_type}
                  onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
                  disabled={loading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Chọn loại giường</option>
                  {bedTypes.map((bedType) => (
                    <option key={bedType} value={bedType}>
                      {bedType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diện tích (m²)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="VD: 25.5"
                  disabled={loading || uploading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={(() => {
                            // Helper function to format image URL
                            const formatImageUrl = (url: string | null | undefined): string => {
                              if (!url) return '';
                              // Check if it's base64 (data:image)
                              if (url.startsWith('data:image')) {
                                return url;
                              }
                              // Check if it's absolute URL
                              if (url.startsWith('http://') || url.startsWith('https://')) {
                                return url;
                              }
                              // Relative path - add base URL
                              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                              return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
                            };
                            return formatImageUrl(imagePreview);
                          })()}
                          alt="Room type preview"
                          className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+Error";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setFormData({ ...formData, image_url: "" });
                          }}
                          disabled={loading || uploading}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        <ImageIcon className="text-gray-400" size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={loading || uploading}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Upload size={18} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {imagePreview ? "Thay đổi ảnh" : "Chọn ảnh"}
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleToggleEdit}
                  disabled={loading || uploading}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading || uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploading ? "Đang upload..." : "Đang xử lý..."}
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypeInfoTab;

