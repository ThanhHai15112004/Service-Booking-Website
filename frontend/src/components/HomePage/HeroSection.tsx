interface HeroSectionProps {
  onSearch: (params: any) => void;
  SearchBarComponent: React.ComponentType<{ onSearch: (params: any) => void }>;
}

export default function HeroSection({ onSearch, SearchBarComponent }: HeroSectionProps) {
  return (
    <div
      className="relative py-8 md:py-12 pb-2 md:pb-4 rounded-b-[40px] md:rounded-b-[80px] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png)'
      }}
    >
      <div className="absolute inset-0 bg-black/20 rounded-b-[40px] md:rounded-b-[80px]"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
            Tìm kiếm khách sạn hoàn hảo cho chuyến đi của bạn
          </h1>
          <p className="text-xs md:text-base text-white">
            Hàng nghìn lựa chọn với giá tốt nhất
          </p>
        </div>

        <div className="relative -mb-16 md:-mb-32">
          <SearchBarComponent onSearch={onSearch} />
        </div>
      </div>
    </div>
  );
}


