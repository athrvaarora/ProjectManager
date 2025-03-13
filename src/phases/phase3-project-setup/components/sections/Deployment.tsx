import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { ProjectRequirements } from '../../types/project.types';

interface DeploymentProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

const deploymentMethods = [
  'Manual Deployment',
  'CI/CD Pipeline',
  'Container Orchestration',
  'Serverless Deployment',
  'Hybrid Deployment',
  'Blue-Green Deployment',
  'Canary Deployment',
  'Rolling Deployment',
];

const environments = [
  'Development',
  'Testing',
  'Staging',
  'Production',
  'Disaster Recovery',
  'Multi-Region',
  'Hybrid Cloud',
  'Multi-Cloud',
];

export const Deployment: React.FC<DeploymentProps> = ({
  requirements,
  setRequirements,
}) => {
  const handleSelectChange = (field: keyof ProjectRequirements) => (
    event: SelectChangeEvent<string>
  ) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleTextChange = (field: keyof ProjectRequirements) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Deployment Environment</InputLabel>
          <Select
            value={requirements.deploymentEnvironment}
            onChange={handleSelectChange('deploymentEnvironment')}
            label="Deployment Environment"
          >
            {environments.map((env) => (
              <MenuItem key={env} value={env}>
                {env}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Deployment Method</InputLabel>
          <Select
            value={requirements.deploymentMethod}
            onChange={handleSelectChange('deploymentMethod')}
            label="Deployment Method"
          >
            {deploymentMethods.map((method) => (
              <MenuItem key={method} value={method}>
                {method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Maintenance Requirements
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Maintenance Expectations"
          value={requirements.maintenanceExpectations}
          onChange={handleTextChange('maintenanceExpectations')}
          placeholder="Describe maintenance procedures, schedules, and responsibilities"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Training Requirements
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Training Requirements"
          value={requirements.trainingRequirements}
          onChange={handleTextChange('trainingRequirements')}
          placeholder="Describe training needs for users, administrators, and support staff"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Additional Considerations
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Backup and recovery procedures
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Monitoring and alerting setup
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Scaling and performance optimization
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Security and compliance measures
        </Typography>
      </Grid>
    </Grid>
  );
}; 