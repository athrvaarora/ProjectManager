import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Chip,
  Box,
  InputAdornment,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  IconButton
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { IProjectSetup } from '../../types/project.types';
import BusinessIcon from '@mui/icons-material/Business';
import TitleIcon from '@mui/icons-material/Title';
import TagIcon from '@mui/icons-material/Tag';
import GroupIcon from '@mui/icons-material/Group';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

export const BasicInfoSection: React.FC = () => {
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
          <InfoOutlinedIcon /> Basic Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Provide essential details about your project
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="basicInfo.title"
              control={control}
              rules={{ required: 'Project title is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project Title"
                  fullWidth
                  required
                  error={!!errors.basicInfo?.title}
                  helperText={errors.basicInfo?.title?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="primary" />
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
          <Grid item xs={12} md={6}>
            <Controller
              name="basicInfo.projectId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Project ID/Reference (Optional)"
                  fullWidth
                  error={!!errors.basicInfo?.projectId}
                  helperText={errors.basicInfo?.projectId?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TagIcon color="primary" />
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

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip 
                label="Client Information" 
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }} 
              />
            </Divider>
          </Grid>

          <Grid item xs={12} md={8}>
            <Controller
              name="basicInfo.clientCompany"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Client Company Name (Optional)"
                  fullWidth
                  error={!!errors.basicInfo?.clientCompany}
                  helperText={errors.basicInfo?.clientCompany?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
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
          <Grid item xs={12} md={4}>
            <Controller
              name="basicInfo.clientDivision"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Division/Department (Optional)"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon color="primary" />
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

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip 
                label="Project Description" 
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }} 
              />
            </Divider>
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="basicInfo.summary"
              control={control}
              rules={{ 
                required: 'Project summary is required',
                maxLength: {
                  value: 500,
                  message: 'Summary should not exceed 500 characters'
                }
              }}
              render={({ field }) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Project Summary
                    </Typography>
                    <Tooltip title="Brief overview (2-3 sentences)">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    required
                    multiline
                    rows={2}
                    placeholder="Provide a brief overview of the project in 2-3 sentences"
                    error={!!errors.basicInfo?.summary}
                    helperText={errors.basicInfo?.summary?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="basicInfo.description"
              control={control}
              render={({ field }) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Detailed Description (Optional)
                    </Typography>
                    <Tooltip title="More detailed explanation of the project">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Provide more details about the project (optional)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                </Box>
              )}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 