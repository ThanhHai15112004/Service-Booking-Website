import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Mail, TrendingUp, Shield, Ban, Clock, ArrowRight } from "lucide-react";
import { adminService } from "../../../services/adminService";
import Loading from "../../Loading";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface RecentAccount {
  account_id: string;
  full_name: string;
  email: string;
  created_at: string;
  avatar_url?: string | null;
}

interface DashboardStats {
  totalAccounts: number;
  totalStaffAndAdmin: number;
  verifiedEmails: number;
  bannedAccounts: number;
  monthlyRegistrations: { month: string; count: number }[];
  roleDistribution: { name: string; value: number; color: string }[];
  recentRegistrations: RecentAccount[];
  recentLogins: RecentAccount[];
  avgSpending?: number;
  bookingRate?: number;
}

const COLORS = ["#000000", "#3b82f6", "#6b7280"]; // Black, Blue, Gray

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAccounts: 0,
    totalStaffAndAdmin: 0,
    verifiedEmails: 0,
    bannedAccounts: 0,
    monthlyRegistrations: [],
    roleDistribution: [],
    recentRegistrations: [],
    recentLogins: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats();
      
      if (!response.success) {
        throw new Error("Không thể tải dữ liệu dashboard");
      }

      const { stats: dashboardStats, monthlyRegistrations, roleDistribution, recentRegistrations, recentLogins } = response.data;

      // Format monthly registrations
      const formattedMonthlyRegistrations = monthlyRegistrations.map((item: { month: string; count: number }) => {
        const [year, month] = item.month.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return {
          month: date.toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
          count: item.count,
        };
      });

      // Format role distribution for pie chart
      const formattedRoleDistribution = roleDistribution.map((item: { role: string; count: number }) => {
        let color = COLORS[2]; // Default USER
        if (item.role === "STAFF") color = COLORS[1];
        if (item.role === "ADMIN") color = COLORS[0];
        return {
          name: item.role,
          value: item.count,
          color,
        };
      });

      setStats({
        totalAccounts: dashboardStats.totalAccounts,
        totalStaffAndAdmin: dashboardStats.totalStaffAdmin,
        verifiedEmails: dashboardStats.verifiedEmails,
        bannedAccounts: dashboardStats.bannedAccounts,
        monthlyRegistrations: formattedMonthlyRegistrations,
        roleDistribution: formattedRoleDistribution,
        recentRegistrations: (recentRegistrations || []).map((item: any) => ({
          account_id: item.account_id,
          full_name: item.full_name,
          email: item.email,
          created_at: item.created_at,
          avatar_url: item.avatar_url || null,
        })),
        recentLogins: (recentLogins || []).map((item: any) => ({
          account_id: item.account_id,
          full_name: item.full_name,
          email: item.email,
          created_at: item.last_login,
          avatar_url: item.avatar_url || null,
        })),
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvatar = (account: RecentAccount) => {
    if (account.avatar_url) {
      return (
        <img
          src={account.avatar_url}
          alt={account.full_name}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-medium rounded-full text-xs">
        {account.full_name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <Loading message="Đang tải dashboard..." />;
  }

  const statCards = [
    {
      title: "Tổng số tài khoản",
      value: stats.totalAccounts.toLocaleString("vi-VN"),
      icon: <Users size={28} />,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Tổng số nhân viên & admin",
      value: stats.totalStaffAndAdmin.toLocaleString("vi-VN"),
      icon: <Shield size={28} />,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Email đã xác minh",
      value: stats.verifiedEmails.toLocaleString("vi-VN"),
      icon: <Mail size={28} />,
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Tài khoản bị khóa / banned",
      value: stats.bannedAccounts.toLocaleString("vi-VN"),
      icon: <Ban size={28} />,
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard – Tổng quan tài khoản</h1>
        <p className="text-gray-600 mt-1">Cung cấp cái nhìn tổng thể về toàn bộ hệ thống tài khoản</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <div className={`${card.color} text-white`}>{card.icon}</div>
              </div>
            </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-black">{card.value}</p>
              </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Monthly Registrations */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-black">Số lượng tài khoản đăng ký theo tháng</h2>
              <p className="text-sm text-gray-600 mt-1">12 tháng gần nhất</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyRegistrations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#000000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Role Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-black">Tỉ lệ vai trò</h2>
            <p className="text-sm text-gray-600 mt-1">User / Staff / Admin</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => {
                  const { name, value, percent } = props;
                  if (value === 0) return '';
                  return `${name}\n${value} (${(percent * 100).toFixed(1)}%)`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} tài khoản`, name]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value: string) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Metrics */}
      {(stats.avgSpending !== undefined || stats.bookingRate !== undefined) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.avgSpending !== undefined && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-600" size={24} />
                <h3 className="text-lg font-bold text-black">Trung bình chi tiêu / user</h3>
              </div>
              <p className="text-3xl font-bold text-black">
                {stats.avgSpending.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
          )}
          {stats.bookingRate !== undefined && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <UserCheck className="text-blue-600" size={24} />
                <h3 className="text-lg font-bold text-black">Tỉ lệ user đã đặt phòng</h3>
              </div>
              <p className="text-3xl font-bold text-black">
                {(stats.bookingRate * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">5 user đăng ký gần nhất</h3>
            <button
              onClick={() => navigate("/admin/accounts")}
              className="text-sm text-gray-600 hover:text-black transition-colors duration-200 flex items-center gap-1"
            >
              Xem tất cả
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Ngày đăng ký
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  stats.recentRegistrations.map((account) => (
                    <tr
                      key={account.account_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/admin/accounts/${account.account_id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getAvatar(account)}
                          <div>
                            <span className="text-sm font-medium text-black block">{account.full_name}</span>
                            <span className="text-xs text-gray-500">{account.account_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{account.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {formatDate(account.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Logins */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-black">5 user đăng nhập gần nhất</h3>
            <p className="text-xs text-gray-500 mt-1">(Cần liên kết với refresh_tokens)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Lần đăng nhập gần nhất
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentLogins.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Clock size={24} className="text-gray-400" />
                        <span>Chưa có dữ liệu đăng nhập</span>
                        <span className="text-xs">Cần liên kết với bảng refresh_tokens</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stats.recentLogins.map((account) => (
                    <tr
                      key={account.account_id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/admin/accounts/${account.account_id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getAvatar(account)}
                          <div>
                            <span className="text-sm font-medium text-black block">{account.full_name}</span>
                            <span className="text-xs text-gray-500">{account.account_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{account.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {formatDate(account.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
              </div>
            </div>
      </div>
    </div>
  );
};

export default Dashboard;
