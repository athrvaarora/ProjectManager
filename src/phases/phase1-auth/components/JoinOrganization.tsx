import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

export const JoinOrganization: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleJoinOrganization = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // In a real implementation, you would verify the invite code against a backend
      // For now, we'll just simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, any 6-character code is accepted
      if (inviteCode.length >= 6) {
        // Update user document to indicate they've joined an organization
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), {
            hasOrganization: true,
            isCreator: false,
            isFirstLogin: false,
            organizationCode: inviteCode,
            role: 'member'
          });
        }
        setIsSuccess(true);
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Invalid invite code. Please enter a valid code.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join organization');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/organization-selection');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 8
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <IconButton 
            onClick={handleGoBack}
            sx={{ 
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #FF9800 30%, #FFCA28 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Join an Organization
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '450px', mx: 'auto' }}>
              Enter the invitation code you received from your organization administrator to join the workspace.
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {isSuccess ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Successfully Joined!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You have successfully joined the organization. Redirecting to your dashboard...
              </Typography>
              <CircularProgress size={24} sx={{ mt: 3 }} />
            </Box>
          ) : (
            <>
              <TextField
                fullWidth
                label="Invitation Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                margin="normal"
                placeholder="Enter your invitation code"
                variant="outlined"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 4,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleJoinOrganization}
                disabled={isLoading || !inviteCode.trim()}
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
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Join Organization'}
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
}; 