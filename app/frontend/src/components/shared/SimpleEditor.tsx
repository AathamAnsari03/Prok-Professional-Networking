import React, { useState, useRef, useEffect } from 'react';

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your post...',
  className = '',
  readOnly = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak', false);
    }
  };

  const toggleBold = () => document.execCommand('bold', false);
  const toggleItalic = () => document.execCommand('italic', false);
  const toggleUnderline = () => document.execCommand('underline', false);
  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  return (
    <div className={`border rounded-lg ${isFocused ? 'ring-2 ring-blue-500' : 'border-gray-300'} ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-200 p-2 bg-gray-50 rounded-t-lg flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleBold}
            className="px-2 py-1 text-sm font-semibold hover:bg-gray-200 rounded"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={toggleItalic}
            className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={toggleUnderline}
            className="px-2 py-1 text-sm underline hover:bg-gray-200 rounded"
            title="Underline"
          >
            U
          </button>
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            type="button"
            onClick={insertLink}
            className="px-2 py-1 text-sm text-blue-600 hover:bg-gray-200 rounded"
            title="Insert Link"
          >
            🔗
          </button>
        </div>
      )}
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-3 min-h-[120px] outline-none ${
          readOnly ? 'bg-gray-50' : 'bg-white'
        } ${!value && !isFocused ? 'text-gray-400' : 'text-gray-900'}`}
        data-placeholder={placeholder}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      />
    </div>
  );
};

export default SimpleEditor; 