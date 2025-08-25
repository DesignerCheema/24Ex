import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthPage from '../Auth/AuthPage';
import { useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useAuth();
  const location = useLocation();

  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('Auth state:', {
    isAuthenticated: state.isAuthenticated,
    user: state.user ? { id: state.user.id, email: state.user.email, role: state.user.role } : null,
    token: state.token ? 'present' : 'missing'
  });

  if (!state.isAuthenticated) {
    // Allow access to public tracking page
    if (location.pathname === '/track') {
      return <>{children}</>;
    }
    
    console.log('Not authenticated - showing auth page');
    return <AuthPage />;
  }

  console.log('Authenticated - showing protected content');
  return <>{children}</>;
}