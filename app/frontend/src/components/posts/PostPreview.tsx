import React from 'react';

interface PostPreviewProps {
  content: string;
  media: File[];
  onClose: () => void;
}

const PostPreview: React.FC<PostPreviewProps> = ({ content, media, onClose }) => {
  const isImage = (file: File) => file.type.startsWith('image/');
  const isVideo = (file: File) => file.type.startsWith('video/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Post Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-4">
          {/* Mock Post Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Your Name</p>
              <p className="text-sm text-gray-500">Just now</p>
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-4">
            {content ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-gray-500 italic">No content</p>
            )}
          </div>

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="mb-4">
              {media.length === 1 ? (
                <div className="rounded-lg overflow-hidden">
                  {isImage(media[0]) ? (
                    <img
                      src={URL.createObjectURL(media[0])}
                      alt="Preview"
                      className="w-full max-h-96 object-cover"
                    />
                  ) : isVideo(media[0]) ? (
                    <video
                      src={URL.createObjectURL(media[0])}
                      className="w-full max-h-96 object-cover"
                      controls
                    />
                  ) : null}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                  {media.slice(0, 4).map((file, index) => (
                    <div key={index} className="aspect-square">
                      {isImage(file) ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : isVideo(file) ? (
                        <video
                          src={URL.createObjectURL(file)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : null}
                    </div>
                  ))}
                  {media.length > 4 && (
                    <div className="aspect-square bg-gray-900 flex items-center justify-center">
                      <span className="text-white font-medium">+{media.length - 4} more</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mock Interaction Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">Like</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm">Comment</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="text-sm">Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPreview; 