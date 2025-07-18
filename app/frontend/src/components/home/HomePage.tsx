import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaFileAlt, FaBriefcase, FaComments } from 'react-icons/fa';

const HomePage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">ProK</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with professionals, share your expertise, and discover opportunities in your field.
          </p>
          
          {!isAuthenticated ? (
            <div className="space-x-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/signup"
                className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <Link
              to="/feed"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Feed
            </Link>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to grow professionally
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <FaUsers className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Professional Network</h3>
            <p className="text-gray-600">Connect with professionals in your industry</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <FaFileAlt className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Share Content</h3>
            <p className="text-gray-600">Share your expertise and insights</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <FaBriefcase className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Job Opportunities</h3>
            <p className="text-gray-600">Discover career opportunities</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-md">
            <FaComments className="text-4xl text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Direct Messaging</h3>
            <p className="text-gray-600">Connect privately with other professionals</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 