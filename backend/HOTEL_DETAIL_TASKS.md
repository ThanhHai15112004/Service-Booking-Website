# 🚀 HOTEL DETAIL PAGE - IMPLEMENTATION TASKS

> **Based on:** HOTEL_DETAIL_PAGE_ANALYSIS.md
> **Priority:** P0 = Must have, P1 = Should have, P2 = Nice to have

---

## 📋 TASK ORGANIZATION

### **PHASE 1: Core Infrastructure** ⏱️ 2-3 days

#### **Task 1.1: Setup Base Components** [P0] ✅ COMPLETED

**Files created:**
- `frontend/src/pages/Clients/HotelDetailPage.tsx` ✅ (enhanced with new layout)
- `frontend/src/components/HotelDetailPage/index.ts` ✅

**Sub-components:**
- [x] `HotelHeader.tsx` ✅
- [x] `HotelImageGallery.tsx` ✅
- [x] `HotelInfo.tsx` ✅
- [x] `HotelAmenities.tsx` ✅
- [x] `HotelPolicies.tsx` ✅
- [x] `BookingCard.tsx` ✅
- [x] `StickyTabNav.tsx` ✅ NEW - Created with scroll spy & smooth scroll
- [x] `Breadcrumb.tsx` ✅ NEW - Created with link navigation
- [x] `HotelHighlights.tsx` ✅ NEW - Created with icon support

**Implementation Details:**

**1. Breadcrumb Component:**
- Responsive navigation path
- Dynamic count badges
- Link integration with React Router
- ChevronRight separator icons

**2. HotelHighlights Component:**
- Grid layout (3 columns on desktop)
- Icon mapping system (Lucide icons)
- Tooltip support
- Hover effects

**3. StickyTabNav Component:**
- Sticky positioning on scroll
- Intersection Observer for scroll spy
- Smooth scroll to sections
- Active tab highlighting
- Mobile horizontal scroll

**4. Updated HotelDetailPage Layout:**
- Added Breadcrumb at top
- Implemented StickyTabNav
- Organized content into sections with IDs:
  - `overview` - Highlights + Info
  - `rooms` - Room selection (placeholder)
  - `facilities` - Amenities
  - `location` - Map (placeholder)
  - `policies` - Hotel policies
- Scroll margin for proper sticky nav offset

**Note:** TS linter may show import errors until TypeScript server restarts. Run `Reload Window` in VS Code if needed.

---

#### **Task 1.2: API Integration - Hotel Detail** [P0]
**Backend endpoint:** `GET /api/hotels/:hotelId`

**Current status:** ✅ API exists

**Enhancements needed:**
1. Add `highlights` field to response
2. Add `badges` array
3. Ensure all images are returned
4. Add structured policies

**Backend files to modify:**
- `backend/src/Repository/Hotel/hotel.repository.ts`
- `backend/src/services/Hotel/hotel.service.ts`

**Update hotel model:**
```typescript
interface HotelDetailResponse {
  hotel: {
    // ... existing fields
    highlights: Highlight[];
    badges: Badge[];
    policies: {
      checkIn: {
        from: string; // "14:00"
        to: string;
      };
      checkOut: {
        before: string; // "12:00"
      };
      children: ChildPolicy[];
      cancellation: CancellationPolicy;
      smoking: boolean;
      pets: boolean;
    };
  };
  availableRooms: Room[];
  searchParams: SearchParams;
}
```

---

### **PHASE 2: Room Selection Section** ⏱️ 3-4 days

#### **Task 2.1: Room Filters Component** [P0] ✅ COMPLETED

**File:** ✅ `frontend/src/components/HotelDetailPage/RoomFilters.tsx`

**Implemented Features:**
- ✅ Filter chips với count badges
- ✅ Multi-select functionality  
- ✅ Active/inactive/disabled state styling
- ✅ Clear all filters button
- ✅ Active filters summary display
- ✅ Accessibility support (disabled state when count=0)

**Interface:**
```typescript
export interface RoomFiltersState {
  noSmoking: boolean;
  payLater: boolean;
  freeCancellation: boolean;
  breakfast: boolean;
  kingBed: boolean;
  cityView: boolean;
  noCreditCard: boolean;
}

interface RoomFiltersProps {
  filters: RoomFiltersState;
  filterCounts?: Partial<Record<keyof RoomFiltersState, number>>;
  onFilterChange: (filters: RoomFiltersState) => void;
  totalRooms?: number;
}
```

