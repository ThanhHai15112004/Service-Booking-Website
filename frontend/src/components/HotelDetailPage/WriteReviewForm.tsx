import { useState, useEffect, useRef } from 'react';
import { Star, X, Send, Bold, Italic, Image as ImageIcon, Loader, Underline, Heading1, Heading2, List, ListOrdered, Link as LinkIcon, Quote, Strikethrough } from 'lucide-react';
import { createReview, updateReview, uploadImage } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';

interface WriteReviewFormProps {
  hotelId: string;
  hotelName: string;
  bookingId?: string;
  reviewId?: string;
  initialRating?: number;
  initialLocationRating?: number;
  initialFacilitiesRating?: number;
  initialServiceRating?: number;
  initialCleanlinessRating?: number;
  initialValueRating?: number;
  initialTitle?: string;
  initialComment?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WriteReviewForm({ 
  hotelId, 
  hotelName, 
  bookingId, 
  reviewId,
  initialRating = 0,
  initialLocationRating = 0,
  initialFacilitiesRating = 0,
  initialServiceRating = 0,
  initialCleanlinessRating = 0,
  initialValueRating = 0,
  initialTitle = '',
  initialComment = '',
  onSuccess, 
  onCancel 
}: WriteReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(initialRating);
  const [locationRating, setLocationRating] = useState<number>(initialLocationRating);
  const [facilitiesRating, setFacilitiesRating] = useState<number>(initialFacilitiesRating);
  const [serviceRating, setServiceRating] = useState<number>(initialServiceRating);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(initialCleanlinessRating);
  const [valueRating, setValueRating] = useState<number>(initialValueRating);
  const [hoverRatings, setHoverRatings] = useState<{ [key: string]: number }>({});
  const [title, setTitle] = useState<string>(initialTitle);
  const [comment, setComment] = useState<string>(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialRating) setRating(initialRating);
    if (initialLocationRating) setLocationRating(initialLocationRating);
    if (initialFacilitiesRating) setFacilitiesRating(initialFacilitiesRating);
    if (initialServiceRating) setServiceRating(initialServiceRating);
    if (initialCleanlinessRating) setCleanlinessRating(initialCleanlinessRating);
    if (initialValueRating) setValueRating(initialValueRating);
    if (initialTitle) setTitle(initialTitle);
    if (initialComment) {
      setComment(initialComment);
      if (editorRef.current) {
        editorRef.current.innerHTML = initialComment;
      }
    }
  }, [initialRating, initialLocationRating, initialFacilitiesRating, initialServiceRating, initialCleanlinessRating, initialValueRating, initialTitle, initialComment]);

  // Format HTML từ contentEditable
  const getFormattedHTML = (): string => {
    if (editorRef.current) {
      return editorRef.current.innerHTML;
    }
    return comment;
  };

  // Apply formatting commands
  const execCommand = (command: string, value: string | boolean = false) => {
    document.execCommand(command, false, value as string);
    editorRef.current?.focus();
  };

  const handleBold = () => {
    execCommand('bold');
  };

  const handleItalic = () => {
    execCommand('italic');
  };

  const handleUnderline = () => {
    execCommand('underline');
  };

  const handleStrikethrough = () => {
    execCommand('strikethrough');
  };

  const handleHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const handleList = (ordered: boolean = false) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const handleQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const handleLink = () => {
    const url = prompt('Nhập URL liên kết:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const response = await uploadImage(file);
      if (response.success && response.data?.imageUrl) {
        const imageUrl = response.data.imageUrl.startsWith('http') 
          ? response.data.imageUrl 
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${response.data.imageUrl}`;
        
        // Insert image into editor
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.borderRadius = '8px';
          img.style.margin = '8px 0';
          img.className = 'review-image';
          range.insertNode(img);
        } else if (editorRef.current) {
          // Insert at end if no selection
          const img = document.createElement('img');
          img.src = imageUrl;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.borderRadius = '8px';
          img.style.margin = '8px 0';
          img.className = 'review-image';
          editorRef.current.appendChild(img);
        }
        editorRef.current?.focus();
      } else {
        setError(response.message || 'Upload ảnh thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setComment(editorRef.current.innerHTML);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: Phải có ít nhất 1 category rating
    const hasAnyRating = locationRating > 0 || facilitiesRating > 0 || serviceRating > 0 || 
                         cleanlinessRating > 0 || valueRating > 0 || rating > 0;
    if (!hasAnyRating) {
      setError('Vui lòng chọn đánh giá cho ít nhất một hạng mục');
      return;
    }

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    const formattedComment = getFormattedHTML();
    if (!formattedComment.trim() || formattedComment === '<br>' || formattedComment === '<div><br></div>') {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let response;
      const reviewData: any = {
        title: title.trim(),
        comment: formattedComment
      };
      
      // Add category ratings if provided
      if (locationRating > 0) reviewData.location_rating = locationRating;
      if (facilitiesRating > 0) reviewData.facilities_rating = facilitiesRating;
      if (serviceRating > 0) reviewData.service_rating = serviceRating;
      if (cleanlinessRating > 0) reviewData.cleanliness_rating = cleanlinessRating;
      if (valueRating > 0) reviewData.value_rating = valueRating;
      
      // Overall rating is optional (will be calculated from category ratings)
      if (rating > 0) reviewData.rating = rating;
      
      if (reviewId) {
        // Update existing review
        response = await updateReview(reviewId, reviewData);
      } else {
        // Create new review
        response = await createReview({
          hotel_id: hotelId,
          booking_id: bookingId || null,
          ...reviewData
        });
      }

      if (response.success) {
        if (!reviewId) {
          // Only reset if creating new review
          setRating(0);
          setLocationRating(0);
          setFacilitiesRating(0);
          setServiceRating(0);
          setCleanlinessRating(0);
          setValueRating(0);
          setTitle('');
          setComment('');
          if (editorRef.current) {
            editorRef.current.innerHTML = '';
          }
        }
        setError('');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-gray-600 text-center">
          Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để viết đánh giá
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {reviewId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá cho'} {!reviewId && hotelName}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Category Star Ratings */}
        <div className="mb-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Đánh giá chi tiết *
          </label>
          
          {/* Category Rating Component */}
          {([
            { key: 'location', label: 'Vị trí', rating: locationRating, setRating: setLocationRating },
            { key: 'facilities', label: 'Cơ sở vật chất', rating: facilitiesRating, setRating: setFacilitiesRating },
            { key: 'service', label: 'Dịch vụ', rating: serviceRating, setRating: setServiceRating },
            { key: 'cleanliness', label: 'Độ sạch sẽ', rating: cleanlinessRating, setRating: setCleanlinessRating },
            { key: 'value', label: 'Đáng giá tiền', rating: valueRating, setRating: setValueRating }
          ] as const).map(({ key, label, rating: catRating, setRating: setCatRating }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
                {label}
              </label>
              <div className="flex items-center gap-1 flex-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCatRating(star)}
                    onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [key]: star }))}
                    onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [key]: 0 }))}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRatings[key] || catRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {catRating > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    {catRating === 1 && 'Rất tệ'}
                    {catRating === 2 && 'Tệ'}
                    {catRating === 3 && 'Bình thường'}
                    {catRating === 4 && 'Tốt'}
                    {catRating === 5 && 'Rất tốt'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề đánh giá *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề đánh giá của bạn..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        {/* Comment with WYSIWYG Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá *
          </label>
          
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 p-2 border border-gray-300 rounded-t-lg bg-gray-50">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
              <button
                type="button"
                onClick={handleBold}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Chữ đậm (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleItalic}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Chữ nghiêng (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleUnderline}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Gạch chân (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleStrikethrough}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Gạch ngang"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>
            
            {/* Headings */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
              <button
                type="button"
                onClick={() => handleHeading(1)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Tiêu đề 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleHeading(2)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Tiêu đề 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Lists */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
              <button
                type="button"
                onClick={() => handleList(false)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Danh sách gạch đầu dòng"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleList(true)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Danh sách đánh số"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>
            
            {/* Other */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
              <button
                type="button"
                onClick={handleQuote}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Trích dẫn"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleLink}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Thêm liên kết"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Image */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleImageClick}
                disabled={uploadingImage}
                className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Thêm ảnh"
              >
                {uploadingImage ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* WYSIWYG Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            className="w-full min-h-[150px] px-4 py-2 border-x border-b border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
            data-placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
          />
          <style>{`
            [contenteditable][data-placeholder]:empty:before {
              content: attr(data-placeholder);
              color: #9ca3af;
              pointer-events: none;
            }
            .review-image {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
              margin: 8px 0;
            }
            [contenteditable] h1 {
              font-size: 1.5rem;
              font-weight: 700;
              margin: 12px 0 8px 0;
              line-height: 1.3;
            }
            [contenteditable] h2 {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 10px 0 6px 0;
              line-height: 1.3;
            }
            [contenteditable] h3 {
              font-size: 1.125rem;
              font-weight: 600;
              margin: 8px 0 4px 0;
              line-height: 1.3;
            }
            [contenteditable] ul,
            [contenteditable] ol {
              margin: 8px 0;
              padding-left: 24px;
            }
            [contenteditable] ul {
              list-style-type: disc;
            }
            [contenteditable] ol {
              list-style-type: decimal;
            }
            [contenteditable] li {
              margin: 4px 0;
            }
            [contenteditable] blockquote {
              border-left: 4px solid #3b82f6;
              padding-left: 16px;
              margin: 12px 0;
              font-style: italic;
              color: #6b7280;
              background-color: #f9fafb;
              padding: 12px 16px;
              border-radius: 4px;
            }
            [contenteditable] a {
              color: #2563eb;
              text-decoration: underline;
            }
            [contenteditable] a:hover {
              color: #1d4ed8;
            }
          `}</style>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || (!locationRating && !facilitiesRating && !serviceRating && !cleanlinessRating && !valueRating) || !title.trim() || !comment.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {reviewId ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
