import React from 'react';
// import Sidebar from './Sidebar';
// import ProfileSection from './ProfileSection';
// import Widgets from './Widgets';
import PostFilters from '../posts/PostFilters';
import PostList from '../posts/PostList';
// import Feed from './Feed'; // Placeholder for posts list

// Main dashboard layout inspired by LinkedIn, dark theme, responsive
const FeedDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {/* Sticky Sidebar (fixed on left) */}
      {/* <Sidebar /> */}

      {/* Main Content Area: margin-left for sidebar, max width, centered, responsive */}
      <main className="flex-1 flex flex-col items-center md:ml-16 px-2 md:px-8 py-8 w-full">
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8">
          {/* Left: Profile + Post + Feed */}
          <section className="flex-1 flex flex-col gap-6">
            {/* Profile section with avatar, name, and Edit Profile modal */}
            {/* <ProfileSection /> */}
            <PostFilters filters={{ search: '', category: '', visibility: '', tags: [], sortBy: 'created_at', sortOrder: 'desc' }} onFiltersChange={() => {}} categories={[]} popularTags={[]} />
            <PostList showFilters={false} />
            {/* Remove PostCreate from feed */}
          </section>

          {/* Right: Widgets (hidden on small screens) */}
          {/* <aside className="hidden md:block w-80 flex-shrink-0">
            <Widgets />
          </aside> */}
        </div>
      </main>
    </div>
  );
};

export default FeedDashboard; 