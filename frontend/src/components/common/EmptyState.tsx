import React from 'react';
import { Search, Hotel, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'search' | 'hotel' | 'alert' | React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Reusable Empty State Component
 * 
 * @param icon - Icon to display (predefined or custom ReactNode)
 * @param title - Optional title
 * @param message - Main message
 * @param actionLabel - Label for action button
 * @param onAction - Action button handler
 * @param className - Additional CSS classes
 */
export default function EmptyState({
  icon = 'search',
  title,
  message,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const IconComponent = {
      search: Search,
      hotel: Hotel,
      alert: AlertCircle
    }[icon as string] || Search;

    return <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />;
  };

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {renderIcon()}
      
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      
      <p className="text-gray-600 text-base max-w-md mx-auto mb-6">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Specific empty states for common scenarios
 */

export function NoResultsFound({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon="search"
      title="Không tìm thấy kết quả"
      message="Không tìm thấy khách sạn phù hợp. Vui lòng thử lại với các tiêu chí khác."
      actionLabel={onReset ? "Đặt lại bộ lọc" : undefined}
      onAction={onReset}
    />
  );
}

export function NoHotelsAvailable() {
  return (
    <EmptyState
      icon="hotel"
      title="Chưa có khách sạn"
      message="Hiện tại chưa có khách sạn nào trong khu vực này."
    />
  );
}

export function NoRoomsAvailable() {
  return (
    <EmptyState
      icon="hotel"
      title="Không có phòng trống"
      message="Không có phòng trống cho thời gian này. Vui lòng thử chọn ngày khác."
    />
  );
}

