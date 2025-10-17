import { Users } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';


interface RoomGuestPickerProps {
  guests: number;
  rooms: number;
  childrenCount: number;
  onChange: (guests: number, rooms: number, children: number) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}


export default function RoomGuestPicker(props: RoomGuestPickerProps) {
  const { guests, rooms, childrenCount, onChange, open: controlledOpen, setOpen: controlledSetOpen } = props;
  const [internalOpen, internalSetOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledSetOpen !== undefined ? controlledSetOpen : internalSetOpen;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handle);
    }
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)}></div>}
      
      <div className="relative w-full" ref={ref}>
        <div
          className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer min-w-[180px]"
          onClick={() => setOpen(true)}
        >
          <Users className="w-5 h-5 text-gray-400 mr-2" />
          <div className="flex flex-col flex-1">
            <span className="text-sm text-black font-medium">{guests} người lớn</span>
            <span className="text-xs text-gray-500">{rooms} phòng, {childrenCount} trẻ em</span>
          </div>
        </div>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-2 md:left-0 md:right-auto bg-white rounded-lg shadow-lg p-3 md:p-4 z-50 w-full md:w-[260px]">
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-gray-700">Phòng</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="w-7 md:w-8 h-7 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-base hover:border-blue-600 hover:text-blue-600 transition-colors" onClick={() => onChange(guests, Math.max(1, rooms - 1), childrenCount)}>-</button>
                  <span className="w-6 md:w-8 text-center text-sm md:text-base font-medium">{rooms}</span>
                  <button type="button" className="w-7 md:w-8 h-7 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-base hover:border-blue-600 hover:text-blue-600 transition-colors" onClick={() => onChange(guests, rooms + 1, childrenCount)}>+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-gray-700">Người lớn</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="w-7 md:w-8 h-7 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-base hover:border-blue-600 hover:text-blue-600 transition-colors" onClick={() => onChange(Math.max(1, guests - 1), rooms, childrenCount)}>-</button>
                  <span className="w-6 md:w-8 text-center text-sm md:text-base font-medium">{guests}</span>
                  <button type="button" className="w-7 md:w-8 h-7 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-base hover:border-blue-600 hover:text-blue-600 transition-colors" onClick={() => onChange(guests + 1, rooms, childrenCount)}>+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-gray-700">Trẻ em</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="w-7 md:w-8 h-7 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-base hover:border-blue-600 hover:text-blue-600 transition-colors" onClick={() => onChange(guests, rooms, Math.max(0, childrenCount - 1))}>-</button>
                  <span className="w-6 md:w-8 text-center text-sm md:text-base font-medium">{childrenCount}</span>
                  <button type="button" className="w-7 md:w-8 h-7 md:h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-base hover:border-blue-600 hover:text-blue-600 transition-colors" onClick={() => onChange(guests, rooms, childrenCount + 1)}>+</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
