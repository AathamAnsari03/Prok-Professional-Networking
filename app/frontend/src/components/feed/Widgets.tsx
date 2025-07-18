import React from 'react';

const Widgets: React.FC = () => {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-800 w-full">
      <h3 className="text-lg font-semibold mb-2">Widgets</h3>
      <div className="text-gray-400">Widgets coming soon...</div>
      {/* Trending topics placeholder */}
      <div className="mt-4">
        <h4 className="font-medium text-gray-300 mb-1">Trending Topics</h4>
        <ul className="list-disc list-inside text-gray-400 text-sm space-y-1">
          <li>#reactjs</li>
          <li>#webdevelopment</li>
          <li>#tailwindcss</li>
        </ul>
      </div>
    </div>
  );
};

export default Widgets; 