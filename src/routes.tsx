import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './phases/phase1-auth/components/LoginPage';
import { RegisterPage } from './phases/phase1-auth/components/RegisterPage';
import { VerifyEmail } from './phases/phase1-auth/components/VerifyEmail';
import { OrganizationSelection } from './phases/phase1-auth/components/OrganizationSelection';
import { JoinOrganization } from './phases/phase1-auth/components/JoinOrganization';
import { SignupInvite } from './phases/phase1-auth/components/SignupInvite';
import { OrganizationChart } from './phases/phase2-org-chart/components/OrganizationChart';
import { ProjectSetupForm } from './phases/phase3-project-setup/components/ProjectSetupForm/ProjectSetupForm';
import { ProjectDescription } from './phases/phase3-project-setup/components/ProjectDescription';
import { ProjectSummary } from './phases/phase3-project-setup/components/ProjectSummary';
import { WorkflowGenerator } from './phases/phase3-project-setup/components/WorkflowGenerator/WorkflowGenerator';
import { WorkflowGenerationWrapper } from './phases/phase4-workflow/components/WorkflowGenerationWrapper';
import { Dashboard } from './phases/phase1-auth/components/Dashboard';
import { PrivateRoute } from './components/PrivateRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/signup-invite/:inviteCode" element={<SignupInvite />} />
      <Route
        path="/organization-selection"
        element={
          <PrivateRoute>
            <OrganizationSelection />
          </PrivateRoute>
        }
      />
      <Route
        path="/join-organization"
        element={
          <PrivateRoute>
            <JoinOrganization />
          </PrivateRoute>
        }
      />
      <Route
        path="/organization-chart"
        element={
          <PrivateRoute>
            <OrganizationChart />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/project-setup"
        element={
          <PrivateRoute>
            <ProjectSetupForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/project-description/:projectId"
        element={
          <PrivateRoute>
            <ProjectDescription />
          </PrivateRoute>
        }
      />
      <Route
        path="/project-summary/:projectId"
        element={
          <PrivateRoute>
            <ProjectSummary />
          </PrivateRoute>
        }
      />
      <Route
        path="/project/:projectId/workflow"
        element={
          <PrivateRoute>
            <WorkflowGenerationWrapper />
          </PrivateRoute>
        }
      />
      <Route
        path="/workflow-generator/:projectId"
        element={
          <PrivateRoute>
            <WorkflowGenerator />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 