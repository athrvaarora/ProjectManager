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

interface TechnicalSpecsProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const TechnicalSpecs: React.FC<TechnicalSpecsProps> = ({
  requirements,
  setRequirements,
}) => {
  const handlePlatformChange = (platform: keyof typeof requirements.platform) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequirements((prev) => ({
      ...prev,
      platform: {
        ...prev.platform,
        [platform]: event.target.checked,
      },
    }));
  };

  const handleArrayAdd = (field: 'requiredTechnologies' | 'integrationRequirements' | 'designDocuments' | 'technicalConstraints') => (
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

  const handleArrayDelete = (field: 'requiredTechnologies' | 'integrationRequirements' | 'designDocuments' | 'technicalConstraints', indexToDelete: number) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, index) => index !== indexToDelete),
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Platform Requirements
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={requirements.platform.web}
                onChange={handlePlatformChange('web')}
              />
            }
            label="Web Application"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={requirements.platform.mobile}
                onChange={handlePlatformChange('mobile')}
              />
            }
            label="Mobile Application"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={requirements.platform.desktop}
                onChange={handlePlatformChange('desktop')}
              />
            }
            label="Desktop Application"
          />
        </FormGroup>
        <TextField
          fullWidth
          label="Other Platform Requirements"
          value={requirements.platform.other}
          onChange={(e) =>
            setRequirements((prev) => ({
              ...prev,
              platform: { ...prev.platform, other: e.target.value },
            }))
          }
          sx={{ mt: 2 }}
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Required Technologies
        </Typography>
        <TextField
          fullWidth
          label="Add Technology (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('requiredTechnologies')(e)}
          placeholder="Enter required technologies"
          inputProps={{ 'aria-label': 'Add required technology' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.requiredTechnologies.map((tech, index) => (
            <Chip
              key={index}
              label={tech}
              onDelete={() => handleArrayDelete('requiredTechnologies', index)}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Integration Requirements
        </Typography>
        <TextField
          fullWidth
          label="Add Integration (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('integrationRequirements')(e)}
          placeholder="Enter integration requirements"
          inputProps={{ 'aria-label': 'Add integration requirement' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.integrationRequirements.map((integration, index) => (
            <Chip
              key={index}
              label={integration}
              onDelete={() => handleArrayDelete('integrationRequirements', index)}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Design Documents
        </Typography>
        <TextField
          fullWidth
          label="Add Design Document (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('designDocuments')(e)}
          placeholder="Enter design document links or references"
          inputProps={{ 'aria-label': 'Add design document' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.designDocuments.map((doc, index) => (
            <Chip
              key={index}
              label={doc}
              onDelete={() => handleArrayDelete('designDocuments', index)}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Technical Constraints
        </Typography>
        <TextField
          fullWidth
          label="Add Constraint (Press Enter)"
          onKeyDown={(e) => handleArrayAdd('technicalConstraints')(e)}
          placeholder="Enter technical constraints"
          inputProps={{ 'aria-label': 'Add technical constraint' }}
        />
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {requirements.technicalConstraints.map((constraint, index) => (
            <Chip
              key={index}
              label={constraint}
              onDelete={() => handleArrayDelete('technicalConstraints', index)}
            />
          ))}
        </Box>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Infrastructure Details"
          value={requirements.infrastructure}
          onChange={(e) =>
            setRequirements((prev) => ({
              ...prev,
              infrastructure: e.target.value,
            }))
          }
          placeholder="Describe infrastructure requirements and setup"
        />
      </Grid>
    </Grid>
  );
}; 