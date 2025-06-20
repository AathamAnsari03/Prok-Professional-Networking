import React from 'react';
import { useProfile } from '../../context/ProfileContext';
import { Link } from 'react-router-dom';

const ProfileView: React.FC = () => {
  const { state } = useProfile();

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

  const profile = state.profile;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Image */}
              <img
                src={getImageUrl(profile.profile_picture)}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">
                  {profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : 'Complete Your Profile'}
                </h1>
                <p className="text-blue-100 mt-1">
                  {profile.headline || 'Add your professional headline'}
                </p>
                <p className="text-blue-100 mt-1">
                  {profile.location || 'Add your location'}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <Link
              to="/profile/edit"
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Professional Information */}
          {(profile.current_position || profile.company || profile.industry) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.current_position && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Current Position</h4>
                    <p className="text-gray-900">{profile.current_position}</p>
                  </div>
                )}
                {profile.company && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Company</h4>
                    <p className="text-gray-900">{profile.company}</p>
                  </div>
                )}
                {profile.industry && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Industry</h4>
                    <p className="text-gray-900">{profile.industry}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(profile.phone || profile.website || profile.linkedin_url || profile.github_url) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                )}
                {profile.website && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Website</h4>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.linkedin_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">LinkedIn</h4>
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </a>
                  </div>
                )}
                {profile.github_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">GitHub</h4>
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Profile Visibility</h4>
                <p className="text-gray-900 capitalize">{profile.profile_visibility}</p>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date(profile.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 