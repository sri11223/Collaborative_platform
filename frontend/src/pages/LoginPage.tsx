import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (isAuthenticated) {
    return <Navigate to={redirect || '/dashboard'} replace />;
  }

  return <LoginForm />;
};

export default LoginPage;
