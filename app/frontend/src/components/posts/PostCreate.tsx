import React, { useState } from 'react';
import { postsApi } from './api';

interface PostCreateProps {
  onPostCreated?: () => void;
}

const PostCreate: React.FC<PostCreateProps> = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await postsApi.createPost(content, imageUrl);
      
      if (response.message) {
        setContent('');
        setImageUrl('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setShowPhotoUpload(false);
        
        if (onPostCreated) {
          onPostCreated();
        }
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload photo
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await postsApi.uploadPhoto(formData);
      setImageUrl(response.photo_url);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setImageUrl('');
    setShowPhotoUpload(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">📝 Create Post</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts, achievements, or updates..."
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        {/* Photo Preview */}
        {photoPreview && (
          <div className="relative">
            <img 
              src={photoPreview} 
              alt="Preview" 
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowPhotoUpload(!showPhotoUpload)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              <span>📷</span>
              <span>Add Photo</span>
            </button>
          </div>
          
          <button
            type="submit"
            className="px-6 py-2 text-white rounded-lg hover:brightness-90 transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#8B4513' }}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>

        {/* Photo Upload Input */}
        {showPhotoUpload && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="photo-upload"
              disabled={isSubmitting}
            />
            <label 
              htmlFor="photo-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              <div className="space-y-2">
                <div className="text-2xl">📷</div>
                <div>Click to upload a photo</div>
                <div className="text-sm text-gray-500">JPG, PNG, GIF up to 5MB</div>
              </div>
            </label>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostCreate; 