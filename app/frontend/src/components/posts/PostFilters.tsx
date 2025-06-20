import React, { useState, useEffect } from 'react';
import { postsApi } from './api';

interface FilterState {
  search: string;
  category: string;
  visibility: string;
  tags: string;
  sort_by: string;
  sort_order: string;
}

interface PostFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const PostFilters: React.FC<PostFiltersProps> = ({ filters, onFiltersChange, onClearFilters }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    setLoading(true);
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        postsApi.getCategories(),
        postsApi.getPopularTags(15)
      ]);
      setCategories(categoriesResponse.categories || []);
      setPopularTags(tagsResponse.tags || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleTagClick = (tag: string) => {
    const currentTags = filters.tags ? filters.tags.split(',').map(t => t.trim()) : [];
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags.join(', '));
  };

  const clearAllFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Filter Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search posts..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category and Visibility Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {loading ? (
                  <option disabled>Loading...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={filters.visibility}
                onChange={(e) => handleFilterChange('visibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Posts</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="connections">Connections</option>
              </select>
            </div>
          </div>

          {/* Sorting Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="created_at">Date Created</option>
                <option value="updated_at">Date Updated</option>
                <option value="likes_count">Most Liked</option>
                <option value="views_count">Most Viewed</option>
                <option value="comments_count">Most Commented</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Popular Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popular Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <div className="text-gray-500">Loading tags...</div>
              ) : (
                popularTags.map((tag) => {
                  const isSelected = filters.tags?.includes(tag) || false;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })
              )}
            </div>
            {filters.tags && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Tags
                </label>
                <input
                  type="text"
                  value={filters.tags}
                  onChange={(e) => handleFilterChange('tags', e.target.value)}
                  placeholder="Enter tags separated by commas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostFilters; 