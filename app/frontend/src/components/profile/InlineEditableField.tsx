import React, { useState, useRef, createContext, useContext } from 'react';
import { FaPencilAlt, FaSpinner } from 'react-icons/fa';

// --- Toast Context ---
type ToastContextType = { showToast: (msg: string) => void };
const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

const useToast = () => useContext(ToastContext);

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<string | null>(null);
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  return (
    <ToastContext.Provider value={{ showToast: (msg) => setToast(msg) }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-cyan-700 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fadeIn backdrop-blur-md border border-cyan-400/40">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};

interface InlineEditableFieldProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  type?: 'text' | 'textarea';
  label?: string;
  className?: string;
  placeholder?: string;
  maxLength?: number;
}

const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  value,
  onSave,
  type = 'text',
  label,
  className = '',
  placeholder = '',
  maxLength,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { showToast } = useToast();

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (type === 'text') (inputRef.current as HTMLInputElement).select();
    }
  }, [editing, type]);

  // If value changes from parent, update local
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSave = async () => {
    if (inputValue === value) {
      setEditing(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(inputValue);
      setEditing(false);
      showToast('Profile updated successfully');
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type === 'text') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(value);
      setEditing(false);
      setError('');
    }
  };

  return (
    <div
      className={`group relative flex items-center gap-2 ${className}`}
      onMouseLeave={() => { if (!loading) setError(''); }}
    >
      {label && <span className="text-white/70 font-medium mr-2">{label}</span>}
      {editing ? (
        type === 'textarea' ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            className="w-full min-h-[60px] px-3 py-2 rounded-lg border border-cyan-400/40 bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none shadow-lg backdrop-blur-md"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={loading}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            className="w-full px-3 py-2 rounded-lg border border-cyan-400/40 bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-lg backdrop-blur-md"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={loading}
          />
        )
      ) : (
        <>
          <span
            className="text-white text-lg cursor-pointer group-hover:bg-white/10 px-2 py-1 rounded transition-all duration-150 group-hover:shadow-md"
            onClick={() => setEditing(true)}
            tabIndex={0}
            role="button"
            aria-label={`Edit ${label || ''}`}
          >
            {value || <span className="text-gray-400">{placeholder}</span>}
          </span>
          <FaPencilAlt
            className="ml-1 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer hover:scale-110"
            onClick={() => setEditing(true)}
            tabIndex={0}
            aria-label="Edit"
          />
        </>
      )}
      {loading && <FaSpinner className="ml-2 animate-spin text-cyan-400" />}
      {error && <span className="ml-2 text-pink-400 text-xs">{error}</span>}
    </div>
  );
};

export { ToastProvider, useToast };
export default InlineEditableField; 