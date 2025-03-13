import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../phase1-auth/utils/firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import { ProjectIdentification } from './sections/ProjectIdentification';
import { ClientContact } from './sections/ClientContact';
import { ProjectOverview } from './sections/ProjectOverview';
import { TechnicalSpecs } from './sections/TechnicalSpecs';
import { Timeline } from './sections/Timeline';
import { ScopeDetails } from './sections/ScopeDetails';
import { QualityCompliance } from './sections/QualityCompliance';
import { Deployment } from './sections/Deployment';
import { TeamRisk } from './sections/TeamRisk';
import type { ProjectRequirements } from '../types/project.types';

const steps = [
  'Project Identification',
  'Client Contact',
  'Project Overview',
  'Technical Specifications',
  'Timeline',
  'Scope Details',
  'Quality & Compliance',
  'Deployment',
  'Additional Notes'
];

const initialRequirements: ProjectRequirements = {
  projectId: uuidv4(),
  projectTitle: '',
  clientCompany: '',
  clientDivision: '',
  primaryContact: {
    name: '',
    position: '',
    email: '',
    phone: '',
    isDecisionMaker: false,
  },
  secondaryContact: {
    name: '',
    position: '',
    email: '',
    phone: '',
    isDecisionMaker: false,
  },
  decisionMakers: [],
  summary: '',
  description: '',
  objectives: [],
  targetUsers: '',
  expectedUserVolume: 0,
  platform: {
    web: false,
    mobile: false,
    desktop: false,
    other: '',
  },
  requiredTechnologies: [],
  integrationRequirements: [],
  designDocuments: [],
  technicalConstraints: [],
  infrastructure: '',
  startDate: null,
  completionDate: null,
  priority: 'Medium',
  milestones: {
    discovery: null,
    design: null,
    development: null,
    testing: null,
    deployment: null,
  },
  coreFeatures: [],
  secondaryFeatures: [],
  outOfScope: [],
  futurePlans: [],
  testingLevels: [],
  complianceRequirements: [],
  securityRequirements: [],
  performanceExpectations: '',
  deploymentEnvironment: '',
  deploymentMethod: '',
  maintenanceExpectations: '',
  trainingRequirements: '',
  specialExpertise: [],
  specialExpertiseInput: '',
  clientInvolvement: 'Medium',
  resourceConstraints: [],
  resourceConstraintsText: '',
  crossTeamDependencies: [],
  crossTeamDependenciesText: '',
  knownChallenges: [],
  knownChallengesInput: '',
  criticalDependencies: [],
  criticalDependenciesInput: '',
  contingencyPlans: '',
  specialInstructions: '',
  historicalContext: '',
  attachments: [],
  initialNotes: '',
};

export type { ProjectRequirements };

export const ProjectSetupForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [requirements, setRequirements] = useState<ProjectRequirements>(initialRequirements);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    // If we're on the last step, trigger the save operation
    if (activeStep === steps.length - 1) {
      handleSave();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    if (!user?.organizationId) {
      setError('No organization ID found. Please ensure you are part of an organization.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create a new project document
      const projectId = requirements.projectId || uuidv4();
      const projectRef = doc(db, 'projects', projectId);
      
      // Set default values for team and risk fields that were removed
      const projectData = {
        ...requirements,
        // Default values for team & risk fields
        specialExpertise: requirements.specialExpertise || [],
        clientInvolvement: requirements.clientInvolvement || 'Medium',
        resourceConstraints: requirements.resourceConstraints || [],
        crossTeamDependencies: requirements.crossTeamDependencies || [],
        knownChallenges: requirements.knownChallenges || [],
        criticalDependencies: requirements.criticalDependencies || [],
        contingencyPlans: requirements.contingencyPlans || '',
        // Organization and metadata
        organizationId: user.organizationId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending_workflow_generation',
        metadata: {
          version: 1,
          lastModifiedBy: user.uid,
          workflowStatus: 'not_generated',
        }
      };

      console.log('Saving project data:', projectData);
      
      // Save project requirements
      await setDoc(projectRef, projectData);

      // Create a workflow document
      const workflowRef = doc(db, 'workflows', projectId);
      await setDoc(workflowRef, {
        projectId,
        organizationId: user.organizationId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        metadata: {
          version: 1,
          lastModifiedBy: user.uid,
          requiresRegeneration: false,
        },
        workflow: {
          steps: [],
          milestones: [],
          dependencies: [],
          teamAssignments: {},
          timeline: {
            startDate: requirements.startDate,
            endDate: requirements.completionDate,
            milestones: requirements.milestones,
          },
          constraints: {
            deadlines: [],
            priorities: requirements.priority,
            resourceConstraints: requirements.resourceConstraints || [],
          }
        }
      });

      // Create an index for the project-workflow relationship
      const indexRef = doc(db, 'projectWorkflows', projectId);
      await setDoc(indexRef, {
        projectId,
        workflowId: projectId,
        organizationId: user.organizationId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log('Successfully saved project data, navigating to project description');
      
      // Navigate to project description page
      navigate(`/project-description/${projectId}`);
    } catch (error) {
      console.error('Error saving project requirements:', error);
      setError('Failed to save project requirements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <ProjectIdentification requirements={requirements} setRequirements={setRequirements} />;
      case 1:
        return <ClientContact requirements={requirements} setRequirements={setRequirements} />;
      case 2:
        return <ProjectOverview requirements={requirements} setRequirements={setRequirements} />;
      case 3:
        return <TechnicalSpecs requirements={requirements} setRequirements={setRequirements} />;
      case 4:
        return <Timeline requirements={requirements} setRequirements={setRequirements} />;
      case 5:
        return <ScopeDetails requirements={requirements} setRequirements={setRequirements} />;
      case 6:
        return <QualityCompliance requirements={requirements} setRequirements={setRequirements} />;
      case 7:
        return <Deployment requirements={requirements} setRequirements={setRequirements} />;
      case 8:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Special Instructions"
                value={requirements.specialInstructions}
                onChange={(e) =>
                  setRequirements((prev) => ({
                    ...prev,
                    specialInstructions: e.target.value,
                  }))
                }
                placeholder="Any special instructions or notes for the project team"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Historical Context"
                value={requirements.historicalContext}
                onChange={(e) =>
                  setRequirements((prev) => ({
                    ...prev,
                    historicalContext: e.target.value,
                  }))
                }
                placeholder="Relevant historical information or context"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Initial Notes"
                value={requirements.initialNotes}
                onChange={(e) =>
                  setRequirements((prev) => ({
                    ...prev,
                    initialNotes: e.target.value,
                  }))
                }
                placeholder="Any additional notes or comments"
              />
            </Grid>
          </Grid>
        );
      default:
        return (
          <Typography>
            This section is under development. Please check back later.
          </Typography>
        );
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Project Setup
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4 }}>
          {activeStep === steps.length ? (
            <Box>
              <Typography>All steps completed - you're finished</Typography>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <CircularProgress size={24} /> : 'Generate Workflow'}
              </Button>
            </Box>
          ) : (
            <Box>
              {renderStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Container>
  );
}; 