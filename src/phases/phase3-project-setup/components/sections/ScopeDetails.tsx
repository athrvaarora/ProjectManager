import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { ProjectRequirements } from '../../types/project.types';

interface ScopeDetailsProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const ScopeDetails: React.FC<ScopeDetailsProps> = ({
  requirements,
  setRequirements,
}) => {
  const handleArrayAdd = (field: 'coreFeatures' | 'secondaryFeatures' | 'outOfScope' | 'futurePlans') => (
    event: React.KeyboardEvent
  ) => {
    if (event.key === 'Enter') {
      const target = event.target as HTMLInputElement;
      if (target.value) {
        setRequirements((prev) => ({
          ...prev,
          [field]: [...prev[field], target.value],
        }));
        target.value = '';
      }
    }
  };

  const handleArrayDelete = (field: 'coreFeatures' | 'secondaryFeatures' | 'outOfScope' | 'futurePlans', indexToDelete: number) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, index) => index !== indexToDelete),
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Core Features
        </Typography>
        <TextField
          fullWidth
          label="Add Core Feature (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('coreFeatures')(e)}
          placeholder="Enter must-have features"
          inputProps={{ 'aria-label': 'Add core feature' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.coreFeatures.map((feature, index) => (
            <Chip
              key={index}
              label={feature}
              onDelete={() => handleArrayDelete('coreFeatures', index)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Secondary Features
        </Typography>
        <TextField
          fullWidth
          label="Add Secondary Feature (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('secondaryFeatures')(e)}
          placeholder="Enter nice-to-have features"
          inputProps={{ 'aria-label': 'Add secondary feature' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.secondaryFeatures.map((feature, index) => (
            <Chip
              key={index}
              label={feature}
              onDelete={() => handleArrayDelete('secondaryFeatures', index)}
              color="secondary"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Out of Scope
        </Typography>
        <TextField
          fullWidth
          label="Add Out of Scope Item (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('outOfScope')(e)}
          placeholder="Enter features/requirements that are explicitly not included"
          inputProps={{ 'aria-label': 'Add out of scope item' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.outOfScope.map((item, index) => (
            <Chip
              key={index}
              label={item}
              onDelete={() => handleArrayDelete('outOfScope', index)}
              color="error"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Future Plans
        </Typography>
        <TextField
          fullWidth
          label="Add Future Plan (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('futurePlans')(e)}
          placeholder="Enter features planned for future phases"
          inputProps={{ 'aria-label': 'Add future plan' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.futurePlans.map((plan, index) => (
            <Chip
              key={index}
              label={plan}
              onDelete={() => handleArrayDelete('futurePlans', index)}
              color="info"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}; 