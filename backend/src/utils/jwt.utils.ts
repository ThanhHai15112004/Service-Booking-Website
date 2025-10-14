import jwt, { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET || "default_access_secret";
const REFRESH_SECRET: Secret = process.env.JWT_REFRESH_SECRET || "default_refresh_secret";

// Tạo Access Token
export function generateAccessToken(payload: object): string {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN) as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn });
}

// Tạo Refresh Token
export function generateRefreshToken(payload: object): string {
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN) as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn });
}

// Xác minh Access Token
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

// Xác minh Refresh Token
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
