import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    // If user is already verified, redirect to organization selection
    if (user?.emailVerified) {
      navigate('/organization-selection');
    }
    
    // If no user is logged in, redirect to login
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSendVerification = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(auth.currentUser!);
        setVerificationSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    // In a real implementation, you would verify the code against a backend
    // For now, we'll just simulate verification
    setError(null);
    setIsLoading(true);

    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, any 6-digit code is accepted
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        navigate('/organization-selection');
      } else {
        setError('Invalid verification code. Please enter a 6-digit code.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Verify Your Email
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {verificationSent ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Verification email sent! Please check your inbox.
            </Alert>
          ) : (
            <Typography variant="body1" paragraph>
              We need to verify your email address. Click the button below to receive a verification email.
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            {!verificationSent ? (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSendVerification}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Send Verification Email'}
              </Button>
            ) : (
              <>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Enter the 6-digit verification code from your email:
                </Typography>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  margin="normal"
                  inputProps={{ maxLength: 6 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Verify Code'}
                </Button>
              </>
            )}
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}; 