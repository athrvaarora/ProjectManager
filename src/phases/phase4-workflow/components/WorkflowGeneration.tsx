import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { FirestoreService } from '../services/firestore.service';
import { AIWorkflowService } from '../services/ai.service';
import { IProjectSetup } from '../../phase3-project-setup/types/project.types';
import { IOrganization } from '../../phase2-org-chart/types/org-chart.types';

interface WorkflowGenerationProps {
  project: IProjectSetup;
  organization: IOrganization;
}

export const WorkflowGeneration: React.FC<WorkflowGenerationProps> = ({
  project,
  organization
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateWorkflow = async () => {
    if (!user?.organizationId) {
      setError('Missing organization context');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const firestoreService = FirestoreService.getInstance();
      const aiService = AIWorkflowService.getInstance();

      // Generate workflow
      const workflowDoc = await aiService.generateWorkflow(project, organization);
      
      // Save workflow
      await firestoreService.saveWorkflow(project.id, workflowDoc);

      // Navigate to workflow view
      navigate(`/project/${project.id}/workflow/view`);
    } catch (err) {
      console.error('Error generating workflow:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate workflow');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        onClick={handleGenerateWorkflow}
        disabled={generating}
        startIcon={generating ? <CircularProgress size={20} /> : null}
      >
        {generating ? 'Generating Workflow...' : 'Generate Workflow'}
      </Button>
    </Box>
  );
}; 