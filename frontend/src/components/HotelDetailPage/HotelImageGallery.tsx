import { useState } from 'react';
import { Camera, Grid3x3, ChevronLeft, ChevronRight } from 'lucide-react';

interface HotelImageGalleryProps {
  images: string[];
  hotelName: string;
  // TODO: When backend supports image categorization, add:
  // imageCategories?: Array<{ category: ImageCategory; count: number; label: string }>;
}

type ImageCategory = 'all' | 'hotel' | 'room' | 'facilities' | 'nearby' | 'other';

// TODO: Future enhancement - when backend supports categorized images:
// interface CategorizedImage {
//   url: string;
//   category: ImageCategory;
//   alt?: string;
// }

export default function HotelImageGallery({
  images,
  hotelName
}: HotelImageGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<ImageCategory>('all'); // Default to 'all'
  const [showGridView, setShowGridView] = useState(false);
  
  // Safety check for empty images
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg h-[400px] mb-6 flex items-center justify-center">
        <p className="text-gray-500">Không có ảnh</p>
      </div>
    );
  }
  
  const displayImages = images.slice(0, 5);

  // Image categories from backend (TODO: will be dynamic when backend supports it)
  // For now, categories will be empty array - only show when real data is available
  const categories: Array<{ key: ImageCategory; label: string; count: number }> = [];
  
  // Example of what backend should return:
  // const categories = [
  //   { key: 'hotel', label: 'Khách sạn', count: 10 },
  //   { key: 'room', label: 'Phòng', count: 20 },
  //   { key: 'facilities', label: 'Cơ sở vật chất', count: 5 },
  // ];

  const goToNext = () => {
    if (selectedPhotoIndex < images.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setShowAllPhotos(false);
  };

  if (showAllPhotos) {
    if (showGridView) {
      // Grid View
      return (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center overflow-y-auto p-4" 
          onKeyDown={handleKeyDown} 
          tabIndex={0}
          onClick={(e) => {
            // Close modal when clicking on backdrop
            if (e.target === e.currentTarget) {
              setShowAllPhotos(false);
            }
          }}
        >
          <div className="w-full max-w-[1200px]  bg-white rounded-lg shadow-2xl my-8">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm rounded-t-lg">
              <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Tabs */}
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => setShowGridView(false)}
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap flex items-center gap-2"
                    >
                      <Grid3x3 className="w-4 h-4" />
                      Thư viện
                    </button>
                    
                    {/* Always show "All" tab */}
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeCategory === 'all'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-700 hover:text-blue-600'
                      }`}
                    >
                      Tất cả ({images.length})
                    </button>
                    
                    {/* Only show categories if backend provides them */}
                    {categories.length > 0 && categories.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                          activeCategory === cat.key
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={() => setShowAllPhotos(false)}
                    className="text-gray-600 hover:text-gray-900 text-3xl font-light leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Grid Content */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => {
                      setSelectedPhotoIndex(index);
                      setShowGridView(false);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${hotelName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Slideshow View (Agoda style)
    return (
      <div 
        className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4" 
        onKeyDown={handleKeyDown} 
        tabIndex={0}
        onClick={(e) => {
          // Close modal when clicking on backdrop
          if (e.target === e.currentTarget) {
            setShowAllPhotos(false);
          }
        }}
      >
        <div className="w-full max-w-[1000px] bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header with Tabs */}
          <div className="flex-shrink-0 bg-white border-b rounded-t-lg">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                {/* Tabs */}
                <div className="flex gap-3 items-center overflow-x-auto">
                  <button
                    onClick={() => setShowGridView(true)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap flex items-center gap-2 border border-gray-300 rounded"
                  >
                    <Grid3x3 className="w-4 h-4" />
                    Thư viện
                  </button>
                  
                  {/* Always show "All" tab */}
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded transition-colors ${
                      activeCategory === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Tất cả ({images.length})
                  </button>
                  
                  {/* Only show categories if backend provides them */}
                  {categories.length > 0 && categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`px-3 py-2 text-sm font-medium whitespace-nowrap rounded transition-colors ${
                        activeCategory === cat.key
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
                
                {/* Close button */}
                <button
                  onClick={() => setShowAllPhotos(false)}
                  className="text-gray-600 hover:text-gray-900 text-3xl font-light leading-none ml-4"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full bg-gray-200 flex items-center justify-center px-4 py-6 relative">
              {/* Main Image */}
              <img
                src={images[selectedPhotoIndex]}
                alt={`${hotelName} ${selectedPhotoIndex + 1}`}
                className="max-h-[50vh] max-w-full object-contain"
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-8 right-8 bg-slate-800 bg-opacity-90 text-white px-3 py-1 rounded text-sm font-medium">
                {selectedPhotoIndex + 1}/{images.length}
              </div>

              {/* Navigation Arrows */}
              {selectedPhotoIndex > 0 && (
                <button
                  onClick={goToPrev}
                  className="absolute left-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 shadow-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {selectedPhotoIndex < images.length - 1 && (
                <button
                  onClick={goToNext}
                  className="absolute right-4 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-3 shadow-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </div>

          {/* Thumbnails Strip at Bottom */}
          <div className="flex-shrink-0 bg-white border-t rounded-b-lg">
            <div className="px-6 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setShowGridView(true)}
                className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Grid3x3 className="w-6 h-6 text-gray-600" />
              </button>
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className={`flex-shrink-0 transition-all ${
                    selectedPhotoIndex === index
                      ? 'ring-2 ring-blue-600 scale-105'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${hotelName} ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 h-[400px] mb-6">
      {/* Main large image - left side */}
      <div className="col-span-2 row-span-2">
        <img
          src={displayImages[0]}
          alt={hotelName}
          className="w-full h-full object-cover rounded-l-lg cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => setShowAllPhotos(true)}
        />
      </div>

      {/* Right side - 4 smaller images in 2x2 grid */}
      {displayImages.slice(1, 5).map((img, index) => (
        <div key={index} className="relative">
          <img
            src={img}
            alt={`${hotelName} ${index + 2}`}
            className={`w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity ${
              index === 1 ? 'rounded-tr-lg' : index === 3 ? 'rounded-br-lg' : ''
            }`}
            onClick={() => setShowAllPhotos(true)}
          />
          
          {/* "View all photos" overlay on last image */}
          {index === 3 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="absolute inset-0 bg-black bg-opacity-50 hover:bg-opacity-60 transition-all rounded-br-lg flex flex-col items-center justify-center text-white"
            >
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-sm font-semibold">
                Xem tất cả {images.length} ảnh
              </span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

