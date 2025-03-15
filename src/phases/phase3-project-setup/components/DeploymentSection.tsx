import React from 'react';
import { Box, Typography, Grid, TextField, MenuItem, Button } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import SummarizeIcon from '@mui/icons-material/Summarize';

const deploymentEnvironments = [
  'Development',
  'Staging',
  'Production',
  'Multi-environment',
  'Cloud',
  'On-premises',
  'Hybrid'
];

const deploymentMethods = [
  'Continuous Integration/Continuous Deployment (CI/CD)',
  'Manual Deployment',
  'Blue-Green Deployment',
  'Canary Deployment',
  'Rolling Deployment',
  'Feature Flags',
  'Other'
];

const DeploymentSection: React.FC = () => {
  const { control, formState: { errors }, trigger } = useFormContext();
  const navigate = useNavigate();

  const handleSummarizeProject = async () => {
    // Validate the form before proceeding
    const isValid = await trigger();
    if (!isValid) {
      console.error('Form validation failed');
      return;
    }

    // The form is valid, so we can proceed to the summary page
    // The actual navigation will be handled in the parent component (ProjectSetupForm)
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Deployment & Maintenance
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="deployment.environment"
            control={control}
            defaultValue=""
            rules={{ required: 'Deployment environment is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Deployment Environment"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message || 'Select the target deployment environment'}
              >
                {deploymentEnvironments.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="deployment.method"
            control={control}
            defaultValue=""
            rules={{ required: 'Deployment method is required' }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                label="Deployment Method"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message || 'Select the deployment method'}
              >
                {deploymentMethods.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="deployment.maintenanceRequirements"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Maintenance Requirements"
                fullWidth
                multiline
                rows={3}
                helperText="Describe any specific maintenance requirements or schedules"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Controller
            name="deployment.trainingRequirements"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Training Requirements"
                fullWidth
                multiline
                rows={3}
                helperText="Describe any training needs for users or administrators"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="deployment.rollbackPlan"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Rollback Plan"
                fullWidth
                multiline
                rows={3}
                helperText="Describe the plan for rolling back deployments if issues occur"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Controller
            name="deployment.monitoringStrategy"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                label="Monitoring Strategy"
                fullWidth
                multiline
                rows={3}
                helperText="Describe how the application will be monitored post-deployment"
              />
            )}
          />
        </Grid>
        
        <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSummarizeProject}
            startIcon={<SummarizeIcon />}
          >
            Summarize Project
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DeploymentSection; 