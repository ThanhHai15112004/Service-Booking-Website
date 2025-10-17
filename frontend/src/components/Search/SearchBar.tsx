import { useState } from 'react';
import SearchTypeTabs from './SearchTypeTabs';
import SearchTab from './SearchTab';
import DateRangePicker, { FlexibleDate } from './DateRangePicker';
import RoomGuestPicker from './RoomGuestPicker';
import { Search } from 'lucide-react';


interface SearchBarProps {
  onSearch: (params: any) => void;
}


export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchType, setSearchType] = useState('hotel');
  const [tab, setTab] = useState<'overnight' | 'dayuse'>('overnight');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<string | FlexibleDate>('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState(0);
  const [roomGuestOpen, setRoomGuestOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ searchType, tab, destination, checkIn, checkOut, guests, rooms, children });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-6xl mx-auto">
      <SearchTypeTabs value={searchType} onChange={setSearchType} />
      <SearchTab value={tab} onChange={setTab} />
      
      {/* Mô tả chỗ ở trong ngày */}
      {tab === 'dayuse' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 bg-red-50 border border-red-200">
          <span className="text-red-600 text-xl">🏨</span>
          <div>
            <span className="text-red-600 font-semibold">Chỗ Ở Trong Ngày</span>
            <span className="text-gray-700 text-sm ml-1">
              là phòng cho thuê không đắt, 4-12 tiếng mà không phải qua đêm. Quý khách sẽ nhận phòng và trả phòng vào cùng một ngày.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        {/* Input điểm đến */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-2.5 md:py-3.5 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập điểm đến (ví dụ: Vũng Tàu, Đà Nẵng...)"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>

        {/* Date và Room/Guest Picker */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              tab={tab}
              onChange={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
                if (typeof ci === 'object' && ci.flexible) {
                  // Xử lý logic khi chọn lịch linh hoạt ở đây
                  // Ví dụ: console.log('Lịch linh hoạt:', ci);
                } else if (ci && co) {
                  setTimeout(() => setRoomGuestOpen(true), 350);
                }
              }}
            />
          </div>
          <div className="flex-1">
            <RoomGuestPicker
              guests={guests}
              rooms={rooms}
              childrenCount={children}
              onChange={(g, r, c) => {
                setGuests(g);
                setRooms(r);
                setChildren(c);
              }}
              open={roomGuestOpen}
              setOpen={setRoomGuestOpen}
            />
          </div>
        </div>

        {/* Nút tìm kiếm */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm font-semibold py-2.5 md:py-3 px-8 md:px-12 rounded-lg transition-colors shadow-md w-full md:w-auto"
          >
            TÌM
          </button>
        </div>
      </div>
    </form>
  );
}
