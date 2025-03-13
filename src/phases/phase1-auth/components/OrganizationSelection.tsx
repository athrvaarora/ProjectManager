import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Grid,
  useTheme,
  Paper,
  Divider,
  CardMedia,
  CardActionArea,
  alpha
} from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useAuth } from '../contexts/AuthContext';

export const OrganizationSelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const handleCreateOrganization = () => {
    navigate('/organization-chart');
  };

  const handleJoinOrganization = () => {
    navigate('/join-organization');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            mb: 4
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome to Workflow
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {user?.displayName ? `Hello, ${user.displayName}!` : 'Hello!'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
              To get started, you can either create a new organization or join an existing one.
              Choose an option below to continue.
            </Typography>
          </Box>

          <Divider sx={{ mb: 5 }} />

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardActionArea onClick={handleCreateOrganization} sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AddBusinessIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                      Create a New Organization
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Start fresh with a new organization. You'll be able to set up your team structure,
                      invite members, and manage projects all in one place.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="large" 
                    variant="contained" 
                    fullWidth
                    onClick={handleCreateOrganization}
                    startIcon={<AddBusinessIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1976D2 30%, #21A6F3 90%)',
                      }
                    }}
                  >
                    Create Organization
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                <CardActionArea onClick={handleJoinOrganization} sx={{ flexGrow: 1 }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <GroupAddIcon sx={{ fontSize: 80, color: theme.palette.secondary.main }} />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                      Join an Existing Organization
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Join an organization you've been invited to. You'll need an invitation code
                      from an organization administrator to proceed.
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="large" 
                    variant="contained" 
                    color="secondary"
                    fullWidth
                    onClick={handleJoinOrganization}
                    startIcon={<GroupAddIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #FF9800 30%, #FFCA28 90%)',
                      boxShadow: '0 3px 5px 2px rgba(255, 152, 0, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #F57C00 30%, #FFB74D 90%)',
                      }
                    }}
                  >
                    Join Organization
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}; 