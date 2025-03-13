import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Skeleton,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { getProjectRequirements } from '../services/project.service';
import { generateProjectDescription } from '../services/openai.service';
import { saveProjectDescription, getProjectDescription } from '../services/project.service';
import ReactMarkdown from 'react-markdown';
import { ProjectRequirements } from '../types/project.types';

export const ProjectDescription: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [projectData, setProjectData] = useState<ProjectRequirements | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch project data
        const data = await getProjectRequirements(projectId);
        setProjectData(data);
        
        // Try to get existing description
        const existingDescription = await getProjectDescription(projectId);
        
        if (existingDescription) {
          setDescription(existingDescription);
        } else {
          // Generate new description if none exists
          await generateAndSaveDescription(data);
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load project data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [projectId]);

  const generateAndSaveDescription = async (data: ProjectRequirements) => {
    if (!projectId) return;
    
    try {
      setGenerating(true);
      setError(null);
      
      // Generate description using OpenAI
      const generatedDescription = await generateProjectDescription(data);
      
      // Save the generated description
      await saveProjectDescription(projectId, generatedDescription);
      
      // Update state
      setDescription(generatedDescription);
    } catch (error) {
      console.error('Error generating description:', error);
      setError('Failed to generate project description. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = async () => {
    if (!projectData || !projectId) return;
    
    try {
      setGenerating(true);
      setError(null);
      
      // Generate new description
      await generateAndSaveDescription(projectData);
    } catch (error) {
      console.error('Error refreshing description:', error);
      setError('Failed to refresh project description. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateWorkflow = () => {
    if (!projectId) return;
    navigate(`/workflow-generator/${projectId}`);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={400} />
        </Box>
      );
    }

    if (generating) {
      return (
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Generating detailed project description...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a minute or two. We're analyzing your project requirements and creating a comprehensive description.
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      );
    }

    return (
      <Box sx={{ mt: 4 }}>
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box className="markdown-content" sx={{ 
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                mt: 2,
                mb: 1,
                fontWeight: 600,
              },
              '& p': {
                mb: 2,
              },
              '& ul, & ol': {
                pl: 3,
                mb: 2,
              },
              '& li': {
                mb: 0.5,
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                pl: 2,
                py: 0.5,
                my: 2,
                bgcolor: 'background.paper',
              },
              '& code': {
                fontFamily: 'monospace',
                bgcolor: 'background.paper',
                p: 0.5,
                borderRadius: 1,
              },
              '& pre': {
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                mb: 2,
              },
            }}>
              <ReactMarkdown>
                {description}
              </ReactMarkdown>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
            <Typography variant="h4">
              Project Description
            </Typography>
          </Box>
          <Tooltip title="Regenerate description">
            <IconButton 
              onClick={handleRefresh} 
              disabled={generating || loading}
              color="primary"
              sx={{ ml: 2 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Below is a detailed description of your project based on the information provided in the setup form.
          This includes a comprehensive overview and a step-by-step approach to building your project.
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGenerateWorkflow}
            disabled={generating || loading || !description}
            endIcon={<ArrowForwardIcon />}
          >
            Generate Workflow
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}; 