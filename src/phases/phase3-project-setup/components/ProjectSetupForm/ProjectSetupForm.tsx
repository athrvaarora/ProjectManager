import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { 
  Container, 
  Button, 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Paper, 
  Typography, 
  useTheme,
  useMediaQuery,
  Divider,
  LinearProgress,
  StepConnector,
  stepConnectorClasses,
  styled,
  Alert,
  Snackbar
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import { saveProjectRequirements } from '../../services/project.service';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../phase1-auth/hooks/useAuth';
import { BasicInfoSection } from './BasicInfoSection';
import { ContactsSection } from './ContactsSection';
import { TechnicalRequirementsSection } from './TechnicalRequirementsSection';
import { TimelineSection } from './TimelineSection';
import { ScopeSection } from './ScopeSection';
import { QualitySection } from './QualitySection';
import { DeploymentSection } from './DeploymentSection';
import { TeamRiskSection } from './TeamRiskSection';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId'>;

const defaultValues: ProjectSetupFormData = {
  basicInfo: {
    title: '',
    projectId: '',
    clientCompany: '',
    clientDivision: '',
    summary: '',
    description: '',
    objectives: [],
    targetUsers: [],
    expectedUserVolume: '',
  },
  contacts: {
    primary: {
      name: '',
      position: '',
      email: '',
      phone: '',
      isDecisionMaker: false,
    },
    secondary: {
      name: '',
      position: '',
      email: '',
      phone: '',
      isDecisionMaker: false,
    },
    decisionMakers: [],
  },
  technical: {
    platform: [],
    technologies: [],
    integrations: [],
    designDocuments: '',
    technicalConstraints: '',
    infrastructureDetails: '',
    securityRequirements: [],
    performanceRequirements: {
      loadCapacity: '',
      responseTime: '',
      availability: '',
    },
  },
  deployment: {
    environment: '',
    method: '',
    maintenanceRequirements: '',
    trainingRequirements: '',
    rollbackPlan: '',
    monitoringStrategy: '',
  },
  timeline: {
    startDate: new Date(),
    targetCompletionDate: new Date(),
    priorityLevel: 'Medium',
    milestones: [],
    dependencies: [],
    phaseBreakdown: [
      'Discovery/Requirements',
      'Design Approval',
      'Development Phase',
      'Testing Phase',
      'Deployment Readiness'
    ],
  },
  scope: {
    coreFeatures: [],
    secondaryFeatures: [],
    outOfScope: [],
    futurePlans: [],
    assumptions: [],
    constraints: [],
  },
  quality: {
    testingLevels: [],
    complianceRequirements: [],
    securityRequirements: [],
    performanceRequirements: {
      loadCapacity: '',
      responseTime: '',
      availability: '',
    },
    acceptanceCriteria: [],
    qualityMetrics: [],
  },
  team: {
    specialExpertise: [],
    clientInvolvement: [],
    resourceConstraints: '',
    crossTeamDependencies: '',
    teamStructure: '',
    communicationPlan: '',
    roles: [],
    responsibilities: [],
  },
  risks: {
    risks: [],
    criticalDependencies: [],
    contingencyPlans: '',
    mitigationStrategies: [],
    riskAssessmentMatrix: [],
  },
  metadata: {
    status: 'draft',
    createdBy: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
    lastModifiedBy: '',
  },
};

const STEPS = [
  { 
    label: 'Project & Client Information', 
    icon: <BusinessIcon />,
    description: 'Basic project details and client contacts'
  },
  { 
    label: 'Technical Requirements', 
    icon: <CodeIcon />,
    description: 'Technical specifications and platform details'
  },
  { 
    label: 'Timeline & Scope', 
    icon: <TimelineIcon />,
    description: 'Project timeline, milestones, and scope details'
  },
  {
    label: 'Quality & Deployment',
    icon: <SecurityIcon />,
    description: 'Quality standards, compliance, and deployment details'
  },
  {
    label: 'Team & Risk Assessment',
    icon: <AssignmentIcon />,
    description: 'Team structure, risks, and contingency plans'
  }
];

// Custom connector for stepper
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #2196F3 0%, #21CBF3 100%)',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #2196F3 0%, #21CBF3 100%)',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

// Custom step icon
const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      'linear-gradient(136deg, #2196F3 0%, #21CBF3 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient(136deg, #2196F3 0%, #21CBF3 100%)',
  }),
}));

function ColorlibStepIcon(props: any) {
  const { active, completed, className, icon } = props;

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckIcon /> : STEPS[icon - 1].icon}
    </ColorlibStepIconRoot>
  );
}

export const ProjectSetupForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<{ [k: number]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const methods = useForm<ProjectSetupFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const newCompleted = { ...completed };
      newCompleted[activeStep] = true;
      setCompleted(newCompleted);
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGenerateWorkflow = async (data: ProjectSetupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('ProjectSetupForm - Generating workflow with data:', data);
      console.log('ProjectSetupForm - User:', user);
      
      if (!user?.organizationId) {
        console.error('ProjectSetupForm - Missing organizationId');
        setError('Missing organization ID. Please ensure you are part of an organization.');
        setIsLoading(false);
        return;
      }
      
      const projectData = {
        ...data,
        organizationId: user.organizationId,
        metadata: {
          ...data.metadata,
          createdBy: user?.uid || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastModifiedBy: user?.uid || '',
        }
      };
      
      console.log('ProjectSetupForm - Saving project requirements with data:', projectData);
      const projectId = await saveProjectRequirements(projectData);
      console.log('ProjectSetupForm - Project saved with ID:', projectId);
      
      // Navigate to the workflow generation page
      console.log('ProjectSetupForm - Navigating to:', `/project/${projectId}/workflow`);
      navigate(`/project/${projectId}/workflow`);
    } catch (err) {
      console.error('ProjectSetupForm - Error saving project requirements:', err);
      setError('Failed to save project requirements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <BasicInfoSection />
            <Divider sx={{ my: 4 }} />
            <ContactsSection />
          </Box>
        );
      case 1:
        return (
          <Box>
            <TechnicalRequirementsSection />
          </Box>
        );
      case 2:
        return (
          <Box>
            <TimelineSection />
            <Divider sx={{ my: 4 }} />
            <ScopeSection />
          </Box>
        );
      case 3:
        return (
          <Box>
            <QualitySection />
            <Divider sx={{ my: 4 }} />
            <DeploymentSection />
          </Box>
        );
      case 4:
        return (
          <Box>
            <TeamRiskSection />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom>
                Project Setup
              </Typography>
              <Typography color="textSecondary">
                Complete the essential project requirements to generate your workflow
              </Typography>
            </Box>

            <Stepper 
              activeStep={activeStep} 
              alternativeLabel={!isMobile}
              orientation={isMobile ? 'vertical' : 'horizontal'}
              connector={<ColorlibConnector />}
            >
              {STEPS.map((step, index) => (
                <Step key={step.label} completed={completed[index]}>
                  <StepLabel
                    StepIconComponent={ColorlibStepIcon}
                    optional={
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 4, mb: 2 }}>
              {isLoading && <LinearProgress />}
            </Box>

            <form onSubmit={methods.handleSubmit(handleGenerateWorkflow)}>
              <Box sx={{ mt: 4 }}>
                {renderStepContent(activeStep)}
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  startIcon={<ArrowBackIcon />}
                >
                  Back
                </Button>
                <Box>
                  {activeStep === STEPS.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={isLoading}
                      endIcon={<CheckIcon />}
                    >
                      Generate Workflow
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForwardIcon />}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </Paper>
        </Container>

        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </LocalizationProvider>
    </FormProvider>
  );
}; 