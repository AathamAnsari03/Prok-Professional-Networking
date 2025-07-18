import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HomeIcon, UserIcon, ArrowLeftOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';

const navItems = [
  { icon: HomeIcon, label: 'Home', active: true },
  { icon: UserIcon, label: 'Profile', active: false },
];

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
  const showSidebar = open || isDesktop;

  return (
    <nav className="fixed top-0 left-0 h-screen w-16 z-50 bg-gray-950 border-r border-gray-800 flex flex-col items-center shadow-xl">
      {/* Logo/App name at the top */}
      <div className="w-full flex flex-col items-center py-4 select-none">
        <span className="text-blue-500 font-bold text-xl tracking-tight">P</span>
      </div>
      {/* Mobile menu button (only on mobile) */}
      <button
        className="md:hidden p-2 m-2 rounded bg-gray-800 hover:bg-gray-700 absolute top-2 left-2"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <Bars3Icon className="w-6 h-6 text-white" />
      </button>
      {/* Sidebar icons (hidden on mobile unless open) */}
      <motion.div
        initial={{ x: -80 }}
        animate={{ x: showSidebar ? 0 : -80 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`flex flex-col items-center justify-between w-full h-full pt-2 md:pt-0 ${showSidebar ? '' : 'hidden md:flex'}`}
      >
        {/* Top nav icons */}
        <div className="flex flex-col items-center gap-6 w-full mt-2">
          {navItems.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all hover:bg-gray-800 focus:bg-gray-800 ${active ? 'bg-gray-800 ring-2 ring-blue-500' : ''}`}
              aria-label={label}
            >
              <Icon className={`w-7 h-7 ${active ? 'text-blue-400' : 'text-gray-300 group-hover:text-blue-400'} transition`} />
              {/* Tooltip */}
              <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700">
                {label}
              </span>
            </button>
          ))}
        </div>
        {/* Divider above logout */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-8 h-px bg-gray-800 mb-4" />
          <button
            className="group relative flex items-center justify-center w-12 h-12 rounded-xl transition-all hover:bg-gray-800 focus:bg-gray-800"
            aria-label="Logout"
          >
            <ArrowLeftOnRectangleIcon className="w-7 h-7 text-gray-300 group-hover:text-red-400 transition" />
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-lg border border-gray-700">
              Logout
            </span>
          </button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Sidebar; 