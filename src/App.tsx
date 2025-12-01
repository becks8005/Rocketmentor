import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import {
  SignupPage,
  LoginPage,
  ForgotPasswordPage,
  OnboardingPage,
  ThisWeekPage,
  PathPage,
  WinsPage,
  CoachPage,
} from './pages';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useApp();
  
  if (!state.user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!state.user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

// Auth Route wrapper (redirect to app if logged in)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useApp();
  
  if (state.user?.onboardingCompleted) {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
};

// Onboarding Route wrapper
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useApp();
  
  if (!state.user) {
    return <Navigate to="/signup" replace />;
  }
  
  if (state.user.onboardingCompleted) {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route 
        path="/signup" 
        element={
          <AuthRoute>
            <SignupPage />
          </AuthRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        } 
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Onboarding */}
      <Route 
        path="/onboarding" 
        element={
          <OnboardingRoute>
            <OnboardingPage />
          </OnboardingRoute>
        } 
      />
      
      {/* Protected App Routes */}
      <Route 
        path="/app" 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ThisWeekPage />} />
        <Route path="path" element={<PathPage />} />
        <Route path="wins" element={<WinsPage />} />
        <Route path="coach" element={<CoachPage />} />
      </Route>
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
