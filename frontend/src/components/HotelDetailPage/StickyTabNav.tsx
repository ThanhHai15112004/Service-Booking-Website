import { useState, useEffect, useRef } from 'react';

interface TabSection {
  id: string;
  label: string;
}

interface StickyTabNavProps {
  sections: TabSection[];
}

export default function StickyTabNav({ sections }: StickyTabNavProps) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id || '');
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Intersection Observer for scroll spy
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.3,
      rootMargin: '-80px 0px -70% 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [sections]);

  useEffect(() => {
    // Detect when nav becomes sticky
    const handleScroll = () => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Height of sticky nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav
      ref={navRef}
      className={`sticky max-w-[1000px] mx-auto top-0 z-40 bg-white border-b border-gray-200 transition-shadow ${
        isSticky ? 'shadow-md' : ''
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto overflow-y-hidden">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`
                py-4 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === section.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

