import disposableDomains from "disposable-email-domains";

export function validateRegisterInput(
    full_name: string,
    email: string,
    password: string,
    phone_number: string
): string | null {
    // 🟢 Kiểm tra họ và tên
    if (!full_name || full_name.trim().length < 2) {
        return "Họ và tên phải có ít nhất 2 ký tự.";
    }

    // 🟢 Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Email không hợp lệ.";
    }

    // 🟢 Kiểm tra domain email tạm thời (chống email rác)
    const domain = email.split("@")[1].toLowerCase();
    if (disposableDomains.includes(domain)) {
        return "Không chấp nhận email tạm thời hoặc email rác.";
    }

    // 🟢 Kiểm tra mật khẩu
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        return "Mật khẩu phải có ít nhất 8 ký tự và bao gồm cả chữ và số.";
    }

    // 🟢 Kiểm tra số điện thoại
    if (phone_number && !/^\d{9,15}$/.test(phone_number)) {
        return "Số điện thoại phải có ít nhất 9 đến 15 chữ số.";
    }

    // ✅ Tất cả hợp lệ
    return null;
}
