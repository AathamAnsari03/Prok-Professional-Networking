import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { postsApi } from './api';
import PostFilters from './PostFilters';
import LazyImage from '../common/LazyImage';
import { useDebounce } from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

interface Post {
  id: number;
  content: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  visibility: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  created_at: string;
  user: {
    id: number;
    username: string;
    profile: {
      first_name: string;
      last_name: string;
      headline: string;
      profile_picture: string | null;
    } | null;
  };
  media: Array<{
    id: number;
    file_url: string;
    file_type: string;
    thumbnail_url: string | null;
  }>;
}

interface FilterState {
  search: string;
  category: string;
  visibility: string;
  tags: string;
  sort_by: string;
  sort_order: string;
}

const PostList: React.FC = () => {
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    visibility: '',
    tags: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Debounced filters for search
  const debouncedFilters = useDebounce(filters, 500);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPosts(true);
  }, [debouncedFilters]);

  // Initial load and navigation
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (location.pathname === '/posts') {
      fetchPosts();
    }
  }, [location.pathname]);

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPosts([]);
      } else if (pagination.page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      const params = {
        page: reset ? 1 : pagination.page,
        per_page: pagination.per_page,
        ...debouncedFilters,
      };

      // Remove empty filter values
      Object.keys(params).forEach(key => {
        if (params[key as keyof typeof params] === '' || params[key as keyof typeof params] === null) {
          delete params[key as keyof typeof params];
        }
      });
      
      const response = await postsApi.getPosts(params);
      
      if (response.posts) {
        if (reset || pagination.page === 1) {
          setPosts(response.posts);
        } else {
          setPosts(prev => [...prev, ...response.posts]);
        }
        
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        if (reset || pagination.page === 1) {
          setPosts([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchPosts(true);
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && pagination.has_next) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      fetchPosts();
    }
  }, [loadingMore, pagination.has_next]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      visibility: '',
      tags: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  const handleLike = async (postId: number) => {
    try {
      await postsApi.likePost(postId);
      // Update the specific post's like count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1 }
          : post
      ));
    } catch (err: any) {
      console.error('Error liking post:', err);
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

  const renderMedia = (media: Post['media']) => {
    if (!media || media.length === 0) return null;

    return (
      <div className="mt-4 space-y-2">
        {media.map((item) => (
          <div key={item.id} className="rounded-lg overflow-hidden">
            {item.file_type === 'image' ? (
              <LazyImage
                src={`http://localhost:5000${item.thumbnail_url || item.file_url}`}
                alt="Post media"
                className="w-full h-48 object-cover"
              />
            ) : (
              <video
                src={`http://localhost:5000${item.file_url}`}
                controls
                className="w-full h-48 object-cover"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll({
    hasNextPage: pagination.has_next,
    isLoading: loadingMore,
    onLoadMore: handleLoadMore,
  });

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <svg 
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
          <Link
            to="/posts/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Post
          </Link>
        </div>
        <p className="text-gray-600 mt-2">Discover posts from your network</p>
      </div>

      {/* Filters */}
      <PostFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />

      {/* Results Summary */}
      {!loading && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {posts.length} of {pagination.total} posts
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(v => v) 
                ? 'Try adjusting your filters or search terms.'
                : 'Be the first to share something with your network!'
              }
            </p>
            {!Object.values(filters).some(v => v) && (
              <Link
                to="/posts/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Post Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {post.user.profile?.profile_picture ? (
                      <LazyImage
                        src={`http://localhost:5000${post.user.profile.profile_picture}`}
                        alt={`${post.user.profile.first_name} ${post.user.profile.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {post.user.profile?.first_name?.[0] || post.user.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {post.user.profile ? 
                        `${post.user.profile.first_name} ${post.user.profile.last_name}` : 
                        post.user.username
                      }
                    </p>
                    {post.user.profile?.headline && (
                      <p className="text-sm text-gray-500">{post.user.profile.headline}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.visibility === 'private' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Private
                      </span>
                    )}
                    {post.category && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {post.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                {post.title && (
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                )}
                <div 
                  className="text-gray-700 whitespace-pre-wrap mb-4"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                {/* Media */}
                {renderMedia(post.media)}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{post.comments_count}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span>{post.shares_count}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{post.views_count} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading more posts...</p>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Manual Pagination (fallback) */}
      {pagination.pages > 1 && !pagination.has_next && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                fetchPosts(true);
              }}
              disabled={!pagination.has_prev}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => {
                setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                fetchPosts(true);
              }}
              disabled={!pagination.has_next}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default PostList; 