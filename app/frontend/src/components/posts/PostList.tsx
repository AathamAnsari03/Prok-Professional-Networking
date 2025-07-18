import React, { useEffect, useState, useCallback } from 'react';
import { postsApi } from './api';
import type { PostFilters as PostFiltersType, PaginationInfo } from './api';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useDebounce } from '../../hooks/useDebounce';
import LazyImage from '../shared/LazyImage';
import PostFiltersComponent from './PostFilters';
import type { Post } from '../../types';

interface PostListProps {
  refreshKey?: number;
  showFilters?: boolean;
}

// Placeholder avatar generator
function getAvatarUrl(userId: number) {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${userId}`;
}

const PostList: React.FC<PostListProps> = ({ refreshKey, showFilters = true }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<PostFiltersType>({
    search: '',
    category: '',
    visibility: '',
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Fetch categories and popular tags
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          postsApi.getCategories(),
          postsApi.getPopularTags()
        ]);

        if (categoriesRes.success) {
          setCategories(categoriesRes.categories || []);
        }
        if (tagsRes.success) {
          setPopularTags(tagsRes.tags || []);
        }
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch posts with filters
  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      const isFirstPage = page === 1;
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await postsApi.getPosts(debouncedFilters, page, 10);
      
      if (response.success) {
        if (append) {
          setPosts(prev => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }
        setPagination(response.pagination || null);
      } else {
        setError(response.message || 'Failed to load posts.');
      }
    } catch (err) {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedFilters]);

  // Initial load and filter changes
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey) {
      fetchPosts(1, false);
    }
  }, [refreshKey, fetchPosts]);

  // Infinite scroll handler
  const handleLoadMore = useCallback(() => {
    if (pagination && pagination.has_next && !loadingMore) {
      fetchPosts(pagination.page + 1, true);
    }
  }, [pagination, loadingMore, fetchPosts]);

  // Infinite scroll hook
  const loadMoreRef = useInfiniteScroll({
    hasMore: pagination?.has_next || false,
    loading: loadingMore,
    onLoadMore: handleLoadMore
  });

  // Handle filter changes
  const handleFilterChange = (newFilters: PostFiltersType) => {
    setFilters(newFilters);
  };

  // Handle post like
  const handleLikePost = async (postId: number) => {
    try {
      const response = await postsApi.likePost(postId);
      if (response.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: response.likes_count }
            : post
        ));
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  // Loading skeleton
  const PostSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="h-48 bg-gray-200 rounded-xl"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <PostFiltersComponent
            filters={filters}
            onChange={handleFilterChange}
            categories={categories}
            popularTags={popularTags}
            loading={loading}
          />
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-6">
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500">Try adjusting your filters or create a new post.</p>
          </div>
        )}

        {posts.map((post, idx) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group relative"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 mb-4">
              <LazyImage
                src={getAvatarUrl(post.user_id)}
                alt="User avatar"
                className="w-10 h-10 rounded-full border border-gray-300 bg-gray-100"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">User #{post.user_id}</div>
                <div className="text-xs text-gray-400">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
              {post.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {post.category}
                </span>
              )}
            </div>

            {/* Post Content */}
            <div
              className="prose max-w-none mb-4 text-gray-800"
              style={{ color: '#1F2937' }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Media */}
            {post.media_url && post.media_type === 'image' && (
              <LazyImage
                src={`http://localhost:5000${post.media_url}`}
                alt="Post media"
                className="max-h-64 rounded-xl border mb-4 w-full object-cover"
              />
            )}

            {post.media_url && post.media_type === 'video' && (
              <video
                src={`http://localhost:5000${post.media_url}`}
                controls
                className="max-h-64 rounded-xl border mb-4 w-full"
              />
            )}

            {/* Post Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.likes_count || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.comments_count || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.views_count || 0}</span>
                </button>
              </div>
              {post.visibility && post.visibility !== 'public' && (
                <span className="text-xs text-gray-400 capitalize">
                  {post.visibility}
                </span>
              )}
            </div>

            {/* Divider */}
            {idx < posts.length - 1 && (
              <div className="absolute left-6 right-6 bottom-0 h-px bg-gray-100 group-hover:bg-gray-200 transition" />
            )}
          </div>
        ))}

        {/* Load More Trigger */}
        {pagination?.has_next && (
          <div ref={loadMoreRef} className="py-4">
            {loadingMore && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        )}

        {/* End of Posts */}
        {!pagination?.has_next && posts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>You've reached the end of the posts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList; 