import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../profile/api';
import PostCreate from '../posts/PostCreate';
import PostList from '../posts/PostList';
import DashboardEffects from './DashboardEffects';
import TestEffects from './TestEffects';

interface User {
  id: number;
  email: string;
  fullName: string;
}

interface ProfileData {
  fullName: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    year: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');
  // Photo upload state
  const [photo, setPhoto] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    experience: [] as Array<{id: number, title: string, company: string, start_date: string, end_date?: string, description: string}>,
    achievements: [] as Array<{id: number, title: string, description: string, date?: string}>
  });
  const [tempProfileData, setTempProfileData] = useState({
    bio: '',
    location: '',
    fullName: '',
    experience: [] as Array<{title: string, company: string, duration: string, description: string}>,
    achievements: [] as Array<{title: string, description: string, date: string}>
  });

  // Shared profile state for dashboard sidebar
  const [dashboardProfileData, setDashboardProfileData] = useState({
    fullName: user?.username || 'John Doe',
    title: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    connections: '500+ connections'
  });

  // Notification state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'connection_accepted',
      title: 'Connection Request Accepted',
      message: 'Alice Johnson accepted your connection request',
      time: 'Just now',
      color: 'blue',
      icon: '✓',
      read: false
    },
    {
      id: 2,
      type: 'job_viewed',
      title: 'Job Application Viewed',
      message: 'TechCorp viewed your application for Frontend Developer',
      time: '1 hour ago',
      color: 'green',
      icon: '💼',
      read: false
    },
    {
      id: 3,
      type: 'connection_request',
      title: 'New Connection Request',
      message: 'Mike Brown sent you a connection request',
      time: '2 hours ago',
      color: 'yellow',
      icon: '👥',
      read: false,
      pending: true
    },
    {
      id: 4,
      type: 'profile_reminder',
      title: 'Profile Update Reminder',
      message: 'Keep your profile updated to get more opportunities',
      time: '1 day ago',
      color: 'purple',
      icon: '📝',
      read: false
    }
  ]);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEffects, setShowEffects] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // New dark mode state

  // Messages state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Alice Johnson',
      avatar: '👩‍💼',
      lastMessage: 'Hi! I saw your profile and would love to connect.',
      time: '2 min ago',
      unread: true,
      online: true
    },
    {
      id: 2,
      sender: 'Mike Brown',
      avatar: '👨‍💻',
      lastMessage: 'Thanks for accepting my connection request!',
      time: '1 hour ago',
      unread: false,
      online: false
    },
    {
      id: 3,
      sender: 'Sarah Wilson',
      avatar: '👩‍🎨',
      lastMessage: 'Are you available for a quick chat about the project?',
      time: '3 hours ago',
      unread: true,
      online: true
    },
    {
      id: 4,
      sender: 'David Chen',
      avatar: '👨‍🔬',
      lastMessage: 'Great work on the recent collaboration!',
      time: '1 day ago',
      unread: false,
      online: false
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Jobs state
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      salary: '$80k - $100k',
      type: 'Full-time',
      description: 'We\'re looking for a talented Frontend Developer to join our team and help build amazing user experiences.',
      requirements: ['React', 'TypeScript', '3+ years experience'],
      posted: '2 days ago',
      status: 'open',
      applied: false,
      saved: false
    },
    {
      id: 2,
      title: 'Backend Engineer',
      company: 'DataFlow Inc',
      location: 'San Francisco',
      salary: '$90k - $120k',
      type: 'Full-time',
      description: 'Join our backend team to build scalable APIs and microservices using modern technologies.',
      requirements: ['Node.js', 'Python', 'AWS', '5+ years experience'],
      posted: '1 week ago',
      status: 'open',
      applied: false,
      saved: false
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Creative Studio',
      location: 'New York',
      salary: '$70k - $90k',
      type: 'Contract',
      description: 'Help us create beautiful and intuitive user interfaces for our growing portfolio of products.',
      requirements: ['Figma', 'Adobe Creative Suite', '2+ years experience'],
      posted: '3 days ago',
      status: 'open',
      applied: false,
      saved: false
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      company: 'CloudTech Solutions',
      location: 'Austin',
      salary: '$100k - $130k',
      type: 'Full-time',
      description: 'Build and maintain our cloud infrastructure and deployment pipelines.',
      requirements: ['Docker', 'Kubernetes', 'AWS/GCP', '4+ years experience'],
      posted: '5 days ago',
      status: 'open',
      applied: false,
      saved: false
    }
  ]);

  // Modal states
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  
  // Form data states
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    date: ''
  });

  // Load profile data on component mount
  useEffect(() => {
    if (activeTab === 'profile') {
      loadProfileData();
    }
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await profileApi.getProfile();
      if (response.profile) {
              setProfileData({
        bio: response.profile.bio || '',
        location: response.profile.location || '',
        experience: response.profile.experience || [],
        achievements: response.profile.achievements || []
      });

        // Update dashboard profile data with real profile information
        setDashboardProfileData({
          fullName: response.profile.full_name || user?.username || 'John Doe',
          title: response.profile.experience && response.profile.experience.length > 0 
            ? response.profile.experience[0].title 
            : 'Software Engineer',
          company: response.profile.experience && response.profile.experience.length > 0 
            ? response.profile.experience[0].company 
            : 'TechCorp',
          location: response.profile.location || 'San Francisco, CA',
          connections: '500+ connections'
        });

        // Load profile photo from backend
        if (response.profile.photos && response.profile.photos.length > 0) {
          setPhoto(response.profile.photos[0].url);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
      setShowPhotoModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const updateProfilePhoto = async () => {
    if (!photoPreview) return;
    
    try {
      setIsUploadingPhoto(true);
      
      // Upload photo to backend
      const response = await profileApi.uploadProfilePhoto(photoPreview);
      
      if (response.photo) {
        setPhoto(photoPreview);
        setShowPhotoModal(false);
        setPhotoPreview(null);
        
        // Show success message
        alert('Profile photo updated successfully! The photo will now appear in both the Profile tab and Dashboard sidebar and persist across sessions.');
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Error updating photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const cancelPhotoUpdate = () => {
    setShowPhotoModal(false);
    setPhotoPreview(null);
  };

  const removeProfilePhoto = async () => {
    try {
      await profileApi.removeProfilePhoto();
      setPhoto(null);
      alert('Profile photo removed! It will no longer appear when you log in.');
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Error removing photo. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Notification functions
  const acceptConnection = (notificationId: number) => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === notificationId) {
        return {
          ...notification,
          type: 'connection_accepted',
          title: 'Connection Request Accepted',
          message: 'Mike Brown is now connected with you',
          color: 'blue',
          icon: '✓',
          pending: false,
          read: false
        };
      }
      return notification;
    }));

    // Show success message
    setSuccessMessage('Connection request accepted successfully! 🎉');
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const declineConnection = (notificationId: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    
    // Show success message
    setSuccessMessage('Connection request declined');
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => prev.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    }));
  };

  // Message functions
  const sendMessage = (messageId: number) => {
    if (!newMessage.trim()) return;

    // Update the selected message with new message
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          lastMessage: newMessage,
          time: 'Just now',
          unread: false
        };
      }
      return message;
    }));

    // Show success message
    setSuccessMessage('Message sent successfully! 💬');
    setShowSuccessMessage(true);
    
    // Clear input
    setNewMessage('');
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const markMessageAsRead = (messageId: number) => {
    setMessages(prev => prev.map(message => {
      if (message.id === messageId) {
        return { ...message, unread: false };
      }
      return message;
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, messageId: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(messageId);
    }
  };

  // Job functions
  const applyForJob = (jobId: number) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: 'applied',
          applied: true
        };
      }
      return job;
    }));

    // Show success message
    setSuccessMessage('Job application submitted successfully! 🎉');
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const withdrawApplication = (jobId: number) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: 'open',
          applied: false
        };
      }
      return job;
    }));

    // Show success message
    setSuccessMessage('Application withdrawn successfully!');
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const saveJob = (jobId: number) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          saved: !job.saved
        };
      }
      return job;
    }));

    const job = jobs.find(j => j.id === jobId);
    const action = job?.saved ? 'removed from' : 'saved to';
    
    // Show success message
    setSuccessMessage(`Job ${action} your saved list!`);
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  // Profile editing functions
  const startEditing = () => {
    setTempProfileData({
      bio: profileData.bio,
      location: profileData.location,
      fullName: dashboardProfileData.fullName,

      experience: profileData.experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        duration: exp.end_date ? `${exp.start_date} - ${exp.end_date}` : exp.start_date,
        description: exp.description
      })),
      achievements: profileData.achievements.map(ach => ({
        title: ach.title,
        description: ach.description || '',
        date: ach.date || ''
      }))
    });
    setIsEditingProfile(true);
  };

  const cancelEditing = () => {
    setIsEditingProfile(false);
  };

  const saveProfile = async () => {
    try {
      setIsLoading(true);
      
      // Update basic profile info
      await profileApi.updateProfile({
        bio: tempProfileData.bio,
        location: tempProfileData.location,
        full_name: tempProfileData.fullName
      });

      // Update dashboard profile data immediately
      setDashboardProfileData(prev => ({
        ...prev,
        location: tempProfileData.location,
        fullName: tempProfileData.fullName
      }));

      // Reload profile data to get updated info
      await loadProfileData();
      
      setIsEditingProfile(false);
      
      // Show success message
      alert('Profile updated successfully! Your name and information will now appear in both the Profile tab and Dashboard sidebar.');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Modal functions

  const openExperienceModal = () => {
    setNewExperience({
      title: '',
      company: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setShowExperienceModal(true);
  };

  const closeExperienceModal = () => {
    setShowExperienceModal(false);
    setNewExperience({
      title: '',
      company: '',
      start_date: '',
      end_date: '',
      description: ''
    });
  };

  const openAchievementModal = () => {
    setNewAchievement({
      title: '',
      description: '',
      date: ''
    });
    setShowAchievementModal(true);
  };

  const closeAchievementModal = () => {
    setShowAchievementModal(false);
    setNewAchievement({
      title: '',
      description: '',
      date: ''
    });
  };



  const addExperience = async () => {
    if (newExperience.title && newExperience.company && newExperience.start_date) {
      try {
        const response = await profileApi.addExperience({
          title: newExperience.title,
          company: newExperience.company,
          start_date: newExperience.start_date,
          end_date: newExperience.end_date || undefined,
          description: newExperience.description
        });
        if (response.experience) {
          setTempProfileData({
            ...tempProfileData,
            experience: [...tempProfileData.experience, {
              title: newExperience.title,
              company: newExperience.company,
              duration: newExperience.end_date ? `${newExperience.start_date} - ${newExperience.end_date}` : newExperience.start_date,
              description: newExperience.description
            }]
          });

          // Update dashboard profile data with new experience
          setDashboardProfileData(prev => ({
            ...prev,
            title: newExperience.title,
            company: newExperience.company
          }));

          closeExperienceModal();
        }
      } catch (error) {
        console.error('Error adding experience:', error);
        alert('Error adding experience. Please try again.');
      }
    }
  };

  const removeExperience = async (index: number) => {
    const expToRemove = profileData.experience[index];
    if (expToRemove) {
      try {
        await profileApi.removeExperience(expToRemove.id);
        setTempProfileData({
          ...tempProfileData,
          experience: tempProfileData.experience.filter((_, i) => i !== index)
        });
      } catch (error) {
        console.error('Error removing experience:', error);
        alert('Error removing experience. Please try again.');
      }
    }
  };

  const addAchievement = async () => {
    if (newAchievement.title) {
      try {
        const response = await profileApi.addAchievement({
          title: newAchievement.title,
          description: newAchievement.description,
          date: newAchievement.date || undefined
        });
        if (response.achievement) {
          setTempProfileData({
            ...tempProfileData,
            achievements: [...tempProfileData.achievements, {
              title: newAchievement.title,
              description: newAchievement.description,
              date: newAchievement.date
            }]
          });
          closeAchievementModal();
        }
      } catch (error) {
        console.error('Error adding achievement:', error);
        alert('Error adding achievement. Please try again.');
      }
    }
  };

  const removeAchievement = async (index: number) => {
    const achievementToRemove = profileData.achievements[index];
    if (achievementToRemove) {
      try {
        await profileApi.removeAchievement(achievementToRemove.id);
        setTempProfileData({
          ...tempProfileData,
          achievements: tempProfileData.achievements.filter((_, i) => i !== index)
        });
      } catch (error) {
        console.error('Error removing achievement:', error);
        alert('Error removing achievement. Please try again.');
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-4">
            <div className={`${showEffects ? 'bg-white/50 backdrop-blur-md' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-gray-500">Software Engineer • 2h ago</p>
                </div>
              </div>
              <p className="mb-4">Excited to share that I've started a new position as Software Engineer at TechCorp!</p>
              <div className={`${showEffects ? 'bg-gray-50/70 backdrop-blur-sm' : 'bg-gray-50'} rounded p-3`}>
                <p className="text-sm text-gray-600">🎉 New beginnings are always exciting. Looking forward to this new chapter in my career!</p>
              </div>
            </div>
            
            <div className={`${showEffects ? 'bg-white/50 backdrop-blur-md' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">JS</span>
                </div>
                <div>
                  <p className="font-semibold">Jane Smith</p>
                  <p className="text-sm text-gray-500">UI/UX Designer • 4h ago</p>
                </div>
              </div>
              <p className="mb-4">Just completed a major redesign project for our mobile app. The user feedback has been incredible!</p>
            </div>
          </div>
        );
      
      case 'jobs':
        return (
          <div className="space-y-4">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">✅</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            <div className={`${showEffects ? 'bg-white/50 backdrop-blur-md' : 'bg-white'} rounded-lg shadow p-6`}>
              <h2 className="text-xl font-semibold mb-4">💼 Job Board</h2>
              
              {/* Jobs List */}
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div 
                    key={job.id}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      job.applied 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company} • {job.location}</p>
                        <p className="text-sm text-gray-500">{job.salary} • {job.type}</p>
                        <p className="text-xs text-gray-400 mt-1">Posted {job.posted}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveJob(job.id)}
                          className={`p-2 rounded-full transition-colors ${
                            job.saved 
                              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={job.saved ? 'Remove from saved' : 'Save job'}
                        >
                          {job.saved ? '⭐' : '☆'}
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{job.description}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      {job.applied ? (
                        <>
                          <button
                            onClick={() => withdrawApplication(job.id)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          >
                            Withdraw Application
                          </button>
                          <span className="px-3 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium">
                            ✓ Applied
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => applyForJob(job.id)}
                          className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                          style={{ backgroundColor: '#8B4513' }}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {jobs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No jobs available at the moment</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'post':
        return (
          <div className="space-y-4">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">✅</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* Import and use PostCreate and PostList components */}
            <PostCreate onPostCreated={() => {
              setShowSuccessMessage(true);
              setSuccessMessage('Post created successfully!');
              setTimeout(() => setShowSuccessMessage(false), 3000);
            }} />
            <PostList refreshTrigger={Date.now()} />
          </div>
        );
      
      case 'messages':
        return (
          <div className="space-y-4">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">✅</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">💬 Messages</h2>
              
              {/* Messages List */}
              <div className="space-y-3 mb-6">
                {messages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedMessage === message.id 
                        ? 'bg-blue-50 border-blue-500 shadow-md' 
                        : message.unread 
                          ? 'bg-yellow-50 border-yellow-500' 
                          : 'bg-gray-50 border-gray-400'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message.id);
                      markMessageAsRead(message.id);
                    }}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.unread ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        <span className="text-white text-lg">{message.avatar}</span>
                      </div>
                      {message.online && (
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-semibold ${
                          message.unread ? 'text-yellow-900' : 'text-gray-900'
                        }`}>
                          {message.sender}
                          {message.unread && (
                            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </p>
                        <span className={`text-xs ${
                          message.unread ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          {message.time}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        message.unread ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        {message.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedMessage && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, selectedMessage)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => sendMessage(selectedMessage)}
                      disabled={!newMessage.trim()}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        newMessage.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              )}

              {messages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No messages yet</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-4">
            {/* Success Message */}
            {showSuccessMessage && (
              <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">✅</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🔔 Notifications</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg border-l-4 transition-all duration-200 ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-300 opacity-75' 
                        : `bg-${notification.color}-50 border-${notification.color}-500`
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.read ? 'bg-gray-400' : `bg-${notification.color}-500`
                    }`}>
                      <span className="text-white text-sm">{notification.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${
                        notification.read ? 'text-gray-700' : `text-${notification.color}-900`
                      }`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm ${
                        notification.read ? 'text-gray-600' : `text-${notification.color}-700`
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Action buttons for pending connection requests */}
                      {notification.pending && (
                        <div className="flex space-x-2 mt-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptConnection(notification.id);
                            }}
                            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              declineConnection(notification.id);
                            }}
                            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      
                      <span className={`text-xs ${
                        notification.read ? 'text-gray-500' : `text-${notification.color}-600`
                      }`}>
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
                
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="space-y-6">
            {isLoading && (
              <div className={`border border-blue-200 rounded-md p-4 ${showEffects ? 'bg-blue-50/70 backdrop-blur-sm' : 'bg-blue-50'}`}>
                <p className="text-blue-800">Loading profile data...</p>
              </div>
            )}
            
            {/* Profile Header with Enhanced Photo Upload */}
            <div className={`${showEffects ? 'bg-white/50 backdrop-blur-md' : 'bg-white'} rounded-lg shadow p-6`}>
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-300 flex items-center justify-center text-gray-600 text-3xl font-semibold overflow-hidden transition-all duration-200">
                    {photo ? (
                      <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      dashboardProfileData.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Photo Upload Button */}
                  <button
                    onClick={() => document.getElementById('profile-photo-upload')?.click()}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700"
                    title="Upload Photo"
                  >
                    📷
                  </button>
                  
                  {/* Photo Actions Menu */}
                  {photo && (
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-white rounded-lg shadow-lg border p-2 space-y-1 min-w-[140px]">
                        <button
                          onClick={() => document.getElementById('profile-photo-upload')?.click()}
                          className="w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center"
                        >
                          ✏️ Edit Photo
                        </button>
                        <button
                          onClick={removeProfilePhoto}
                          className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded flex items-center"
                        >
                          🗑️ Remove Photo
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    id="profile-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {dashboardProfileData.fullName}
                  </h2>
                  <p className="text-gray-600 mb-1">{dashboardProfileData.title} at {dashboardProfileData.company}</p>
                  <p className="text-sm text-gray-500 mb-3">{dashboardProfileData.location}</p>
                  
                  {/* Photo Upload Instructions */}
                  <div className={`p-3 rounded-lg border border-blue-200 ${showEffects ? 'bg-blue-50/70 backdrop-blur-sm' : 'bg-blue-50'}`}>
                    <p className="text-sm text-blue-700">
                      <strong>Profile Photo:</strong> Click the camera icon to upload a new photo, or hover over your current photo to edit or remove it.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                {!isEditingProfile ? (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button
                      onClick={saveProfile}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditingProfile ? (
                  <textarea
                    value={tempProfileData.bio}
                    onChange={(e) => setTempProfileData({...tempProfileData, bio: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">{profileData.bio || 'No bio added yet.'}</p>
                )}
              </div>

              {/* Location Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={tempProfileData.location}
                    onChange={(e) => setTempProfileData({...tempProfileData, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your location"
                  />
                ) : (
                  <p className="text-gray-600">{profileData.location || 'No location specified.'}</p>
                )}
              </div>

              {/* Full Name Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={tempProfileData.fullName}
                    onChange={(e) => setTempProfileData({...tempProfileData, fullName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-gray-600">{dashboardProfileData.fullName}</p>
                )}
              </div>
            </div>



            {/* Experience Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                {isEditingProfile && (
                  <button
                    onClick={openExperienceModal}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    disabled={isLoading}
                  >
                    + Add Experience
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {(isEditingProfile ? tempProfileData.experience : profileData.experience.map(exp => ({
                  title: exp.title,
                  company: exp.company,
                  duration: exp.end_date ? `${exp.start_date} - ${exp.end_date}` : exp.start_date,
                  description: exp.description
                }))).map((exp, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                        <p className="text-blue-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                        <p className="text-gray-600 mt-1">{exp.description}</p>
                      </div>
                      {isEditingProfile && (
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {!isEditingProfile && profileData.experience.length === 0 && (
                  <p className="text-gray-500">No experience added yet.</p>
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
                {isEditingProfile && (
                  <button
                    onClick={openAchievementModal}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    disabled={isLoading}
                  >
                    + Add Achievement
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {(isEditingProfile ? tempProfileData.achievements : profileData.achievements.map(ach => ({
                  title: ach.title,
                  description: ach.description || '',
                  date: ach.date || ''
                }))).map((achievement, index) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-500">{achievement.date}</p>
                        <p className="text-gray-600 mt-1">{achievement.description}</p>
                      </div>
                      {isEditingProfile && (
                        <button
                          onClick={() => removeAchievement(index)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {!isEditingProfile && profileData.achievements.length === 0 && (
                  <p className="text-gray-500">No achievements added yet.</p>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className={`min-h-screen relative ${isDarkMode ? 'dark' : ''}`} style={{ 
      backgroundColor: showEffects 
        ? (isDarkMode ? 'rgba(17, 24, 39, 0.3)' : 'rgba(249, 250, 251, 0.3)')
        : (isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(249, 250, 251, 0.8)')
    }}>
              {/* GPU Effects Background */}
        {showEffects && <TestEffects darkMode={isDarkMode} />}
      {/* Navigation Bar */}
                                                 <nav className={`${showEffects 
                           ? (isDarkMode ? 'bg-gray-800/60 backdrop-blur-md' : 'bg-white/60 backdrop-blur-md')
                           : (isDarkMode ? 'bg-gray-800' : 'bg-white')
                         } shadow-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#8B4513' }}>
                <span className="text-white font-bold text-sm">P</span>
              </div>
                              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-brown-800'}`} style={{ color: isDarkMode ? '#ffffff' : '#8B4513' }}>peer</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Effects Toggle */}
              <button
                onClick={() => setShowEffects(!showEffects)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  showEffects 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={showEffects ? 'Disable GPU Effects' : 'Enable GPU Effects'}
              >
                {showEffects ? '✨ Effects ON' : '✨ Effects OFF'}
              </button>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-800' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                title={isDarkMode ? 'Enable Light Mode' : 'Enable Dark Mode'}
              >
                {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`text-gray-600 hover:text-gray-900 relative transition-colors ${activeTab === 'notifications' ? 'font-semibold' : ''}`}
                style={{ color: activeTab === 'notifications' ? '#8B4513' : undefined }}
              >
                🔔 Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`text-gray-600 hover:text-gray-900 relative transition-colors ${activeTab === 'messages' ? 'font-semibold' : ''}`}
                style={{ color: activeTab === 'messages' ? '#8B4513' : undefined }}
              >
                💬 Messages
                {messages.filter(m => m.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {messages.filter(m => m.unread).length}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="text-white px-4 py-2 rounded hover:brightness-90 transition-colors"
                style={{ backgroundColor: '#8B4513' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Professional Welcome Section */}
            <div className="mb-8">
              <div className={`rounded-lg p-6 flex items-center space-x-6 shadow ${showEffects 
                ? (isDarkMode ? 'bg-gray-800/80 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md')
                : ''
              }`} style={{ 
                backgroundColor: showEffects 
                  ? 'transparent' 
                  : (isDarkMode ? '#374151' : '#fdf8f6')
              }}>
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: '#8B4513' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} style={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}>
                    Welcome{user?.username ? `, ${user.username}` : ''}!
                  </h1>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'} style={{ color: isDarkMode ? '#d1d5db' : '#374151' }}>We're glad to see you on your dashboard. Here you can manage your profile, posts, jobs, and more.</p>
                </div>
              </div>
            </div>
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Navigation Menu */}
            <div className={`${showEffects 
              ? (isDarkMode ? 'bg-gray-800/40 backdrop-blur-md' : 'bg-white/40 backdrop-blur-md')
              : (isDarkMode ? 'bg-gray-800/90 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-sm')
            } rounded-lg shadow`}>
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setActiveTab('feed')}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'feed' ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ backgroundColor: activeTab === 'feed' ? '#8B4513' : 'transparent' }}
                    >
                      📰 Feed
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('jobs')}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'jobs' ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ backgroundColor: activeTab === 'jobs' ? '#8B4513' : 'transparent' }}
                    >
                      💼 Jobs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'messages' ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ backgroundColor: activeTab === 'messages' ? '#8B4513' : 'transparent' }}
                    >
                      💬 Messages
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'notifications' ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ backgroundColor: activeTab === 'notifications' ? '#8B4513' : 'transparent' }}
                    >
                      🔔 Notifications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('post')}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'post' ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ backgroundColor: activeTab === 'post' ? '#8B4513' : 'transparent' }}
                    >
                      📝 Post
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${activeTab === 'profile' ? 'text-white font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                      style={{ backgroundColor: activeTab === 'profile' ? '#8B4513' : 'transparent' }}
                    >
                      👤 Profile
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>



      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  placeholder="e.g., Software Engineer"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  placeholder="e.g., TechCorp"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={newExperience.start_date}
                  onChange={(e) => setNewExperience({...newExperience, start_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newExperience.end_date}
                  onChange={(e) => setNewExperience({...newExperience, end_date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if current position</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Describe your role and achievements..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeExperienceModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addExperience}
                className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                style={{ backgroundColor: '#8B4513' }}
                disabled={!newExperience.title || !newExperience.company || !newExperience.start_date}
              >
                Add Experience
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Achievement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievement Title *</label>
                <input
                  type="text"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                  placeholder="e.g., Employee of the Year"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) => setNewAchievement({...newAchievement, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                  placeholder="Describe your achievement..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeAchievementModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={addAchievement}
                className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors"
                style={{ backgroundColor: '#8B4513' }}
                disabled={!newAchievement.title}
              >
                Add Achievement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Profile Photo</h3>
            
            {/* Photo Preview */}
            <div className="mb-6">
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                  {photoPreview ? (
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Instructions */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#fdf8f6' }}>
              <h4 className="font-medium mb-2" style={{ color: '#8B4513' }}>Photo Guidelines:</h4>
              <ul className="text-sm space-y-1" style={{ color: '#6d3410' }}>
                <li>• Use a clear, professional headshot</li>
                <li>• Recommended size: 400x400 pixels or larger</li>
                <li>• Supported formats: JPG, PNG, GIF</li>
                <li>• File size: Maximum 5MB</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelPhotoUpdate}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isUploadingPhoto}
              >
                Cancel
              </button>
              <button
                onClick={updateProfilePhoto}
                className="px-4 py-2 text-white rounded-md hover:brightness-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                style={{ backgroundColor: '#8B4513' }}
                disabled={!photoPreview || isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Photo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 