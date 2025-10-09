export function validateRegisterInput(
    full_name: string,
    email: string,
    password: string,
    phone_number: string
): string | null {
    //kiểm tra full_name
    if (!full_name || full_name.trim().length < 2) {
        return "Họ và tên phải có ít nhất 2 ký tự.";
    }

    //kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Email không hợp lệ.";
    }

    //kiểm tra password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if(!passwordRegex.test(password)) {
        return "Mật khẩu phải có ít nhất 8 ký tự.";
    }

    //kiểm tra phone_number
    if(phone_number && !/^\d{9,15}$/.test(phone_number)) {
        return "Số điện thoại phải có ít nhất 9 đến 15 chữ số.";
    }

    //nếu tất cả hợp lệ, trả về null
    return null;
}