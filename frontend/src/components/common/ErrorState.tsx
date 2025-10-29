import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, XCircle, WifiOff, ServerCrash } from 'lucide-react';

interface ErrorStateProps {
  error: string | Error;
  icon?: 'alert' | 'error' | 'network' | 'server' | React.ReactNode;
  title?: string;
  showDetails?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

/**
 * Reusable Error State Component
 * 
 * @param error - Error message or Error object
 * @param icon - Icon to display
 * @param title - Optional title
 * @param showDetails - Show error details
 * @param actionLabel - Label for action button
 * @param onAction - Action button handler
 * @param showHomeButton - Show "Go to Home" button
 * @param className - Additional CSS classes
 */
export default function ErrorState({
  error,
  icon = 'alert',
  title,
  showDetails = false,
  actionLabel,
  onAction,
  showHomeButton = true,
  className = ''
}: ErrorStateProps) {
  const navigate = useNavigate();

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack;

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const IconComponent = {
      alert: AlertTriangle,
      error: XCircle,
      network: WifiOff,
      server: ServerCrash
    }[icon as string] || AlertTriangle;

    return <IconComponent className="w-16 h-16 text-red-500 mx-auto mb-4" />;
  };

  return (
    <div className={`text-center py-12 px-4 max-w-2xl mx-auto ${className}`}>
      {renderIcon()}
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {title || 'Đã có lỗi xảy ra'}
      </h2>
      
      <p className="text-gray-600 text-base mb-6">
        {errorMessage}
      </p>

      {showDetails && errorStack && (
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Chi tiết lỗi
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-700 overflow-auto max-h-48">
            {errorStack}
          </pre>
        </details>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {actionLabel}
          </button>
        )}
        
        {showHomeButton && (
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Quay về trang chủ
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Specific error states for common scenarios
 */

export function NotFoundError({ 
  resourceType = 'trang',
  onGoBack
}: { 
  resourceType?: string;
  onGoBack?: () => void;
}) {
  const navigate = useNavigate();
  
  return (
    <ErrorState
      error={`Không tìm thấy ${resourceType} này`}
      icon="error"
      title="404 - Không tìm thấy"
      actionLabel={onGoBack ? "Quay lại" : undefined}
      onAction={onGoBack || (() => navigate(-1))}
      showHomeButton
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      error="Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn."
      icon="network"
      title="Lỗi kết nối"
      actionLabel={onRetry ? "Thử lại" : undefined}
      onAction={onRetry}
      showHomeButton
    />
  );
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      error="Máy chủ đang gặp sự cố. Vui lòng thử lại sau."
      icon="server"
      title="Lỗi máy chủ"
      actionLabel={onRetry ? "Thử lại" : undefined}
      onAction={onRetry}
      showHomeButton
    />
  );
}

/**
 * Page-level error state with layout
 */
export function PageError({ error }: { error: string | Error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <ErrorState error={error} />
    </div>
  );
}

