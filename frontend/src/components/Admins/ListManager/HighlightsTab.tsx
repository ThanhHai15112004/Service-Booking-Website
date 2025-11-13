import { useState, useEffect, useRef } from "react";
import { Star, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import adminApi from "../../../api/adminAxiosClient";

interface Highlight {
  highlight_id: string;
  name: string;
  icon_url?: string;
  description?: string;
  category: string;
  created_at: string;
}

const HighlightsTab = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(null);
  const [formData, setFormData] = useState<Partial<Highlight>>({
    highlight_id: "",
    name: "",
    icon_url: "",
    description: "",
    category: "GENERAL",
  });
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setEditingHighlight(null);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllHighlights();
      if (response.success && response.data) {
        setHighlights(response.data);
      } else {
        showToast("error", response.message || "Không thể tải điểm nổi bật");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (highlight?: Highlight) => {
    if (highlight) {
      setEditingHighlight(highlight);
      setFormData(highlight);
    } else {
      setEditingHighlight(null);
      setFormData({
        highlight_id: "",
        name: "",
        icon_url: "",
        description: "",
        category: "GENERAL",
      });
    }
    setShowModal(true);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await adminApi.post("/api/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && (response.data.data?.url || response.data.data?.imageUrl)) {
        const imageUrl = response.data.data.url || response.data.data.imageUrl;
        setFormData({ ...formData, icon_url: imageUrl });
        showToast("success", "Upload icon thành công");
      } else {
        showToast("error", "Không thể upload icon");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Không thể upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };

  const generateHighlightId = () => {
    const maxId = highlights.reduce((max, highlight) => {
      const match = highlight.highlight_id.match(/^HL(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const newNum = maxId + 1;
    return `HL${String(newNum).padStart(3, '0')}`;
  };

  const handleSave = async () => {
    try {
      if (editingHighlight) {
        const response = await adminService.updateHighlight(editingHighlight.highlight_id, formData);
        if (response.success) {
          showToast("success", response.message || "Cập nhật điểm nổi bật thành công");
          fetchData();
          setShowModal(false);
          setEditingHighlight(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật điểm nổi bật");
        }
      } else {
        if (!formData.name) {
          showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
          return;
        }
        const autoId = generateHighlightId();
        const response = await adminService.createHighlight({
          highlight_id: autoId,
          name: formData.name,
          icon_url: formData.icon_url,
          description: formData.description,
          category: formData.category,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm điểm nổi bật thành công");
          fetchData();
          setShowModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm điểm nổi bật");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu điểm nổi bật");
    }
  };

  const handleDelete = async (highlightId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa điểm nổi bật này?")) return;

    try {
      const response = await adminService.deleteHighlight(highlightId);
      if (response.success) {
        showToast("success", response.message || "Xóa điểm nổi bật thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa điểm nổi bật");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa điểm nổi bật");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý điểm nổi bật</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm điểm nổi bật
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((highlight) => (
          <div key={highlight.highlight_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {highlight.icon_url ? (
                  highlight.icon_url.startsWith("http") ? (
                    <img src={highlight.icon_url} alt={highlight.name} className="w-12 h-12 object-contain rounded" />
                  ) : highlight.icon_url.startsWith("/") ? (
                    <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${highlight.icon_url}`} alt={highlight.name} className="w-12 h-12 object-contain rounded" />
                  ) : (
                    <span className="text-3xl">{highlight.icon_url}</span>
                  )
                ) : (
                  <Star size={24} className="text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{highlight.name}</h4>
                  {highlight.description && <p className="text-sm text-gray-600 mt-1">{highlight.description}</p>}
                  <span className="text-xs text-gray-500 mt-1 block">{highlight.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(highlight)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(highlight.highlight_id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingHighlight ? "Chỉnh sửa điểm nổi bật" : "Thêm điểm nổi bật mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingHighlight(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {editingHighlight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highlight ID
                    </label>
                    <input
                      type="text"
                      value={formData.highlight_id || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      placeholder="HL001"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Wi-Fi miễn phí"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select
                    value={formData.category || "GENERAL"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GENERAL">Chung</option>
                    <option value="AMENITY">Tiện ích</option>
                    <option value="LOCATION">Vị trí</option>
                    <option value="SERVICE">Dịch vụ</option>
                    <option value="EXPERIENCE">Trải nghiệm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả về điểm nổi bật..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <div className="flex items-center gap-4">
                  {formData.icon_url && (
                    <div className="w-16 h-16 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                      {formData.icon_url.startsWith("http") ? (
                        <img src={formData.icon_url} alt="Icon" className="w-full h-full object-contain" />
                      ) : formData.icon_url.startsWith("/") ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${formData.icon_url}`} alt="Icon" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{formData.icon_url}</span>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.icon_url || ""}
                      onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      placeholder="URL icon"
                    />
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload size={18} />
                      <span className="text-sm">Upload icon</span>
                      <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" disabled={uploadingIcon} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingHighlight(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingHighlight ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HighlightsTab;

