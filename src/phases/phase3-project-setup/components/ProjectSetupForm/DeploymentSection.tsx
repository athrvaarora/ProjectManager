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
  useTheme,
  alpha,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import CloudIcon from '@mui/icons-material/Cloud';
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import RestoreIcon from '@mui/icons-material/Restore';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

const DEPLOYMENT_ENVIRONMENTS = [
  'Development',
  'Testing',
  'Staging',
  'Production',
  'Hybrid',
  'On-Premises',
  'Cloud',
  'Multi-Cloud',
];

const DEPLOYMENT_METHODS = [
  'Manual Deployment',
  'CI/CD Pipeline',
  'Blue-Green Deployment',
  'Canary Deployment',
  'Rolling Deployment',
  'Feature Flags',
  'Containerized Deployment',
  'Serverless Deployment',
];

export const DeploymentSection: React.FC = () => {
  const theme = useTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, 
        mb: 3, 
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        p: 2, 
        background: alpha(theme.palette.primary.main, 0.05),
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: theme.palette.primary.main,
            fontWeight: 600
          }}
        >
          <CloudIcon /> Deployment Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define how the project will be deployed and maintained
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Deployment Environment */}
          <Grid item xs={12} md={6}>
            <Controller
              name="deployment.environment"
              control={control}
              render={({ field }) => (
                <FormControl 
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <InputLabel>Deployment Environment</InputLabel>
                  <Select
                    {...field}
                    label="Deployment Environment"
                    startAdornment={
                      <InputAdornment position="start">
                        <SettingsSystemDaydreamIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    {DEPLOYMENT_ENVIRONMENTS.map((env) => (
                      <MenuItem key={env} value={env}>
                        {env}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Deployment Method */}
          <Grid item xs={12} md={6}>
            <Controller
              name="deployment.method"
              control={control}
              render={({ field }) => (
                <FormControl 
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <InputLabel>Deployment Method</InputLabel>
                  <Select
                    {...field}
                    label="Deployment Method"
                    startAdornment={
                      <InputAdornment position="start">
                        <CloudIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    {DEPLOYMENT_METHODS.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          </Grid>

          {/* Maintenance Requirements */}
          <Grid item xs={12} md={6}>
            <Controller
              name="deployment.maintenanceRequirements"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Maintenance Requirements"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe ongoing maintenance needs"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BuildIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Training Requirements */}
          <Grid item xs={12} md={6}>
            <Controller
              name="deployment.trainingRequirements"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Training Requirements"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe any training needs for users or administrators"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Rollback Plan */}
          <Grid item xs={12} md={6}>
            <Controller
              name="deployment.rollbackPlan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Rollback Plan"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe the strategy for rolling back in case of issues"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RestoreIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              )}
            />
          </Grid>

          {/* Monitoring Strategy */}
          <Grid item xs={12} md={6}>
            <Controller
              name="deployment.monitoringStrategy"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Monitoring Strategy"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe how the application will be monitored"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MonitorHeartIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 