import { ChevronDown, Plane, Bed, Ticket } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-3 left-1 rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
      {children}
    </span>
  );
}

export default function Navigation() {
  return (
    <nav className="relative hidden md:block">
      <ul className="flex items-center gap-6 text-[15px]">
        <li className="relative">
          <Badge>Mới!</Badge>
           <a href="/hotel" className="flex items-center gap-1.5 hover:text-gray-700">
            <Bed className="h-4 w-4" />
            <span>Khách sạn</span>
            <ChevronDown className="h-4 w-4" />
          </a>
        </li>

        <li className="relative">
          <Badge>Đặt gói để tiết kiệm!</Badge>
         <a href="#" className="flex items-center gap-1.5 hover:text-gray-700">
            <Plane className="h-4 w-4" />
            <span>Máy bay + K.sạn</span>
          </a>
        </li>

        <li>
          <a href="#" className="flex items-center gap-1.5 hover:text-gray-700">
            <Bed className="h-4 w-4" />
            <span>Chỗ ở</span>
          </a>
        </li>

        <li>
          <a href="#" className="flex items-center gap-1.5 hover:text-gray-700">
            <Ticket className="h-4 w-4" />
            <span>Phiếu giảm giá và ưu đãi</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
