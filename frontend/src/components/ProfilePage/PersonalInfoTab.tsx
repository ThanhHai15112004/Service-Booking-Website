import { useState, useRef, useEffect } from 'react';
import { Save, Camera, User, Mail, Phone, Calendar, Users, Globe, Lock } from 'lucide-react';
import { uploadImage } from '../../services/profileService';

interface PersonalInfoTabProps {
  user: any;
  onUpdate: (data: any) => Promise<void>;
  saving: boolean;
  showToast?: (toast: { type: 'success' | 'error'; message: string }) => void;
}

export default function PersonalInfoTab({ user, onUpdate, saving, showToast }: PersonalInfoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.full_name?.split(' ')[0] || '',
    lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    birthday: '',
    gender: '',
    nationality: 'VN',
    language: 'vi',
    avatar_url: user?.avatar_url || ''
  });

  // Update formData when user changes
  useEffect(() => {
    setFormData({
      firstName: user?.full_name?.split(' ')[0] || '',
      lastName: user?.full_name?.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      birthday: '',
      gender: '',
      nationality: 'VN',
      language: 'vi',
      avatar_url: user?.avatar_url || ''
    });
    // Reset preview when user changes
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [user]);

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      // Reset file input if no file selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      const message = 'Kích thước ảnh không được vượt quá 5MB';
      if (showToast) {
        showToast({ type: 'error', message });
      } else {
        alert(message);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file type - chỉ cho phép JPEG, PNG, GIF, WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const mimeType = file.type.toLowerCase();
    
    // Kiểm tra cả mimetype và extension
    const isValidMimeType = allowedTypes.includes(mimeType);
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (!isValidMimeType || !isValidExtension) {
      const message = `Định dạng ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.`;
      if (showToast) {
        showToast({ type: 'error', message });
      } else {
        alert(message);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Cleanup previous preview URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Save file to upload later, and create preview
    // Use the original file object directly - don't create a new File object
    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalAvatarUrl = formData.avatar_url;
    
    // If there's a selected file, upload it first
    if (selectedFile) {
      try {
        setUploadingImage(true);
        const uploadResponse = await uploadImage(selectedFile);
        
        if (uploadResponse.success && uploadResponse.data?.imageUrl) {
          const imageUrl = uploadResponse.data.imageUrl;
          // Convert to full URL if needed
          finalAvatarUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${imageUrl}`;
          
          // Cleanup preview URL after successful upload
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setSelectedFile(null);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          const message = uploadResponse.message || 'Upload ảnh thất bại. Vui lòng thử lại.';
          if (showToast) {
            showToast({ type: 'error', message });
          } else {
            alert(message);
          }
          setUploadingImage(false);
          return;
        }
      } catch (error: any) {
        console.error('Error uploading image on submit:', error);
        // Check if error is about file format
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi upload ảnh.';
        if (errorMessage.includes('định dạng') || errorMessage.includes('JPEG') || errorMessage.includes('PNG') || errorMessage.includes('GIF') || errorMessage.includes('WebP')) {
          const message = 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn file JPG, PNG, GIF hoặc WebP.';
          if (showToast) {
            showToast({ type: 'error', message });
          } else {
            alert(message);
          }
        } else {
          const message = 'Có lỗi xảy ra khi upload ảnh. Vui lòng thử lại.';
          if (showToast) {
            showToast({ type: 'error', message });
          } else {
            alert(message);
          }
        }
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }
    
    // Update profile with all data including avatar URL
    await onUpdate({
      full_name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone_number: formData.phone_number,
      avatar_url: finalAvatarUrl
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            Đang lưu thay đổi
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-300"
              />
            ) : formData.avatar_url ? (
              <img
                src={formData.avatar_url}
                alt={user?.full_name || 'Avatar'}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-gray-200">
                <User className="w-12 h-12 text-white" />
              </div>
            )}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadingImage || saving}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-4 border-white hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Ảnh đại diện</p>
            <p className="text-xs text-gray-500">
              {selectedFile 
                ? `Đã chọn: ${selectedFile.name}. Nhấn "Lưu thay đổi" để upload.`
                : 'JPG, PNG hoặc GIF. Tối đa 5MB.'}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Địa chỉ email
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Số điện thoại
            </label>
            <div className="flex gap-2">
              <select 
                className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue="+84"
              >
                <option value="+84">+84</option>
                <option value="+1">+1</option>
                <option value="+880">+880</option>
              </select>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1681 788 203"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày sinh
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Giới tính
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Quốc tịch
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="VN">Việt Nam</option>
              <option value="US">United States</option>
              <option value="BD">Bangladesh</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Ngôn ngữ ưa thích
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang upload ảnh...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            <strong>Bảo mật:</strong> Thông tin của bạn sẽ được bảo mật tuyệt đối và chỉ được sử dụng để cải thiện trải nghiệm dịch vụ.
          </p>
        </div>
      </div>
    </div>
  );
}

