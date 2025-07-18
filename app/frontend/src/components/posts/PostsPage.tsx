import React, { useState } from 'react';
import PostCreate from './PostCreate';
import PostList from './PostList';

const PostsPage: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostCreated = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <PostCreate onPostCreated={handlePostCreated} />
      <div className="mt-8">
        <PostList refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default PostsPage; 