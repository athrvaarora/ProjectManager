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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { getProjectRequirements, saveProjectDescription, getProjectDescription } from '../services/project.service';
import { generateProjectDescription } from '../services/openai.service';
import ReactMarkdown from 'react-markdown';
import { IProjectSetup } from '../types/project.types';

export const ProjectDescription: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [projectData, setProjectData] = useState<IProjectSetup | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        }
        
        // Fetch existing description if available
        const existingDescription = await getProjectDescription(projectId);
        if (existingDescription) {
          setDescription(existingDescription);
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);

  const generateAndSaveDescription = async (projectData: IProjectSetup) => {
    if (!projectId || !user) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      // Generate description using OpenAI
      const generatedDescription = await generateProjectDescription(projectData);
      
      // Save the generated description
      await saveProjectDescription(projectId, generatedDescription, user.uid);
      
      // Update state
      setDescription(generatedDescription);
    } catch (err) {
      console.error('Error generating description:', err);
      setError('Failed to generate project description');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateDescription = () => {
    if (projectData) {
      generateAndSaveDescription(projectData);
    }
  };

  const handleContinue = () => {
    if (projectId) {
      navigate(`/project-summary/${projectId}`);
    }
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
            Generating comprehensive project description...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a minute or two.
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
                {description || ''}
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
              onClick={handleGenerateDescription} 
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
            onClick={handleContinue}
            disabled={generating || loading || !description}
            endIcon={<ArrowForwardIcon />}
          >
            Continue to Summary
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}; 