import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-6">
            {/* Other navigation links can go here */}
          </div>
          {/* Profile widget in top right */}
          <div className="flex items-center space-x-3">
            <Link to="/profile" className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-1 rounded">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-600">JD</span>
              </div>
              <span className="text-gray-700 font-medium">John Doe</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;