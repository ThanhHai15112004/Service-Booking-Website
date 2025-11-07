import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AccountRepository } from "../Repository/Auth/account.repository";
dotenv.config();

const accountRepo = new AccountRepository();

export async function authenticateJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Thiếu token." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Thiếu token." });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    
    // ✅ Set both res.locals and req.user for compatibility
    res.locals.accountId = decoded.account_id;
    
    // ✅ Nếu token có role, dùng role từ token (nhanh hơn)
    // Nếu không có, query từ database để đảm bảo chính xác
    let role = decoded.role;
    
    if (!role) {
      // Fallback: query từ database nếu token không có role (token cũ)
      try {
        const account = await accountRepo.findById(decoded.account_id);
        role = account?.role || 'USER';
      } catch (error) {
        console.warn("[AuthMiddleware] Failed to fetch role from database, using default USER");
        role = 'USER';
      }
    }
    
    // ✅ Set req.user với account_id và role
    req.user = { 
      account_id: decoded.account_id,
      role: role,
      email: decoded.email // Thêm email nếu cần
    };
    
    // ✅ Chỉ log trong development mode để tránh spam log
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AUTH === 'true') {
      console.log("[authenticateJWT] User authenticated:", {
        account_id: req.user.account_id,
        email: req.user.email,
        role: req.user.role,
        roleFromToken: decoded.role
      });
    }
    
    next();
  } catch (err: any) {
    // ✅ Differentiate between expired token (401) and invalid token (403)
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token đã hết hạn. Vui lòng refresh token." 
      });
    }
    // Invalid token (malformed, wrong secret, etc.)
    return res.status(403).json({ 
      message: "Token không hợp lệ." 
    });
  }
}

// ✅ Middleware kiểm tra quyền ADMIN
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Vui lòng đăng nhập" 
    });
  }
  
  // ✅ Chỉ log trong development mode để tránh spam log
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_AUTH === 'true') {
    console.log("[requireAdmin] Current user:", {
      account_id: req.user.account_id,
      email: req.user.email,
      role: req.user.role
    });
  }
  
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      message: `Chỉ ADMIN mới có quyền truy cập tài nguyên này. Role hiện tại của bạn: ${req.user.role}` 
    });
  }
  next();
}

// ✅ Middleware kiểm tra quyền STAFF (ADMIN hoặc STAFF)
export function requireStaff(req: any, res: any, next: any) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "Vui lòng đăng nhập" 
    });
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF') {
    return res.status(403).json({ 
      success: false, 
      message: "Bạn không có quyền truy cập tài nguyên này" 
    });
  }
  next();
}
