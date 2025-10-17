import { TrendingUp, Award, Shield, MapPin, Star, ThumbsUp } from 'lucide-react';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <TrendingUp className="w-7 md:w-8 h-7 md:h-8 text-blue-600" />,
    title: "Giá tốt nhất",
    description: "So sánh hàng triệu khách sạn để tìm mức giá tốt nhất cho bạn"
  },
  {
    icon: <Award className="w-7 md:w-8 h-7 md:h-8 text-blue-600" />,
    title: "Đánh giá tin cậy",
    description: "Hơn 50 triệu đánh giá thực từ khách hàng đã trải nghiệm"
  },
  {
    icon: <Shield className="w-7 md:w-8 h-7 md:h-8 text-blue-600" />,
    title: "Thanh toán an toàn",
    description: "Bảo mật thông tin và chính sách hủy phòng linh hoạt"
  },
  {
    icon: <MapPin className="w-7 md:w-8 h-7 md:h-8 text-blue-600" />,
    title: "Khắp mọi nơi",
    description: "Hơn 2 triệu khách sạn tại hơn 200 quốc gia và vùng lãnh thổ"
  },
  {
    icon: <Star className="w-7 md:w-8 h-7 md:h-8 text-blue-600" />,
    title: "Chất lượng đảm bảo",
    description: "Từ nhà nghỉ bình dân đến resort 5 sao sang trọng"
  },
  {
    icon: <ThumbsUp className="w-7 md:w-8 h-7 md:h-8 text-blue-600" />,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ mọi lúc"
  }
];

export default function FeaturesSection() {
  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            Tại sao chọn chúng tôi?
          </h2>
          <p className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm đặt phòng tốt nhất với dịch vụ chuyên nghiệp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-white w-14 md:w-16 h-14 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-5 shadow-md group-hover:shadow-lg transition-shadow">
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
