import { useState, useEffect, useRef } from "react";
import { Bed, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import adminApi from "../../../api/adminAxiosClient";

interface BedType {
  bed_type_key: string;
  name_vi: string;
  name_en?: string;
  description?: string;
  icon?: string;
  display_order: number;
}

const BedTypesTab = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBedType, setEditingBedType] = useState<BedType | null>(null);
  const [formData, setFormData] = useState<Partial<BedType>>({
    bed_type_key: "",
    name_vi: "",
    name_en: "",
    description: "",
    icon: "",
    display_order: 0,
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
        setEditingBedType(null);
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
      const response = await adminService.getBedTypes();
      if (response.success && response.data) {
        setBedTypes(response.data);
      } else {
        showToast("error", response.message || "Không thể tải loại giường");
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

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await adminApi.post("/api/upload/image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && (response.data.data?.url || response.data.data?.imageUrl)) {
        const imageUrl = response.data.data.url || response.data.data.imageUrl;
        setFormData({ ...formData, icon: imageUrl });
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

  const handleOpenModal = (bedType?: BedType) => {
    if (bedType) {
      setEditingBedType(bedType);
      setFormData(bedType);
    } else {
      setEditingBedType(null);
      setFormData({
        bed_type_key: "",
        name_vi: "",
        name_en: "",
        description: "",
        icon: "",
        display_order: 0,
      });
    }
    setShowModal(true);
  };

  const generateBedTypeKey = () => {
    // Generate based on name_vi (convert to uppercase, remove diacritics, replace spaces with underscore)
    if (!formData.name_vi) return `BED_${Date.now()}`;
    
    const normalized = formData.name_vi
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    
    return normalized || `BED_${Date.now()}`;
  };

  const handleSave = async () => {
    try {
      if (editingBedType) {
        const response = await adminService.updateBedType(editingBedType.bed_type_key, formData);
        if (response.success) {
          showToast("success", response.message || "Cập nhật loại giường thành công");
          fetchData();
          setShowModal(false);
          setEditingBedType(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật loại giường");
        }
      } else {
        if (!formData.name_vi) {
          showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
          return;
        }
        const autoKey = generateBedTypeKey();
        const response = await adminService.createBedType({
          bed_type_key: autoKey,
          name_vi: formData.name_vi,
          name_en: formData.name_en,
          description: formData.description,
          icon: formData.icon,
          display_order: formData.display_order,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm loại giường thành công");
          fetchData();
          setShowModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm loại giường");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu loại giường");
    }
  };

  const handleDelete = async (bedTypeKey: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại giường này?")) return;

    try {
      const response = await adminService.deleteBedType(bedTypeKey);
      if (response.success) {
        showToast("success", response.message || "Xóa loại giường thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa loại giường");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa loại giường");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý loại giường</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm loại giường
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên (Tiếng Việt)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên (English)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thứ tự</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bedTypes.map((bedType) => (
                <tr key={bedType.bed_type_key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bedType.bed_type_key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bedType.name_vi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bedType.name_en || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bedType.icon ? (
                      bedType.icon.startsWith("http") ? (
                        <img src={bedType.icon} alt={bedType.name_vi} className="w-8 h-8 object-contain" />
                      ) : bedType.icon.startsWith("/") ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${bedType.icon}`} alt={bedType.name_vi} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">{bedType.icon}</span>
                      )
                    ) : (
                      <Bed size={20} className="text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bedType.display_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(bedType)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(bedType.bed_type_key)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBedType ? "Chỉnh sửa loại giường" : "Thêm loại giường mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBedType(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {editingBedType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bed Type Key
                    </label>
                    <input
                      type="text"
                      value={formData.bed_type_key || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      placeholder="Single"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên (Tiếng Việt) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name_vi || ""}
                    onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Giường đơn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên (English)</label>
                  <input
                    type="text"
                    value={formData.name_en || ""}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Single Bed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.icon || ""}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="URL icon hoặc emoji"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <Upload size={16} />
                        <span className="text-sm font-medium">
                          {uploadingIcon ? "Đang upload..." : "Upload ảnh"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          disabled={uploadingIcon}
                          className="hidden"
                        />
                      </label>
                      {formData.icon && (
                        <div className="w-10 h-10 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                          {formData.icon.startsWith("http") ? (
                            <img src={formData.icon} alt="Icon" className="w-full h-full object-contain" />
                          ) : formData.icon.startsWith("/") ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${formData.icon}`} alt="Icon" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-2xl">{formData.icon}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả về loại giường..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBedType(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingBedType ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedTypesTab;

