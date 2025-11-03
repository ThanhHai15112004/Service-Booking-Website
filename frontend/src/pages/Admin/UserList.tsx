import { useState } from "react";
import { Search, Plus, Edit, Trash2, Mail, Phone } from "lucide-react";

const UserList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const users = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      phone: "0901234567",
      role: "Customer",
      status: "Active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@example.com",
      phone: "0912345678",
      role: "Customer",
      status: "Active",
      joinDate: "2024-02-20",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@example.com",
      phone: "0923456789",
      role: "Admin",
      status: "Active",
      joinDate: "2023-12-01",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Quản lý người dùng</h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin và quyền hạn người dùng
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors duration-200">
          <Plus size={20} />
          <span className="font-medium">Thêm người dùng</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200"
            />
          </div>
          <select className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200">
            <option value="">Tất cả vai trò</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <select className="px-4 py-2.5 border border-gray-300 focus:outline-none focus:border-black transition-colors duration-200">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-4">Người dùng</th>
              <th className="px-6 py-4">Liên hệ</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">ID: #{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <span>{user.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs font-medium ${
                      user.role === "Admin"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.joinDate}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 transition-colors duration-200">
                      <Edit size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 transition-colors duration-200">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white p-4 border border-gray-200">
        <p className="text-sm text-gray-600">
          Hiển thị <span className="font-medium">1-3</span> của{" "}
          <span className="font-medium">3</span> người dùng
        </p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
            Previous
          </button>
          <button className="px-4 py-2 bg-black text-white text-sm font-medium">
            1
          </button>
          <button className="px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserList;
