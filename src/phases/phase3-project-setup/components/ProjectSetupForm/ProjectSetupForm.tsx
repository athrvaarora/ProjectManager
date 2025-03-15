import React, { useState, useEffect } from 'react';
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
  Snackbar,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  alpha
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import TimelineIcon from '@mui/icons-material/Timeline';
import SecurityIcon from '@mui/icons-material/Security';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { saveProjectRequirements, getProjectRequirements } from '../../services/project.service';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../../phase1-auth/hooks/useAuth';
import { BasicInfoSection } from './BasicInfoSection';
import { ContactsSection } from './ContactsSection';
import { TechnicalRequirementsSection } from './TechnicalRequirementsSection';
import { TimelineSection } from './TimelineSection';
import { ScopeSection } from './ScopeSection';
import { QualitySection } from './QualitySection';
import { DeploymentSection } from './DeploymentSection';
import { IProjectSetup } from '../../types/project.types';

// Update the type definition to make id optional
type ProjectSetupFormData = Omit<IProjectSetup, 'organizationId'> & { id?: string };

const defaultValues: ProjectSetupFormData = {
  id: '',
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
  const [isLoadingExistingProject, setIsLoadingExistingProject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openLoadingModal, setOpenLoadingModal] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('Saving project data...');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  
  const methods = useForm<ProjectSetupFormData>({
    defaultValues,
    mode: 'onChange',
  });

  // Load existing project data if projectId is provided in URL
  useEffect(() => {
    const loadExistingProject = async () => {
      const queryParams = new URLSearchParams(location.search);
      const projectId = queryParams.get('projectId');
      
      if (projectId) {
        setIsLoadingExistingProject(true);
        setError(null);
        
        try {
          const projectData = await getProjectRequirements(projectId);
          
          if (projectData) {
            console.log('Loaded existing project data:', projectData);
            
            // Reset form with existing project data
            methods.reset(projectData as any);
            
            // Mark all steps as completed
            const newCompleted: { [k: number]: boolean } = {};
            STEPS.forEach((_, index) => {
              newCompleted[index] = true;
            });
            setCompleted(newCompleted);
          } else {
            setError('Project not found. Starting with a new project.');
          }
        } catch (err) {
          console.error('Error loading existing project:', err);
          setError('Failed to load existing project. Starting with a new project.');
        } finally {
          setIsLoadingExistingProject(false);
        }
      }
    };
    
    loadExistingProject();
  }, [location.search, methods]);

  // Effect to animate the loading progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (openLoadingModal && loadingProgress < 90) {
      timer = setTimeout(() => {
        // Gradually increase progress, slowing down as it approaches 90%
        const increment = Math.max(1, 10 - Math.floor(loadingProgress / 10));
        setLoadingProgress(prev => Math.min(prev + increment, 90));
        
        // Update loading message based on progress
        if (loadingProgress > 30 && loadingProgress <= 60) {
          setLoadingMessage('Analyzing project requirements...');
        } else if (loadingProgress > 60) {
          setLoadingMessage('Preparing to generate summary...');
        }
      }, 300);
    }
    return () => clearTimeout(timer);
  }, [openLoadingModal, loadingProgress]);

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

  const handleGenerateWorkflow = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get form values
      const data = methods.getValues();
      console.log('ProjectSetupForm - Generating workflow with data:', data);
      console.log('ProjectSetupForm - User:', user);
      
      if (!user?.organizationId) {
        console.error('ProjectSetupForm - Missing organizationId');
        setError('Missing organization ID. Please ensure you are part of an organization.');
        setIsLoading(false);
        return;
      }
      
      // Check if we're updating an existing project
      const queryParams = new URLSearchParams(location.search);
      const existingProjectId = queryParams.get('projectId');
      
      const projectData = {
        ...data,
        id: existingProjectId || data.id || crypto.randomUUID(), // Ensure id is set
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
      
      // If we have an existing projectId, use it when saving
      const projectId = existingProjectId 
        ? await saveProjectRequirements(existingProjectId, projectData as any, user.uid)
        : await saveProjectRequirements(projectData as any);
        
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

  const handleSummarizeProject = async () => {
    // Validate all form fields
    const isValid = await methods.trigger();
    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOpenLoadingModal(true);
    setLoadingProgress(0);
    setLoadingMessage('Saving project data...');

    try {
      // Get form values
      const formValues = methods.getValues();
      console.log('Form values:', formValues);

      // Get user info
      const organizationId = user?.organizationId;
      if (!organizationId) {
        throw new Error('User organization not found');
      }

      // Check if we're updating an existing project
      const queryParams = new URLSearchParams(location.search);
      const existingProjectId = queryParams.get('projectId');

      // Prepare project data
      const projectData = {
        ...formValues,
        id: existingProjectId || formValues.id || crypto.randomUUID(), // Ensure id is set
        organizationId,
        metadata: {
          ...formValues.metadata,
          createdBy: user?.uid || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastModifiedBy: user?.uid || '',
        }
      };

      // Save project requirements
      console.log('ProjectSetupForm - Saving project requirements with data:', projectData);
      
      // If we have an existing projectId, use it when saving
      const savedProjectId = existingProjectId 
        ? await saveProjectRequirements(existingProjectId, projectData as any, user.uid)
        : await saveProjectRequirements(projectData as any);
        
      console.log('Project saved with ID:', savedProjectId);

      // Set progress to 100% before navigating
      setLoadingProgress(100);
      setLoadingMessage('Summary generation started! Redirecting...');
      
      // Short delay before navigation to show the 100% state
      setTimeout(() => {
        // Navigate to the project summary page with a query parameter
        navigate(`/project-summary/${savedProjectId}?from=setup`);
      }, 1000);
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project. Please try again.');
      setOpenLoadingModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle closing the modal
  const handleCloseLoadingModal = () => {
    // Only allow closing if there's an error
    if (error) {
      setOpenLoadingModal(false);
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
      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          {isLoadingExistingProject ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Loading existing project data...
              </Typography>
            </Box>
          ) : (
            <FormProvider {...methods}>
              <form>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h4" gutterBottom>
                    Project Setup
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Complete the following steps to set up your project
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel={!isMobile}
                  orientation={isMobile ? 'vertical' : 'horizontal'}
                  connector={<ColorlibConnector />}
                  sx={{ mb: 4 }}
                >
                  {STEPS.map((step, index) => (
                    <Step key={step.label} completed={completed[index]}>
                      <StepLabel 
                        StepIconComponent={ColorlibStepIcon}
                        optional={isMobile ? <Typography variant="caption">{step.description}</Typography> : null}
                      >
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {renderStepContent(activeStep)}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0 || isLoading}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={activeStep === STEPS.length - 1 
                      ? handleSummarizeProject
                      : handleNext}
                    endIcon={activeStep === STEPS.length - 1 ? null : <ArrowForwardIcon />}
                    disabled={isLoading}
                  >
                    {activeStep === STEPS.length - 1 ? (
                      isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                          Summarizing...
                        </Box>
                      ) : (
                        'Summarize Project'
                      )
                    ) : (
                      'Next'
                    )}
                  </Button>
                </Box>
              </form>
            </FormProvider>
          )}

          {/* Loading Modal */}
          <Modal
            open={openLoadingModal}
            onClose={handleCloseLoadingModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 800,
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Fade 
              in={openLoadingModal} 
              timeout={{
                enter: 800,
                exit: 500
              }}
            >
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 4,
                  boxShadow: 24,
                  p: 4,
                  width: { xs: '90%', sm: '550px' },
                  textAlign: 'center',
                  outline: 'none',
                  transform: 'translateY(20px)',
                  animation: openLoadingModal ? 'floatIn 0.8s forwards' : 'none',
                  '@keyframes floatIn': {
                    '0%': { opacity: 0, transform: 'translateY(40px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Box sx={{ position: 'relative', mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: 120,
                      height: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={loadingProgress}
                      size={120}
                      thickness={4}
                      sx={{
                        color: theme.palette.primary.main,
                        position: 'absolute',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      {loadingProgress < 30 && (
                        <SummarizeIcon 
                          sx={{ 
                            fontSize: 40, 
                            color: theme.palette.primary.main,
                            animation: 'fadeIn 0.5s ease-in-out',
                            '@keyframes fadeIn': {
                              '0%': { opacity: 0, transform: 'scale(0.8)' },
                              '100%': { opacity: 1, transform: 'scale(1)' },
                            },
                          }} 
                        />
                      )}
                      {loadingProgress >= 30 && loadingProgress < 60 && (
                        <AnalyticsIcon 
                          sx={{ 
                            fontSize: 40, 
                            color: theme.palette.primary.main,
                            animation: 'fadeIn 0.5s ease-in-out',
                            '@keyframes fadeIn': {
                              '0%': { opacity: 0, transform: 'scale(0.8)' },
                              '100%': { opacity: 1, transform: 'scale(1)' },
                            },
                          }} 
                        />
                      )}
                      {loadingProgress >= 60 && (
                        <AutoGraphIcon 
                          sx={{ 
                            fontSize: 40, 
                            color: theme.palette.primary.main,
                            animation: 'fadeIn 0.5s ease-in-out',
                            '@keyframes fadeIn': {
                              '0%': { opacity: 0, transform: 'scale(0.8)' },
                              '100%': { opacity: 1, transform: 'scale(1)' },
                            },
                          }} 
                        />
                      )}
                      <Typography
                        variant="caption"
                        component="div"
                        color="text.secondary"
                        sx={{ 
                          fontSize: '1.2rem', 
                          fontWeight: 'bold',
                          mt: 1,
                        }}
                      >
                        {`${Math.round(loadingProgress)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Typography 
                  variant="h5" 
                  component="h2" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 'bold',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Generating Project Summary
                </Typography>
                
                <Box sx={{ width: '100%', mb: 3 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={loadingProgress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 2,
                      background: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        borderRadius: 4,
                      }
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'medium',
                      color: theme.palette.primary.main,
                    }}
                  >
                    {loadingMessage}
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: alpha(theme.palette.primary.light, 0.1),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                    mb: 3,
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 2,
                    mb: 2
                  }}>
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main,
                          opacity: 0.7,
                          animation: 'pulse 1.5s infinite ease-in-out',
                          animationDelay: `${i * 0.3}s`,
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                            '50%': { transform: 'scale(1.2)', opacity: 1 },
                            '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                          },
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Please wait while we analyze your project data and generate a comprehensive summary.
                    This may take a minute or two.
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {loadingProgress < 30 && "Saving your project data..."}
                    {loadingProgress >= 30 && loadingProgress < 60 && "Analyzing project requirements..."}
                    {loadingProgress >= 60 && loadingProgress < 90 && "Preparing to generate summary..."}
                    {loadingProgress >= 90 && "Almost there! Finalizing summary..."}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Modal>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}; 