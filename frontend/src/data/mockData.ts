import { Hotel } from '../types';

export const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Grand Palace Hotel',
    description: 'Khách sạn sang trọng 5 sao tại trung tâm thành phố với view toàn cảnh tuyệt đẹp. Phòng nghỉ hiện đại, tiện nghi đầy đủ.',
    address: '123 Nguyễn Huệ, Quận 1',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    star_rating: 5,
    main_image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
    price_per_night: 2500000,
    rating: 9.2,
    reviews_count: 1847,
    amenities: ['WiFi miễn phí', 'Bể bơi', 'Gym', 'Nhà hàng', 'Spa', 'Quầy bar']
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    description: 'Resort nghỉ dưỡng bên bờ biển với bãi biển riêng, bể bơi vô cực và spa cao cấp. Hoàn hảo cho kỳ nghỉ thư giãn.',
    address: '456 Trần Phú',
    city: 'Nha Trang',
    country: 'Việt Nam',
    star_rating: 5,
    main_image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    price_per_night: 3200000,
    rating: 9.5,
    reviews_count: 2134,
    amenities: ['WiFi miễn phí', 'Bể bơi', 'Bãi biển riêng', 'Spa', 'Nhà hàng', 'Quầy bar']
  },
  {
    id: '3',
    name: 'City Center Hotel',
    description: 'Khách sạn 4 sao hiện đại ngay trung tâm, gần khu mua sắm và các điểm tham quan. Phù hợp cho cả du lịch và công tác.',
    address: '789 Lê Lợi, Hoàn Kiếm',
    city: 'Hà Nội',
    country: 'Việt Nam',
    star_rating: 4,
    main_image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg',
    price_per_night: 1800000,
    rating: 8.7,
    reviews_count: 1234,
    amenities: ['WiFi miễn phí', 'Gym', 'Nhà hàng', 'Đỗ xe miễn phí']
  },
  {
    id: '4',
    name: 'Mountain Lodge',
    description: 'Khách sạn ấm cúng với view núi non hùng vĩ. Không khí trong lành, yên tĩnh, lý tưởng cho những ai muốn thoát khỏi náo nhiệt đô thị.',
    address: '321 Cao nguyên',
    city: 'Đà Lạt',
    country: 'Việt Nam',
    star_rating: 4,
    main_image: 'https://images.pexels.com/photos/1134176/pexels-photo-1134176.jpeg',
    price_per_night: 1500000,
    rating: 9.0,
    reviews_count: 892,
    amenities: ['WiFi miễn phí', 'Nhà hàng', 'Đỗ xe miễn phí', 'Sân vườn']
  },
  {
    id: '5',
    name: 'Boutique Garden Hotel',
    description: 'Khách sạn boutique nhỏ xinh với vườn hoa xinh đẹp. Phong cách thiết kế độc đáo, dịch vụ tận tâm, phù hợp cho cặp đôi.',
    address: '654 Pasteur, Quận 3',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    star_rating: 4,
    main_image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    price_per_night: 1200000,
    rating: 8.9,
    reviews_count: 567,
    amenities: ['WiFi miễn phí', 'Sân vườn', 'Nhà hàng', 'Dịch vụ phòng']
  },
  {
    id: '6',
    name: 'Business Express Hotel',
    description: 'Khách sạn 3 sao tiện lợi cho khách công tác với trung tâm hội nghị, WiFi tốc độ cao và vị trí gần sân bay.',
    address: '987 Hoàng Văn Thụ',
    city: 'Hà Nội',
    country: 'Việt Nam',
    star_rating: 3,
    main_image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
    price_per_night: 900000,
    rating: 8.2,
    reviews_count: 743,
    amenities: ['WiFi miễn phí', 'Đỗ xe miễn phí', 'Trung tâm hội nghị']
  },
  {
    id: '7',
    name: 'Riverside Boutique',
    description: 'Khách sạn view sông thơ mộng với kiến trúc Đông Dương đặc trưng. Không gian yên tĩnh, lãng mạn.',
    address: '234 Bạch Đằng',
    city: 'Đà Nẵng',
    country: 'Việt Nam',
    star_rating: 4,
    main_image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg',
    price_per_night: 1600000,
    rating: 8.8,
    reviews_count: 671,
    amenities: ['WiFi miễn phí', 'Bể bơi', 'Nhà hàng', 'Quầy bar']
  },
  {
    id: '8',
    name: 'Heritage Hotel',
    description: 'Khách sạn lịch sử được bảo tồn với kiến trúc cổ kính, nội thất sang trọng. Trải nghiệm độc đáo giữa lòng phố cổ.',
    address: '45 Hàng Bông',
    city: 'Hà Nội',
    country: 'Việt Nam',
    star_rating: 5,
    main_image: 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg',
    price_per_night: 2200000,
    rating: 9.1,
    reviews_count: 1456,
    amenities: ['WiFi miễn phí', 'Nhà hàng', 'Spa', 'Dịch vụ phòng']
  }
];

export const popularDestinations = [
  {
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    image: 'https://images.pexels.com/photos/1722183/pexels-photo-1722183.jpeg',
    hotels_count: 450
  },
  {
    city: 'Hà Nội',
    country: 'Việt Nam',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRPaVV2sC0tEuownWBXZDOcbiKvTzgsUe96Q&s',
    hotels_count: 380
  },
  {
    city: 'Đà Nẵng',
    country: 'Việt Nam',
    image: 'https://images.pexels.com/photos/2529973/pexels-photo-2529973.jpeg',
    hotels_count: 250
  },
  {
    city: 'Nha Trang',
    country: 'Việt Nam',
    image: 'https://images.pexels.com/photos/3152126/pexels-photo-3152126.jpeg',
    hotels_count: 320
  },
  {
    city: 'Phú Quốc',
    country: 'Việt Nam',
    image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg',
    hotels_count: 180
  },
  {
    city: 'Đà Lạt',
    country: 'Việt Nam',
    image: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg',
    hotels_count: 210
  }
];
