interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

/**
 * Simple Loading Component
 */
export default function Loading({ 
  message = 'Đang tải...', 
  size = 'md',
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  const spinnerClass = sizeClasses[size];

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Simple circular spinner */}
      <div 
        className={`${spinnerClass} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="text-gray-600 text-sm">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white bg-opacity-80">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Page-level loading state
 */
export function PageLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <Loading message={message} size="lg" />
    </div>
  );
}

/**
 * Inline loading for sections
 */
export function InlineLoading({ message }: { message?: string }) {
  return (
    <div className="flex justify-center items-center py-12">
      <Loading message={message} size="md" />
    </div>
  );
}

