import { TrendingUp, Award, Shield, Headphones } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export default function Features() {
  const features: Feature[] = [
    {
      icon: TrendingUp,
      title: 'Giá tốt nhất',
      description: 'Đảm bảo giá tốt nhất trên thị trường'
    },
    {
      icon: Award,
      title: 'Chất lượng cao',
      description: 'Hàng nghìn khách sạn đạt chuẩn'
    },
    {
      icon: Shield,
      title: 'Thanh toán an toàn',
      description: 'Bảo mật thông tin 100%'
    },
    {
      icon: Headphones,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ tận tâm luôn sẵn sàng'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div key={index} className="text-center">
              <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}