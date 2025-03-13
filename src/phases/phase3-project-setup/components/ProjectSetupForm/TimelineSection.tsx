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
  FormHelperText,
  useTheme,
  alpha,
  Divider,
  Chip,
  Tooltip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

const PRIORITY_LEVELS = ['high', 'medium', 'low', 'urgent'] as const;

export const TimelineSection: React.FC = () => {
  const theme = useTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  const milestones = useFieldArray({
    control,
    name: 'timeline.milestones' as const,
  });

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
          <AccessTimeIcon /> Project Timeline
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set approximate timeline for your project (all fields optional)
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Controller
              name="timeline.startDate"
              control={control}
              rules={{ required: false }}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  {...field}
                  label="Start Date (Optional)"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: false,
                      error: !!error,
                      helperText: error?.message,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="primary" />
                          </InputAdornment>
                        ),
                      },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="timeline.targetCompletionDate"
              control={control}
              rules={{ required: false }}
              render={({ field, fieldState: { error } }) => (
                <DatePicker
                  {...field}
                  label="Target Completion Date (Optional)"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: false,
                      error: !!error,
                      helperText: error?.message,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon color="primary" />
                          </InputAdornment>
                        ),
                      },
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="timeline.priorityLevel"
              control={control}
              rules={{ required: false }}
              render={({ field, fieldState: { error } }) => (
                <FormControl 
                  fullWidth 
                  error={!!error}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <InputLabel>Priority Level (Optional)</InputLabel>
                  <Select 
                    {...field} 
                    label="Priority Level (Optional)"
                    startAdornment={
                      <InputAdornment position="start">
                        <FlagIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                  </Select>
                  {error && <FormHelperText>{error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label="Key Milestones" 
                size="small"
                sx={{ 
                  fontWeight: 600,
                  background: alpha(theme.palette.info.main, 0.1),
                  color: theme.palette.info.main,
                  borderRadius: 1.5
                }} 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                Add important project milestones (optional)
              </Typography>
            </Box>
            
            {milestones.fields.map((field, index) => (
              <Box 
                key={field.id} 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  '&:hover': {
                    boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <Controller
                      name={`timeline.milestones.${index}.phase`}
                      control={control}
                      rules={{ required: false }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Milestone Name"
                          fullWidth
                          required={false}
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <FlagIcon color="primary" />
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
                  <Grid item xs={12} md={5}>
                    <Controller
                      name={`timeline.milestones.${index}.targetDate`}
                      control={control}
                      rules={{ required: false }}
                      render={({ field, fieldState: { error } }) => (
                        <DatePicker
                          {...field}
                          label="Target Date"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              required: false,
                              error: !!error,
                              helperText: error?.message,
                              InputProps: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarTodayIcon color="primary" />
                                  </InputAdornment>
                                ),
                              },
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2} display="flex" justifyContent="flex-end" alignItems="center">
                    <IconButton
                      onClick={() => milestones.remove(index)}
                      color="error"
                      sx={{ 
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name={`timeline.milestones.${index}.description`}
                      control={control}
                      rules={{ required: false }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Description"
                          fullWidth
                          multiline
                          rows={2}
                          required={false}
                          error={!!error}
                          helperText={error?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <DescriptionIcon color="primary" />
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
            ))}
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() =>
                milestones.append({
                  phase: '',
                  targetDate: new Date(),
                  description: '',
                  isRequired: "0"
                })
              }
              sx={{ 
                mt: 2,
                borderRadius: 2,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              Add Milestone
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}; 