import { useState } from "react";
import { Bed, MapPin, Users, Maximize2, DollarSign } from "lucide-react";

interface RoomType {
  room_type_id: string;
  name: string;
  description?: string;
  hotel_id: string;
  hotel_name: string;
  bed_type: string;
  area: number;
  capacity: number;
  price_base: number;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  main_image?: string;
  created_at: string;
  updated_at: string;
}

interface RoomTypeInfoTabProps {
  roomType: RoomType;
  onUpdate: () => void;
}

const RoomTypeInfoTab = ({ roomType }: RoomTypeInfoTabProps) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng</label>
            <p className="text-gray-900">{roomType.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn</label>
            <p className="text-gray-900">{roomType.hotel_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giường</label>
            <div className="flex items-center gap-2">
              <Bed className="text-gray-400" size={18} />
              <span className="text-gray-900">{roomType.bed_type}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích</label>
            <div className="flex items-center gap-2">
              <Maximize2 className="text-gray-400" size={18} />
              <span className="text-gray-900">{roomType.area} m²</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
            <div className="flex items-center gap-2">
              <Users className="text-gray-400" size={18} />
              <span className="text-gray-900">{roomType.capacity} người</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản</label>
            <div className="flex items-center gap-2">
              <DollarSign className="text-gray-400" size={18} />
              <span className="text-gray-900 font-medium">
                {new Intl.NumberFormat("vi-VN").format(roomType.price_base)} VNĐ/phòng/đêm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {roomType.description && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{roomType.description}</p>
        </div>
      )}

      {/* Timestamps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
            <p className="text-gray-900">{roomType.created_at}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
            <p className="text-gray-900">{roomType.updated_at}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeInfoTab;

