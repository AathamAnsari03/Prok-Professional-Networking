import type { Profile, ProfileUpdateData, ImageUploadResponse, ApiResponse } from '../types';

const API_URL = 'http://127.0.0.1:5000';

// Cache for profile data
let profileCache: Profile | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Utility functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const isOnline = () => navigator.onLine;

const getCachedProfile = (): Profile | null => {
  if (!profileCache || Date.now() - cacheTimestamp > CACHE_DURATION) {
    return null;
  }
  return profileCache;
};

const setCachedProfile = (profile: Profile) => {
  profileCache = profile;
  cacheTimestamp = Date.now();
  // Also cache in localStorage for offline access
  localStorage.setItem('cachedProfile', JSON.stringify(profile));
  localStorage.setItem('profileCacheTimestamp', cacheTimestamp.toString());
};

const getOfflineProfile = (): Profile | null => {
  try {
    const cached = localStorage.getItem('cachedProfile');
    const timestamp = localStorage.getItem('profileCacheTimestamp');
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (error) {
    console.warn('Failed to load cached profile:', error);
  }
  return null;
};

export const api = {
  // Auth endpoints
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse> => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection. Please check your network.');
      }

      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  signup: async (userData: { username: string; email: string; password: string }): Promise<ApiResponse> => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection. Please check your network.');
      }

      const response = await fetch(`${API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      return await handleResponse(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Signup failed');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cachedProfile');
    localStorage.removeItem('profileCacheTimestamp');
    profileCache = null;
    cacheTimestamp = 0;
  },

  // Profile endpoints
  getProfile: async (): Promise<Profile> => {
    try {
      // Check cache first
      const cached = getCachedProfile();
      if (cached) {
        return cached;
      }

      // Check offline cache
      if (!isOnline()) {
        const offlineProfile = getOfflineProfile();
        if (offlineProfile) {
          return offlineProfile;
        }
        throw new Error('No internet connection and no cached profile available.');
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      
      if (data.profile) {
        setCachedProfile(data.profile);
        return data.profile;
      }

      throw new Error('Invalid profile data received');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch profile');
    }
  },

  updateProfile: async (profileData: ProfileUpdateData): Promise<{ profile: Profile; updated_fields: string[] }> => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection. Please check your network.');
      }

      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      const data = await handleResponse(response);
      
      if (data.profile) {
        setCachedProfile(data.profile);
        return {
          profile: data.profile,
          updated_fields: data.updated_fields || []
        };
      }

      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  },

  uploadProfileImage: async (file: File): Promise<ImageUploadResponse> => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection. Please check your network.');
      }

      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await handleResponse(response);
      
      if (data.profile) {
        setCachedProfile(data.profile);
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
    }
  },

  deleteProfileImage: async (): Promise<{ profile: Profile }> => {
    try {
      if (!isOnline()) {
        throw new Error('No internet connection. Please check your network.');
      }

      const response = await fetch(`${API_URL}/api/profile/image`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      
      if (data.profile) {
        setCachedProfile(data.profile);
      }

      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete image');
    }
  },

  // Utility functions
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearCache: () => {
    profileCache = null;
    cacheTimestamp = 0;
    localStorage.removeItem('cachedProfile');
    localStorage.removeItem('profileCacheTimestamp');
  },

  // Network status
  isOnline: () => isOnline(),
}; 