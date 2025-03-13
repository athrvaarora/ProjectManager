import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Chip,
  Box,
  InputAdornment,
} from '@mui/material';
import { ProjectRequirements } from '../../types/project.types';

interface ProjectOverviewProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  requirements,
  setRequirements,
}) => {
  const handleChange = (field: keyof ProjectRequirements) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleObjectiveAdd = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value) {
      setRequirements((prev) => ({
        ...prev,
        objectives: [...prev.objectives, event.currentTarget.value],
      }));
      event.currentTarget.value = '';
    }
  };

  const handleObjectiveDelete = (indexToDelete: number) => {
    setRequirements((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((_, index) => index !== indexToDelete),
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          multiline
          rows={3}
          label="Project Summary"
          value={requirements.summary}
          onChange={handleChange('summary')}
          placeholder="Provide a brief overview of the project"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          multiline
          rows={4}
          label="Detailed Description"
          value={requirements.description}
          onChange={handleChange('description')}
          placeholder="Describe the project in detail, including its purpose and expected outcomes"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Project Objectives
        </Typography>
        <TextField
          fullWidth
          label="Add Objective (Press Enter)"
          onKeyPress={handleObjectiveAdd}
          placeholder="Enter project objectives one by one"
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.objectives.map((objective, index) => (
            <Chip
              key={index}
              label={objective}
              onDelete={() => handleObjectiveDelete(index)}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          multiline
          rows={2}
          label="Target Users"
          value={requirements.targetUsers}
          onChange={handleChange('targetUsers')}
          placeholder="Describe the target user base for this project"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          type="number"
          label="Expected User Volume"
          value={requirements.expectedUserVolume}
          onChange={handleChange('expectedUserVolume')}
          InputProps={{
            endAdornment: <InputAdornment position="end">users</InputAdornment>,
          }}
          placeholder="Estimated number of users"
        />
      </Grid>
    </Grid>
  );
}; 