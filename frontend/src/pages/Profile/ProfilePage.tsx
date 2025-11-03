import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../services/profileService';
import MainLayout from '../../layouts/MainLayout';
import {
  ProfileSidebar,
  DashboardTab,
  PersonalInfoTab,
  PaymentBillingTab,
  AddressBookTab,
  MyReviewsTab,
  AccountSettingsTab,
  UpgradeAccountTab
} from '../../components/ProfilePage';
import { getMyBookings } from '../../services/bookingService';

interface ProfileData {
  account_id: string;
  username?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  provider?: string;
  statistics?: {
    total_bookings: number;
    created_count: number;
    paid_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    total_spent: number;
    last_booking_date: string | null;
  };
  recentActivity?: Array<{
    type: string;
    description: string;
    date: string;
    booking_id?: string;
  }>;
}

interface ToastProps {
  type: 'success' | 'error';
  message: string;
}

function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'personal' | 'payment' | 'address' | 'reviews' | 'upgrade' | 'settings'>('dashboard');
  const [toast, setToast] = useState<ToastProps | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  const showToast = (toastObj: ToastProps) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 3000);
  };

  // Load profile data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load profile
        const profileResponse = await getProfile();
        if (profileResponse.success) {
          setProfileData(profileResponse.data);
        } else {
          showToast({ type: 'error', message: profileResponse.message });
        }

        // Load bookings for payment billing tab
        try {
          const bookingsResponse = await getMyBookings();
          if (bookingsResponse.success && bookingsResponse.data) {
            setBookings(bookingsResponse.data);
          }
        } catch (err) {
          console.error('Error loading bookings:', err);
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Lỗi khi tải thông tin profile' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (data: any) => {
    setSaving(true);
    try {
      const response = await updateProfile(data);
      if (response.success) {
        showToast({ type: 'success', message: 'Cập nhật profile thành công!' });
        
        // Reload profile data
        const refreshResponse = await getProfile();
        if (refreshResponse.success) {
          setProfileData(refreshResponse.data);
        }
        
        // Update auth context
        if (authUser) {
          const updatedUser = { ...authUser, ...data };
          login(updatedUser, localStorage.getItem('accessToken') || '', localStorage.getItem('refreshToken') || '');
        }
      } else {
        showToast({ type: 'error', message: response.message });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Lỗi khi cập nhật profile' });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (oldPassword: string, newPassword: string) => {
    setSaving(true);
    try {
      const response = await changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });
      
      if (response.success) {
        showToast({ type: 'success', message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
        
        // Logout user sau khi đổi mật khẩu
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        showToast({ type: 'error', message: response.message });
        throw new Error(response.message);
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || 'Lỗi khi đổi mật khẩu' });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <ProfileSidebar
                activeTab={activeTab}
                onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
                user={profileData}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  user={profileData} 
                  statistics={profileData?.statistics}
                  recentActivity={profileData?.recentActivity}
                />
              )}
              
              {activeTab === 'personal' && (
                <PersonalInfoTab
                  user={profileData}
                  onUpdate={handleProfileUpdate}
                  saving={saving}
                  showToast={showToast}
                />
              )}
              
              {activeTab === 'payment' && (
                <PaymentBillingTab bookings={bookings} />
              )}
              
              {activeTab === 'address' && (
                <AddressBookTab />
              )}
              
              {activeTab === 'reviews' && (
                <MyReviewsTab />
              )}
              
              {activeTab === 'upgrade' && (
                <UpgradeAccountTab />
              )}
              
              {activeTab === 'settings' && (
                <AccountSettingsTab
                  onPasswordChange={handlePasswordChange}
                  saving={saving}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}
    </MainLayout>
  );
}

export default ProfilePage;
