import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Link
} from '@mui/material';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db, auth } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

interface InviteData {
  email: string;
  organizationId: string;
  organizationCode: string;
  createdBy: string;
  createdAt: any;
  expiresAt: any;
  status: 'pending' | 'accepted' | 'expired';
}

export const SignupInvite: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptTerms: false
  });

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/dashboard');
      return;
    }

    const fetchInviteData = async () => {
      if (!inviteCode) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const inviteRef = doc(db, 'invites', inviteCode);
        const inviteSnap = await getDoc(inviteRef);

        if (!inviteSnap.exists()) {
          setError('Invitation not found or has expired');
          setLoading(false);
          return;
        }

        const data = inviteSnap.data() as InviteData;
        
        // Check if invitation has expired
        if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
          setError('This invitation has expired');
          setLoading(false);
          return;
        }

        // Check if invitation has already been accepted
        if (data.status === 'accepted') {
          setError('This invitation has already been used');
          setLoading(false);
          return;
        }

        setInviteData(data);
        setFormData(prev => ({ ...prev, email: data.email }));

        // Fetch organization name
        try {
          const orgRef = doc(db, 'organizations', data.organizationId);
          const orgSnap = await getDoc(orgRef);
          if (orgSnap.exists()) {
            setOrganizationName(orgSnap.data().name || 'Your Organization');
          }
        } catch (err) {
          console.error('Error fetching organization details:', err);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching invite:', err);
        setError('Failed to load invitation details');
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [inviteCode, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteData) {
      setError('Invalid invitation data');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.displayName) {
      setError('Please enter your name');
      return;
    }

    if (!formData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        inviteData.email,
        formData.password
      );

      // Update the user's profile
      await updateProfile(userCredential.user, {
        displayName: formData.displayName
      });

      // Update the user's document in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userRef, {
        email: inviteData.email,
        displayName: formData.displayName,
        organizationId: inviteData.organizationId,
        organizationCode: inviteData.organizationCode,
        role: 'member',
        hasOrganization: true,
        isCreator: false,
        isFirstLogin: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update the invite status
      const inviteRef = doc(db, 'invites', inviteCode!);
      await updateDoc(inviteRef, {
        status: 'accepted',
        acceptedAt: new Date(),
        acceptedBy: userCredential.user.uid
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating account:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
      setLoading(false);
    }
  };

  if (loading && !inviteData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Join {organizationName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete your account setup to join the organization
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Verify Invitation</StepLabel>
            </Step>
            <Step>
              <StepLabel>Create Account</StepLabel>
            </Step>
            <Step>
              <StepLabel>Join Organization</StepLabel>
            </Step>
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!inviteData ? (
            <Alert severity="error">
              Invalid or expired invitation. Please contact your organization administrator for a new invitation.
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    value={inviteData.email}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      I accept the{' '}
                      <Link href="/terms" target="_blank">
                        Terms and Conditions
                      </Link>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                    >
                      Already have an account? Log in
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account & Join'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          )}
        </Paper>
      </Container>
    </Box>
  );
}; 