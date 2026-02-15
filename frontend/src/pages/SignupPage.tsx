import React from 'react';
import { Navigate } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuthStore } from '../store/authStore';

const SignupPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <SignupForm />;
};

export default SignupPage;
