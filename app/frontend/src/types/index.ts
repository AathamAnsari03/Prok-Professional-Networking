export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  avatar: string;
  banner: string;
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
  media_url?: string;
  media_type?: string;
  category?: string;
  tags?: string[];
  visibility?: string;
  likes_count?: number;
  views_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at?: string;
  likes: number;
  comments: Comment[];
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