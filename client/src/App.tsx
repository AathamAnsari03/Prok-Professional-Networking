import React, { useState, useEffect } from 'react';
import './index.css';
import '@fontsource/poppins';
import '@fontsource/inter';
import ProfileCard from './components/profile/ProfileCard';
import EditProfileModal from './components/profile/EditProfileModal';
import UploadPhotoModal from './components/profile/UploadPhotoModal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [profile, setProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    document.body.className = dark ? 'dark' : '';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    setLoading(true);
    axios.get('/profile').then(res => {
      setProfile(res.data.profile);
      setActivity(res.data.profile.activity || []);
      setLoading(false);
    });
  }, []);

  const handleEdit = () => setEditOpen(true);
  const handleSave = (updated: any) => {
    setProfile(updated);
    setActivity(updated.activity || []);
  };
  const handleUpload = () => setUploadOpen(true);
  const handleUploaded = (url: string) => {
    setProfile((p: any) => ({ ...p, photo: url }));
    toast.success('Profile photo updated!');
  };
  const handleEndorse = async (skill: string) => {
    const updated = { ...profile };
    updated.skills = updated.skills.map((s: any) =>
      s.name === skill ? { ...s, endorsements: s.endorsements + 1 } : s
    );
    setProfile(updated);
    toast.success(`Endorsed ${skill}!`);
    await axios.patch('/profile', { skills: updated.skills });
  };

  if (loading || !profile) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-white">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neonBlue"></div>
    </div>
  );

  return (
    <div className={dark ? 'dark' : ''}>
      {/* Animated Gradient Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-to-tr from-neonBlue via-neonPurple to-transparent opacity-30 blur-3xl rounded-full top-[-10%] left-[-10%] animate-pulse" />
        <div className="absolute w-80 h-80 bg-gradient-to-br from-neonPurple via-neonBlue to-transparent opacity-20 blur-2xl rounded-full bottom-[-10%] right-[-10%] animate-pulse" />
      </div>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative z-10">
        {/* Theme Toggle */}
        <button
          className="fixed top-4 right-4 neon bg-neonBlue text-black px-4 py-2 rounded-full font-bold transition hover:bg-neonPurple hover:text-white shadow-lg"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? '🌙 Dark' : '☀️ Light'}
        </button>
        <ProfileCard
          profile={profile}
          onEdit={handleEdit}
          onUpload={handleUpload}
          onEndorse={handleEndorse}
        />
        {/* Activity Timeline */}
        <div className="glass mt-8 max-w-md w-full p-6">
          <h3 className="text-xl font-bold mb-4 text-neonBlue">Activity Timeline</h3>
          <ul className="timeline timeline-vertical">
            {activity.length === 0 && <li className="text-gray-400">No activity yet.</li>}
            {activity.map((act, i) => (
              <li key={i} className="mb-2 flex items-center">
                <span className="w-2 h-2 bg-neonBlue rounded-full mr-3"></span>
                <span className="text-sm text-white/80">{act.action} <span className="text-xs text-gray-400 ml-2">{new Date(act.timestamp).toLocaleString()}</span></span>
              </li>
            ))}
          </ul>
        </div>
        {/* Download Resume Button */}
        <a
          href="/profile/resume"
          className="mt-6 px-6 py-2 bg-neonBlue text-black rounded-full shadow-neon font-bold transition hover:bg-neonPurple hover:text-white animate-bounce"
          download
        >
          Download Resume
        </a>
        {/* Modals */}
        {editOpen && (
          <EditProfileModal
            profile={profile}
            onClose={() => setEditOpen(false)}
            onSave={handleSave}
          />
        )}
        {uploadOpen && (
          <UploadPhotoModal
            onClose={() => setUploadOpen(false)}
            onUploaded={handleUploaded}
          />
        )}
        <ToastContainer position="bottom-right" />
      </div>
    </div>
  );
}

export default App;
