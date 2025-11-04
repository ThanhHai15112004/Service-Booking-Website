import { Request, Response, NextFunction } from "express";

// ✅ Error handler riêng cho admin routes
export function adminErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("[AdminErrorHandler]", err);

  // Validation errors
  if (err.name === 'ValidationError' || err.message?.includes('validation')) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Dữ liệu không hợp lệ'
    });
  }

  // Unauthorized
  if (err.status === 401 || err.message?.includes('unauthorized')) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Không có quyền truy cập'
    });
  }

  // Forbidden
  if (err.status === 403 || err.message?.includes('forbidden')) {
    return res.status(403).json({
      success: false,
      message: err.message || 'Bị cấm truy cập'
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: err.message || 'Lỗi server'
  });
}

// ✅ Wrapper cho async routes
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
