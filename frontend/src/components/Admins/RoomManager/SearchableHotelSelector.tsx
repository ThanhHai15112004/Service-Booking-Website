import { useState, useEffect, useRef } from "react";
import { Building2, Search, ChevronDown, X } from "lucide-react";
import { adminService } from "../../../services/adminService";

interface Hotel {
  hotel_id: string;
  name: string;
}

interface SearchableHotelSelectorProps {
  value?: string;
  onChange: (hotelId: string) => void;
  placeholder?: string;
  className?: string;
}

const STORAGE_KEY = "selected_hotel_id";

const SearchableHotelSelector = ({
  value,
  onChange,
  placeholder = "Tìm kiếm hoặc chọn khách sạn...",
  className = "",
}: SearchableHotelSelectorProps) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHotelId = localStorage.getItem(STORAGE_KEY);
    if (savedHotelId && !value) {
      onChange(savedHotelId);
    }
  }, []);

  // Save to localStorage when value changes
  useEffect(() => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [value]);

  // Fetch hotels
  useEffect(() => {
    fetchHotels();
  }, []);

  // Filter hotels based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hotel.hotel_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHotels(filtered);
    }
  }, [searchTerm, hotels]);

  // Set selected hotel when value changes
  useEffect(() => {
    if (value && hotels.length > 0) {
      const hotel = hotels.find((h) => h.hotel_id === value);
      if (hotel) {
        setSelectedHotel(hotel);
        setSearchTerm(hotel.name);
      }
    } else {
      setSelectedHotel(null);
      setSearchTerm("");
    }
  }, [value, hotels]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to selected hotel name if dropdown closes
        if (selectedHotel) {
          setSearchTerm(selectedHotel.name);
        } else {
          setSearchTerm("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedHotel]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotels({ limit: 1000 });
      if (response.success && response.data) {
        const hotelList = response.data.hotels.map((h: any) => ({
          hotel_id: h.hotel_id,
          name: h.name,
        }));
        setHotels(hotelList);
        setFilteredHotels(hotelList);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setSearchTerm(hotel.name);
    onChange(hotel.hotel_id);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedHotel(null);
    setSearchTerm("");
    onChange("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          <Building2 className="text-gray-400" size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full pl-11 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium bg-white"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {selectedHotel && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Xóa lựa chọn"
            >
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${isOpen ? "transform rotate-180" : ""}`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : filteredHotels.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm.trim() ? "Không tìm thấy khách sạn nào" : "Không có khách sạn nào"}
            </div>
          ) : (
            <div className="py-2">
              {filteredHotels.map((hotel) => (
                <button
                  key={hotel.hotel_id}
                  onClick={() => handleSelect(hotel)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    selectedHotel?.hotel_id === hotel.hotel_id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2
                      size={18}
                      className={selectedHotel?.hotel_id === hotel.hotel_id ? "text-blue-600" : "text-gray-400"}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${selectedHotel?.hotel_id === hotel.hotel_id ? "text-blue-900" : "text-gray-900"}`}>
                        {hotel.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">ID: {hotel.hotel_id}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          {filteredHotels.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500 bg-gray-50">
              Hiển thị {filteredHotels.length} / {hotels.length} khách sạn
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableHotelSelector;

