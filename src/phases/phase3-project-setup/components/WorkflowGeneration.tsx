import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, CircularProgress } from '@mui/material';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../phase1-auth/utils/firebaseConfig';
import { IWorkflow } from '../../phase4-workflow/types/workflow.types';

export const WorkflowGeneration: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => {
          // This component is deprecated, using phase4 WorkflowGeneration instead
          window.location.href = `/project/${projectId}/workflow`;
        }}
      >
        Go to Workflow Generation
      </Button>
    </Box>
  );
}; 