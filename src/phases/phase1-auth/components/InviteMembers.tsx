import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

interface InviteMembersProps {
  open: boolean;
  onClose: () => void;
}

export const InviteMembers: React.FC<InviteMembersProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAddEmail = () => {
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (invitedEmails.includes(email)) {
      setError('This email has already been added');
      return;
    }

    setInvitedEmails([...invitedEmails, email]);
    setEmail('');
    setError(null);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvitedEmails(invitedEmails.filter((e) => e !== emailToRemove));
  };

  const handleSendInvites = async () => {
    if (!user?.organizationId) {
      setError('No organization ID found');
      return;
    }

    try {
      const inviteCode = Math.random().toString(36).substring(2, 15);
      const inviteRef = doc(db, 'invites', inviteCode);

      await setDoc(inviteRef, {
        organizationId: user.organizationId,
        invitedBy: user.uid,
        emails: invitedEmails,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });

      // Here you would typically trigger an email sending function
      // through your backend service to send invitation emails
      // For now, we'll just show the invite code
      setSuccess(`Invites sent successfully! Invite code: ${inviteCode}`);
      setInvitedEmails([]);
    } catch (error) {
      setError('Error sending invites. Please try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Team Members</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddEmail();
              }
            }}
            error={!!error}
            helperText={error}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleAddEmail}
            disabled={!email}
          >
            Add Email
          </Button>
        </Box>

        {invitedEmails.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Invited Members:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {invitedEmails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => handleRemoveEmail(email)}
                />
              ))}
            </Box>
          </Box>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSendInvites}
          disabled={invitedEmails.length === 0}
        >
          Send Invites
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 