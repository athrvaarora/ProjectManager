import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { FirestoreService } from '../services/firestore.service';
import { WorkflowGeneration } from './WorkflowGeneration';
import { IProjectSetup } from '../../phase3-project-setup/types/project.types';
import { IOrganization } from '../../phase2-org-chart/types/org-chart.types';
import { useAuth } from '../../phase1-auth/hooks/useAuth';

export const WorkflowGenerationWrapper: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<IProjectSetup | null>(null);
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log('WorkflowGenerationWrapper - Loading data with projectId:', projectId);
      console.log('WorkflowGenerationWrapper - User:', user);
      
      if (!projectId) {
        console.error('WorkflowGenerationWrapper - Missing projectId');
        setError('Missing project ID');
        setLoading(false);
        return;
      }

      if (!user?.organizationId) {
        console.error('WorkflowGenerationWrapper - Missing organizationId');
        setError('Missing organization context');
        setLoading(false);
        return;
      }

      try {
        console.log('WorkflowGenerationWrapper - Getting FirestoreService instance');
        const firestoreService = FirestoreService.getInstance();

        console.log('WorkflowGenerationWrapper - Fetching project and organization data');
        const [projectData, orgData] = await Promise.all([
          firestoreService.getProject(projectId),
          firestoreService.getOrganization(user.organizationId)
        ]);

        console.log('WorkflowGenerationWrapper - Project data:', projectData);
        console.log('WorkflowGenerationWrapper - Organization data:', orgData);

        if (!projectData) {
          console.error('WorkflowGenerationWrapper - Project not found');
          throw new Error('Project not found');
        }

        if (!orgData) {
          console.error('WorkflowGenerationWrapper - Organization not found');
          throw new Error('Organization not found');
        }

        setProject(projectData);
        setOrganization(orgData);
      } catch (err) {
        console.error('WorkflowGenerationWrapper - Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, user?.organizationId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading workflow data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Please check the console for more details or try again later.
        </Typography>
      </Box>
    );
  }

  if (!project || !organization) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Project or organization data not available
        </Alert>
        <Typography variant="body1">
          Please check if the project exists and you have access to it.
        </Typography>
      </Box>
    );
  }

  return <WorkflowGeneration project={project} organization={organization} />;
}; 