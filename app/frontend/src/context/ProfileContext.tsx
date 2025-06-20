import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Profile, ProfileUpdateData } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  uploadingImage: boolean;
}

type ProfileAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: Profile }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_UPLOADING_IMAGE'; payload: boolean }
  | { type: 'CLEAR_PROFILE' };

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  updating: false,
  uploadingImage: false,
};

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, updating: false, uploadingImage: false };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload, loading: false, error: null };
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    case 'SET_UPLOADING_IMAGE':
      return { ...state, uploadingImage: action.payload };
    case 'CLEAR_PROFILE':
      return { ...state, profile: null, error: null };
    default:
      return state;
  }
};

interface ProfileContextType {
  state: ProfileState;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: () => Promise<void>;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { isAuthenticated } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const profile = await api.getProfile();
      dispatch({ type: 'SET_PROFILE', payload: profile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch profile' });
    }
  };

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
      return;
    }

    try {
      dispatch({ type: 'SET_UPDATING', payload: true });
      const result = await api.updateProfile(data);
      dispatch({ type: 'SET_PROFILE', payload: result.profile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update profile' });
    }
  };

  const uploadImage = async (file: File) => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
      return;
    }

    try {
      dispatch({ type: 'SET_UPLOADING_IMAGE', payload: true });
      const result = await api.uploadProfileImage(file);
      dispatch({ type: 'SET_PROFILE', payload: result.profile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to upload image' });
    }
  };

  const deleteImage = async () => {
    if (!isAuthenticated) {
      dispatch({ type: 'SET_ERROR', payload: 'Not authenticated' });
      return;
    }

    try {
      dispatch({ type: 'SET_UPLOADING_IMAGE', payload: true });
      const result = await api.deleteProfileImage();
      dispatch({ type: 'SET_PROFILE', payload: result.profile });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete image' });
    }
  };

  const clearProfile = () => {
    dispatch({ type: 'CLEAR_PROFILE' });
  };

  // Auto-fetch profile when authenticated
  useEffect(() => {
    if (isAuthenticated && !state.profile && !state.loading) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && !state.profile) {
        fetchProfile();
      }
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ERROR', payload: 'You are currently offline. Some features may be limited.' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, state.profile]);

  const value: ProfileContextType = {
    state,
    fetchProfile,
    updateProfile,
    uploadImage,
    deleteImage,
    clearProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 