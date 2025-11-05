import { useState, useEffect } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";
import { getAllFacilities } from "../../../../services/hotelService";

interface Facility {
  facility_id: string;
  name: string;
  icon?: string;
  category: "HOTEL" | "ROOM";
}

interface HotelFacility {
  facility_id: string;
  name: string;
  icon?: string;
  category: "HOTEL" | "ROOM";
}

interface HotelFacilitiesTabProps {
  hotelId: string;
}

const HotelFacilitiesTab = ({ hotelId }: HotelFacilitiesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hotelFacilities, setHotelFacilities] = useState<HotelFacility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelFacilitiesRes, allFacilitiesRes] = await Promise.all([
        adminService.getHotelFacilities(hotelId),
        getAllFacilities(),
      ]);

      if (hotelFacilitiesRes.success && hotelFacilitiesRes.data) {
        setHotelFacilities(hotelFacilitiesRes.data);
      }

      // Handle different response structures
      if (allFacilitiesRes.success) {
        let facilitiesArray: any[] = [];
        
        if (allFacilitiesRes.items && Array.isArray(allFacilitiesRes.items)) {
          facilitiesArray = allFacilitiesRes.items;
        } else if (Array.isArray(allFacilitiesRes.data)) {
          facilitiesArray = allFacilitiesRes.data;
        } else if (Array.isArray(allFacilitiesRes)) {
          facilitiesArray = allFacilitiesRes;
        } else {
          console.error("Unexpected facilities response structure:", allFacilitiesRes);
          showToast("error", "Không thể parse dữ liệu tiện nghi");
          return;
        }
        
        // Map facilityId (camelCase) to facility_id (snake_case) for consistency
        const mappedFacilities = facilitiesArray.map((facility: any) => ({
          facility_id: facility.facility_id || facility.facilityId,
          name: facility.name,
          category: facility.category,
          icon: facility.icon,
          created_at: facility.created_at || facility.createdAt
        }));
        
        setAllFacilities(mappedFacilities);
      } else {
        console.error("Failed to fetch facilities:", allFacilitiesRes);
        showToast("error", allFacilitiesRes.message || "Không thể tải danh sách tiện nghi");
      }image.png
    } catch (error: any) {
      console.error("Error fetching facilities:", error);
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async (facilityId: string) => {
    if (!facilityId) {
      showToast("error", "Không tìm thấy ID tiện nghi");
      return;
    }
    
    try {
      const response = await adminService.addHotelFacility(hotelId, facilityId);
      if (response.success) {
        showToast("success", response.message || "Thêm tiện nghi thành công");
        fetchData();
        setShowAddModal(false);
      } else {
        showToast("error", response.message || "Không thể thêm tiện nghi");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể thêm tiện nghi");
    }
  };

  const handleRemoveFacility = async (facilityId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tiện nghi này?")) return;

    try {
      const response = await adminService.removeHotelFacility(hotelId, facilityId);
      if (response.success) {
        showToast("success", response.message || "Xóa tiện nghi thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa tiện nghi");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa tiện nghi");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const availableFacilities = allFacilities.filter(
    (facility) => !hotelFacilities.some((hf) => hf.facility_id === facility.facility_id)
  );

  const hotelFacilitiesList = hotelFacilities.filter((f) => f.category === "HOTEL");
  const roomFacilitiesList = hotelFacilities.filter((f) => f.category === "ROOM");

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý tiện nghi</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm tiện nghi
        </button>
      </div>

      {/* Hotel Facilities */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Tiện nghi khách sạn ({hotelFacilitiesList.length})</h4>
        {hotelFacilitiesList.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có tiện nghi nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotelFacilitiesList.map((facility) => (
              <div
                key={facility.facility_id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {facility.icon && (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      {facility.icon.startsWith('http') ? (
                        <img src={facility.icon} alt={facility.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">{facility.icon}</span>
                      )}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{facility.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFacility(facility.facility_id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Room Facilities */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Tiện nghi phòng ({roomFacilitiesList.length})</h4>
        {roomFacilitiesList.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có tiện nghi nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roomFacilitiesList.map((facility) => (
              <div
                key={facility.facility_id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  {facility.icon && (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      {facility.icon.startsWith('http') ? (
                        <img src={facility.icon} alt={facility.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-xl">{facility.icon}</span>
                      )}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{facility.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFacility(facility.facility_id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm tiện nghi</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              {availableFacilities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không còn tiện nghi nào để thêm</p>
              ) : (
                <div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tiện nghi khách sạn</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {availableFacilities
                        .filter((f) => f.category === "HOTEL")
                        .map((facility) => (
                          <button
                            key={facility.facility_id || `hotel-${facility.name}`}
                            onClick={() => {
                              if (facility.facility_id) {
                                handleAddFacility(facility.facility_id);
                              } else {
                                showToast("error", "Tiện nghi không có ID hợp lệ");
                              }
                            }}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
                          >
                            {facility.icon ? (
                              facility.icon.startsWith('http') ? (
                                <img src={facility.icon} alt={facility.name} className="w-6 h-6 object-contain" />
                              ) : (
                                <span className="text-xl">{facility.icon}</span>
                              )
                            ) : null}
                            <span className="text-sm font-medium text-gray-900">{facility.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tiện nghi phòng</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {availableFacilities
                        .filter((f) => f.category === "ROOM")
                        .map((facility) => (
                          <button
                            key={facility.facility_id || `room-${facility.name}`}
                            onClick={() => {
                              if (facility.facility_id) {
                                handleAddFacility(facility.facility_id);
                              } else {
                                showToast("error", "Tiện nghi không có ID hợp lệ");
                              }
                            }}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-500 transition-colors text-left"
                          >
                            {facility.icon ? (
                              facility.icon.startsWith('http') ? (
                                <img src={facility.icon} alt={facility.name} className="w-6 h-6 object-contain" />
                              ) : (
                                <span className="text-xl">{facility.icon}</span>
                              )
                            ) : null}
                            <span className="text-sm font-medium text-gray-900">{facility.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelFacilitiesTab;