**Filter Options with Icons:**
- 🚭 Không hút thuốc (Ban icon)
- 💳 Thanh toán sau (CreditCard icon)
- 📅 Hủy miễn phí (Calendar icon)
- ☕ Bao gồm bữa sáng (Coffee icon)
- 🛏️ Giường King (Bed icon)
- 👁️ Nhìn ra thành phố (Eye icon)
- 💳 Không cần thẻ tín dụng (CreditCard icon)

**Component Features:**
1. **Smart Chip States:**
   - Active (selected): Blue background, white text, shadow
   - Inactive: White background, gray text, hover effect
   - Disabled: Gray background, no hover (when count=0)

2. **Count Badges:**
   - Displays number of matching rooms
   - Auto-hidden when undefined or 0
   - Different styling for active/inactive

3. **Clear Button:**
   - Shows when any filter is active
   - Displays active filter count
   - One-click to reset all

4. **Active Summary:**
   - Blue banner showing active filter names
   - Auto-shows when filters applied

**Usage in HotelDetailPage:**
```tsx
const [roomFilters, setRoomFilters] = useState<RoomFiltersState>({
  noSmoking: false,
  payLater: false,
  freeCancellation: false,
  breakfast: false,
  kingBed: false,
  cityView: false,
  noCreditCard: false
});

<RoomFilters
  filters={roomFilters}
  onFilterChange={setRoomFilters}
  totalRooms={availableRooms.length}
  filterCounts={{
    noSmoking: 5,
    payLater: 8,
    freeCancellation: 10
  }}
/>
```

**Files Modified:**
- ✅ `frontend/src/components/HotelDetailPage/RoomFilters.tsx` (created)
- ✅ `frontend/src/components/HotelDetailPage/index.ts` (added exports)
- ✅ `frontend/src/pages/Clients/HotelDetailPage.tsx` (integrated)

---

