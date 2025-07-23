import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from './api';

interface Skill {
  id: number;
  name: string;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  date: string;
  image_url?: string;
}

interface ProfileData {
  profile: {
    id: number;
    full_name: string;
    bio: string;
    location: string;
    skills: Skill[];
    experience: Experience[];
    education: any[];
    achievements: Achievement[];
    photos: any[];
  };
  user: {
    id: number;
    username: string;
    email: string;
  };
}

const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    experience: true,
    education: true,
    achievements: true
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-500">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="relative">
          {/* Cover Image Placeholder */}
          <div className="h-48 rounded-t-lg" style={{ background: 'linear-gradient(135deg, #8B4513 0%, #6d3410 100%)' }}></div>
          
          {/* Avatar and Basic Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end space-x-4 -mt-16">
                <div className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg" style={{ backgroundColor: '#8B4513' }}>
                  <span className="text-4xl font-bold text-white">
                    {getInitials(profileData.profile.full_name || profileData.user.username)}
                  </span>
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{profileData.profile.full_name || profileData.user.username}</h1>
                  <p className="text-xl text-gray-600">{profileData.user.email}</p>
                  <p className="text-gray-500">📍 {profileData.profile.location || 'Location not set'}</p>
                </div>
              </div>
              
              {/* Edit Profile Button */}
              <div className="flex space-x-3 mt-4 sm:mt-0">
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                  style={{ backgroundColor: '#8B4513' }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          {profileData.profile.bio && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B4513' }}>About</h2>
              <p className="text-gray-700 leading-relaxed">{profileData.profile.bio}</p>
            </div>
          )}

          {/* Experience Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: '#8B4513' }}>Experience</h2>
                <button
                  onClick={() => toggleSection('experience')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.experience ? '▼' : '▶'}
                </button>
              </div>
            </div>
            
            {expandedSections.experience && (
              <div className="p-6">
                {profileData.profile.experience.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.profile.experience.map((exp) => (
                      <div key={exp.id} className="border-l-4 pl-4" style={{ borderColor: '#8B4513' }}>
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No experience added yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: '#8B4513' }}>Achievements</h2>
                <button
                  onClick={() => toggleSection('achievements')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.achievements ? '▼' : '▶'}
                </button>
              </div>
            </div>
            
            {expandedSections.achievements && (
              <div className="p-6">
                {profileData.profile.achievements.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.profile.achievements.map((achievement) => (
                      <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-gray-500">{achievement.date}</p>
                        {achievement.description && (
                          <p className="text-gray-700 mt-2">{achievement.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No achievements added yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B4513' }}>Skills</h2>
            {profileData.profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profileData.profile.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No skills added yet.</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#8B4513' }}>Contact</h2>
            <div className="space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Email:</span> {profileData.user.email}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Username:</span> {profileData.user.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;