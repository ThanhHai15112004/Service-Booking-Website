import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, KeyRound, Shield, Eye, EyeOff, AlertCircle, CheckCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { adminService } from "../../../services/adminService";
import { uploadImage } from "../../../services/profileService";
import Toast from "../../Toast";
import Loading from "../../Loading";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone_number: "",
    role: "USER" as "ADMIN" | "STAFF" | "USER",
    avatar_url: "",
  });

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 10;
  };

  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 6) {
      return { valid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
    }
    if (password.length > 50) {
      return { valid: false, message: "Mật khẩu không được vượt quá 50 ký tự" };
    }
    return { valid: true, message: "" };
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = "Họ tên không được để trống";
    } else if (form.full_name.trim().length < 2) {
      newErrors.full_name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!form.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else {
      const passwordValidation = validatePassword(form.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (form.phone_number && !validatePhone(form.phone_number)) {
      newErrors.phone_number = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast("error", "Vui lòng kiểm tra lại thông tin đã nhập");
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = form.avatar_url;

      // Upload avatar nếu có file được chọn nhưng chưa upload
      if (avatarFile && !avatarUrl) {
        const uploadResult = await uploadImage(avatarFile);
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url;
        } else {
          showToast("error", uploadResult.message || "Không thể upload ảnh đại diện");
          setLoading(false);
          return;
        }
      }

      // Tạo tài khoản
      if (form.role === "USER") {
        await adminService.createUserAccount({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone_number: form.phone_number.trim() || undefined,
          avatar_url: avatarUrl || undefined,
        });
      } else {
        await adminService.createAdminAccount({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone_number: form.phone_number.trim() || undefined,
          role: form.role,
          avatar_url: avatarUrl || undefined,
        });
      }
      showToast("success", "Tạo tài khoản thành công");
      setTimeout(() => {
        navigate("/admin/accounts");
      }, 1500);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi tạo tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: "weak" | "medium" | "strong"; color: string; text: string } => {
    if (password.length === 0) {
      return { strength: "weak", color: "text-gray-400", text: "" };
    }
    if (password.length < 6) {
      return { strength: "weak", color: "text-red-500", text: "Yếu" };
    }
    if (password.length < 10) {
      return { strength: "medium", color: "text-yellow-500", text: "Trung bình" };
    }
    return { strength: "strong", color: "text-green-500", text: "Mạnh" };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF hoặc WebP");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Lưu file để upload sau khi submit
    setAvatarFile(file);

    // Tạo preview ngay lập tức
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Xóa avatar_url cũ nếu có (vì đã chọn file mới)
    setForm({ ...form, avatar_url: "" });
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm({ ...form, avatar_url: "" });
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message={avatarFile && !form.avatar_url ? "Đang upload ảnh và tạo tài khoản..." : "Đang tạo tài khoản..."} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/accounts")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-black">Thêm tài khoản mới</h1>
          <p className="text-gray-600 mt-1">Tạo tài khoản User, Admin hoặc Staff</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-blue-600" />
                  <span>Vai trò <span className="text-red-500">*</span></span>
                </div>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "USER", label: "USER", desc: "Người dùng thông thường" },
                  { value: "STAFF", label: "STAFF", desc: "Nhân viên" },
                  { value: "ADMIN", label: "ADMIN", desc: "Quản trị viên" },
                ].map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: role.value as any })}
                    className={`p-4 border-2 rounded-lg transition-all duration-200 text-left ${
                      form.role === role.value
                        ? "border-black bg-black text-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="font-medium mb-1">{role.label}</div>
                    <div className={`text-xs ${form.role === role.value ? "text-gray-200" : "text-gray-500"}`}>
                      {role.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <User size={20} />
                Thông tin cá nhân
              </h3>

              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                        <ImageIcon className="text-gray-400" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors duration-200">
                      <Upload size={18} />
                      <span className="text-sm font-medium">
                        {avatarPreview ? "Thay đổi ảnh" : "Chọn ảnh"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, GIF hoặc WebP (tối đa 5MB). Ảnh sẽ được upload khi bấm "Tạo tài khoản"
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => {
                      setForm({ ...form, full_name: e.target.value });
                      if (errors.full_name) setErrors({ ...errors, full_name: "" });
                    }}
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.full_name ? "border-red-500" : "border-gray-300 focus:border-black"
                    }`}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.email ? "border-red-500" : "border-gray-300 focus:border-black"
                    }`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={form.phone_number}
                    onChange={(e) => {
                      setForm({ ...form, phone_number: e.target.value });
                      if (errors.phone_number) setErrors({ ...errors, phone_number: "" });
                    }}
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.phone_number ? "border-red-500" : "border-gray-300 focus:border-black"
                    }`}
                    placeholder="+84 xxx xxx xxx"
                  />
                </div>
                {errors.phone_number && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.phone_number}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Tùy chọn - Có thể để trống</p>
              </div>
            </div>

            {/* Security Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <KeyRound size={20} />
                Thông tin bảo mật
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    className={`w-full pl-12 pr-12 py-2.5 border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.password ? "border-red-500" : "border-gray-300 focus:border-black"
                    }`}
                    placeholder="Tối thiểu 6 ký tự"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.password}
                  </p>
                )}
                {form.password && !errors.password && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`text-xs ${passwordStrength.color}`}>
                      Độ mạnh: {passwordStrength.text}
                    </span>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          passwordStrength.strength === "weak"
                            ? "bg-red-500 w-1/3"
                            : passwordStrength.strength === "medium"
                            ? "bg-yellow-500 w-2/3"
                            : "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => {
                      setForm({ ...form, confirmPassword: e.target.value });
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                    }}
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:outline-none transition-colors duration-200 ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-black"
                    }`}
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.confirmPassword}
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Mật khẩu khớp
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo tài khoản"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/accounts")}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <h3 className="text-lg font-bold text-black mb-4">Thông tin tài khoản</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold rounded-full">
                      {form.full_name ? form.full_name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-black">{form.full_name || "Chưa nhập"}</p>
                    <p className="text-xs text-gray-500">{form.email || "Chưa nhập"}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Vai trò:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      form.role === "ADMIN" ? "bg-black text-white" :
                      form.role === "STAFF" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {form.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Số điện thoại:</span>
                    <span className="text-black">{form.phone_number || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Xác thực:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      Đã xác minh
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-blue-600 mt-0.5" size={16} />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Tài khoản được tạo sẽ tự động được xác thực email</li>
                      <li>Trạng thái mặc định là ACTIVE</li>
                      {form.role !== "USER" && (
                        <li className="font-medium">Chỉ ADMIN mới có quyền tạo tài khoản {form.role}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
