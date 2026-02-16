import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { useAuthStore } from '../store/authStore';

const SignupPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (isAuthenticated) {
    return <Navigate to={redirect || '/dashboard'} replace />;
  }

  return <SignupForm />;
};

export default SignupPage;
