import { useState, useEffect, useRef } from "react";
import { Wifi, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import adminApi from "../../../api/adminAxiosClient";

interface Facility {
  facility_id: string;
  name: string;
  category: "HOTEL" | "ROOM";
  icon?: string;
  created_at?: string;
}

const FacilitiesTab = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [formData, setFormData] = useState<Partial<Facility>>({
    facility_id: "",
    name: "",
    category: "HOTEL",
    icon: "",
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
        setEditingFacility(null);
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
      const response = await adminService.getAllFacilities();
      if (response.success && response.data) {
        // Map data để đảm bảo type safety
        const mappedFacilities: Facility[] = response.data.map((item) => ({
          facility_id: item.facility_id,
          name: item.name,
          category: (item.category === "HOTEL" || item.category === "ROOM" ? item.category : "HOTEL") as "HOTEL" | "ROOM",
          icon: item.icon || undefined,
          created_at: undefined,
        }));
        setFacilities(mappedFacilities);
      } else {
        showToast("error", response.message || "Không thể tải tiện ích");
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

  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData(facility);
    } else {
      setEditingFacility(null);
      setFormData({
        facility_id: "",
        name: "",
        category: "HOTEL",
        icon: "",
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

  const generateFacilityId = () => {
    // Tìm ID lớn nhất hiện có
    const maxId = facilities.reduce((max, facility) => {
      const match = facility.facility_id.match(/^F(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    
    // Tạo ID mới
    const newNum = maxId + 1;
    return `F${String(newNum).padStart(3, '0')}`;
  };

  const handleSave = async () => {
    try {
      if (editingFacility) {
        const response = await adminService.updateFacility(editingFacility.facility_id, formData);
        if (response.success) {
          showToast("success", response.message || "Cập nhật tiện ích thành công");
          fetchData();
          setShowModal(false);
          setEditingFacility(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật tiện ích");
        }
      } else {
        if (!formData.name) {
          showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
          return;
        }
        // Tự động generate ID
        const autoId = generateFacilityId();
        const response = await adminService.createFacility({
          facility_id: autoId,
          name: formData.name,
          category: formData.category || "HOTEL",
          icon: formData.icon,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm tiện ích thành công");
          fetchData();
          setShowModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm tiện ích");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu tiện ích");
    }
  };

  const handleDelete = async (facilityId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tiện ích này?")) return;

    try {
      const response = await adminService.deleteFacility(facilityId);
      if (response.success) {
        showToast("success", response.message || "Xóa tiện ích thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa tiện ích");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa tiện ích");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý tiện ích</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm tiện ích
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facilities.map((facility) => (
                <tr key={facility.facility_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{facility.facility_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{facility.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        facility.category === "HOTEL"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {facility.category === "HOTEL" ? "Khách sạn" : "Phòng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {facility.icon ? (
                      facility.icon.startsWith("http") ? (
                        <img src={facility.icon} alt={facility.name} className="w-8 h-8 object-contain" />
                      ) : facility.icon.startsWith("/") ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${facility.icon}`} alt={facility.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">{facility.icon}</span>
                      )
                    ) : (
                      <Wifi size={20} className="text-gray-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(facility)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(facility.facility_id)}
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
                {editingFacility ? "Chỉnh sửa tiện ích" : "Thêm tiện ích mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingFacility(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {editingFacility && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Facility ID
                    </label>
                    <input
                      type="text"
                      value={formData.facility_id || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      placeholder="F001"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên tiện ích <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Wifi miễn phí"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category || "HOTEL"}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as "HOTEL" | "ROOM" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HOTEL">Khách sạn</option>
                    <option value="ROOM">Phòng</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="flex items-center gap-4">
                  {formData.icon && (
                    <div className="w-16 h-16 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                      {formData.icon.startsWith("http") ? (
                        <img src={formData.icon} alt="Icon" className="w-full h-full object-contain" />
                      ) : formData.icon.startsWith("/") ? (
                        <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${formData.icon}`} alt="Icon" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl">{formData.icon}</span>
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.icon || ""}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      placeholder="URL icon hoặc emoji"
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
                  setEditingFacility(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingFacility ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitiesTab;

