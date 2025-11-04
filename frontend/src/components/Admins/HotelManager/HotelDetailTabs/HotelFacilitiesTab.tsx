import { useState, useEffect } from "react";
import { Check, Plus, X } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";

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
      // TODO: Replace with actual API calls
      // const [hotelFacilitiesRes, allFacilitiesRes] = await Promise.all([
      //   adminService.getHotelFacilities(hotelId),
      //   adminService.getAllFacilities(),
      // ]);
      // setHotelFacilities(hotelFacilitiesRes.data);
      // setAllFacilities(allFacilitiesRes.data);

      // Mock data
      setTimeout(() => {
        setHotelFacilities([
          { facility_id: "F001", name: "Wi-Fi miễn phí", icon: "wifi", category: "HOTEL" },
          { facility_id: "F002", name: "Bãi đỗ xe", icon: "parking", category: "HOTEL" },
          { facility_id: "F003", name: "Hồ bơi", icon: "pool", category: "HOTEL" },
          { facility_id: "F016", name: "Điều hòa", icon: "ac", category: "ROOM" },
          { facility_id: "F017", name: "TV", icon: "tv", category: "ROOM" },
        ]);
        setAllFacilities([
          { facility_id: "F001", name: "Wi-Fi miễn phí", icon: "wifi", category: "HOTEL" },
          { facility_id: "F002", name: "Bãi đỗ xe", icon: "parking", category: "HOTEL" },
          { facility_id: "F003", name: "Hồ bơi", icon: "pool", category: "HOTEL" },
          { facility_id: "F004", name: "Nhà hàng", icon: "restaurant", category: "HOTEL" },
          { facility_id: "F005", name: "Bar", icon: "bar", category: "HOTEL" },
          { facility_id: "F016", name: "Điều hòa", icon: "ac", category: "ROOM" },
          { facility_id: "F017", name: "TV", icon: "tv", category: "ROOM" },
          { facility_id: "F018", name: "Minibar", icon: "minibar", category: "ROOM" },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu");
      setLoading(false);
    }
  };

  const handleAddFacility = async (facilityId: string) => {
    try {
      // TODO: API call
      // await adminService.addHotelFacility(hotelId, facilityId);
      showToast("success", "Thêm tiện nghi thành công");
      fetchData();
    } catch (error: any) {
      showToast("error", error.message || "Không thể thêm tiện nghi");
    }
  };

  const handleRemoveFacility = async (facilityId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tiện nghi này?")) return;

    try {
      // TODO: API call
      // await adminService.removeHotelFacility(hotelId, facilityId);
      showToast("success", "Xóa tiện nghi thành công");
      fetchData();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa tiện nghi");
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
                      <span className="text-xl">{facility.icon}</span>
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{facility.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFacility(facility.facility_id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <X size={18} />
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
                      <span className="text-xl">{facility.icon}</span>
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{facility.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFacility(facility.facility_id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <div className="space-y-4">
              {availableFacilities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không còn tiện nghi nào để thêm</p>
              ) : (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tiện nghi khách sạn</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {availableFacilities
                        .filter((f) => f.category === "HOTEL")
                        .map((facility) => (
                          <button
                            key={facility.facility_id}
                            onClick={() => {
                              handleAddFacility(facility.facility_id);
                              setShowAddModal(false);
                            }}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
                          >
                            {facility.icon && <span className="text-xl">{facility.icon}</span>}
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
                            key={facility.facility_id}
                            onClick={() => {
                              handleAddFacility(facility.facility_id);
                              setShowAddModal(false);
                            }}
                            className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-500 transition-colors text-left"
                          >
                            {facility.icon && <span className="text-xl">{facility.icon}</span>}
                            <span className="text-sm font-medium text-gray-900">{facility.name}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelFacilitiesTab;

