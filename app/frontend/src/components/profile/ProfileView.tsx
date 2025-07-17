import React, { useState, useEffect } from 'react';

// Mock data for demonstration
const mockProfileData = {
  user: {
    id: 1,
    name: 'John Doe',
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    avatar: null, // Will use initials
    bio: 'Passionate software engineer with 5+ years of experience in full-stack development. Specialized in React, Node.js, and cloud technologies. Always eager to learn new technologies and solve complex problems.',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    website: 'https://johndoe.dev',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe'
    }
  },
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'PostgreSQL'],
  experience: [
    {
      id: 1,
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      startDate: '2022-01',
      endDate: 'Present',
      description: 'Leading development of scalable web applications using React and Node.js. Mentoring junior developers and implementing best practices.'
    },
    {
      id: 2,
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      startDate: '2020-03',
      endDate: '2021-12',
      description: 'Built and maintained multiple web applications. Collaborated with cross-functional teams to deliver high-quality products.'
    }
  ],
  education: [
    {
      id: 1,
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startYear: 2016,
      endYear: 2020,
      gpa: '3.8'
    }
  ],
  activity: [
    {
      id: 1,
      type: 'post',
      content: 'Excited to share that I\'ve started a new position as Senior Software Engineer at TechCorp!',
      timestamp: '2024-01-15T10:30:00Z',
      likes: 45,
      comments: 12
    },
    {
      id: 2,
      type: 'connection',
      content: 'Connected with Jane Smith',
      timestamp: '2024-01-14T15:20:00Z'
    },
    {
      id: 3,
      type: 'post',
      content: 'Just completed a major project using React and Node.js. The team did an amazing job!',
      timestamp: '2024-01-10T09:15:00Z',
      likes: 23,
      comments: 8
    }
  ],
  connections: 500,
  mutualConnections: 45
};

const ProfileView: React.FC = () => {
  const [profileData, setProfileData] = useState(mockProfileData);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    experience: true,
    education: true,
    activity: true
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="relative">
          {/* Cover Image Placeholder */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
          
          {/* Avatar and Basic Info */}
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end space-x-4 -mt-16">
                <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-4xl font-bold text-gray-600">
                    {getInitials(profileData.user.name)}
                  </span>
                </div>
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{profileData.user.name}</h1>
                  <p className="text-xl text-gray-600">{profileData.user.title}</p>
                  <p className="text-gray-500">📍 {profileData.user.location}</p>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-3 mt-4 sm:mt-0">
                {Object.entries(profileData.user.socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <span className="capitalize">{platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-gray-700 leading-relaxed">{profileData.user.bio}</p>
          </div>

          {/* Experience Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              <button
                onClick={() => toggleSection('experience')}
                className="lg:hidden text-blue-600 hover:text-blue-800"
              >
                {expandedSections.experience ? 'Collapse' : 'Expand'}
              </button>
            </div>
            
            {expandedSections.experience && (
              <div className="space-y-6">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                    <p className="text-blue-600 font-medium">{exp.company}</p>
                    <p className="text-gray-500 text-sm">{exp.location}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                      {exp.endDate === 'Present' ? ' Present' : ` ${new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    </p>
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Education</h2>
              <button
                onClick={() => toggleSection('education')}
                className="lg:hidden text-blue-600 hover:text-blue-800"
              >
                {expandedSections.education ? 'Collapse' : 'Expand'}
              </button>
            </div>
            
            {expandedSections.education && (
              <div className="space-y-4">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-lg">{edu.degree}</h3>
                    <p className="text-green-600 font-medium">{edu.school}</p>
                    <p className="text-gray-500 text-sm">{edu.location}</p>
                    <p className="text-gray-500 text-sm">{edu.startYear} - {edu.endYear}</p>
                    {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <button
                onClick={() => toggleSection('activity')}
                className="lg:hidden text-blue-600 hover:text-blue-800"
              >
                {expandedSections.activity ? 'Collapse' : 'Expand'}
              </button>
            </div>
            
            {expandedSections.activity && (
              <div className="space-y-4">
                {profileData.activity.map((activity) => (
                  <div key={activity.id} className="border-l-4 border-purple-500 pl-4">
                    <p className="text-gray-700">{activity.content}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                    {activity.likes && (
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>👍 {activity.likes}</span>
                        <span>💬 {activity.comments}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">📧</span>
                <a href={`mailto:${profileData.user.email}`} className="text-blue-600 hover:underline">
                  {profileData.user.email}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">📱</span>
                <span>{profileData.user.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">🌐</span>
                <a href={profileData.user.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {profileData.user.website}
                </a>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Connections */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Connections</h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">{profileData.connections}</p>
              <p className="text-gray-600">Total connections</p>
              <p className="text-sm text-gray-500">{profileData.mutualConnections} mutual connections</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView; 