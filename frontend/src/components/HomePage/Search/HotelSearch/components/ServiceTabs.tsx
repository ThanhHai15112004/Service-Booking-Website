import { MapPin } from 'lucide-react';
import type { ServiceTabsProps } from '../types/hotel.types';

export default function ServiceTabs({ activeService, onServiceChange }: ServiceTabsProps) {
  const services = [
    { id: 'hotel', name: 'Khách sạn', icon: MapPin },
    { id: 'apartment', name: 'Nhà và Căn hộ' },
    { id: 'flight', name: 'Máy bay' },
    { id: 'car', name: 'Thuê xe' },
    { id: 'combo', name: 'Combo' }
  ];

  return (
    <div className="flex gap-4 mb-6 border-b-2 border-gray-100">
      {services.map((service) => {
        const Icon = service.icon;
        const isActive = activeService === service.id;
        
        return (
          <button
            key={service.id}
            onClick={() => onServiceChange(service.id)}
            className={`flex items-center gap-2 px-3 py-2 font-medium text-sm transition-colors ${
              isActive
                ? 'font-semibold border-b-3 border-blue-600 text-blue-600 -mb-0.5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {service.name}
          </button>
        );
      })}
    </div>
  );
}