import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Toast from "../../Toast";
import { adminService } from "../../../services/adminService";
import adminApi from "../../../api/adminAxiosClient";

interface Room {
  room_id: string;
  room_number?: string | null;
  room_type_id: string;
  room_type_name: string;
  hotel_id: string;
  hotel_name: string;
  capacity: number;
  image_url?: string | null;
  price_base?: number | null;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  created_at: string;
  updated_at: string;
}

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomTypeId: string;
  room?: Room | null; // If provided, it's edit mode
}

const RoomModal = ({ isOpen, onClose, onSuccess, roomTypeId, room }: RoomModalProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    room_number: "",
    capacity: 2,
    price_base: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "MAINTENANCE",
    image_url: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEditMode = !!room;

  useEffect(() => {
    if (isOpen) {
      if (room) {
        // Edit mode - populate form
        setFormData({
          room_number: room.room_number || "",
          capacity: room.capacity,
          price_base: room.price_base?.toString() || "",
          status: room.status,
          image_url: room.image_url || "",
        });
        setImagePreview(room.image_url || null);
        setImageFile(null);
      } else {
        // Create mode - reset form
        setFormData({
          room_number: "",
          capacity: 2,
          price_base: "",
          status: "ACTIVE",
          image_url: "",
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, room]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showToast("error", "Vui lòng chọn file ảnh");
        return;
      }
      // Validate file size (max 5MB)
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
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await adminApi.post("/api/upload/single", formData, {
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

  const generateRoomId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `R${timestamp}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.room_number.trim()) {
      showToast("error", "Vui lòng nhập số phòng");
      return;
    }

    if (formData.capacity < 1) {
      showToast("error", "Sức chứa phải lớn hơn 0");
      return;
    }

    setLoading(true);

    try {
      // Upload image first if there's a new image
      let imageUrl: string | null = formData.image_url || null;
      if (imageFile) {
        const uploadedUrl = await handleUploadImage();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      if (isEditMode && room) {
        // Update room
        const updateData: any = {
          room_number: formData.room_number.trim(),
          capacity: formData.capacity,
          status: formData.status,
        };

        if (formData.price_base) {
          updateData.price_base = parseFloat(formData.price_base);
        }

        // Always include image_url, even if null (to allow clearing the image)
        updateData.image_url = imageUrl || null;

        const response = await adminService.updateRoom(room.room_id, updateData);
        if (response.success) {
          showToast("success", response.message || "Cập nhật phòng thành công");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 500);
        } else {
          showToast("error", response.message || "Lỗi khi cập nhật phòng");
        }
      } else {
        // Create room
        const roomId = generateRoomId();
        const createData: any = {
          room_id: roomId,
          room_type_id: roomTypeId,
          room_number: formData.room_number.trim(),
          capacity: formData.capacity,
          status: formData.status,
        };

        if (formData.price_base) {
          createData.price_base = parseFloat(formData.price_base);
        }

        // Always include image_url, even if null
        createData.image_url = imageUrl || null;

        const response = await adminService.createRoom(createData);
        if (response.success) {
          showToast("success", response.message || "Tạo phòng thành công");
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 500);
        } else {
          showToast("error", response.message || "Lỗi khi tạo phòng");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
      if (e.target === e.currentTarget && !loading && !uploading) {
        onClose();
      }
    }}>
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading || uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh phòng</label>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Room preview"
                      className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageFile(null);
                        setFormData({ ...formData, image_url: "" });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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

          {/* Room Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số phòng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              placeholder="VD: 101, 201A, Suite 1"
              required
              disabled={loading || uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sức chứa (người) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
              required
              disabled={loading || uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Price Base */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giá cơ bản (VNĐ)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.price_base}
              onChange={(e) => setFormData({ ...formData, price_base: e.target.value })}
              placeholder="VD: 1000000"
              disabled={loading || uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Để trống nếu sử dụng giá từ loại phòng
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              required
              disabled={loading || uploading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="MAINTENANCE">Bảo trì</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
                isEditMode ? "Cập nhật" : "Tạo phòng"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;

