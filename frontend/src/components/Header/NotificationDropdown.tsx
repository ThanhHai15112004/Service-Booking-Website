import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);
  
  return (
    <div className="relative" ref={ref}>
      <div
        className="flex flex-col items-center justify-center gap-0 cursor-pointer hover:opacity-80"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="relative">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">5</span>
        </div>
        <span className="text-[10px] text-gray-600 whitespace-nowrap">Thông báo</span>
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 animate-fade-in">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Thông báo</div>
          <ul className="py-2 text-sm text-gray-700 max-h-60 overflow-y-auto">
            <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="font-medium">Đặt phòng thành công</div>
              <div className="text-xs text-gray-500">Bạn đã đặt phòng khách sạn ABC.</div>
            </li>
            <li className="px-4 py-2 hover:bg-gray-50 cursor-pointer">
              <div className="font-medium">Nhận ưu đãi mới</div>
              <div className="text-xs text-gray-500">Nhận ngay mã giảm giá 10% cho đơn tiếp theo.</div>
            </li>
          </ul>
          <div className="px-4 py-2 border-t text-xs text-blue-600 hover:underline cursor-pointer">Xem tất cả thông báo</div>
        </div>
      )}
    </div>
  );
}
