import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import Avatar from '../shared/Avatar'; // Assume you have an Avatar component

const ProfileSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  // Placeholder user data
  const user = {
    name: 'Jane Doe',
    avatar: '/default-avatar.png',
    headline: 'Software Engineer',
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-8 flex items-center gap-6 shadow-xl border border-gray-800 w-full">
      {/* Avatar */}
      <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-blue-500" />
      <div className="flex-1 min-w-0">
        <div className="text-lg font-semibold truncate">{user.name}</div>
        <div className="text-gray-400 text-sm truncate">{user.headline}</div>
      </div>
      <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium transition shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
        onClick={() => setModalOpen(true)}
      >
        Edit Profile
      </button>
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              {/* Profile edit form (placeholder) */}
              <input className="w-full mb-3 p-2 rounded bg-gray-700 text-white" placeholder="Name" />
              <input className="w-full mb-3 p-2 rounded bg-gray-700 text-white" placeholder="Headline" />
              <div className="flex justify-end gap-3 mt-6">
                <button className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-semibold shadow focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSection; 