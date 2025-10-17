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
    res.locals.accountId = decoded.account_id;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
}
