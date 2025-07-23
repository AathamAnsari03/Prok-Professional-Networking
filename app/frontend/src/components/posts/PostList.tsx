import React, { useState, useEffect } from 'react';
import { postsApi } from './api';
import { useAuth } from '../../context/AuthContext';

interface Post {
  id: number;
  content: string;
  image_url?: string;
  created_at: string;
  user: {
    id: number;
    username: string;
  };
  likes_count: number;
  liked_by_user: boolean;
}

interface PostListProps {
  userId?: number; // If provided, shows only posts from this user
  refreshTrigger?: number; // Used to trigger refresh
}

const PostList: React.FC<PostListProps> = ({ userId, refreshTrigger }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = userId 
        ? await postsApi.getUserPosts(userId)
        : await postsApi.getPosts();
      
      if (response.posts) {
        setPosts(response.posts);
      } else {
        setError('Failed to load posts');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [userId, refreshTrigger]);

  const handleLike = async (postId: number) => {
    try {
      const response = await postsApi.likePost(postId);
      
      if (response.message) {
        // Update the post in the list
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  likes_count: response.likes_count,
                  liked_by_user: response.liked_by_user
                }
              : post
          )
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await postsApi.deletePost(postId);
      
      if (response.message) {
        // Remove the post from the list
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadPosts}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
        <p className="text-gray-500">
          {userId ? "This user hasn't posted anything yet." : "Be the first to share something!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow p-6">
          {/* Post Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{post.user.username}</p>
                <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
              </div>
            </div>
            
            {/* Delete button for own posts */}
            {user && post.user.username === user.name && (
              <button
                onClick={() => handleDelete(post.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete post"
              >
                🗑️
              </button>
            )}
          </div>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Post Image */}
          {post.image_url && (
            <div className="mb-4">
              <img 
                src={`http://localhost:5000${post.image_url}`} 
                alt="Post" 
                className="w-full max-h-96 object-cover rounded-lg"
                onError={(e) => {
                  // Fallback for broken images
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                post.liked_by_user 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <span className="text-lg">{post.liked_by_user ? '❤️' : '🤍'}</span>
              <span>{post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList; 