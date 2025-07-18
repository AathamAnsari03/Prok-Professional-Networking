import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../components/auth/api';
import { profileApi } from '../components/profile/api';

interface User {
  id: number;
  email: string;
  username: string;
}

interface Profile {
  id: number;
  user_id: number;
  avatar: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  address: string;
  skills: string[];
  socials: Record<string, string>;
  experiences: any[];
  education: any[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!token) return;
    
    setProfileLoading(true);
    try {
      const response = await profileApi.getProfile(token);
      if (response.success && response.profile) {
        setProfile(response.profile);
        console.log('[AuthContext] Profile loaded:', response.profile);
      } else {
        console.error('[AuthContext] Failed to load profile:', response.message);
      }
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Check for existing token and user data on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        
        // Fetch profile - if it fails, the token might be invalid
        fetchProfile().catch(() => {
          // If profile fetch fails, clear storage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
          setProfile(null);
          });
      } catch (error) {
        // Invalid stored data, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; message?: string }> => {
    console.log('[AuthContext] login called with:', { identifier, password });
    setLoading(true);
    
    try {
      const response = await authApi.login({ identifier, password });
      console.log('[AuthContext] login API response:', response);
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('[AuthContext] login success, user and token set');
        
        // Fetch profile after successful login
        await fetchProfile();
        
        return { success: true };
      }
      
      console.log('[AuthContext] login failed:', response.message || response.error);
      return { success: false, message: response.error || response.message || 'Login failed' };
    } catch (error: any) {
      console.error('[AuthContext] login error:', error);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    } finally {
      setLoading(false);
      console.log('[AuthContext] login: setLoading(false) called');
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    console.log('[AuthContext] signup called with:', { username, email });
    setLoading(true);
    
    try {
      const response = await authApi.signup({ username, email, password });
      console.log('[AuthContext] signup API response:', response);
      
      if (response.success) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        console.log('[AuthContext] signup success, user and token set');
        
        // Fetch profile after successful signup
        await fetchProfile();
        
        return true;
      }
      
      console.log('[AuthContext] signup failed:', response.message || response.error);
      return false;
    } catch (error: any) {
      console.error('[AuthContext] signup error:', error);
      return false;
    } finally {
      setLoading(false);
      console.log('[AuthContext] signup: setLoading(false) called');
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out...');
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to login page
    window.location.href = '/login';
  };

  const updateProfile = async (profileData: Partial<Profile>): Promise<{ success: boolean; message?: string }> => {
    console.log('[AuthContext] Updating profile:', profileData);
    setProfileLoading(true);
    
    try {
      const response = await profileApi.updateProfile(profileData, token!);
      console.log('[AuthContext] Profile update response:', response);
      
      if (response.success && response.profile) {
        setProfile(response.profile);
        console.log('[AuthContext] Profile updated successfully');
        return { success: true, message: 'Profile updated successfully' };
      } else {
        console.error('[AuthContext] Profile update failed:', response.message);
        return { success: false, message: response.message || 'Failed to update profile' };
      }
    } catch (error: any) {
      console.error('[AuthContext] Profile update error:', error);
      return { success: false, message: error.message || 'Network error. Please try again.' };
    } finally {
      setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const value: AuthContextType = {
    user,
    profile,
    token,
    isAuthenticated: !!token && !!user,
    login,
    signup,
    logout,
    updateProfile,
    refreshProfile,
    loading,
    profileLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Add a hook to use AuthContext for header/avatar
export const useAuthContext = () => React.useContext(AuthContext); 