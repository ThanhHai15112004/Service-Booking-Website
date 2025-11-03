import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Warehouse,
  Tags,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  icon: JSX.Element;
  path?: string;
  subItems?: { label: string; path: string }[];
}

const AdminSidebar = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin",
    },
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
    {
      id: "products",
      label: "Quản lý sản phẩm",
      icon: <Package size={20} />,
      subItems: [
        { label: "Danh sách sản phẩm", path: "/admin/products" },
        { label: "Thêm sản phẩm", path: "/admin/products/create" },
        { label: "Danh mục", path: "/admin/categories" },
      ],
    },
    {
      id: "orders",
      label: "Quản lý đơn hàng",
      icon: <ShoppingCart size={20} />,
      path: "/admin/orders",
    },
    {
      id: "inventory",
      label: "Quản lý kho",
      icon: <Warehouse size={20} />,
      subItems: [
        { label: "Tồn kho", path: "/admin/inventory" },
        { label: "Cảnh báo", path: "/admin/inventory/alerts" },
      ],
    },
    {
      id: "vouchers",
      label: "Quản lý voucher",
      icon: <Tags size={20} />,
      path: "/admin/vouchers",
    },
    {
      id: "reports",
      label: "Báo cáo",
      icon: <BarChart3 size={20} />,
      subItems: [
        { label: "Doanh thu", path: "/admin/reports/revenue" },
        { label: "Khách hàng", path: "/admin/reports/customers" },
      ],
    },
    {
      id: "blogs",
      label: "Quản lý bài viết",
      icon: <FileText size={20} />,
      path: "/admin/blogs",
    },
    {
      id: "settings",
      label: "Cài đặt",
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },
  ];

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const isParentActive = (subItems?: { path: string }[]) => {
    return subItems?.some((item) => location.pathname === item.path);
  };

  return (
    <aside className="w-64 bg-black text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-tight">PANTHERA ADMIN</h1>
      </div>

      {/* Menu */}
      <nav className="py-6">
        {menuItems.map((item) => (
          <div key={item.id} className="mb-1">
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleExpand(item.id)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-sm transition-colors duration-200 ${
                    isParentActive(item.subItems)
                      ? "bg-white text-black"
                      : "hover:bg-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {expandedItems.includes(item.id) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </button>
                {expandedItems.includes(item.id) && (
                  <div className="bg-gray-950 animate-slideDown">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`block px-14 py-2.5 text-sm transition-colors duration-200 ${
                          isActive(subItem.path)
                            ? "text-white font-medium"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.path!}
                className={`flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                  isActive(item.path!)
                    ? "bg-white text-black font-medium"
                    : "hover:bg-gray-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
