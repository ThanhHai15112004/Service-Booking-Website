import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authenticateJWT(req: any, res: any, next: any) {
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
    req.user = { account_id: decoded.account_id }; // ✅ Set req.user for controller
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
