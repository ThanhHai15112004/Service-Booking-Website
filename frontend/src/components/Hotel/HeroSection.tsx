interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  children?: React.ReactNode;
}

export default function HeroSection({ title, subtitle, backgroundImage, children }: HeroSectionProps) {
  return (
    <div
      className="relative py-8 md:py-16 pb-2 md:pb-4 rounded-b-[40px] md:rounded-b-[60px] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/30 rounded-b-[40px] md:rounded-b-[60px]"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center textsize-15 mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3">
            {title}
          </h1>
          <p className="text-sm md:text-lg text-white/90 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        {children && (
          <div className="relative -mb-16 md:-mb-32">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
