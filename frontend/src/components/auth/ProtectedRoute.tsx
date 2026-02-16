import React, { useState, useCallback } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { OnboardingFlow, isOnboardingComplete } from '../onboarding/OnboardingFlow';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { fetchWorkspaces } = useWorkspaceStore();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(!isOnboardingComplete());

  const handleOnboardingComplete = useCallback(() => {
    // Re-fetch workspaces so the one created during onboarding appears
    fetchWorkspaces();
    setShowOnboarding(false);
  }, [fetchWorkspaces]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <Outlet />;
};
