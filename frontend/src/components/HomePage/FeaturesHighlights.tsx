import { TrendingUp, Award, Shield } from 'lucide-react';

export default function FeaturesHighlights() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Giá tốt nhất',
      description: 'So sánh giá từ nhiều nguồn để đảm bảo bạn có mức giá tốt nhất'
    },
    {
      icon: Award,
      title: 'Đánh giá tin cậy',
      description: 'Hàng triệu đánh giá thực từ khách hàng đã trải nghiệm'
    },
    {
      icon: Shield,
      title: 'Đặt phòng an toàn',
      description: 'Thanh toán bảo mật và chính sách hủy linh hoạt'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={index} className="text-center">
            <div className="bg-gray-100 w-14 md:w-16 h-14 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Icon className="w-7 md:w-8 h-7 md:h-8 text-black" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">{feature.title}</h3>
            <p className="text-sm md:text-base text-gray-600">
              {feature.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}

