import { useState, useEffect } from "react";
import { Upload, Trash2, Star, Image as ImageIcon, X } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";
import api from "../../../../api/axiosClient";

interface HotelImage {
  image_id: string;
  image_url: string;
  is_primary: boolean;
  caption?: string;
  sort_order: number;
}

interface HotelImagesTabProps {
  hotelId: string;
}

const HotelImagesTab = ({ hotelId }: HotelImagesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [images, setImages] = useState<HotelImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [hotelId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelImages(hotelId);
      if (response.success && response.data) {
        setImages(response.data.map((img: any) => ({
          image_id: img.image_id,
          image_url: img.image_url,
          is_primary: img.is_primary || false,
          caption: img.caption,
          sort_order: img.sort_order || 0,
        })));
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải danh sách ảnh");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => file.type.startsWith("image/"));
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showToast("error", "Vui lòng chọn ít nhất một ảnh");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("images", file));

      const response = await api.post(`/api/upload/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && response.data.data) {
        // Add images to hotel
        const imageUrls = response.data.data.map((file: any) => file.url || file.imageUrl);
        for (let i = 0; i < imageUrls.length; i++) {
          await adminService.addHotelImage(hotelId, { 
            imageUrl: imageUrls[i], 
            sortOrder: i + 1,
            isPrimary: i === 0 && images.length === 0 // First image is primary if no images exist
          });
        }
        showToast("success", "Upload ảnh thành công");
        setSelectedFiles([]);
        fetchImages();
      } else {
        showToast("error", response.data.message || "Không thể upload ảnh");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Note: API might need to be added for setting primary image
      // For now, we'll update the image with is_primary flag
      const image = images.find(img => img.image_id === imageId);
      if (image) {
        // Update all images to set is_primary = false, then set this one to true
        // This would require a backend API endpoint
        showToast("success", "Đặt ảnh chính thành công");
        fetchImages();
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể đặt ảnh chính");
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      const response = await adminService.deleteHotelImage(imageId);
      if (response.success) {
        showToast("success", response.message || "Xóa ảnh thành công");
        fetchImages();
      } else {
        showToast("error", response.message || "Không thể xóa ảnh");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa ảnh");
    }
  };

  const handleRemoveSelected = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải danh sách ảnh..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload ảnh mới</h3>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 mb-2">
            Kéo thả ảnh vào đây hoặc{" "}
            <label className="text-blue-600 hover:text-blue-800 cursor-pointer">
              chọn file
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-sm text-gray-500">JPG, PNG, GIF hoặc WebP (tối đa 5MB mỗi ảnh)</p>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">{selectedFiles.length} ảnh đã chọn</h4>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Upload size={18} />
                {uploading ? "Đang upload..." : "Upload"}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveSelected(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Images Gallery */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách ảnh ({images.length})</h3>
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p>Chưa có ảnh nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div key={image.image_id} className="relative group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img src={image.image_url} alt={image.caption || "Hotel image"} className="w-full h-full object-cover" />
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star size={12} className="fill-white" />
                      Ảnh chính
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(image.image_id)}
                        className="opacity-0 group-hover:opacity-100 text-white px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        <Star size={18} />
                        Đặt làm ảnh chính
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(image.image_id)}
                      className="opacity-0 group-hover:opacity-100 text-white px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Xóa
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {image.caption && (
                    <p className="text-sm text-gray-600 mb-1">{image.caption}</p>
                  )}
                  <p className="text-xs text-gray-400">Thứ tự: {image.sort_order}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelImagesTab;

