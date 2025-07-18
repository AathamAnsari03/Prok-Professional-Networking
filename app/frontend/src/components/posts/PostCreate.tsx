import React, { useState, useRef } from 'react';
import { postsApi } from './api';
import type { Post } from '../../types';
import SimpleEditor from '../shared/SimpleEditor';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileApi } from '../profile/api';
import { FaImage, FaVideo, FaTimes } from 'react-icons/fa';

const MAX_MEDIA_SIZE_MB = 10;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/webm'];

function isLoggedIn() {
  return Boolean(localStorage.getItem('token'));
}

interface PostCreateProps {
  onPostCreated?: () => void;
}

const PostCreate: React.FC<PostCreateProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !ALLOWED_IMAGE_TYPES.includes(file.type) &&
      !ALLOWED_VIDEO_TYPES.includes(file.type)
    ) {
      setError('Only PNG, JPG, JPEG images or MP4, MOV, WEBM videos are allowed.');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE_MB * 1024 * 1024) {
      setError('File too large. Max 10MB allowed.');
      return;
    }
    setMediaFile(file);
    setError(null);
    setMediaPreview(URL.createObjectURL(file));
  };

  // Drag-and-drop support
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (
        !ALLOWED_IMAGE_TYPES.includes(file.type) &&
        !ALLOWED_VIDEO_TYPES.includes(file.type)
      ) {
        setError('Only PNG, JPG, JPEG images or MP4, MOV, WEBM videos are allowed.');
        return;
      }
      if (file.size > MAX_MEDIA_SIZE_MB * 1024 * 1024) {
        setError('File too large. Max 10MB allowed.');
        return;
      }
      setMediaFile(file);
      setError(null);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!isLoggedIn()) {
      setError('You must be logged in to create a post.');
      return;
    }
    if (!content && !mediaFile) {
      setError('Post must have text or media.');
      return;
    }
    setLoading(true);
    try {
      const res = await postsApi.createPost(
        content, 
        mediaFile || undefined, 
        category || undefined, 
        tags.length > 0 ? tags : undefined, 
        visibility
      );
      if (res.success) {
        setSuccess('Post created successfully!');
        setContent('');
        setCategory('');
        setTags([]);
        setVisibility('public');
        handleRemoveMedia();
        if (onPostCreated) onPostCreated();
        setTimeout(() => navigate('/posts'), 1000); // Redirect after short delay
      } else {
        setError(res.message || 'Failed to create post.');
      }
    } catch (err: any) {
      if (err && err.response) {
        try {
          const data = await err.response.json();
          setError(data.message || 'Failed to create post. Please check your connection or login status.');
        } catch {
          setError('Failed to create post. Please check your connection or login status.');
        }
      } else if (err && err.message) {
        setError(err.message);
      } else {
        setError('Failed to create post. Please check your connection or login status.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Avatar logic
  const avatarUrl = profile?.avatar
    ? (profile?.avatar.startsWith('http') ? profile.avatar : `http://localhost:5000${profile.avatar}`)
    : profileApi.getDefaultAvatar(profile?.name || user?.username || 'User');
  const displayName = profile?.name || user?.username || 'User';

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-3xl font-extrabold mb-8 text-blue-700 tracking-tight">Create a Post</h2>
        {/* User avatar and name */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full border-4 border-blue-200 object-cover bg-gray-100 shadow-md"
          />
          <div>
            <div className="font-bold text-gray-900 text-xl">{displayName}</div>
            <div className="text-xs text-gray-500">Share your thoughts with your network</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <SimpleEditor
              value={content}
              onChange={handleContentChange}
              placeholder="What's on your mind? Start typing..."
              className="mb-2 rounded-2xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-200 transition-all min-h-[80px] text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              className="rounded-xl border border-gray-200 px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-full text-gray-900 placeholder-gray-500"
              placeholder="e.g., Technology, Travel, Food"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
            <select
              className="rounded-xl border border-gray-200 px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-full text-gray-900"
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="private">Private</option>
            </select>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center">
            {tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center text-sm shadow-sm">
                #{tag}
                <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="ml-2 text-xs hover:text-red-400">×</button>
              </span>
            ))}
            <input
              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-gray-900 placeholder-gray-500"
              placeholder="Add tag"
              value={tagInput}
              onChange={e => setTagInput(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && tagInput) {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              list="tag-suggestions"
            />
            <datalist id="tag-suggestions">
              {['react', 'typescript', 'tailwind', 'webdev', 'uiux'].filter(s => !tags.includes(s)).map(s => (
                <option value={s} key={s} />
              ))}
            </datalist>
          </div>
          {/* Media upload */}
          <div
            className="border-2 border-dashed border-blue-200 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-blue-50 hover:bg-blue-100 transition relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            aria-label="Upload image or video"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,video/mp4,video/mov,video/webm"
              onChange={handleMediaChange}
              ref={fileInputRef}
              className="hidden"
            />
            <div className="flex items-center gap-2 text-blue-600">
              <span className="font-medium">Add image or video (drag & drop or click)</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Max size: 10MB. Allowed: PNG, JPG, JPEG, MP4, MOV, WEBM.</div>
            {mediaPreview && (
              <div className="mt-4 w-full flex flex-col items-center gap-2 relative">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemoveMedia(); }}
                  className="absolute top-0 right-0 text-red-500 bg-white rounded-full shadow p-1 hover:bg-red-50"
                  aria-label="Remove media"
                >
                  ×
                </button>
                {mediaFile && mediaFile.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-xl border" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded-xl border" />
                )}
              </div>
            )}
          </div>
          {/* Feedback messages */}
          {error && <div className="text-red-600 text-sm font-medium animate-pulse">{error}</div>}
          {success && <div className="text-green-600 text-sm font-medium animate-fade-in">{success}</div>}
          {/* Post button at bottom right */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition disabled:opacity-50 text-lg"
              disabled={loading || !isLoggedIn() || (!content && !mediaFile)}
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span> Posting...</span>
              ) : 'Post'}
            </button>
          </div>
        </form>
        {/* Preview Section */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Live Preview</h3>
          <div className="border rounded-2xl p-5 bg-gray-50 min-h-[80px]">
            <div
              className="prose max-w-none text-gray-900"
              style={{ color: '#1F2937' }}
              dangerouslySetInnerHTML={{ __html: content || '<span class="text-gray-400">Nothing to preview.</span>' }}
            />
            {mediaPreview && (
              <div className="mt-3">
                {mediaFile && mediaFile.type.startsWith('image') ? (
                  <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-xl border" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-48 rounded-xl border" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCreate; 