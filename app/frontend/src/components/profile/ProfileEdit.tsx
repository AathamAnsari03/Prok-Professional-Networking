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

interface FormErrors {
  [key: string]: string;
}

const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Form states
  const [basicInfo, setBasicInfo] = useState({
    full_name: '',
    bio: '',
    location: ''
  });
  
  // Skills management
  const [newSkill, setNewSkill] = useState('');
  const [editingSkill, setEditingSkill] = useState<number | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');
  
  // Experience management
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [editingExperience, setEditingExperience] = useState<number | null>(null);
  const [editingExperienceData, setEditingExperienceData] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  
  // Achievement management
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: ''
  });
  const [editingAchievement, setEditingAchievement] = useState<number | null>(null);
  const [editingAchievementData, setEditingAchievementData] = useState({
    title: '',
    description: '',
    date: ''
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile();
      setProfileData(data);
      setBasicInfo({
        full_name: data.profile.full_name || '',
        bio: data.profile.bio || '',
        location: data.profile.location || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Basic info handlers
  const handleBasicInfoChange = (field: string, value: string) => {
    setBasicInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleBasicInfoSave = async () => {
    setSaving(true);
    try {
      await profileApi.updateProfile(basicInfo);
      await loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating basic info:', error);
    } finally {
      setSaving(false);
    }
  };

  // Skills handlers
  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    try {
      await profileApi.addSkill({ name: newSkill.trim() });
      setNewSkill('');
      await loadProfile();
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill.id);
    setEditingSkillName(skill.name);
  };

  const handleSaveSkillEdit = async () => {
    if (!editingSkill || !editingSkillName.trim()) return;
    
    try {
      // Remove old skill and add new one
      await profileApi.removeSkill(editingSkill);
      await profileApi.addSkill({ name: editingSkillName.trim() });
      setEditingSkill(null);
      setEditingSkillName('');
      await loadProfile();
    } catch (error) {
      console.error('Error updating skill:', error);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await profileApi.removeSkill(skillId);
      await loadProfile();
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  // Experience handlers
  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.company || !newExperience.start_date) return;
    
    try {
      await profileApi.addExperience(newExperience);
      setNewExperience({
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      });
      await loadProfile();
    } catch (error) {
      console.error('Error adding experience:', error);
    }
  };

  const handleEditExperience = (exp: Experience) => {
    setEditingExperience(exp.id);
    setEditingExperienceData({
      title: exp.title,
      company: exp.company,
      start_date: exp.start_date,
      end_date: exp.end_date || '',
      description: exp.description
    });
  };

  const handleSaveExperienceEdit = async () => {
    if (!editingExperience) return;
    
    try {
      // Remove old experience and add new one
      await profileApi.removeExperience(editingExperience);
      await profileApi.addExperience(editingExperienceData);
      setEditingExperience(null);
      setEditingExperienceData({
        title: '',
        company: '',
        start_date: '',
        end_date: '',
        description: ''
      });
      await loadProfile();
    } catch (error) {
      console.error('Error updating experience:', error);
    }
  };

  const handleDeleteExperience = async (expId: number) => {
    try {
      await profileApi.removeExperience(expId);
      await loadProfile();
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  // Achievement handlers
  const handleAddAchievement = async () => {
    if (!newAchievement.title || !newAchievement.description) return;
    
    try {
      await profileApi.addAchievement(newAchievement);
      setNewAchievement({
        title: '',
        description: '',
        date: ''
      });
      await loadProfile();
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement.id);
    setEditingAchievementData({
      title: achievement.title,
      description: achievement.description,
      date: achievement.date
    });
  };

  const handleSaveAchievementEdit = async () => {
    if (!editingAchievement) return;
    
    try {
      // Remove old achievement and add new one
      await profileApi.removeAchievement(editingAchievement);
      await profileApi.addAchievement(editingAchievementData);
      setEditingAchievement(null);
      setEditingAchievementData({
        title: '',
        description: '',
        date: ''
      });
      await loadProfile();
    } catch (error) {
      console.error('Error updating achievement:', error);
    }
  };

  const handleDeleteAchievement = async (achievementId: number) => {
    try {
      await profileApi.removeAchievement(achievementId);
      await loadProfile();
    } catch (error) {
      console.error('Error deleting achievement:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
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
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold" style={{ color: '#8B4513' }}>Edit Profile</h1>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: '#8B4513' }}>Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={basicInfo.full_name}
                  onChange={(e) => handleBasicInfoChange('full_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={basicInfo.location}
                  onChange={(e) => handleBasicInfoChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={basicInfo.bio}
                onChange={(e) => handleBasicInfoChange('bio', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                placeholder="Tell us about yourself..."
              />
            </div>
            <button
              onClick={handleBasicInfoSave}
              disabled={saving}
              className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#8B4513', '--tw-ring-color': '#8B4513' } as React.CSSProperties}
            >
              {saving ? 'Saving...' : 'Save Basic Info'}
            </button>
          </div>

          {/* Skills Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: '#8B4513' }}>Skills</h2>
            
            {/* Add new skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                style={{ backgroundColor: '#8B4513' }}
              >
                Add
              </button>
            </div>

            {/* Skills list */}
            <div className="space-y-2">
              {profileData.profile.skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  {editingSkill === skill.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editingSkillName}
                        onChange={(e) => setEditingSkillName(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                      />
                      <button
                        onClick={handleSaveSkillEdit}
                        className="px-3 py-1 text-white text-sm rounded"
                        style={{ backgroundColor: '#8B4513' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSkill(null)}
                        className="px-3 py-1 text-gray-600 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{skill.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSkill(skill)}
                          className="px-3 py-1 text-blue-600 text-sm border border-blue-300 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="px-3 py-1 text-red-600 text-sm border border-red-300 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: '#8B4513' }}>Experience</h2>
            
            {/* Add new experience */}
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <h3 className="font-medium">Add New Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Job Title"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
                <input
                  type="text"
                  value={newExperience.start_date}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                  placeholder="Start Date (e.g., 2020-01)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
                <input
                  type="text"
                  value={newExperience.end_date}
                  onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                  placeholder="End Date (e.g., 2023-01 or Present)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
              </div>
              <textarea
                value={newExperience.description}
                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
              />
              <button
                onClick={handleAddExperience}
                className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                style={{ backgroundColor: '#8B4513' }}
              >
                Add Experience
              </button>
          </div>

            {/* Experience list */}
          <div className="space-y-4">
              {profileData.profile.experience.map((exp) => (
                <div key={exp.id} className="border border-gray-200 rounded-md p-4">
                  {editingExperience === exp.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingExperienceData.title}
                          onChange={(e) => setEditingExperienceData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Job Title"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                        />
                        <input
                          type="text"
                          value={editingExperienceData.company}
                          onChange={(e) => setEditingExperienceData(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Company"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                        />
                        <input
                          type="text"
                          value={editingExperienceData.start_date}
                          onChange={(e) => setEditingExperienceData(prev => ({ ...prev, start_date: e.target.value }))}
                          placeholder="Start Date"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                        />
                  <input
                          type="text"
                          value={editingExperienceData.end_date}
                          onChange={(e) => setEditingExperienceData(prev => ({ ...prev, end_date: e.target.value }))}
                          placeholder="End Date"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                        />
                      </div>
                      <textarea
                        value={editingExperienceData.description}
                        onChange={(e) => setEditingExperienceData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveExperienceEdit}
                          className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                          style={{ backgroundColor: '#8B4513' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingExperience(null)}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{exp.title}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {exp.start_date} - {exp.end_date || 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditExperience(exp)}
                            className="px-3 py-1 text-blue-600 text-sm border border-blue-300 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExperience(exp.id)}
                            className="px-3 py-1 text-red-600 text-sm border border-red-300 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold" style={{ color: '#8B4513' }}>Achievements</h2>
            
            {/* Add new achievement */}
            <div className="bg-gray-50 p-4 rounded-md space-y-3">
              <h3 className="font-medium">Add New Achievement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Achievement Title"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
              <input
                type="text"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                  placeholder="Date (e.g., 2023)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                />
              </div>
              <textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
              />
              <button
                onClick={handleAddAchievement}
                className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                style={{ backgroundColor: '#8B4513' }}
              >
                Add Achievement
              </button>
            </div>

            {/* Achievements list */}
            <div className="space-y-4">
              {profileData.profile.achievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 rounded-md p-4">
                  {editingAchievement === achievement.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={editingAchievementData.title}
                          onChange={(e) => setEditingAchievementData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Achievement Title"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                        />
                        <input
                          type="text"
                          value={editingAchievementData.date}
                          onChange={(e) => setEditingAchievementData(prev => ({ ...prev, date: e.target.value }))}
                          placeholder="Date"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                        />
                      </div>
                      <textarea
                        value={editingAchievementData.description}
                        onChange={(e) => setEditingAchievementData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#8B4513' } as React.CSSProperties}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveAchievementEdit}
                          className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                          style={{ backgroundColor: '#8B4513' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingAchievement(null)}
                          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-gray-500">{achievement.date}</p>
                          {achievement.description && (
                            <p className="text-gray-700 mt-2">{achievement.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAchievement(achievement)}
                            className="px-3 py-1 text-blue-600 text-sm border border-blue-300 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            className="px-3 py-1 text-red-600 text-sm border border-red-300 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit; 