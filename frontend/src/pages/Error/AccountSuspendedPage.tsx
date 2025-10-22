import React from 'react';
import { Shield, Mail, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

const AccountSuspendedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tài khoản bị khóa
            </h1>
            
            <p className="text-gray-600 mb-6">
              Tài khoản của bạn đã bị khóa hoặc xóa. Vui lòng liên hệ với bộ phận hỗ trợ để được hỗ trợ.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/contact')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Liên hệ hỗ trợ
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSuspendedPage;
