import { useState } from "react";
import { MapPin, Phone, Mail, Globe, Clock, Building2, Star, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Hotel {
  hotel_id: string;
  name: string;
  description?: string;
  category: string;
  city: string;
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  star_rating: number;
  avg_rating: number;
  review_count: number;
  checkin_time: string;
  checkout_time: string;
  phone_number?: string;
  email?: string;
  website?: string;
  total_rooms: number;
  main_image?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  created_at: string;
  updated_at: string;
}

interface HotelInfoTabProps {
  hotel: Hotel;
  onUpdate: () => void;
}

const HotelInfoTab = ({ hotel, onUpdate }: HotelInfoTabProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const MAX_DESCRIPTION_LENGTH = 500; // Số ký tự hiển thị trước khi "xem thêm"

  // Get text content length from HTML
  const getTextLength = (html: string): number => {
    if (!html) return 0;
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent || div.innerText || '').length;
  };

  // Check if description needs "read more"
  const descriptionTextLength = getTextLength(hotel.description || '');
  const needsTruncation = descriptionTextLength > MAX_DESCRIPTION_LENGTH;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách sạn</label>
            <p className="text-gray-900">{hotel.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <p className="text-gray-900">{hotel.category}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xếp hạng sao</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-900">{hotel.star_rating} sao</span>
              <Star className="text-yellow-500 fill-yellow-500" size={16} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số phòng</label>
            <p className="text-gray-900">{hotel.total_rooms} phòng</p>
          </div>
        </div>
      </div>

      {/* Description */}
      {hotel.description && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả</h3>
          <div className="prose max-w-none">
            <div 
              className={`text-gray-700 leading-relaxed ${needsTruncation && !showFullDescription ? 'line-clamp-6' : ''}`}
              dangerouslySetInnerHTML={{ __html: hotel.description }}
            />
            {needsTruncation && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp size={16} />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Xem thêm
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Location */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="text-blue-600" size={20} />
          Địa chỉ & Vị trí
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <p className="text-gray-900">{hotel.address}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố / Quận</label>
            <p className="text-gray-900">
              {[hotel.city, hotel.district].filter(Boolean).join(", ") || "-"}
            </p>
          </div>
          {hotel.latitude && hotel.longitude && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tọa độ</label>
              <div className="flex items-center gap-4">
                <span className="text-gray-900">
                  <strong>Lat:</strong> {hotel.latitude}
                </span>
                <span className="text-gray-900">
                  <strong>Lng:</strong> {hotel.longitude}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Xem trên Google Maps
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="text-green-600" size={20} />
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotel.phone_number && (
            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={20} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <a href={`tel:${hotel.phone_number}`} className="text-blue-600 hover:text-blue-800">
                  {hotel.phone_number}
                </a>
              </div>
            </div>
          )}
          {hotel.email && (
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <a href={`mailto:${hotel.email}`} className="text-blue-600 hover:text-blue-800">
                  {hotel.email}
                </a>
              </div>
            </div>
          )}
          {hotel.website && (
            <div className="flex items-center gap-3">
              <Globe className="text-gray-400" size={20} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <a href={hotel.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                  {hotel.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Check-in/Check-out */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="text-purple-600" size={20} />
          Thời gian nhận/trả phòng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ nhận phòng</label>
            <p className="text-gray-900">{hotel.checkin_time}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ trả phòng</label>
            <p className="text-gray-900">{hotel.checkout_time}</p>
          </div>
        </div>
      </div>

      {/* Rating & Reviews */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="text-yellow-600" size={20} />
          Đánh giá & Reviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating trung bình</label>
            <div className="flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
              <span className="text-2xl font-bold text-gray-900">{(hotel.avg_rating * 2).toFixed(1)}</span>
              <span className="text-gray-500">/ 10</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số reviews</label>
            <p className="text-gray-900 text-2xl font-bold">{hotel.review_count} reviews</p>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="text-gray-600" size={20} />
          Thông tin hệ thống
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
            <p className="text-gray-900">{hotel.created_at}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
            <p className="text-gray-900">{hotel.updated_at}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelInfoTab;

