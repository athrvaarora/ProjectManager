import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Chip,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { ProjectRequirements } from '../../types/project.types';

interface QualityComplianceProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

const testingLevelOptions = [
  'Unit Testing',
  'Integration Testing',
  'End-to-End Testing',
  'Performance Testing',
  'Security Testing',
  'Accessibility Testing',
  'User Acceptance Testing',
  'Load Testing',
  'Stress Testing',
  'Regression Testing',
];

export const QualityCompliance: React.FC<QualityComplianceProps> = ({
  requirements,
  setRequirements,
}) => {
  const handleArrayAdd = (field: 'testingLevels' | 'complianceRequirements' | 'securityRequirements') => (
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

  const handleArrayDelete = (field: 'testingLevels' | 'complianceRequirements' | 'securityRequirements', indexToDelete: number) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, index) => index !== indexToDelete),
    }));
  };

  const handleTestingLevelToggle = (level: string) => {
    setRequirements((prev) => {
      const currentLevels = prev.testingLevels;
      const newLevels = currentLevels.includes(level)
        ? currentLevels.filter((l) => l !== level)
        : [...currentLevels, level];
      return {
        ...prev,
        testingLevels: newLevels,
      };
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Testing Levels
        </Typography>
        <FormGroup>
          {testingLevelOptions.map((level) => (
            <FormControlLabel
              key={level}
              control={
                <Checkbox
                  checked={requirements.testingLevels.includes(level)}
                  onChange={() => handleTestingLevelToggle(level)}
                />
              }
              label={level}
            />
          ))}
        </FormGroup>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Compliance Requirements
        </Typography>
        <TextField
          fullWidth
          label="Add Compliance Requirement (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('complianceRequirements')(e)}
          placeholder="Enter compliance standards, regulations, or certifications"
          inputProps={{ 'aria-label': 'Add compliance requirement' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.complianceRequirements.map((req, index) => (
            <Chip
              key={index}
              label={req}
              onDelete={() => handleArrayDelete('complianceRequirements', index)}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Security Requirements
        </Typography>
        <TextField
          fullWidth
          label="Add Security Requirement (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('securityRequirements')(e)}
          placeholder="Enter security requirements and standards"
          inputProps={{ 'aria-label': 'Add security requirement' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.securityRequirements.map((req, index) => (
            <Chip
              key={index}
              label={req}
              onDelete={() => handleArrayDelete('securityRequirements', index)}
              color="secondary"
              variant="outlined"
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Performance Expectations"
          value={requirements.performanceExpectations}
          onChange={(e) =>
            setRequirements((prev) => ({
              ...prev,
              performanceExpectations: e.target.value,
            }))
          }
          placeholder="Describe performance requirements (e.g., response times, load capacity, availability)"
        />
      </Grid>
    </Grid>
  );
}; 