import disposableDomains from "disposable-email-domains";
import { HotelSearchParams } from "../models/hotel.model";

export function validateRegisterInput(
  full_name: string,
  email: string,
  password: string,
  phone_number: string
): string | null {
  //  Kiểm tra họ và tên
  if (!full_name || full_name.trim().length < 2) {
    return "Họ và tên phải có ít nhất 2 ký tự.";
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ.";
  }

  // Kiểm tra domain email tạm thời (chống email rác)
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return "Không chấp nhận email tạm thời hoặc email rác.";
  }

  //  Kiểm tra mật khẩu
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return "Mật khẩu phải có ít nhất 8 ký tự và bao gồm cả chữ và số.";
  }

  //  Kiểm tra số điện thoại
  if (phone_number && !/^\d{9,15}$/.test(phone_number)) {
    return "Số điện thoại phải có ít nhất 9 đến 15 chữ số.";
  }

  // Tất cả hợp lệ
  return null;
}

export function validateEmailFormat(email: string): boolean {
  // Regex chuẩn RFC 5322 để kiểm tra email
  const emailRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return false;
  }

  // Kiểm tra thêm: email phải có ít nhất 3 ký tự trước @ và ít nhất 3 ký tự domain
  const [localPart, domain] = email.split("@");
  if (!localPart || localPart.length < 2 || !domain || domain.length < 3) {
    return false;
  }

  // Kiểm tra không có các ký tự đặc biệt liên tiếp
  if (/\.{2,}|__{2,}|-{2,}/.test(email)) {
    return false;
  }

  return true;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return true;

  // Kiểm tra domain rác (disposable domains)
  if (disposableDomains.includes(domain)) {
    return true;
  }

  // Kiểm tra thêm: domain phải có ít nhất 2 phần (ví dụ: gmail.com, not e.com)
  const domainParts = domain.split(".");
  if (
    domainParts.length < 2 ||
    domainParts[0].length < 2 ||
    domainParts[domainParts.length - 1].length < 2
  ) {
    return true; // Coi là email rác
  }

  return false;
}
