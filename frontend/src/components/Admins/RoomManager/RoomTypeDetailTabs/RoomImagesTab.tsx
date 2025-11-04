import { useState, useEffect } from "react";
import { Upload, Trash2, Star, Image as ImageIcon, X } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";

interface RoomImage {
  image_id: string;
  image_url: string;
  is_primary: boolean;
  caption?: string;
  sort_order: number;
}

interface RoomImagesTabProps {
  roomTypeId: string;
}

const RoomImagesTab = ({ roomTypeId }: RoomImagesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [roomTypeId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setImages([
          {
            image_id: "RIMG001",
            image_url: "https://via.placeholder.com/800x600",
            is_primary: true,
            caption: "Phòng ngủ chính",
            sort_order: 1,
          },
          {
            image_id: "RIMG002",
            image_url: "https://via.placeholder.com/800x600",
            is_primary: false,
            caption: "Phòng tắm",
            sort_order: 2,
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách ảnh");
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
      // TODO: API call
      showToast("success", "Upload ảnh thành công");
      setSelectedFiles([]);
      fetchImages();
    } catch (error: any) {
      showToast("error", error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      // TODO: API call
      showToast("success", "Đặt ảnh chính thành công");
      fetchImages();
    } catch (error: any) {
      showToast("error", error.message || "Không thể đặt ảnh chính");
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa ảnh thành công");
      fetchImages();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa ảnh");
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
                  <img src={image.image_url} alt={image.caption || "Room image"} className="w-full h-full object-cover" />
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

export default RoomImagesTab;

