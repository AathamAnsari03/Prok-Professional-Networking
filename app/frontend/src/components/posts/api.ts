const API_URL = 'http://localhost:5000';

export interface PostFilters {
  search: string;
  category: string;
  visibility: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PostsResponse {
  success: boolean;
  posts: any[];
  pagination?: PaginationInfo;
  message?: string;
}

export const postsApi = {
  createPost: async (content: string, mediaFile?: File, category?: string, tags?: string[], visibility?: string) => {
    if (!content.trim() && !mediaFile) {
      // Return error, let UI handle toast/snackbar
      return { success: false, message: 'Please enter content or upload media before posting.' };
    }
    const token = localStorage.getItem('token');
    if (mediaFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('media', mediaFile);
      if (category) formData.append('category', category);
      if (tags) formData.append('tags', JSON.stringify(tags));
      if (visibility) formData.append('visibility', visibility);
    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
          Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
    } else {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          category,
          tags,
          visibility,
        }),
      });
      return response.json();
    }
  },

  getPosts: async (filters?: Partial<PostFilters>, page: number = 1, perPage: number = 10): Promise<PostsResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.visibility) params.append('visibility', filters.visibility);
      if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
    }
    
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await fetch(`${API_URL}/api/posts?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getCategories: async () => {
    const response = await fetch(`${API_URL}/api/posts/categories`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  getPopularTags: async () => {
    const response = await fetch(`${API_URL}/api/posts/popular-tags`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  likePost: async (postId: number) => {
    const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },
}; 