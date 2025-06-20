export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  current_position: string | null;
  company: string | null;
  industry: string | null;
  phone: string | null;
  website: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  profile_visibility: 'public' | 'private' | 'connections';
  profile_picture: string | null;
  cover_photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  current_position?: string;
  company?: string;
  industry?: string;
  phone?: string;
  website?: string;
  linkedin_url?: string;
  github_url?: string;
  profile_visibility?: 'public' | 'private' | 'connections';
  profile_picture?: string;
  cover_photo?: string;
}

export interface ImageUploadResponse {
  message: string;
  image: {
    filename: string;
    profile_url: string;
    thumbnail_url: string;
    size: number;
  };
  profile: Profile;
}

export interface ApiResponse<T = any> {
  message?: string;
  errors?: string[];
  data?: T;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface Education {
  id: number;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  media?: PostMedia[];
  created_at: string;
  likes: number;
  comments: Comment[];
}

export interface PostMedia {
  id: number;
  post_id: number;
  file_url: string;
  file_type: 'image' | 'video';
  file_name: string;
  created_at: string;
}

export interface CreatePostData {
  content: string;
  media?: File[];
}

export interface PostFormData {
  content: string;
  media: File[];
  preview: boolean;
}

export interface Comment {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  read: boolean;
} 