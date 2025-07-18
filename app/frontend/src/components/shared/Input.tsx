import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-semibold mb-1 text-white">{label}</label>}
    <input
      className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${error ? 'border-pink-500' : 'border-white/20'} ${className}`}
      {...props}
    />
    {error && <div className="text-pink-400 text-xs mt-1">{error}</div>}
  </div>
);

export default Input; 