import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, List, ListOrdered, Link as LinkIcon, Quote, Image as ImageIcon, Loader } from 'lucide-react';
import api from '../../../api/axiosClient';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Nhập mô tả...",
  minHeight = "200px"
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      alert('Chỉ chấp nhận file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await api.post('/api/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success && response.data.data) {
        const imageUrl = response.data.data[0]?.url || response.data.data[0]?.imageUrl;
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
        alert(response.data.message || 'Upload ảnh thất bại');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi upload ảnh');
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

  return (
    <div>
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
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleEditorChange}
        className="w-full px-4 py-2 border-x border-b border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
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
      `}</style>
    </div>
  );
}

