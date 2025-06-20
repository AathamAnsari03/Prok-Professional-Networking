import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from './RichTextEditor';
import MediaUpload from './MediaUpload';
import PostPreview from './PostPreview';
import { postsApi } from './api';

interface PostFormData {
  content: string;
  media: File[];
}

const schema = yup.object({
  content: yup.string(),
  media: yup.array().of(yup.mixed()),
}).required();

const PostCreate: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PostFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      content: '',
      media: [],
    },
  });

  const watchedContent = watch('content');
  const watchedMedia = watch('media');

  const handleContentChange = (content: string) => {
    setValue('content', content);
  };

  const handleMediaChange = (files: File[]) => {
    setValue('media', files);
  };

  const onSubmit = async (data: PostFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Strip HTML tags for content validation
      const textContent = data.content.replace(/<[^>]*>/g, '').trim();
      
      if (!textContent && data.media.length === 0) {
        throw new Error('Post must contain either text content or media');
      }

      await postsApi.createPost(data.content, data.media);
      
      setSubmitSuccess(true);
      reset();
      
      // Navigate to posts list after successful submission
      setTimeout(() => {
        navigate('/posts');
      }, 1500);
      
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const isFormValid = true; // Always allow form submission for testing

  console.log('PostCreate rendering with watchedMedia:', watchedMedia);

  return (
    <div className="p-4 mx-auto max-w-4xl">
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <p className="mt-1 text-sm text-blue-100">Share your thoughts, updates, or media with your network</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Success Message */}
          {submitSuccess && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <svg className="mr-2 w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-green-800">Post created successfully!</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <svg className="mr-2 w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800">{submitError}</span>
              </div>
            </div>
          )}

          {/* Rich Text Editor */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Post Content
            </label>
            <RichTextEditor
              content={watchedContent}
              onChange={handleContentChange}
              placeholder="What's on your mind? Share your thoughts, updates, or insights..."
              className="min-h-[200px]"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Add Media (Optional)
            </label>
            <MediaUpload
              onMediaChange={handleMediaChange}
              maxFiles={5}
              maxFileSize={10}
            />
          </div>

          {/* Character Count */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>
                {watchedContent.replace(/<[^>]*>/g, '').length} characters
              </span>
              <span>
                {watchedMedia.length} media file{watchedMedia.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {watchedContent.replace(/<[^>]*>/g, '').length > 1000 && (
                <span className="text-orange-600">
                  {Math.round((watchedContent.replace(/<[^>]*>/g, '').length / 1000) * 100)}% of recommended length
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handlePreview}
                disabled={!isFormValid}
                className="flex items-center px-4 py-2 space-x-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => reset()}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex items-center px-6 py-2 space-x-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Post Preview Modal */}
      {showPreview && (
        <PostPreview
          content={watchedContent}
          media={watchedMedia}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default PostCreate; 