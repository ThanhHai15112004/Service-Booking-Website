import React from 'react';
import { Baby, User, Users } from 'lucide-react';

interface HotelPoliciesDetailedProps {
  policies?: {
    checkIn?: {
      from?: string;
      to?: string;
    };
    checkOut?: {
      before?: string;
    };
    children?: string;
    cancellation?: string;
    smoking?: boolean;
    pets?: boolean;
    additionalPolicies?: Array<{
      policyName: string;
      description: string;
    }>;
  };
}

export default function HotelPoliciesDetailed({ policies }: HotelPoliciesDetailedProps) {
  if (!policies) {
    return null;
  }

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold text-black mb-4">Quy định của chỗ nghỉ</h2>
      
      {/* Children and Extra Beds */}
      {(policies.children || policies.checkIn || policies.checkOut) && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Trẻ em và giường phụ</h3>
          <p className="text-sm text-gray-700 mb-4">
            Giường phụ tùy thuộc vào loại phòng bạn chọn, xin vui lòng kiểm tra thông tin phòng để biết thêm chi tiết.
          </p>
          {policies.children && (
            <p className="text-sm text-gray-700 mb-4">{policies.children}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Infants 0-0 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Baby className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Trẻ sơ sinh 0-0 tuổi [bao gồm cả bé 0 tuổi]
                </h4>
              </div>
              <p className="text-xs text-gray-600">
                Ở miễn phí nếu sử dụng giường có sẵn.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Có thể trực tiếp yêu cầu giường cũi trẻ em từ cơ sở lưu trú. Phụ thuộc vào tình trạng thực tế.
              </p>
            </div>
            
            {/* Children 1-1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Trẻ em 1-1 tuổi [bao gồm cả bé 1 tuổi]
                </h4>
              </div>
              <p className="text-xs text-gray-600">
                Ở miễn phí nếu sử dụng giường có sẵn.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Nếu cần một giường phụ thì sẽ phụ thu thêm.
              </p>
            </div>
            
            {/* Adults 2+ */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-900">
                  Những khách từ 2 tuổi trở lên tính là người lớn
                </h4>
              </div>
              <p className="text-xs text-gray-600">
                Cần đặt thêm một giường phụ và sẽ phụ thu thêm.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Other Policies */}
      {(policies.smoking !== undefined || policies.pets !== undefined || policies.additionalPolicies) && (
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Quy định khác</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {policies.smoking !== undefined && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{policies.smoking ? 'Cho phép hút thuốc' : 'Không được phép hút thuốc'}</span>
              </li>
            )}
            {policies.pets !== undefined && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{policies.pets ? 'Được phép mang theo thú cưng' : 'Không được phép mang theo thú cưng'}</span>
              </li>
            )}
            {policies.cancellation && (
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{policies.cancellation}</span>
              </li>
            )}
            {policies.additionalPolicies?.map((policy, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{policy.description || policy.policyName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

