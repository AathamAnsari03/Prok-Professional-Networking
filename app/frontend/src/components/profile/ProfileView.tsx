import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from './api';
import { FaEdit, FaSignOutAlt, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaStar, FaCalendarAlt, FaUpload, FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import type { Profile } from '../../types';
import toast from 'react-hot-toast';

const ProfileView: React.FC = () => {
  const { user, profile, logout, profileLoading, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar || '');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(profile?.banner || '');
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        await refreshProfile();
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Avatar upload logic
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[FRONTEND] handleAvatarChange called');
    console.log('[FRONTEND] Event target:', e.target);
    console.log('[FRONTEND] Event target files:', e.target.files);
    const file = e.target.files?.[0];
    console.log('[FRONTEND] Selected file:', file);
    if (!file) {
      console.log('[FRONTEND] No file selected');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG/PNG images allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max file size is 5MB.');
      return;
    }
    setAvatarUploading(true);
    try {
      console.log('[FRONTEND] Uploading file:', file);
      console.log('[FRONTEND] File name:', file.name);
      console.log('[FRONTEND] File type:', file.type);
      console.log('[FRONTEND] File size:', file.size);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');
      console.log('[FRONTEND] FormData created');
      const response = await fetch('http://localhost:5000/api/profile/image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        setAvatarPreview(data.url);
        await updateProfile({ avatar: data.url });
        await refreshProfile();
        toast.success('Avatar updated!');
        } else {
        toast.error(data.message || 'Avatar upload failed.');
      }
    } catch (err) {
      toast.error('Avatar upload failed.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const onAvatarDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Create a DataTransfer to simulate a file input event
      const dt = new DataTransfer();
      dt.items.add(file);
      const input = document.createElement('input');
      input.type = 'file';
      input.files = dt.files;
      const event = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleAvatarChange(event);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: onAvatarDrop, accept: { 'image/jpeg': [], 'image/png': [] } });

  // Banner upload logic
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG/PNG images allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max file size is 5MB.');
      return;
    }
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/api/profile/banner', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.url) {
        setBannerPreview(data.url);
        await updateProfile({ banner: data.url } as Partial<Profile>);
        await refreshProfile();
        toast.success('Banner updated!');
      } else {
        toast.error(data.message || 'Banner upload failed.');
      }
    } catch (err) {
      toast.error('Banner upload failed.');
    } finally {
      setBannerUploading(false);
    }
  };

  const onBannerDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const dt = new DataTransfer();
      dt.items.add(file);
      const input = document.createElement('input');
      input.type = 'file';
      input.files = dt.files;
      const event = { target: input } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleBannerChange(event);
    }
  };
  const { getRootProps: getBannerRootProps, getInputProps: getBannerInputProps } = useDropzone({ onDrop: onBannerDrop, accept: { 'image/jpeg': [], 'image/png': [] } });

  const getAvatarUrl = () => profile?.avatar || profileApi.getDefaultAvatar(profile?.name || user?.username || 'User');
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';
  
  // Helper to get full backend URL for images
  const backendUrl = "http://localhost:5000";
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    return url.startsWith('http') ? url : backendUrl + url;
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Please log in.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner with upload */}
      <div className="relative group" {...getBannerRootProps()}>
        <img
          src={getImageUrl(bannerPreview || profile?.banner) || '/default-banner.jpg'}
          alt="Banner"
          className="w-full h-48 object-cover transition-opacity duration-200 rounded-b-none rounded-t-xl border-b-4 border-gray-900"
          style={{ opacity: bannerUploading ? 0.5 : 1 }}
        />
        <input type="file" accept="image/*" ref={bannerInputRef} className="hidden" onChange={handleBannerChange} {...getBannerInputProps()} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-b-none rounded-t-xl">
          <div className="flex flex-col items-center">
            <FaUpload className="text-2xl text-cyan-300 mb-1" />
            <span className="text-cyan-200 text-sm">{bannerUploading ? 'Uploading...' : 'Change Banner'}</span>
          </div>
        </div>
      </div>
      {/* Avatar section (below banner, above profile info) */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-8">
        <div className="relative -mt-16 md:-mt-24 mb-4 md:mb-0">
          <div className="relative group" {...getRootProps()}>
            <img
              src={getImageUrl(profile?.avatar) || getAvatarUrl()}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-900 object-cover bg-gray-700"
              style={{ opacity: avatarUploading ? 0.5 : 1 }}
            />
            <input type="file" accept="image/*" ref={avatarInputRef} className="hidden" onChange={handleAvatarChange} {...getInputProps()} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <div className="flex flex-col items-center">
                <FaUpload className="text-2xl text-cyan-300 mb-1" />
                <span className="text-cyan-200 text-sm">{avatarUploading ? 'Uploading...' : 'Change Avatar'}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Profile info */}
        <div>
          <h1 className="text-3xl font-bold">{profile?.name || user.username}</h1>
          <p className="text-xl text-gray-300">{profile?.title || 'Professional'}</p>
          {profile?.location && <div className="flex items-center text-gray-400"><FaMapMarkerAlt className="mr-2" />{profile.location}</div>}
          {profile?.address && <div className="flex items-center text-gray-400 mt-1"><FaGlobe className="mr-2" />{profile.address}</div>}
          <button
            onClick={() => navigate('/edit-profile')}
            className="mt-4 flex items-center gap-2 px-5 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-white font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>
      {/* About */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaStar className="text-yellow-500" />About</h2>
        <p className="text-gray-300">{profile?.bio || 'No bio available.'}</p>
      </div>
      
      {/* Contact & Social Links */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Contact & Social</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile?.socials?.linkedin && (
            <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">
              <FaLinkedin className="text-xl" />
              <span>LinkedIn</span>
            </a>
          )}
          {profile?.socials?.github && (
            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition">
              <FaGithub className="text-xl" />
              <span>GitHub</span>
            </a>
          )}
          {profile?.socials?.email && (
            <a href={`mailto:${profile.socials.email}`} className="flex items-center gap-2 text-green-400 hover:text-green-300 transition">
              <FaEnvelope className="text-xl" />
              <span>{profile.socials.email}</span>
            </a>
          )}
          {profile?.socials?.phone && (
            <a href={`tel:${profile.socials.phone}`} className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition">
              <FaPhone className="text-xl" />
              <span>{profile.socials.phone}</span>
            </a>
          )}
          {profile?.socials?.website && (
            <a href={profile.socials.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition">
              <FaGlobe className="text-xl" />
              <span>Website</span>
            </a>
          )}
          {(!profile?.socials?.linkedin && !profile?.socials?.github && !profile?.socials?.email && !profile?.socials?.phone && !profile?.socials?.website) && (
            <p className="text-gray-400 col-span-2">No contact information added yet.</p>
          )}
        </div>
      </div>
      {/* Experience */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaBriefcase className="text-blue-500" />Experience</h2>
        {profile?.experiences?.length ? profile.experiences.map((exp, i) => (
          <div key={i} className="mb-4 border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold">{exp.title}</h3>
            <p className="text-blue-400">{exp.company}</p>
            <p className="text-gray-400 text-sm flex items-center gap-2"><FaCalendarAlt className="text-xs" />{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
            {exp.description && <p className="text-gray-300 mt-2">{exp.description}</p>}
            </div>
        )) : <p className="text-gray-400">No experience added yet.</p>}
            </div>
      {/* Education */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FaGraduationCap className="text-green-500" />Education</h2>
        {profile?.education?.length ? profile.education.map((edu, i) => (
          <div key={i} className="mb-4 border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold">{edu.school}</h3>
            <p className="text-green-400">{edu.degree} in {edu.field}</p>
            <p className="text-gray-400 text-sm flex items-center gap-2"><FaCalendarAlt className="text-xs" />{formatDate(edu.start_date)} - {formatDate(edu.end_date)}</p>
          </div>
        )) : <p className="text-gray-400">No education added yet.</p>}
                    </div>
      {/* Skills */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        {profile?.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">{skill}</span>
            ))}
          </div>
        ) : <p className="text-gray-400">No skills added yet.</p>}
        </div>
      {/* Recent Activity Placeholder */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-gray-400">No recent activity yet. (Coming soon!)</div>
      </div>
    </div>
  );
};

export default ProfileView; 