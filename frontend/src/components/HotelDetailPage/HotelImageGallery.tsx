interface HotelImageGalleryProps {
  images: string[];
  hotelName: string;
  selectedImage: number;
  onSelectImage: (index: number) => void;
}

export default function HotelImageGallery({
  images,
  hotelName,
  selectedImage,
  onSelectImage
}: HotelImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-8">
      <div className="lg:col-span-3">
        <img
          src={images[selectedImage]}
          alt={hotelName}
          className="w-full h-96 object-cover rounded-lg"
        />
      </div>
      <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
        {images.slice(0, 4).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`${hotelName} ${index + 1}`}
            onClick={() => onSelectImage(index)}
            className={`w-full h-20 lg:h-24 object-cover rounded-lg cursor-pointer ${
              selectedImage === index ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'
            } transition-opacity`}
          />
        ))}
      </div>
    </div>
  );
}

