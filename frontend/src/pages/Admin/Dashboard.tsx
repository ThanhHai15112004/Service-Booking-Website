import { Users, ShoppingCart, Package, DollarSign } from "lucide-react";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  // Mock data - sau này sẽ fetch từ API
  const stats = [
    {
      title: "Customers",
      value: "3,782",
      icon: Users,
      trend: { value: "11.01%", isPositive: true },
    },
    {
      title: "Orders",
      value: "5,359",
      icon: ShoppingCart,
      trend: { value: "9.05%", isPositive: false },
    },
    {
      title: "Products",
      value: "1,234",
      icon: Package,
      trend: { value: "5.20%", isPositive: true },
    },
    {
      title: "Revenue",
      value: "$45.2K",
      icon: DollarSign,
      trend: { value: "12.50%", isPositive: true },
    },
  ];

  const monthlySalesData = [
    { month: "Jan", value: 200 },
    { month: "Feb", value: 400 },
    { month: "Mar", value: 300 },
    { month: "Apr", value: 350 },
    { month: "May", value: 250 },
    { month: "Jun", value: 320 },
    { month: "Jul", value: 380 },
    { month: "Aug", value: 150 },
    { month: "Sep", value: 280 },
    { month: "Oct", value: 420 },
    { month: "Nov", value: 360 },
    { month: "Dec", value: 200 },
  ];

  const maxValue = Math.max(...monthlySalesData.map((d) => d.value));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to Panthera Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Monthly Sales</h2>
            <button className="text-gray-400 hover:text-black transition-colors duration-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlySalesData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-black hover:bg-gray-700 transition-all duration-300 cursor-pointer relative group"
                  style={{
                    height: `${(data.value / maxValue) * 100}%`,
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    ${data.value}
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Target */}
        <div className="bg-white p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Monthly Target</h2>
            <button className="text-gray-400 hover:text-black transition-colors duration-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Target you've set for each month
          </p>

          {/* Circular Progress */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#000000"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="552.92"
                  strokeDashoffset="138.23"
                  strokeLinecap="square"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-black">75.55%</span>
                <span className="text-sm text-green-600 font-medium">+10%</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600 text-center mb-6">
            You earn $3287 today, it's higher than last month. Keep up your good
            work!
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Target</p>
              <p className="text-lg font-bold text-black">$20K</p>
              <span className="text-xs text-red-600">↓</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Revenue</p>
              <p className="text-lg font-bold text-black">$20K</p>
              <span className="text-xs text-green-600">↑</span>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Today</p>
              <p className="text-lg font-bold text-black">$20K</p>
              <span className="text-xs text-green-600">↑</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-black">Statistics</h2>
            <p className="text-sm text-gray-600">
              Target you've set for each month
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-black bg-white border border-black hover:bg-black hover:text-white transition-all duration-200">
              Monthly
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200">
              Quarterly
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200">
              Annually
            </button>
          </div>
        </div>

        {/* Simple Line Chart */}
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 1000 200">
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="1000"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Area fill */}
            <path
              d="M 0 150 Q 100 120 200 130 T 400 110 T 600 90 T 800 70 T 1000 50 L 1000 200 L 0 200 Z"
              fill="#000000"
              fillOpacity="0.05"
            />

            {/* Line */}
            <path
              d="M 0 150 Q 100 120 200 130 T 400 110 T 600 90 T 800 70 T 1000 50"
              fill="none"
              stroke="#000000"
              strokeWidth="3"
              className="animate-drawLine"
            />
          </svg>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  id: "#ORD-2024-001",
                  customer: "Nguyễn Văn A",
                  date: "2024-10-28",
                  amount: "$125.00",
                  status: "Completed",
                },
                {
                  id: "#ORD-2024-002",
                  customer: "Trần Thị B",
                  date: "2024-10-27",
                  amount: "$89.50",
                  status: "Processing",
                },
                {
                  id: "#ORD-2024-003",
                  customer: "Lê Văn C",
                  date: "2024-10-27",
                  amount: "$245.00",
                  status: "Shipped",
                },
              ].map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-black">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
