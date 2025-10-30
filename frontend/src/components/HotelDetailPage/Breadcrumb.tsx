import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
  count?: number;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="bg-white py-3 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.href}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {item.label}
                {item.count && (
                  <span className="text-gray-500 ml-1">
                    ({item.count.toLocaleString()})
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

