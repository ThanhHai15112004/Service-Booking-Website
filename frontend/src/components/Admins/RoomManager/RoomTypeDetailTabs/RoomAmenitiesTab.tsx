import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface Facility {
  facility_id: string;
  name: string;
  icon?: string | null;
  category: string;
}

interface RoomAmenitiesTabProps {
  roomTypeId: string;
}

const RoomAmenitiesTab = ({ roomTypeId }: RoomAmenitiesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [roomAmenities, setRoomAmenities] = useState<Facility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [roomTypeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch room amenities and all facilities in parallel
      const [amenitiesResponse, facilitiesResponse] = await Promise.all([
        adminService.getRoomTypeAmenities(roomTypeId),
        adminService.getAllFacilities("ROOM"),
      ]);

      if (amenitiesResponse.success && amenitiesResponse.data) {
        setRoomAmenities(amenitiesResponse.data);
      } else {
        showToast("error", amenitiesResponse.message || "Không thể tải danh sách tiện nghi");
        setRoomAmenities([]);
      }

      if (facilitiesResponse.success && facilitiesResponse.data) {
        setAllFacilities(facilitiesResponse.data);
      } else {
        showToast("error", facilitiesResponse.message || "Không thể tải danh sách tiện nghi có sẵn");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
      setRoomAmenities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async (facilityId: string) => {
    try {
      const response = await adminService.addRoomTypeAmenity(roomTypeId, facilityId);
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

  const handleRemoveAmenity = async (facilityId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tiện nghi này?")) return;

    try {
      const response = await adminService.removeRoomTypeAmenity(roomTypeId, facilityId);
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
    (facility) => !roomAmenities.some((ra) => ra.facility_id === facility.facility_id)
  );

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý tiện nghi phòng</h3>
        <div className="flex items-center gap-3">
          {/* TODO: Implement copy amenities from other room type */}
          {/* <button
            onClick={() => setShowCopyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy size={18} />
            Copy từ room type khác
          </button> */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Thêm tiện nghi
          </button>
        </div>
      </div>

      {/* Amenities List */}
      {roomAmenities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Chưa có tiện nghi nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomAmenities.map((amenity) => (
            <div
              key={amenity.facility_id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {amenity.icon ? (
                  amenity.icon.startsWith("http://") || amenity.icon.startsWith("https://") ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={amenity.icon} alt={amenity.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                      {amenity.icon}
                    </div>
                  )
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">{amenity.name.charAt(0)}</span>
                  </div>
                )}
                <span className="font-medium text-gray-900">{amenity.name}</span>
              </div>
              <button
                onClick={() => handleRemoveAmenity(amenity.facility_id)}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm tiện nghi</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            {availableFacilities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không còn tiện nghi nào để thêm</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableFacilities.map((facility) => (
                  <button
                    key={facility.facility_id}
                    onClick={() => {
                      handleAddAmenity(facility.facility_id);
                      setShowAddModal(false);
                    }}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
                  >
                    {facility.icon ? (
                      facility.icon.startsWith("http://") || facility.icon.startsWith("https://") ? (
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center overflow-hidden">
                          <img src={facility.icon} alt={facility.name} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-xl">{facility.icon}</span>
                      )
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 font-bold">{facility.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">{facility.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomAmenitiesTab;

