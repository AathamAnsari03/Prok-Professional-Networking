import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
  onSave: (profile: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onSave }) => {
  const [form, setForm] = useState(profile);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.patch('/profile', form);
      onSave(res.data.profile);
      toast.success('Profile updated!');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="glass p-8 max-w-lg w-full relative">
        <button
          className="absolute top-2 right-2 text-neonBlue font-bold text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <div className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} className="w-full p-2 rounded bg-glass text-white" placeholder="Name" />
          <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 rounded bg-glass text-white" placeholder="Location" />
          <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full p-2 rounded bg-glass text-white" placeholder="Bio" />
          <input name="education" value={form.education} onChange={handleChange} className="w-full p-2 rounded bg-glass text-white" placeholder="Education" />
          <input name="contact" value={form.contact} onChange={handleChange} className="w-full p-2 rounded bg-glass text-white" placeholder="Contact" />
        </div>
        <button
          className="mt-6 px-6 py-2 bg-neonPurple text-white rounded-full shadow-neon font-bold transition hover:bg-neonBlue hover:text-black w-full flex items-center justify-center"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <span className="loader mr-2"></span> : 'Save'}
        </button>
      </div>
    </div>
  );
};

export default EditProfileModal; 