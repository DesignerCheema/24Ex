import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AdminSignupForm from './AdminSignupForm';

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'admin'>('login');

  const toggleToSignup = () => setAuthMode('signup');
  const toggleToLogin = () => setAuthMode('login');
  const toggleToAdmin = () => setAuthMode('admin');

  switch (authMode) {
    case 'signup':
      return <SignupForm onToggleMode={toggleToLogin} onAdminMode={toggleToAdmin} />;
    case 'admin':
      return <AdminSignupForm onToggleMode={toggleToLogin} />;
    default:
      return <LoginForm onToggleMode={toggleToSignup} onAdminMode={toggleToAdmin} />;
  }
}