#### **Task 2.2: Room Card Component** [P0]
**File:** `frontend/src/components/HotelDetailPage/RoomCard.tsx`

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ [Image] [Thumbnails]  │  Policies List  │  Price & CTA    │
│ Room Name             │  ✓ Breakfast    │  👤👤           │
│ Room Info             │  ✓ Free Cancel  │  Price Info     │
│ "Xem chi tiết"        │  ✓ WiFi         │  [Qty] [Book]   │
└────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface RoomCardProps {
  room: Room;
  onBook: (roomId: string, quantity: number) => void;
  searchParams: SearchParams;
}
```

**Sub-components:**
- `<RoomGallery />` - Images
- `<RoomInfo />` - Name, size, bed type
- `<RoomPolicies />` - Policy icons list
- `<RoomPricing />` - Price display + CTA

---

#### **Task 2.3: Room List Logic** [P0]
**File:** `frontend/src/components/HotelDetailPage/RoomList.tsx`

**Features:**
- Filter rooms based on selected criteria
- Sort by price (low to high, high to low)
- Show filtered count
- Empty state when no rooms match

**Logic:**
```typescript
const filteredRooms = useMemo(() => {
  return rooms.filter(room => {
    if (filters.noSmoking && room.policies.smokingAllowed) return false;
    if (filters.breakfast && !room.policies.breakfast) return false;
    // ... more filters
    return true;
  });
}, [rooms, filters]);
```

---

### **PHASE 3: Advanced Features** ⏱️ 3-4 days

#### **Task 3.1: Sticky Tab Navigation** [P0]
**File:** `frontend/src/components/HotelDetailPage/StickyTabNav.tsx`

**Features:**
- Sticky on scroll
- Smooth scroll to sections
- Active tab highlighting
- Scroll spy

**Sections:**
```typescript
const sections = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'rooms', label: 'Phòng nghỉ' },
  { id: 'things-to-do', label: 'Làm gì đi đâu' },
  { id: 'facilities', label: 'Cơ sở vật chất' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'location', label: 'Vị trí' },
  { id: 'policies', label: 'Chính sách' },
];
```

**Implementation:**
```tsx
const StickyTabNav = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Intersection Observer for scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );
    
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <nav className="sticky top-0 z-40 bg-white border-b">
      {sections.map(section => (
        <TabItem 
          key={section.id}
          active={activeTab === section.id}
          onClick={() => scrollToSection(section.id)}
        >
          {section.label}
        </TabItem>
      ))}
    </nav>
  );
};
```

---

#### **Task 3.2: Image Gallery with Lightbox** [P1]
**File:** `frontend/src/components/HotelDetailPage/ImageGallery.tsx`

**Enhancements needed:**
- Lightbox modal
- Image navigation (prev/next)
- Thumbnail strip in lightbox
- Keyboard navigation (arrow keys, ESC)
- Swipe gestures (mobile)
- Image counter (1/25)

**Libraries to use:**
- `react-image-lightbox` or
- `yet-another-react-lightbox`

**Implementation:**
```tsx
const ImageGallery = ({ images }: { images: Image[] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {/* Main image */}
        <div 
          className="col-span-1 cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img src={images[0].imageUrl} alt="Main" />
        </div>
        
        {/* Thumbnails grid */}
        <div className="grid grid-cols-2 gap-2">
          {images.slice(1, 5).map((img, idx) => (
            <img 
              key={idx}
              src={img.imageUrl}
              onClick={() => openLightbox(idx + 1)}
            />
          ))}
          
          {/* View all button */}
          <button onClick={() => openLightbox(0)}>
            Xem mọi bức ảnh
          </button>
        </div>
      </div>
      
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentIndex}
        />
      )}
    </>
  );
};
```

---

#### **Task 3.3: Location Section with Map** [P1]
**File:** `frontend/src/components/HotelDetailPage/LocationSection.tsx`

**Components:**
- `<InteractiveMap />` - Google Maps
- `<NearbyPlaces />` - Categorized POIs list

**Backend API:**
```
GET /api/hotels/:hotelId/nearby-places
```

**Backend implementation:**
```sql
-- Query to get nearby places
SELECT 
  poi.name,
  poi.category,
  poi.latitude,
  poi.longitude,
  ST_Distance_Sphere(
    point(h.longitude, h.latitude),
    point(poi.longitude, poi.latitude)
  ) / 1000 as distance_km
FROM point_of_interest poi
CROSS JOIN hotel h
WHERE h.hotel_id = ?
  AND ST_Distance_Sphere(...) < 50000 -- 50km radius
