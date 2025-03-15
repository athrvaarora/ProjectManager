import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  TextField,
  IconButton,
  Divider,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  useTheme,
  alpha,
  Container,
  Tooltip,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Snackbar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import SummarizeIcon from '@mui/icons-material/Summarize';
import ChatIcon from '@mui/icons-material/Chat';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EventIcon from '@mui/icons-material/Event';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/Flag';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { getProjectRequirements, saveProjectSummary, getProjectSummary } from '../services/project.service';
import { generateProjectSummary, generateProjectSummaryWithUserInput, generateSummaryEdit } from '../services/openai.service';
import { IProjectSetup } from '../types/project.types';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'question' | 'edit';
  appliedEdit?: boolean;
}

/**
 * Helper function to safely format a date
 * @param dateValue - The date value to format
 * @returns Formatted date string or 'Not specified' if invalid
 */
const formatDate = (dateValue: any): string => {
  if (!dateValue) return 'Not specified';
  
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Not specified';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error, dateValue);
    return 'Not specified';
  }
};

export const ProjectSummary: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<IProjectSetup | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [summaryUpdated, setSummaryUpdated] = useState<boolean>(false);
  const [updatedSection, setUpdatedSection] = useState<string | null>(null);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState<boolean>(false);
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [processingChat, setProcessingChat] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMode, setChatMode] = useState<'question' | 'edit'>('question');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editSuccess, setEditSuccess] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editedSummary, setEditedSummary] = useState<string | null>(null);

  const generateAndSaveSummary = useCallback(async (projectData: IProjectSetup) => {
    if (!projectId || !user) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      // Ensure organizationId is set in the project data
      const projectDataWithOrg = {
        ...projectData,
        organizationId: projectData.organizationId || user.organizationId || ''
      };
      
      // Generate summary using OpenAI
      const generatedSummary = await generateProjectSummary(projectDataWithOrg as IProjectSetup);
      
      // Save the generated summary
      await saveProjectSummary(projectId, generatedSummary, user.uid);
      
      // Update state
      setSummary(generatedSummary);
    } catch (err) {
      console.error('Error generating project summary:', err);
      setError('Failed to generate project summary');
    } finally {
      setGenerating(false);
    }
  }, [projectId, user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        // Fetch project requirements
        const projectReq = await getProjectRequirements(projectId);
        if (projectReq) {
          setProjectData(projectReq);
        } else {
          setError('Project not found');
          setLoading(false);
          return;
        }
        
        // Fetch existing summary if available
        const existingSummary = await getProjectSummary(projectId);
        if (existingSummary) {
          setSummary(existingSummary);
        } else if (projectReq) {
          // Generate summary if none exists and we have valid project data
          await generateAndSaveSummary(projectReq);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, user, generateAndSaveSummary]);

  useEffect(() => {
    // Check if we're coming from the setup form
    const queryParams = new URLSearchParams(location.search);
    const fromSetup = queryParams.get('from') === 'setup';
    
    if (fromSetup) {
      setShowWelcomeAnimation(true);
      
      // Reset the animation after 3 seconds
      const timer = setTimeout(() => {
        setShowWelcomeAnimation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.search]);

  const handleRegenerateSummary = () => {
    if (projectData) {
      generateAndSaveSummary(projectData);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !projectData || !user) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
      timestamp: new Date(),
      type: chatMode
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setProcessingChat(true);
    
    try {
      // Get previous questions for context
      const previousQuestions = chatMessages
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.text);
      
      if (chatMode === 'question') {
        // Ensure organizationId is set in the project data
        const projectDataWithOrg = {
          ...projectData,
          organizationId: projectData.organizationId || user.organizationId || ''
        };
        
        // Generate response using OpenAI
        const response = await generateProjectSummaryWithUserInput(
          projectDataWithOrg as IProjectSetup,
          userInput,
          previousQuestions
        );
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'ai',
          timestamp: new Date(),
          type: 'question'
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        setProcessingChat(false);
      } else {
        // Handle edit request using the new generateSummaryEdit function
        if (!summary) {
          throw new Error('No summary available to edit');
        }
        
        try {
          // Ensure organizationId is set in the project data
          const projectDataWithOrg = {
            ...projectData,
            organizationId: projectData.organizationId || user.organizationId || ''
          };
          
          // Generate edited summary using OpenAI
          const updatedSummary = await generateSummaryEdit(
            projectDataWithOrg as IProjectSetup,
            summary,
            userInput
          );
          
          // Save the updated summary
          if (projectId && user) {
            await saveProjectSummary(projectId, updatedSummary, user.uid);
          }
          
          // Extract the section being edited from the user's request
          let editedSection = "the summary";
          let sectionHeading = null;
          if (userInput.toLowerCase().includes("executive summary")) {
            editedSection = "the Executive Summary section";
            sectionHeading = "Executive Summary";
          } else if (userInput.toLowerCase().includes("technical")) {
            editedSection = "the Technical Strategy section";
            sectionHeading = "Technical Strategy";
          } else if (userInput.toLowerCase().includes("risk")) {
            editedSection = "the Risk Assessment section";
            sectionHeading = "Risk Assessment";
          } else if (userInput.toLowerCase().includes("implementation")) {
            editedSection = "the Implementation Plan section";
            sectionHeading = "Implementation Plan";
          } else if (userInput.toLowerCase().includes("roadmap") || userInput.toLowerCase().includes("timeline")) {
            editedSection = "the Project Roadmap section";
            sectionHeading = "Project Roadmap";
          } else if (userInput.toLowerCase().includes("team") || userInput.toLowerCase().includes("personnel") || userInput.toLowerCase().includes("organization")) {
            editedSection = "the Team Structure section";
            sectionHeading = "Team Structure";
          } else if (userInput.toLowerCase().match(/add section (?:on|about|for)?\s*([a-zA-Z\s]+)/i)) {
            const match = userInput.toLowerCase().match(/add section (?:on|about|for)?\s*([a-zA-Z\s]+)/i);
            if (match && match[1]) {
              editedSection = `the new ${match[1]} section`;
              sectionHeading = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            }
          }
          
          const editResponse = `I've updated ${editedSection} based on your request: "${userInput}". The changes have been applied while preserving all other content in the summary.`;
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: editResponse,
            sender: 'ai',
            timestamp: new Date(),
            type: 'edit',
            appliedEdit: true // Mark as already applied
          };
          
          setChatMessages(prev => [...prev, aiMessage]);
          setEditSuccess(true);
          
          // Update the summary state
          setSummary(updatedSummary);
          setSummaryUpdated(true);
          setUpdatedSection(sectionHeading);
          
          // Reset the highlight effect after 3 seconds
          setTimeout(() => {
            setSummaryUpdated(false);
            setUpdatedSection(null);
          }, 3000);
        } catch (err) {
          console.error('Error updating summary:', err);
          
          const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: `I'm sorry, I couldn't update the summary. Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'edit'
          };
          
          setChatMessages(prev => [...prev, errorMessage]);
          setError('Failed to update summary');
        } finally {
          setProcessingChat(false);
        }
      }
    } catch (err) {
      console.error('Error generating chat response:', err);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        sender: 'ai',
        timestamp: new Date(),
        type: chatMode
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      setError('Failed to generate response');
      setProcessingChat(false);
    }
  };

  const handleChatModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'question' | 'edit' | null,
  ) => {
    if (newMode !== null) {
      setChatMode(newMode);
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleApplyEdit = (messageId: string) => {
    if (!editedSummary || !projectId || !user) return;
    
    // Update the message to show applied status
    setChatMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, appliedEdit: true } 
          : msg
      )
    );
    
    // Update the summary state
    setSummary(editedSummary);
    setEditedSummary(null);
    
    // In a real implementation, save the updated summary to the database
    try {
      saveProjectSummary(projectId, editedSummary, user.uid);
    } catch (err) {
      console.error('Error saving updated summary:', err);
      setError('Failed to save updated summary to database');
    }
    
    // Show success message
    setEditSuccess(true);
    
    // Close the menu if open
    if (anchorEl) {
      handleMenuClose();
    }
  };

  const handleCloseSnackbar = () => {
    setEditSuccess(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} thickness={4} color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {showWelcomeAnimation && (
        <Box
          sx={{
            position: 'relative',
            mb: 4,
            p: 3,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.success.light, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            boxShadow: theme.shadows[3],
            animation: 'slideDown 0.8s ease-out forwards',
            '@keyframes slideDown': {
              '0%': { opacity: 0, transform: 'translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SummarizeIcon 
              sx={{ 
                fontSize: 40, 
                color: theme.palette.success.main,
                mr: 2,
                animation: 'pulse 1.5s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.1)', opacity: 1 },
                  '100%': { transform: 'scale(1)', opacity: 0.7 },
                },
              }} 
            />
            <Box>
              <Typography variant="h6" color="success.main" fontWeight="bold">
                Project Summary Generated Successfully!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your comprehensive project summary is ready. Scroll down to explore the details.
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          {error}
        </Alert>
      )}
      
      <Box 
        sx={{ 
          mb: 3,
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: theme.palette.primary.main,
              fontWeight: 'bold'
            }}
          >
            <SummarizeIcon sx={{ mr: 1, fontSize: 36 }} />
            Project Summary
          </Typography>
          
          {projectData && (
            <Typography 
              variant="h5" 
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 500
              }}
            >
              {projectData.basicInfo?.title || 'Untitled Project'}
            </Typography>
          )}
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate(`/project-setup?projectId=${projectId}`)}
          sx={{ 
            borderRadius: 8,
            px: 3,
            boxShadow: theme.shadows[4],
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
          }}
        >
          Back to Project Setup
        </Button>
      </Box>
      
      {projectData && (
        <Box 
          mb={3}
          sx={{ 
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.light, 0.1),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={1.5}>
                <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="primary">Project Overview</Typography>
              </Box>
              <Typography variant="body1" paragraph>
                {projectData.basicInfo?.summary || 'No summary available'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  Project ID: <Chip 
                    label={projectId} 
                    size="small" 
                    sx={{ 
                      ml: 1,
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }} 
                  />
                </Typography>
                
                {/* Display project timeline */}
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 0.5 }} /> Timeline:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {projectData.timeline?.startDate && (
                      <Chip 
                        label={`Start: ${formatDate(projectData.timeline.startDate)}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ borderRadius: 4, fontWeight: 500 }} 
                      />
                    )}
                    {projectData.timeline?.targetCompletionDate && (
                      <Chip 
                        label={`Target: ${formatDate(projectData.timeline.targetCompletionDate)}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ borderRadius: 4, fontWeight: 500 }} 
                      />
                    )}
                    {(!projectData.timeline?.startDate && !projectData.timeline?.targetCompletionDate) && (
                      <Typography variant="body2" color="text.secondary">No timeline specified</Typography>
                    )}
                  </Box>
                </Box>
                
                {projectData.timeline?.milestones && projectData.timeline.milestones.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                      <FlagIcon fontSize="small" sx={{ mr: 0.5 }} /> Milestones:
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {projectData.timeline.milestones.map((milestone, index) => (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap'
                          }}
                        >
                          <Chip 
                            label={milestone.phase} 
                            size="small" 
                            color="secondary" 
                            sx={{ borderRadius: 4, fontWeight: 500 }} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(milestone.targetDate)}
                          </Typography>
                          {milestone.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              - {milestone.description}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Technologies:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {projectData.technical?.technologies?.map((tech, index) => (
                      <Chip 
                        key={index} 
                        label={tech} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                        sx={{ 
                          borderRadius: 4,
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          }
                        }} 
                      />
                    ))}
                    {(!projectData.technical?.technologies || projectData.technical.technologies.length === 0) && (
                      <Typography variant="body2" color="text.secondary">No technologies specified</Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {generating && (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          my={6}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            boxShadow: theme.shadows[4],
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              animation: 'progressBar 2s infinite linear',
              '@keyframes progressBar': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' },
              },
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CircularProgress 
              size={100} 
              thickness={4}
              sx={{
                color: theme.palette.primary.main,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SummarizeIcon 
                sx={{ 
                  fontSize: 40, 
                  color: alpha(theme.palette.primary.main, 0.7),
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.2)', opacity: 1 },
                    '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                  },
                }} 
              />
            </Box>
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              mt: 3,
              fontWeight: 'bold',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Generating Comprehensive Project Summary
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            We're analyzing your project requirements and creating a strategic summary.
            <br />This may take a minute or two.
          </Typography>
          
          <Box sx={{ 
            width: '100%', 
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2
          }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  opacity: 0.7,
                  animation: 'bounce 1.4s infinite ease-in-out both',
                  animationDelay: `${i * 0.16}s`,
                  '@keyframes bounce': {
                    '0%, 80%, 100%': { transform: 'scale(0)' },
                    '40%': { transform: 'scale(1)' },
                  },
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ 
            mt: 4, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.primary.light, 0.1),
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
            maxWidth: '80%',
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              We're using AI to analyze your project data, extract key insights, and generate a comprehensive summary with technical recommendations, implementation strategy, and potential challenges.
            </Typography>
          </Box>
        </Box>
      )}
      
      {summary && !generating && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={showChat ? 8 : 12}>
            <Card 
              elevation={4} 
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box 
                sx={{ 
                  p: 3, 
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Box display="flex" alignItems="center">
                  <SummarizeIcon sx={{ mr: 1.5, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Project Summary
                  </Typography>
                </Box>
                <Tooltip title="Regenerate Summary" arrow>
                  <IconButton 
                    onClick={handleRegenerateSummary} 
                    disabled={generating}
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.2),
                      }
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <CardContent 
                sx={{ 
                  p: 0, 
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box 
                  sx={{
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    padding: 1,
                    borderRadius: 2,
                    p: 3,
                    maxHeight: '65vh', 
                    overflow: 'auto',
                    flexGrow: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      borderRadius: '4px 4px 0 0',
                      opacity: 0.7,
                    }
                  }}
                >
                  {summaryUpdated && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        zIndex: 10,
                        animation: 'fadeOut 3s forwards',
                        '@keyframes fadeOut': {
                          '0%': { opacity: 1 },
                          '70%': { opacity: 1 },
                          '100%': { opacity: 0 },
                        },
                      }}
                    >
                      <Chip 
                        label={updatedSection ? `Updated: ${updatedSection}` : "Summary Updated"} 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 'bold' }} 
                      />
                    </Box>
                  )}
                  {summary && (
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }: any) => {
                          const content = String(props.children || '');
                          const isUpdatedSection = updatedSection && content.includes(updatedSection);
                          return (
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                color: theme.palette.primary.main,
                                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                pb: 1,
                                mt: 3,
                                mb: 2,
                                fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                                position: 'relative',
                                backgroundColor: isUpdatedSection && summaryUpdated ? alpha(theme.palette.success.light, 0.1) : 'transparent',
                                padding: isUpdatedSection && summaryUpdated ? 1 : 0,
                                borderRadius: isUpdatedSection && summaryUpdated ? 1 : 0,
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: -2,
                                  left: 0,
                                  width: '60px',
                                  height: '4px',
                                  backgroundColor: theme.palette.primary.main,
                                  borderRadius: '2px',
                                },
                              }}
                            >
                              {props.children}
                            </Typography>
                          );
                        },
                        h2: ({ node, ...props }: any) => {
                          const content = String(props.children || '');
                          const isUpdatedSection = updatedSection && content.includes(updatedSection);
                          return (
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                color: theme.palette.primary.dark,
                                mt: 3,
                                mb: 1.5,
                                fontWeight: 'bold',
                                fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                pl: 2,
                                py: 0.5,
                                borderRadius: '0 4px 4px 0',
                                backgroundColor: isUpdatedSection && summaryUpdated ? alpha(theme.palette.success.light, 0.1) : alpha(theme.palette.primary.light, 0.1),
                                padding: isUpdatedSection && summaryUpdated ? '0.5rem 1rem 0.5rem 1rem' : '0.5rem 0.5rem 0.5rem 1rem',
                              }}
                            >
                              {props.children}
                            </Typography>
                          );
                        },
                        h3: ({ node, ...props }: any) => {
                          const content = String(props.children || '');
                          const isUpdatedSection = updatedSection && content.includes(updatedSection);
                          return (
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                color: theme.palette.secondary.main,
                                mt: 2.5,
                                mb: 1,
                                fontWeight: 'bold',
                                fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                                display: 'inline-block',
                                position: 'relative',
                                backgroundColor: isUpdatedSection && summaryUpdated ? alpha(theme.palette.success.light, 0.1) : 'transparent',
                                padding: isUpdatedSection && summaryUpdated ? 1 : 0,
                                borderRadius: isUpdatedSection && summaryUpdated ? 1 : 0,
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: -2,
                                  left: 0,
                                  width: '100%',
                                  height: '2px',
                                  background: `linear-gradient(90deg, ${theme.palette.secondary.main}, transparent)`,
                                },
                              }}
                            >
                              {props.children}
                            </Typography>
                          );
                        },
                        p: ({ node, ...props }: any) => {
                          return (
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                mb: 1.5,
                                lineHeight: 1.7,
                                fontSize: '1rem',
                                color: alpha(theme.palette.text.primary, 0.9),
                              }}
                            >
                              {props.children}
                            </Typography>
                          );
                        },
                        ul: ({ node, ...props }: any) => {
                          return (
                            <Box 
                              component="ul" 
                              sx={{ 
                                pl: 3,
                                mb: 2,
                                listStyleType: 'none',
                                '& li': {
                                  position: 'relative',
                                  mb: 1,
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    left: -20,
                                    top: '0.6em',
                                    width: 8,
                                    height: 8,
                                    backgroundColor: theme.palette.primary.main,
                                    borderRadius: '50%',
                                  },
                                },
                              }}
                            >
                              {props.children}
                            </Box>
                          );
                        },
                        ol: ({ node, ...props }: any) => {
                          return (
                            <Box 
                              component="ol" 
                              sx={{ 
                                pl: 3,
                                mb: 2,
                                counterReset: 'item',
                                '& li': {
                                  position: 'relative',
                                  mb: 1,
                                  counterIncrement: 'item',
                                  '&::before': {
                                    content: 'counter(item)',
                                    position: 'absolute',
                                    left: -28,
                                    top: '0.1em',
                                    width: 22,
                                    height: 22,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                  },
                                },
                              }}
                            >
                              {props.children}
                            </Box>
                          );
                        },
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  )}
                </Box>
              </CardContent>
              
              <Box 
                sx={{ 
                  p: 2, 
                  borderTop: `1px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Button 
                  variant={showChat ? "outlined" : "contained"}
                  color="secondary" 
                  startIcon={<ChatIcon />}
                  onClick={() => setShowChat(!showChat)}
                  sx={{ 
                    borderRadius: 8,
                    px: 3,
                    boxShadow: showChat ? 'none' : theme.shadows[2],
                  }}
                >
                  {showChat ? 'Hide Chat' : 'Ask Questions'}
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={() => navigate(`/project/${projectId}/workflow`)}
                  sx={{
                    borderRadius: 8,
                    px: 3,
                    boxShadow: theme.shadows[3],
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    },
                  }}
                >
                  Generate Project Workflow
                </Button>
              </Box>
            </Card>
          </Grid>
          
          {showChat && (
            <Grid item xs={12} md={4}>
              <Card 
                elevation={4} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <ChatIcon sx={{ mr: 1.5 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Project Assistant
                    </Typography>
                  </Box>
                  <ToggleButtonGroup
                    value={chatMode}
                    exclusive
                    onChange={handleChatModeChange}
                    aria-label="chat mode"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.15),
                      borderRadius: 2,
                      '& .MuiToggleButtonGroup-grouped': {
                        border: 0,
                        color: 'white',
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.common.white, 0.25),
                          color: 'white',
                        },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.common.white, 0.15),
                        },
                      },
                    }}
                  >
                    <ToggleButton value="question" aria-label="ask questions">
                      <Tooltip title="Ask questions" arrow>
                        <QuestionAnswerIcon fontSize="small" />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="edit" aria-label="edit summary">
                      <Tooltip title="Edit summary" arrow>
                        <EditIcon fontSize="small" />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    overflow: 'auto', 
                    maxHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 0,
                    backgroundColor: alpha(theme.palette.background.default, 0.7),
                  }}
                >
                  {chatMessages.length === 0 ? (
                    <Box 
                      display="flex" 
                      flexDirection="column" 
                      alignItems="center" 
                      justifyContent="center" 
                      height="100%"
                      p={3}
                    >
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          mb: 2,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                          color: theme.palette.secondary.main,
                        }}
                      >
                        {chatMode === 'question' ? <QuestionAnswerIcon sx={{ fontSize: 40 }} /> : <EditIcon sx={{ fontSize: 40 }} />}
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        color="secondary" 
                        align="center"
                        sx={{ mb: 1 }}
                      >
                        {chatMode === 'question' ? 'Ask Me Anything' : 'Edit Project Summary'}
                      </Typography>
                      <Typography 
                        color="text.secondary" 
                        variant="body1" 
                        align="center"
                      >
                        {chatMode === 'question' 
                          ? 'Get insights, clarifications, or additional details about this project'
                          : 'Request changes or improvements to the project summary'}
                      </Typography>
                      <Box 
                        sx={{ 
                          mt: 3, 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: 1,
                          width: '100%',
                        }}
                      >
                        {chatMode === 'question' 
                          ? ['What are the key milestones?', 'Explain the technical requirements', 'What are potential challenges?'].map((suggestion, index) => (
                              <Chip
                                key={index}
                                label={suggestion}
                                onClick={() => setUserInput(suggestion)}
                                sx={{
                                  p: 1,
                                  borderRadius: 4,
                                  backgroundColor: alpha(theme.palette.secondary.light, 0.1),
                                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.secondary.light, 0.2),
                                  },
                                  cursor: 'pointer',
                                }}
                              />
                            ))
                          : ['Add more details to the Executive Summary', 'Improve the Technical Strategy section', 'Add section on Project Timeline', 'Update the risk assessment with mitigation strategies', 'Make the implementation plan more detailed'].map((suggestion, index) => (
                              <Chip
                                key={index}
                                label={suggestion}
                                onClick={() => setUserInput(suggestion)}
                                sx={{
                                  p: 1,
                                  borderRadius: 4,
                                  backgroundColor: alpha(theme.palette.primary.light, 0.1),
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.light, 0.2),
                                  },
                                  cursor: 'pointer',
                                }}
                              />
                            ))
                        }
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ p: 2 }}>
                      {chatMessages.map((message, index) => (
                        <Box
                          key={message.id}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            mb: 2,
                            maxWidth: '100%',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: message.sender === 'user' 
                                  ? theme.palette.primary.main 
                                  : message.type === 'edit'
                                    ? theme.palette.success.main
                                    : theme.palette.secondary.main,
                                fontSize: '0.875rem',
                              }}
                            >
                              {message.sender === 'user' 
                                ? 'You' 
                                : message.type === 'edit' 
                                  ? <EditIcon fontSize="small" /> 
                                  : 'AI'
                              }
                            </Avatar>
                            <Paper
                              elevation={1}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                maxWidth: '85%',
                                backgroundColor: message.sender === 'user'
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : message.type === 'edit'
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : alpha(theme.palette.secondary.main, 0.1),
                                border: message.sender === 'user'
                                  ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                  : message.type === 'edit'
                                    ? `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                                    : `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 10,
                                  [message.sender === 'user' ? 'right' : 'left']: -8,
                                  width: 0,
                                  height: 0,
                                  borderTop: '8px solid transparent',
                                  borderBottom: '8px solid transparent',
                                  [message.sender === 'user' ? 'borderLeft' : 'borderRight']: message.sender === 'user'
                                    ? `8px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                    : message.type === 'edit'
                                      ? `8px solid ${alpha(theme.palette.success.main, 0.2)}`
                                      : `8px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                },
                              }}
                            >
                              {message.sender === 'ai' ? (
                                <Box sx={{
                                  '& p': { mt: 0, mb: 1 },
                                  '& p:last-child': { mb: 0 },
                                  '& ul, & ol': { pl: 2, mb: 1 },
                                  '& li': { mb: 0.5 },
                                }}>
                                  <ReactMarkdown>{message.text}</ReactMarkdown>
                                  {message.type === 'edit' && (
                                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip 
                                        label="Changes Applied" 
                                        size="small" 
                                        color="success" 
                                        sx={{ borderRadius: 4 }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                              ) : (
                                <Typography variant="body1">{message.text}</Typography>
                              )}
                            </Paper>
                            {message.sender === 'ai' && (
                              <IconButton 
                                size="small"
                                onClick={handleMenuOpen}
                                sx={{ 
                                  ml: 0.5, 
                                  color: theme.palette.text.secondary,
                                  '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.1) }
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              mr: message.sender === 'user' ? 5 : 0,
                              ml: message.sender === 'ai' ? 5 : 0,
                            }}
                          >
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      ))}
                      {processingChat && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: chatMode === 'edit' 
                                ? theme.palette.success.main 
                                : theme.palette.secondary.main,
                              fontSize: '0.875rem',
                            }}
                          >
                            {chatMode === 'edit' ? <EditIcon fontSize="small" /> : 'AI'}
                          </Avatar>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: chatMode === 'edit'
                                ? alpha(theme.palette.success.main, 0.05)
                                : alpha(theme.palette.secondary.main, 0.05),
                              border: chatMode === 'edit'
                                ? `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                                : `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CircularProgress 
                              size={16} 
                              thickness={4} 
                              color={chatMode === 'edit' ? "success" : "secondary"} 
                            />
                            <Typography variant="body2">
                              {chatMode === 'edit' ? 'Updating summary...' : 'Thinking...'}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    borderTop: `1px solid ${theme.palette.divider}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  }}
                >
                  <Box 
                    component="form" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-end',
                      gap: 1 
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder={chatMode === 'question' 
                        ? "Type your question..." 
                        : "Describe the changes you want to make..."
                      }
                      variant="outlined"
                      size="medium"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={processingChat}
                      multiline
                      maxRows={3}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: theme.palette.background.paper,
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: chatMode === 'edit' 
                              ? theme.palette.success.main 
                              : theme.palette.secondary.main,
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                    <Tooltip title={chatMode === 'question' ? "Send question" : "Request edit"} arrow>
                      <span>
                        <IconButton 
                          color={chatMode === 'edit' ? "success" : "secondary"}
                          onClick={handleSendMessage} 
                          disabled={!userInput.trim() || processingChat}
                          sx={{ 
                            p: 1.5,
                            backgroundColor: chatMode === 'edit'
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.secondary.main, 0.1),
                            '&:hover': {
                              backgroundColor: chatMode === 'edit'
                                ? alpha(theme.palette.success.main, 0.2)
                                : alpha(theme.palette.secondary.main, 0.2),
                            },
                          }}
                          type="submit"
                        >
                          <SendIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Success Snackbar */}
      <Snackbar
        open={editSuccess}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Summary updated successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}; 