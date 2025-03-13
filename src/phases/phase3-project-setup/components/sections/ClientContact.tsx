import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { ProjectRequirements } from '../../types/project.types';

interface ClientContactProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const ClientContact: React.FC<ClientContactProps> = ({
  requirements,
  setRequirements,
}) => {
  const handlePrimaryContactChange = (field: keyof typeof requirements.primaryContact) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequirements((prev: ProjectRequirements) => ({
      ...prev,
      primaryContact: {
        ...prev.primaryContact,
        [field]: event.target.value,
      },
    }));
  };

  const handleSecondaryContactChange = (field: keyof typeof requirements.secondaryContact) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequirements((prev: ProjectRequirements) => ({
      ...prev,
      secondaryContact: {
        ...prev.secondaryContact,
        [field]: event.target.value,
      },
    }));
  };

  const handleDecisionMakerAdd = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value) {
      setRequirements((prev: ProjectRequirements) => ({
        ...prev,
        decisionMakers: [...prev.decisionMakers, event.currentTarget.value],
      }));
      event.currentTarget.value = '';
    }
  };

  const handleDecisionMakerDelete = (indexToDelete: number) => {
    setRequirements((prev: ProjectRequirements) => ({
      ...prev,
      decisionMakers: prev.decisionMakers.filter((_: string, index: number) => index !== indexToDelete),
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Primary Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Name"
              value={requirements.primaryContact.name}
              onChange={handlePrimaryContactChange('name')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Position"
              value={requirements.primaryContact.position}
              onChange={handlePrimaryContactChange('position')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Email"
              type="email"
              value={requirements.primaryContact.email}
              onChange={handlePrimaryContactChange('email')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              label="Phone"
              value={requirements.primaryContact.phone}
              onChange={handlePrimaryContactChange('phone')}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Secondary Contact
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              value={requirements.secondaryContact.name}
              onChange={handleSecondaryContactChange('name')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Position"
              value={requirements.secondaryContact.position}
              onChange={handleSecondaryContactChange('position')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={requirements.secondaryContact.email}
              onChange={handleSecondaryContactChange('email')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={requirements.secondaryContact.phone}
              onChange={handleSecondaryContactChange('phone')}
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Decision Makers
        </Typography>
        <TextField
          fullWidth
          label="Add Decision Maker (Press Enter)"
          onKeyPress={handleDecisionMakerAdd}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.decisionMakers.map((maker: string, index: number) => (
            <Chip
              key={index}
              label={maker}
              onDelete={() => handleDecisionMakerDelete(index)}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}; 