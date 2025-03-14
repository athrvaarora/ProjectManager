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
import { doc, updateDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { isValidOrganizationCode } from '../../phase2-org-chart/utils/codeGenerator';

export const JoinOrganization: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [organizationCode, setOrganizationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleJoinOrganization = async () => {
    if (!organizationCode.trim()) {
      setError('Please enter an organization code');
      return;
    }

    if (!isValidOrganizationCode(organizationCode)) {
      setError('Invalid organization code format');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Look up the organization code in the organizationCodes collection
      const orgCodeRef = doc(db, 'organizationCodes', organizationCode);
      const orgCodeSnap = await getDoc(orgCodeRef);

      if (!orgCodeSnap.exists()) {
        setError('Invalid organization code. Please check and try again.');
        setIsLoading(false);
        return;
      }

      const orgData = orgCodeSnap.data();
      const organizationId = orgData.organizationId;

      // Verify the organization exists
      const orgRef = doc(db, 'organizations', organizationId);
      const orgSnap = await getDoc(orgRef);

      if (!orgSnap.exists()) {
        setError('Organization not found. Please contact your administrator.');
        setIsLoading(false);
        return;
      }

      // Check if the user's email is in the invites for this organization
      const invitesQuery = query(
        collection(db, 'invites'),
        where('organizationId', '==', organizationId),
        where('email', '==', user?.email),
        where('status', '==', 'pending')
      );

      const invitesSnap = await getDocs(invitesQuery);

      if (invitesSnap.empty) {
        setError('No pending invitation found for your email in this organization.');
        setIsLoading(false);
        return;
      }

      // Update user document to indicate they've joined an organization
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          hasOrganization: true,
          isCreator: false,
          isFirstLogin: false,
          organizationId: organizationId,
          organizationCode: organizationCode,
          role: 'member',
          organizationRole: 'member',
          updatedAt: new Date()
        });

        // Update all the user's pending invites for this organization to 'accepted'
        const batch = writeBatch(db);
        invitesSnap.forEach((inviteDoc) => {
          batch.update(inviteDoc.ref, {
            status: 'accepted',
            acceptedAt: new Date(),
            acceptedBy: user.uid
          });
        });
        await batch.commit();
      }

      setIsSuccess(true);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error joining organization:', err);
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
              Enter the organization code you received from your organization administrator to join the workspace.
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
                label="Organization Code"
                value={organizationCode}
                onChange={(e) => setOrganizationCode(e.target.value.toUpperCase())}
                margin="normal"
                placeholder="Enter your organization code"
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
                disabled={isLoading || !organizationCode.trim()}
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