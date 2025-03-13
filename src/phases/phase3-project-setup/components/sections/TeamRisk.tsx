import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ProjectRequirements } from '../ProjectSetupForm';

interface TeamRiskProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const TeamRisk: React.FC<TeamRiskProps> = ({ requirements, setRequirements }) => {
  // Handler for adding items to arrays
  const handleAddItem = (field: keyof ProjectRequirements, value: string) => {
    if (!value.trim()) return;
    
    setRequirements((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value],
    }));
  };

  // Handler for removing items from arrays
  const handleRemoveItem = (field: keyof ProjectRequirements, index: number) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  // Handler for text input changes
  const handleInputChange = (field: keyof ProjectRequirements, value: string) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Team Structure & Expertise
        </Typography>
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Special Expertise */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Special Expertise Required
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Special Expertise"
                  placeholder="E.g., Machine Learning, DevOps, UX Design"
                  value={requirements.specialExpertiseInput || ''}
                  onChange={(e) => 
                    setRequirements((prev) => ({
                      ...prev,
                      specialExpertiseInput: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('specialExpertise', requirements.specialExpertiseInput || '');
                      setRequirements((prev) => ({ ...prev, specialExpertiseInput: '' }));
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    handleAddItem('specialExpertise', requirements.specialExpertiseInput || '');
                    setRequirements((prev) => ({ ...prev, specialExpertiseInput: '' }));
                  }}
                  sx={{ ml: 1, minWidth: '120px' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {requirements.specialExpertise.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveItem('specialExpertise', index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Client Involvement */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Client Involvement Level</InputLabel>
                <Select
                  value={requirements.clientInvolvement}
                  label="Client Involvement Level"
                  onChange={(e) => 
                    handleInputChange('clientInvolvement', e.target.value as string)
                  }
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Very High">Very High</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Resource Constraints */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Resource Constraints"
                multiline
                rows={2}
                value={requirements.resourceConstraintsText || ''}
                onChange={(e) => 
                  setRequirements((prev) => ({
                    ...prev,
                    resourceConstraintsText: e.target.value,
                  }))
                }
                placeholder="Describe any resource limitations or constraints"
              />
            </Grid>

            {/* Cross-Team Dependencies */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cross-Team Dependencies"
                multiline
                rows={2}
                value={requirements.crossTeamDependenciesText || ''}
                onChange={(e) => 
                  setRequirements((prev) => ({
                    ...prev,
                    crossTeamDependenciesText: e.target.value,
                  }))
                }
                placeholder="Describe any dependencies on other teams or departments"
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Risk Assessment
        </Typography>
        <Paper elevation={0} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Known Challenges */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Known Challenges
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Known Challenge"
                  placeholder="E.g., Integration with legacy systems, Data migration"
                  value={requirements.knownChallengesInput || ''}
                  onChange={(e) => 
                    setRequirements((prev) => ({
                      ...prev,
                      knownChallengesInput: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('knownChallenges', requirements.knownChallengesInput || '');
                      setRequirements((prev) => ({ ...prev, knownChallengesInput: '' }));
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    handleAddItem('knownChallenges', requirements.knownChallengesInput || '');
                    setRequirements((prev) => ({ ...prev, knownChallengesInput: '' }));
                  }}
                  sx={{ ml: 1, minWidth: '120px' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {requirements.knownChallenges.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveItem('knownChallenges', index)}
                    color="error"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Critical Dependencies */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Critical Dependencies
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Add Critical Dependency"
                  placeholder="E.g., Third-party API availability, Hardware delivery"
                  value={requirements.criticalDependenciesInput || ''}
                  onChange={(e) => 
                    setRequirements((prev) => ({
                      ...prev,
                      criticalDependenciesInput: e.target.value,
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddItem('criticalDependencies', requirements.criticalDependenciesInput || '');
                      setRequirements((prev) => ({ ...prev, criticalDependenciesInput: '' }));
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    handleAddItem('criticalDependencies', requirements.criticalDependenciesInput || '');
                    setRequirements((prev) => ({ ...prev, criticalDependenciesInput: '' }));
                  }}
                  sx={{ ml: 1, minWidth: '120px' }}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {requirements.criticalDependencies.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveItem('criticalDependencies', index)}
                    color="warning"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Contingency Plans */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contingency Plans"
                multiline
                rows={3}
                value={requirements.contingencyPlans}
                onChange={(e) => 
                  handleInputChange('contingencyPlans', e.target.value)
                }
                placeholder="Describe alternative approaches if issues arise"
              />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
}; 