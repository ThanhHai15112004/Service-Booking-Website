import { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  Heading1, Heading2, Heading3,
  List, ListOrdered, Link as LinkIcon, Quote, Image as ImageIcon, Loader,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo2, Redo2, RemoveFormatting, Code, Minus,
  Palette, Type, Subscript, Superscript
} from 'lucide-react';
import api from '../../api/axiosClient';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  uploadEndpoint?: string; // API endpoint for upload (e.g., '/api/upload/images' or '/api/upload/image')
  uploadFieldName?: string; // Field name for upload (e.g., 'images' or 'image')
  onUploadError?: (error: string) => void; // Callback for upload errors
  uploadApi?: any; // API instance (axios instance) - if not provided, uses default api
  className?: string; // Additional CSS classes
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập mô tả...",
  minHeight = "200px",
  uploadEndpoint = '/api/upload/images',
  uploadFieldName = 'images',
  onUploadError,
  uploadApi,
  className = ''
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontSizePickerRef = useRef<HTMLDivElement>(null);

  // Import API dynamically based on uploadApi prop
  const getApi = () => {
    if (uploadApi) return uploadApi;
    // Default: import api dynamically
    return require('../../api/axiosClient').default;
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // Apply formatting commands
  const execCommand = (command: string, value: string | boolean = false) => {
    document.execCommand(command, false, value as string);
    editorRef.current?.focus();
    handleEditorChange();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrikethrough = () => execCommand('strikethrough');
  const handleHeading = (level: number) => execCommand('formatBlock', `h${level}`);
  const handleList = (ordered: boolean = false) => execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  const handleQuote = () => execCommand('formatBlock', 'blockquote');
  const handleCode = () => execCommand('formatBlock', 'pre');
  const handleHorizontalRule = () => execCommand('insertHorizontalRule');
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');
  const handleRemoveFormat = () => execCommand('removeFormat');
  const handleSubscript = () => execCommand('subscript');
  const handleSuperscript = () => execCommand('superscript');
  
  const handleAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    execCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
  };
  
  const handleFontSize = (size: string) => {
    execCommand('fontSize', '7');
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const fontElement = range.commonAncestorContainer.parentElement;
      if (fontElement && fontElement.tagName === 'FONT') {
        fontElement.style.fontSize = size;
      } else {
        const font = document.createElement('span');
        font.style.fontSize = size;
        try {
          range.surroundContents(font);
        } catch (e) {
          const contents = range.extractContents();
          font.appendChild(contents);
          range.insertNode(font);
        }
        handleEditorChange();
      }
    }
    setShowFontSizePicker(false);
  };
  
  const handleFontColor = (color: string) => {
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };
  
  const handleBackgroundColor = (color: string) => {
    execCommand('backColor', color);
    setShowColorPicker(false);
  };
  
  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#800000', '#008000',
    '#000080', '#808000', '#800080', '#008080', '#C0C0C0',
    '#808080', '#FFA500', '#FFC0CB', '#FFD700', '#ADFF2F'
  ];
  
  const fontSizes = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];
  
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

    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Chỉ chấp nhận file ảnh';
      if (onUploadError) {
        onUploadError(errorMsg);
      } else {
        alert(errorMsg);
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = 'Kích thước ảnh không được vượt quá 5MB';
      if (onUploadError) {
        onUploadError(errorMsg);
      } else {
        alert(errorMsg);
      }
      return;
    }

    setUploadingImage(true);

    try {
      const apiInstance = uploadApi || api;
      const formData = new FormData();
      formData.append(uploadFieldName, file);

      const response = await apiInstance.post(uploadEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data) {
        // Handle different response formats
        let imageUrl: string | undefined;
        if (Array.isArray(response.data.data)) {
          imageUrl = response.data.data[0]?.url || response.data.data[0]?.imageUrl;
        } else {
          imageUrl = response.data.data.url || response.data.data.imageUrl;
        }

        if (imageUrl) {
          const fullUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${imageUrl}`;
          
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const img = document.createElement('img');
            img.src = fullUrl;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '8px 0';
            img.className = 'rich-text-image';
            range.insertNode(img);
          } else if (editorRef.current) {
            const img = document.createElement('img');
            img.src = fullUrl;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.margin = '8px 0';
            img.className = 'rich-text-image';
            editorRef.current.appendChild(img);
          }
          editorRef.current?.focus();
          handleEditorChange();
        }
      } else {
        const errorMsg = response.data.message || 'Upload ảnh thất bại';
        if (onUploadError) {
          onUploadError(errorMsg);
        } else {
          alert(errorMsg);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi upload ảnh';
      if (onUploadError) {
        onUploadError(errorMsg);
      } else {
        alert(errorMsg);
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (fontSizePickerRef.current && !fontSizePickerRef.current.contains(event.target as Node)) {
        setShowFontSizePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={className}>
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
          <button
            type="button"
            onClick={() => handleHeading(3)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Tiêu đề 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Font Size */}
        <div className="relative border-r border-gray-300 pr-1">
          <button
            type="button"
            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
            className="p-2 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
            title="Cỡ chữ"
          >
            <Type className="w-4 h-4" />
            <span className="text-xs">A</span>
          </button>
          {showFontSizePicker && (
            <div
              ref={fontSizePickerRef}
              className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-2"
              style={{ width: '150px' }}
            >
              <div className="text-xs font-semibold mb-2 text-gray-700">Cỡ chữ</div>
              <div className="grid grid-cols-3 gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleFontSize(size)}
                    className="px-2 py-1 text-xs hover:bg-gray-100 rounded"
                    style={{ fontSize: size }}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Font Color & Background */}
        <div className="relative border-r border-gray-300 pr-1">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Màu chữ & Nền"
          >
            <Palette className="w-4 h-4" />
          </button>
          {showColorPicker && (
            <div
              ref={colorPickerRef}
              className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3"
              style={{ width: '250px' }}
            >
              <div className="text-xs font-semibold mb-2 text-gray-700">Màu chữ</div>
              <div className="grid grid-cols-10 gap-1 mb-3">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleFontColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="text-xs font-semibold mb-2 text-gray-700">Màu nền</div>
              <div className="grid grid-cols-10 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={`bg-${color}`}
                    type="button"
                    onClick={() => handleBackgroundColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                onChange={(e) => handleFontColor(e.target.value)}
                className="mt-2 w-full h-8 rounded border border-gray-300 cursor-pointer"
                title="Chọn màu tùy chỉnh"
              />
            </div>
          )}
        </div>
        
        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
          <button
            type="button"
            onClick={() => handleAlignment('left')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Căn trái"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignment('center')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Căn giữa"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignment('right')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Căn phải"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAlignment('justify')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Căn đều"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
        
        {/* Subscript & Superscript */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
          <button
            type="button"
            onClick={handleSubscript}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Chỉ số dưới"
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSuperscript}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Chỉ số trên"
          >
            <Superscript className="w-4 h-4" />
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
            onClick={handleCode}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Code block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleHorizontalRule}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Đường kẻ ngang"
          >
            <Minus className="w-4 h-4" />
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
        
        {/* Undo/Redo & Format */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-1">
          <button
            type="button"
            onClick={handleUndo}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRemoveFormat}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="Xóa định dạng"
          >
            <RemoveFormatting className="w-4 h-4" />
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
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleEditorChange}
        className={`w-full px-4 py-2 border-x border-b border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto ${className}`}
        style={{
          minHeight,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
        data-placeholder={placeholder}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .rich-text-image {
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
        [contenteditable] pre {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 12px;
          margin: 8px 0;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          white-space: pre;
        }
        [contenteditable] hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 16px 0;
        }
        [contenteditable] sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        [contenteditable] sup {
          vertical-align: super;
          font-size: 0.75em;
        }
      `}</style>
    </div>
  );
}

