import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserIcon, HomeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/profile', label: 'Profile', icon: UserIcon },
  { to: '/feed', label: 'Feed', icon: HomeIcon },
  { to: '/posts/create', label: 'Post', icon: PencilSquareIcon },
  { to: '/connections', label: 'Connections', icon: UserIcon },
];

const Navbar: React.FC = () => {
  const { logout } = useAuth();
  return (
    <nav className="w-full bg-gray-950 border-b border-gray-800 shadow flex items-center px-6 h-16 z-50">
      {/* Logo or App Name */}
      <div className="text-blue-500 font-bold text-xl tracking-tight select-none mr-8">Prok</div>
      {/* Navigation Links */}
      <div className="flex gap-6">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all hover:bg-gray-800 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isActive ? 'bg-gray-800 text-blue-400' : 'text-gray-200'}`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      {/* Spacer */}
      <div className="flex-1" />
      <button onClick={logout} className="ml-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition">
        <FaSignOutAlt className="w-5 h-5" />
        <span className="hidden md:inline">Logout</span>
      </button>
      {/* (Optional) User avatar or logout button can go here */}
    </nav>
  );
};

export default Navbar; 