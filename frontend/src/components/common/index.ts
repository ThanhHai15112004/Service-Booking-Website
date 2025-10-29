/**
 * Common/Shared Components
 * 
 * These components are reusable across the entire application.
 * Follow DRY principle - Don't Repeat Yourself
 */

// Loading states
export { default as Loading, PageLoading, InlineLoading } from './Loading';

// Empty states
export { 
  default as EmptyState,
  NoResultsFound,
  NoHotelsAvailable,
  NoRoomsAvailable
} from './EmptyState';

// Error states
export {
  default as ErrorState,
  NotFoundError,
  NetworkError,
  ServerError,
  PageError
} from './ErrorState';

