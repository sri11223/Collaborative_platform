import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PageSpinner } from './components/common/Spinner';
import { useAuthStore } from './store/authStore';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BoardPage = lazy(() => import('./pages/BoardPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const InboxPage = lazy(() => import('./pages/InboxPage'));
const MyTasksPage = lazy(() => import('./pages/MyTasksPage'));
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DirectMessagesPage = lazy(() => import('./pages/DirectMessagesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AiPage = lazy(() => import('./pages/AiPage'));

const App: React.FC = () => {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f9fafb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />
      <Suspense fallback={<PageSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/inbox" element={<InboxPage />} />
              <Route path="/my-tasks" element={<MyTasksPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/board/:id" element={<BoardPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/ai" element={<AiPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/messages" element={<DirectMessagesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
