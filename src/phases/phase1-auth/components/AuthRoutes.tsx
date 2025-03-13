import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { VerifyEmail } from './VerifyEmail';
import { OrganizationSelection } from './OrganizationSelection';
import { OrganizationChart } from '../../phase2-org-chart/components/OrganizationChart';
import { ProjectRequirements } from '../../phase3-requirements/components/ProjectRequirements';
import { WorkflowGeneration } from '../../phase4-workflow/components/WorkflowGeneration';
import { Dashboard } from '../../phase5-jira-dashboard/components/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import { WorkflowGenerationWrapper } from '../../phase4-workflow/components/WorkflowGenerationWrapper';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireUnauth?: boolean;
  requireVerified?: boolean;
  requireNoOrganization?: boolean;
  requireOrganization?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  requireUnauth = false,
  requireVerified = false,
  requireNoOrganization = false,
  requireOrganization = false,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" />;
  }

  if (requireUnauth && user) {
    return <Navigate to="/" />;
  }

  if (requireVerified && user && !user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (requireNoOrganization && user?.hasOrganization) {
    return <Navigate to="/dashboard" />;
  }

  if (requireOrganization && user && !user.hasOrganization) {
    return <Navigate to="/organization-selection" />;
  }

  return <>{children}</>;
};

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  if (!user.hasOrganization) {
    return <Navigate to="/organization-selection" />;
  }

  return <>{children}</>;
};

export const AuthRoutes: React.FC = () => {
  const { user } = useAuth();
  console.log("Current user state:", user);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <ProtectedRoute requireUnauth>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute requireUnauth>
            <RegisterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute requireAuth>
            <VerifyEmail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization-selection"
        element={
          <ProtectedRoute requireAuth requireVerified requireNoOrganization>
            <OrganizationSelection />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organization-chart"
        element={
          <ProtectedRoute requireAuth requireVerified>
            <OrganizationChart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-requirements"
        element={
          <ProtectedRoute requireAuth requireVerified>
            <ProjectRequirements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/workflow/generate"
        element={
          <ProtectedRoute requireAuth requireVerified>
            <WorkflowGenerationWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAuth requireVerified requireOrganization>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" />
          ) : !user.emailVerified ? (
            <Navigate to="/verify-email" />
          ) : !user.hasOrganization ? (
            <Navigate to="/organization-selection" />
          ) : (
            <Navigate to="/dashboard" />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}; 