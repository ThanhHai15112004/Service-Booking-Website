import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { 
  Heart, 
  MapPin, 
  Star, 
  Trash2,
  Search,
  Filter,
  Building2,
  Calendar
} from 'lucide-react';

interface WishlistItem {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  amenities: string[];
  addedDate: string;
}

function WishlistPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');

  // Mock data - trong thực tế sẽ lấy từ localStorage hoặc API
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const handleRemoveFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
    // TODO: Remove from localStorage or API
  };

  const filteredItems = wishlistItems.filter(item =>
    item.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'name':
        return a.hotelName.localeCompare(b.hotelName);
      case 'date':
      default:
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
    }
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-red-600 fill-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">Danh sách yêu thích</h1>
                  <p className="text-gray-600">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'khách sạn' : 'khách sạn'} đã lưu
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/hotels/search')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Khám phá thêm
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm trong danh sách yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'name')}
                  className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="date">Mới nhất</option>
                  <option value="price">Giá tăng dần</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          {sortedItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {wishlistItems.length === 0 
                  ? 'Danh sách yêu thích trống' 
                  : 'Không tìm thấy kết quả'}
              </h3>
              <p className="text-gray-600 mb-6">
                {wishlistItems.length === 0
                  ? 'Bắt đầu lưu các khách sạn bạn yêu thích để dễ dàng tìm lại sau!'
                  : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'}
              </p>
              <button
                onClick={() => navigate('/hotels/search')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Khám phá khách sạn
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/hotel/${item.hotelId}`)}
                >
                  {/* Hotel Image */}
                  <div className="relative aspect-video overflow-hidden bg-gray-200">
                    {item.hotelImage ? (
                      <img
                        src={item.hotelImage}
                        alt={item.hotelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWishlist(item.id);
                      }}
                      className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors group/btn"
                    >
                      <Heart className="w-5 h-5 text-red-600 fill-red-600 group-hover/btn:scale-110 transition-transform" />
                    </button>

                    {/* Discount Badge */}
                    {item.discount && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        -{item.discount}%
                      </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            {item.originalPrice && (
                              <p className="text-xs text-gray-500 line-through">
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(item.originalPrice)}
                              </p>
                            )}
                            <p className="text-lg font-bold text-gray-900">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.price)}
                              <span className="text-xs font-normal text-gray-500">/đêm</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {item.hotelName}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(item.rating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({item.reviewCount} đánh giá)
                      </span>
                    </div>

                    {/* Amenities */}
                    {item.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {amenity}
                          </span>
                        ))}
                        {item.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            +{item.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Added Date */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Đã lưu {new Date(item.addedDate).toLocaleDateString('vi-VN')}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/hotel/${item.hotelId}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Card */}
          {wishlistItems.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Mẹo sử dụng danh sách yêu thích</h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Lưu các khách sạn bạn quan tâm để dễ dàng so sánh và đặt phòng sau</li>
                    <li>Nhận thông báo khi giá giảm hoặc có ưu đãi đặc biệt</li>
                    <li>Chia sẻ danh sách với bạn bè và gia đình</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default WishlistPage;