ORDER BY category, distance_km
LIMIT 100
```

**Frontend integration:**
```tsx
const LocationSection = ({ hotelId }: Props) => {
  const { data: locationData } = useQuery(
    ['hotel-location', hotelId],
    () => api.get(`/api/hotels/${hotelId}/nearby-places`)
  );
  
  return (
    <section id="location">
      <h2>Vị trí</h2>
      
      <InteractiveMap 
        center={{ lat: hotel.latitude, lng: hotel.longitude }}
        markers={locationData.nearby}
      />
      
      <NearbyCategories>
        <Category name="Sân bay lân cận">
          {locationData.airports.map(airport => (
            <PlaceItem key={airport.id} {...airport} />
          ))}
        </Category>
        {/* ... more categories */}
      </NearbyCategories>
    </section>
  );
};
```

---

#### **Task 3.4: Guest Reviews Section** [P1]
**File:** `frontend/src/components/HotelDetailPage/ReviewsSection.tsx`

**Sub-components:**
- `<ReviewTabs />` - Agoda/Booking.com/Other
- `<RatingOverview />` - Overall score + category bars
- `<ReviewFilters />` - Filter controls
- `<ReviewCard />` - Individual review
- `<Pagination />` - Page navigation

**Backend API:**
```
GET /api/hotels/:hotelId/reviews?source=agoda&page=1&limit=10&minRating=8
```

**Backend implementation:**
Create new table:
```sql
CREATE TABLE hotel_review (
  review_id VARCHAR(50) PRIMARY KEY,
  hotel_id VARCHAR(50) NOT NULL,
  source ENUM('agoda', 'booking', 'other') DEFAULT 'agoda',
  rating DECIMAL(2,1) NOT NULL,
  guest_name VARCHAR(100),
  guest_country VARCHAR(50),
  travel_type VARCHAR(50),
  room_type VARCHAR(100),
  stay_date DATE,
  review_date DATE,
  title VARCHAR(200),
  content TEXT,
  is_translated BOOLEAN DEFAULT FALSE,
  original_language VARCHAR(10),
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id),
  INDEX idx_hotel_source (hotel_id, source),
  INDEX idx_rating (rating)
);
```

**Repository method:**
```typescript
async getReviews(
  hotelId: string,
  filters: {
    source?: 'agoda' | 'booking' | 'other';
    minRating?: number;
    page?: number;
    limit?: number;
  }
): Promise<ReviewsResponse> {
  const { source, minRating, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT * FROM hotel_review
    WHERE hotel_id = ?
  `;
  const params: any[] = [hotelId];
  
  if (source) {
    sql += ` AND source = ?`;
    params.push(source);
  }
  
  if (minRating) {
    sql += ` AND rating >= ?`;
    params.push(minRating);
  }
  
  sql += ` ORDER BY review_date DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const [reviews] = await conn.query(sql, params);
  
  // Get total count
  const [countResult] = await conn.query(
    `SELECT COUNT(*) as total FROM hotel_review WHERE hotel_id = ?`,
    [hotelId]
  );
  
  return {
    reviews: reviews as Review[],
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(countResult[0].total / limit),
      totalReviews: countResult[0].total
    }
  };
}
```

**Frontend:**
```tsx
const ReviewsSection = ({ hotelId }: Props) => {
  const [activeSource, setActiveSource] = useState('agoda');
  const [filters, setFilters] = useState({ minRating: 0, page: 1 });
  
  const { data, isLoading } = useQuery(
    ['reviews', hotelId, activeSource, filters],
    () => getReviews(hotelId, { source: activeSource, ...filters })
  );
  
  return (
    <section id="reviews">
      <h2>Bài đánh giá từ khách thật</h2>
      
      <ReviewTabs 
        sources={['agoda', 'booking', 'other']}
        active={activeSource}
        onChange={setActiveSource}
      />
      
      <RatingOverview ratings={data.overview} />
      
      <ReviewFilters 
        filters={filters}
        onChange={setFilters}
      />
      
      {isLoading ? (
        <ReviewSkeleton />
      ) : (
        <>
          <ReviewList reviews={data.reviews} />
          <Pagination {...data.pagination} />
        </>
      )}
    </section>
  );
};
```

---

### **PHASE 4: Nice-to-Have Features** ⏱️ 2-3 days

#### **Task 4.1: Activities Carousel** [P2]
**File:** `frontend/src/components/HotelDetailPage/ActivitiesCarousel.tsx`

**API:**
```
GET /api/activities/nearby?hotelId=H004&city=Ho-Chi-Minh&limit=10
```

**Implementation:**
- Use `swiper` or `react-slick` for carousel
- Lazy load activity images
- Link to activity detail pages

---

#### **Task 4.2: FAQ Accordion** [P2]
**File:** `frontend/src/components/HotelDetailPage/FAQSection.tsx`

**Backend API:**
```
GET /api/hotels/:hotelId/faq
```

**Create FAQ table:**
```sql
CREATE TABLE hotel_faq (
  faq_id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
);
```

---

#### **Task 4.3: Availability Warning Banner** [P2]
**File:** `frontend/src/components/HotelDetailPage/AvailabilityWarning.tsx`

**API:**
```
GET /api/hotels/:hotelId/availability-status?date=YYYY-MM-DD
```

**Logic:**
```typescript
async getAvailabilityStatus(hotelId: string, date: string) {
  // Check recent bookings in last 24h for this city
  const sql = `
    SELECT COUNT(*) as recent_bookings
    FROM booking
    WHERE hotel_id IN (
      SELECT hotel_id FROM hotel WHERE city = (
        SELECT city FROM hotel WHERE hotel_id = ?
      )
    )
    AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `;
  
  const [result] = await conn.query(sql, [hotelId]);
  
  return {
    isPopularDate: result[0].recent_bookings > 50,
    recentBookingsCount: result[0].recent_bookings,
    message: `Các chỗ nghỉ ở ${city} đang được đặt 1 phút trước`
  };
}
```

---

#### **Task 4.4: Wishlist/Favorite** [P2]
**File:** Heart icon in image gallery

**Backend API:**
```
POST /api/wishlist
DELETE /api/wishlist/:hotelId
GET /api/wishlist (get user's wishlist)
```

**Table:**
```sql
CREATE TABLE wishlist (
  wishlist_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id VARCHAR(50) NOT NULL,
  hotel_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (account_id, hotel_id),
  FOREIGN KEY (account_id) REFERENCES account(account_id),
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
);
```

---

### **PHASE 5: Optimization & Polish** ⏱️ 2-3 days

#### **Task 5.1: Performance Optimization** [P0]
- [ ] Implement image lazy loading
- [ ] Add skeleton loaders
- [ ] Code splitting by section
- [ ] Optimize bundle size
- [ ] Add service worker for caching

#### **Task 5.2: SEO Optimization** [P1]
- [ ] Server-side rendering (SSR)
- [ ] Meta tags (title, description)
- [ ] Open Graph tags
- [ ] Schema.org structured data
- [ ] Canonical URLs

**Example structured data:**
```json
{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Valentine Hotel",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "93/1 Nguyễn Chí Thanh",
    "addressLocality": "Quận 5",
    "addressRegion": "Hồ Chí Minh",
    "postalCode": "70000",
    "addressCountry": "VN"
  },
  "starRating": {
    "@type": "Rating",
    "ratingValue": "3"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "8.1",
    "reviewCount": "763"
  },
  "priceRange": "$$"
}
```

#### **Task 5.3: Accessibility** [P1]
- [ ] Add ARIA labels
- [ ] Keyboard navigation support
- [ ] Screen reader testing
- [ ] Color contrast check
- [ ] Focus management

#### **Task 5.4: Mobile Optimization** [P0]
- [ ] Responsive layouts
- [ ] Touch-friendly controls
- [ ] Bottom sticky booking bar (mobile)
- [ ] Drawer for filters (mobile)
- [ ] Optimized image sizes

---

## 📊 TESTING CHECKLIST

### **Unit Tests:**
- [ ] Room filter logic
- [ ] Price calculations
- [ ] Date validations
- [ ] Availability checks

### **Integration Tests:**
- [ ] API calls
- [ ] Room booking flow
- [ ] Filter + sort combinations
- [ ] Review pagination

### **E2E Tests:**
- [ ] Full booking journey
- [ ] Image gallery interaction
- [ ] Filter usage
- [ ] Review submission

---

## 🎯 PRIORITY ORDER

### **Week 1:** Foundation
1. Task 1.1: Setup components ✅ (mostly done)
2. Task 1.2: API integration
3. Task 3.1: Sticky tabs
4. Task 2.2: Room cards

### **Week 2:** Core Features
1. Task 2.1: Room filters
2. Task 2.3: Room list logic
3. Task 3.3: Location section
4. Task 3.4: Reviews section

### **Week 3:** Polish & Extras
1. Task 3.2: Image gallery lightbox
2. Task 4.1-4.4: Nice-to-have features
3. Task 5.1-5.4: Optimization

---

## 📈 SUCCESS METRICS

- [ ] Page load time < 2s
- [ ] Core Web Vitals pass
- [ ] 95%+ mobile usability score
- [ ] Conversion rate >= 5%
- [ ] Bounce rate < 40%

---

## 🔗 DEPENDENCIES

**Libraries to install:**
```bash
# Frontend
npm install --save swiper react-slick yet-another-react-lightbox
npm install --save-dev @types/react-slick

# Backend
npm install --save geolib # For distance calculations
```

**External Services:**
- Google Maps API (for location map)
- Image CDN (Cloudinary/ImageKit)
- Analytics (Google Analytics 4)

---

## 📝 NOTES

1. **Data Migration:**
   - Seed reviews table with sample data
   - Import FAQ from existing docs
   - Add missing hotel images

2. **Testing Data:**
   - Create test hotels with various room types
   - Generate sample reviews
   - Add POIs for location testing

3. **Documentation:**
   - API documentation (Swagger/OpenAPI)
   - Component documentation (Storybook)
   - User guide for admin panel


