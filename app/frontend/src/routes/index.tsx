import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ForgotPassword from '../components/auth/ForgotPassword';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostsPage from '../components/posts/PostsPage';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';
import NotFound from '../components/NotFound';
import MainLayout from '../components/navigation/MainLayout';
import HomePage from '../components/home/HomePage';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import PublicRoute from '../components/shared/PublicRoute';
import FeedDashboard from '../components/feed/FeedDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ), // All main app pages use this layout
    children: [
      { path: '/profile', element: <ProfileView /> },
      { path: '/edit-profile', element: <ProfileEdit /> },
      { path: '/posts/create', element: <PostCreate /> },
      { path: '/posts', element: <PostsPage /> },
      { path: '/feed', element: <FeedDashboard /> },
      { path: '/jobs', element: <JobList /> },
      { path: '/messages', element: <MessageList /> },
      { path: '*', element: <NotFound /> },
    ],
  },
], {
  future: {
    v7_startTransition: true,
  } as any,
}); 