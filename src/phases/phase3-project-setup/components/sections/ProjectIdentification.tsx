import React from 'react';
import {
  Grid,
  TextField,
} from '@mui/material';
import { ProjectRequirements } from '../../types/project.types';

interface ProjectIdentificationProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const ProjectIdentification: React.FC<ProjectIdentificationProps> = ({
  requirements,
  setRequirements,
}) => {
  const handleChange = (field: keyof ProjectRequirements) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequirements((prev: ProjectRequirements) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Project Title"
          value={requirements.projectTitle}
          onChange={handleChange('projectTitle')}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Client Company"
          value={requirements.clientCompany}
          onChange={handleChange('clientCompany')}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Client Division/Department"
          value={requirements.clientDivision}
          onChange={handleChange('clientDivision')}
        />
      </Grid>
    </Grid>
  );
}; 