import React, { useState, useRef } from 'react';
import { useProfile } from '../../context/ProfileContext';
import type { ProfileUpdateData } from '../../types';

const ProfileEdit: React.FC = () => {
  const { state, updateProfile, uploadImage, deleteImage } = useProfile();
  const [formData, setFormData] = useState<ProfileUpdateData>({});
  const [showImageUpload, setShowImageUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (state.profile) {
      setFormData({
        first_name: state.profile.first_name || '',
        last_name: state.profile.last_name || '',
        headline: state.profile.headline || '',
        bio: state.profile.bio || '',
        location: state.profile.location || '',
        current_position: state.profile.current_position || '',
        company: state.profile.company || '',
        industry: state.profile.industry || '',
        phone: state.profile.phone || '',
        website: state.profile.website || '',
        linkedin_url: state.profile.linkedin_url || '',
        github_url: state.profile.github_url || '',
        profile_visibility: state.profile.profile_visibility,
      });
    }
  }, [state.profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty strings
    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== '')
    ) as ProfileUpdateData;

    await updateProfile(filteredData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
      setShowImageUpload(false);
    }
  };

  const handleDeleteImage = async () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      await deleteImage();
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return '/default-avatar.png';
    return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{state.error}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={getImageUrl(state.profile.profile_picture)}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute bottom-0 right-0">
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                  title="Change photo"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {state.profile.first_name && state.profile.last_name
                  ? `${state.profile.first_name} ${state.profile.last_name}`
                  : 'Complete Your Profile'}
              </h1>
              <p className="text-blue-100 mt-1">
                {state.profile.headline || 'Add your professional headline'}
              </p>
              <p className="text-blue-100 mt-1">
                {state.profile.location || 'Add your location'}
              </p>
            </div>
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Update Profile Photo</h3>
              
            <input
                ref={fileInputRef}
              type="file"
              accept="image/*"
                onChange={handleImageUpload}
              className="hidden"
              />
              
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={state.uploadingImage}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {state.uploadingImage ? 'Uploading...' : 'Choose Photo'}
                </button>
                
                {state.profile.profile_picture && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={state.uploadingImage}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {state.uploadingImage ? 'Deleting...' : 'Remove Current Photo'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowImageUpload(false)}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your last name"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Headline
                </label>
                <input
                  type="text"
                  name="headline"
                  value={formData.headline || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Visibility
                </label>
                <select
                  name="profile_visibility"
                  value={formData.profile_visibility || 'public'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="connections">Connections Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Position
                </label>
                <input
                  type="text"
                  name="current_position"
                  value={formData.current_position || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
          </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technology"
                />
              </div>
            </div>
        </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
        </div>
              
        <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub
                </label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
        </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={state.updating}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {state.updating ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 