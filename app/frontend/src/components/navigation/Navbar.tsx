import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null; // Don't show navbar if not logged in
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo/Brand */}
            <Link to="/feed" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">Prok</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/feed"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Feed
              </Link>
              <Link
                to="/posts"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Posts
              </Link>
              <Link
                to="/jobs"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Jobs
              </Link>
              <Link
                to="/messages"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Messages
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create Post Button */}
            <Link
              to="/posts/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Create Post
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Profile
              </Link>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/feed"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Feed
          </Link>
          <Link
            to="/posts"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Posts
          </Link>
          <Link
            to="/jobs"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Jobs
          </Link>
          <Link
            to="/messages"
            className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
          >
            Messages
          </Link>
          <Link
            to="/posts/create"
            className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium"
          >
            Create Post
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 