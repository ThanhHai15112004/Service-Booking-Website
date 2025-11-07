import { useState, useEffect, useRef } from "react";
import { Building2, MapPin, Plus, Edit, Trash2, Star, X, Upload } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import adminApi from "../../../api/adminAxiosClient";

interface Category {
  category_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

interface Location {
  location_id: string;
  country: string;
  city: string;
  district?: string;
  ward?: string;
  area_name?: string;
  latitude?: number;
  longitude?: number;
  distance_center?: number;
  description?: string;
  is_hot: boolean;
  created_at: string;
}

const CategoriesAndLocations = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"categories" | "locations">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, locationsRes] = await Promise.all([
        adminService.getCategories(),
        adminService.getLocations(),
      ]);

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      } else {
        showToast("error", categoriesRes.message || "Không thể tải danh mục");
      }

      if (locationsRes.success && locationsRes.data) {
        setLocations(locationsRes.data);
      } else {
        showToast("error", locationsRes.message || "Không thể tải vị trí");
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

  const handleSaveCategory = async (category: Partial<Category>) => {
    try {
      if (editingCategory) {
        const response = await adminService.updateCategory(editingCategory.category_id, category);
        if (response.success) {
          showToast("success", response.message || "Cập nhật danh mục thành công");
          fetchData();
          setShowCategoryModal(false);
          setEditingCategory(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật danh mục");
        }
      } else {
        if (!category.category_id || !category.name) {
          showToast("error", "Vui lòng điền đầy đủ thông tin");
          return;
        }
        const response = await adminService.createCategory({
          category_id: category.category_id,
          name: category.name,
          description: category.description,
          icon: category.icon,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm danh mục thành công");
          fetchData();
          setShowCategoryModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm danh mục");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu danh mục");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      const response = await adminService.deleteCategory(categoryId);
      if (response.success) {
        showToast("success", response.message || "Xóa danh mục thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa danh mục");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa danh mục");
    }
  };

  const handleSaveLocation = async (location: Partial<Location>) => {
    try {
      if (editingLocation) {
        const response = await adminService.updateLocation(editingLocation.location_id, location);
        if (response.success) {
          showToast("success", response.message || "Cập nhật vị trí thành công");
          fetchData();
          setShowLocationModal(false);
          setEditingLocation(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật vị trí");
        }
      } else {
        if (!location.location_id || !location.country || !location.city) {
          showToast("error", "Vui lòng điền đầy đủ thông tin");
          return;
        }
        const response = await adminService.createLocation({
          location_id: location.location_id,
          country: location.country,
          city: location.city,
          district: location.district,
          ward: location.ward,
          area_name: location.area_name,
          latitude: location.latitude,
          longitude: location.longitude,
          distance_center: location.distance_center,
          description: location.description,
          is_hot: location.is_hot,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm vị trí thành công");
          fetchData();
          setShowLocationModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm vị trí");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu vị trí");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vị trí này?")) return;

    try {
      const response = await adminService.deleteLocation(locationId);
      if (response.success) {
        showToast("success", response.message || "Xóa vị trí thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa vị trí");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa vị trí");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Danh mục & Vị trí</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "categories"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Building2 size={18} />
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "locations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MapPin size={18} />
              Vị trí
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý danh mục khách sạn</h3>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Thêm danh mục
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.category_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {category.icon ? (
                          category.icon.startsWith('http') || category.icon.startsWith('/') ? (
                            <img src={category.icon} alt={category.name} className="w-12 h-12 object-contain rounded" />
                          ) : (
                            <span className="text-3xl">{category.icon}</span>
                          )
                        ) : (
                          <Building2 size={24} className="text-gray-400" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.category_id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý vị trí khách sạn</h3>
                <button
                  onClick={() => {
                    setEditingLocation(null);
                    setShowLocationModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Thêm vị trí
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quốc gia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành phố</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quận/Huyện</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khoảng cách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {locations.map((location) => (
                      <tr key={location.location_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.city}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {[location.district, location.ward, location.area_name].filter(Boolean).join(", ") || location.city || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {location.distance_center ? `${location.distance_center} km` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {location.is_hot ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Hot
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingLocation(location);
                                setShowLocationModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(location.location_id)}
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
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          location={editingLocation}
          onClose={() => {
            setShowLocationModal(false);
            setEditingLocation(null);
          }}
          onSave={handleSaveLocation}
        />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
}) => {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "",
  });
  const [uploading, setUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Update form and preview when category changes
  useEffect(() => {
    if (category) {
      setForm({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "",
      });
      // Show preview for URLs (http/https) or relative paths (/uploads/ or /)
      if (category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/'))) {
        setIconPreview(category.icon);
      } else if (category.icon) {
        // Emoji, không hiển thị preview nhưng vẫn giữ trong form
        setIconPreview(null);
      } else {
        setIconPreview(null);
      }
    } else {
      setForm({
        name: "",
        description: "",
        icon: "",
      });
      setIconPreview(null);
    }
  }, [category]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Kích thước file không được vượt quá 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await adminApi.post('/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data.imageUrl || response.data.data.url;
        setForm({ ...form, icon: imageUrl });
        setIconPreview(imageUrl);
        showToast("success", "Upload ảnh thành công");
      } else {
        showToast("error", response.data.message || "Không thể upload ảnh");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể upload ảnh");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveIcon = () => {
    setForm({ ...form, icon: "" });
    setIconPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Đóng modal khi click vào overlay (background)
        if (e.target === e.currentTarget && !uploading) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {toast && <Toast type={toast.type} message={toast.message} />}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{category ? "Chỉnh sửa" : "Thêm"} danh mục</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên danh mục"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Nhập mô tả"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            
            {/* Preview */}
            {iconPreview && (
              <div className="mb-3 flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={iconPreview} 
                    alt="Icon preview" 
                    className="w-16 h-16 object-contain border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={handleRemoveIcon}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    type="button"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Đã chọn ảnh</p>
                  <p className="text-xs text-gray-400 truncate">{iconPreview}</p>
                </div>
              </div>
            )}

            {/* Upload button */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="icon-upload"
              />
              <label
                htmlFor="icon-upload"
                className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  uploading 
                    ? "border-gray-300 bg-gray-100 cursor-not-allowed" 
                    : "border-blue-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <Upload size={18} className={uploading ? "text-gray-400" : "text-blue-600"} />
                <span className={`text-sm ${uploading ? "text-gray-400" : "text-blue-600"}`}>
                  {uploading ? "Đang upload..." : "Chọn ảnh"}
                </span>
              </label>
              
              {/* Fallback: Manual URL input (optional) */}
              {!iconPreview && (
                <div className="flex-1">
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm({ ...form, icon: value });
                      // Show preview if URL (http/https) or relative path (/uploads/)
                      if (value.startsWith('http') || value.startsWith('/')) {
                        setIconPreview(value);
                      } else if (!value) {
                        setIconPreview(null);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Hoặc nhập URL ảnh"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)</p>
          </div>
          <div className="flex items-center gap-3 justify-end pt-4 border-t">
            <button 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={uploading}
            >
              Hủy
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading || !form.name.trim()}
            >
              {uploading ? "Đang upload..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Location Modal Component
const LocationModal = ({
  location,
  onClose,
  onSave,
}: {
  location: Location | null;
  onClose: () => void;
  onSave: (location: Partial<Location>) => void;
}) => {
  const [form, setForm] = useState({
    country: location?.country || "Việt Nam",
    city: location?.city || "",
    district: location?.district || "",
    ward: location?.ward || "",
    area_name: location?.area_name || "",
    latitude: location?.latitude?.toString() || "",
    longitude: location?.longitude?.toString() || "",
    distance_center: location?.distance_center?.toString() || "",
    description: location?.description || "",
    is_hot: location?.is_hot || false,
  });

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Đóng modal khi click vào overlay (background)
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{location ? "Chỉnh sửa" : "Thêm"} vị trí</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <input
                type="text"
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực/Địa chỉ</label>
              <input
                type="text"
                value={form.area_name}
                onChange={(e) => setForm({ ...form, area_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng cách đến trung tâm (km)</label>
              <input
                type="number"
                value={form.distance_center}
                onChange={(e) => setForm({ ...form, distance_center: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.000001"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_hot"
              checked={form.is_hot}
              onChange={(e) => setForm({ ...form, is_hot: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_hot" className="text-sm font-medium text-gray-700">
              Đánh dấu là khu vực "Hot"
            </label>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesAndLocations;

