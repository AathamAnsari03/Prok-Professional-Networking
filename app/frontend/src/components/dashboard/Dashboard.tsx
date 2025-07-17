import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
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
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-600">🎉 New beginnings are always exciting. Looking forward to this new chapter in my career!</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Frontend Developer</h3>
              <p className="text-gray-600 mb-2">TechCorp • Remote</p>
              <p className="text-sm text-gray-500 mb-3">$80k - $100k • Full-time</p>
              <p className="mb-4">We're looking for a talented Frontend Developer to join our team...</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply Now
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Backend Engineer</h3>
              <p className="text-gray-600 mb-2">DataFlow Inc • San Francisco</p>
              <p className="text-sm text-gray-500 mb-3">$90k - $120k • Full-time</p>
              <p className="mb-4">Join our backend team to build scalable APIs and microservices...</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Apply Now
              </button>
            </div>
          </div>
        );
      
      case 'messages':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">AS</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Alice Johnson</p>
                  <p className="text-sm text-gray-500">Hi! I saw your profile and would love to connect...</p>
                </div>
                <span className="text-xs text-gray-400">2h ago</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">MB</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Mike Brown</p>
                  <p className="text-sm text-gray-500">Thanks for the connection request! Let's stay in touch...</p>
                </div>
                <span className="text-xs text-gray-400">1d ago</span>
              </div>
            </div>
          </div>
        );
      
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-2xl font-semibold">JD</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">John Doe</h2>
                <p className="text-gray-600">Software Engineer at TechCorp</p>
                <p className="text-sm text-gray-500">San Francisco, CA</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-gray-600">Passionate software engineer with 5+ years of experience in full-stack development...</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Experience</h3>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">Senior Developer - TechCorp</p>
                    <p className="text-sm text-gray-500">2022 - Present</p>
                  </div>
                  <div>
                    <p className="font-medium">Software Engineer - StartupXYZ</p>
                    <p className="text-sm text-gray-500">2020 - 2022</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-brown-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-xl font-bold text-gray-900">peer</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">Notifications</button>
              <button className="text-gray-600 hover:text-gray-900">Messages</button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-semibold">John Doe</p>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">📍 San Francisco, CA</p>
                <p className="text-gray-600">🏢 TechCorp</p>
                <p className="text-gray-600">👥 500+ connections</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-lg shadow">
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setActiveTab('feed')}
                      className={`w-full text-left px-3 py-2 rounded ${activeTab === 'feed' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      📰 Feed
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('jobs')}
                      className={`w-full text-left px-3 py-2 rounded ${activeTab === 'jobs' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      💼 Jobs
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className={`w-full text-left px-3 py-2 rounded ${activeTab === 'messages' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      💬 Messages
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className={`w-full text-left px-3 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
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
    </div>
  );
};

export default Dashboard; 