import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get user data to find organization ID
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        if (!userData?.organizationId) {
          setError('No organization found. Please create or join an organization.');
          setIsLoading(false);
          return;
        }
        
        // Get organization data
        const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
        
        if (orgDoc.exists()) {
          setOrganizationData(orgDoc.data());
        } else {
          setError('Organization data not found.');
        }
      } catch (err) {
        console.error('Error fetching organization data:', err);
        setError('Failed to load organization data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchOrganizationData();
    }
  }, [user, loading]);

  const handleCreateProject = () => {
    navigate('/project-setup');
  };

  if (loading || isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Welcome, {user?.displayName || user?.email}
          </Typography>
          <Typography variant="body1">
            You are part of {organizationData?.name || 'your organization'}.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Projects
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {organizationData?.projects?.length 
                    ? `You have ${organizationData.projects.length} active projects.` 
                    : 'No active projects yet.'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={handleCreateProject}
                >
                  Create New Project
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Team Members
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {organizationData?.members?.length 
                    ? `Your organization has ${organizationData.members.length} members.` 
                    : 'No team members added yet.'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate('/organization-chart')}
                >
                  View Organization Chart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 