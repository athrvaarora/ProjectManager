import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  useTheme,
  alpha,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningIcon from '@mui/icons-material/Warning';
import EngineeringIcon from '@mui/icons-material/Engineering';
import PersonIcon from '@mui/icons-material/Person';
import LinkIcon from '@mui/icons-material/Link';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SecurityIcon from '@mui/icons-material/Security';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

export const TeamRiskSection: React.FC = () => {
  const theme = useTheme();
  const {
    control,
  } = useFormContext<ProjectSetupFormData>();

  const { fields: specialExpertiseFields, append: appendSpecialExpertise, remove: removeSpecialExpertise } = useFieldArray({
    control,
    name: 'team.specialExpertise' as any,
  });

  const { fields: clientInvolvementFields, append: appendClientInvolvement, remove: removeClientInvolvement } = useFieldArray({
    control,
    name: 'team.clientInvolvement' as any,
  });

  const { fields: risksFields, append: appendRisk, remove: removeRisk } = useFieldArray({
    control,
    name: 'risks.risks' as any,
  });

  const { fields: criticalDependenciesFields, append: appendCriticalDependency, remove: removeCriticalDependency } = useFieldArray({
    control,
    name: 'risks.criticalDependencies' as any,
  });

  const { fields: mitigationStrategiesFields, append: appendMitigationStrategy, remove: removeMitigationStrategy } = useFieldArray({
    control,
    name: 'risks.mitigationStrategies' as any,
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
          <GroupsIcon /> Team & Risk Assessment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define team structure, potential risks, and mitigation strategies
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Team Structure Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label="Team Structure" 
              size="small"
              sx={{ 
                fontWeight: 600,
                background: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                borderRadius: 1.5
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Define team composition and responsibilities
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
              mb: 3
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="team.teamStructure"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Team Structure"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe the team structure and organization"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <GroupsIcon color="success" />
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
          
          {/* Special Expertise */}
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Special Expertise Required</Typography>
          
          {specialExpertiseFields.map((field, index) => (
            <Box 
              key={field.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={11}>
                  <Controller
                    name={`team.specialExpertise.${index}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Expertise ${index + 1}`}
                        placeholder="e.g., Machine Learning, Blockchain, etc."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EngineeringIcon color="success" />
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
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeSpecialExpertise(index)}
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
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => appendSpecialExpertise('' as any)}
            sx={{ 
              mt: 1,
              mb: 3,
              borderRadius: 2,
              borderColor: alpha(theme.palette.success.main, 0.5),
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                borderColor: theme.palette.success.main,
              }
            }}
          >
            Add Special Expertise
          </Button>
          
          {/* Client Involvement */}
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Client Involvement</Typography>
          
          {clientInvolvementFields.map((field, index) => (
            <Box 
              key={field.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={11}>
                  <Controller
                    name={`team.clientInvolvement.${index}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Client Involvement ${index + 1}`}
                        placeholder="e.g., Weekly meetings, User testing, etc."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="success" />
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
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeClientInvolvement(index)}
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
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => appendClientInvolvement('' as any)}
            sx={{ 
              mt: 1,
              mb: 3,
              borderRadius: 2,
              borderColor: alpha(theme.palette.success.main, 0.5),
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                borderColor: theme.palette.success.main,
              }
            }}
          >
            Add Client Involvement
          </Button>
          
          {/* Resource Constraints & Dependencies */}
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
              mb: 3
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="team.resourceConstraints"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Resource Constraints"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe any limitations on available personnel or resources"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WarningIcon color="warning" />
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
                  name="team.crossTeamDependencies"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cross-Team Dependencies"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Describe any dependencies on other teams or departments"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon color="warning" />
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
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Risk Assessment Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label="Risk Assessment" 
              size="small"
              sx={{ 
                fontWeight: 600,
                background: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
                borderRadius: 1.5
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Identify potential risks and mitigation strategies
            </Typography>
          </Box>
          
          {/* Known Challenges */}
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
              mb: 3
            }}
          >
            <Controller
              name="risks.contingencyPlans"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Known Challenges & Contingency Plans"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe any known challenges or potential issues and contingency plans"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReportProblemIcon color="error" />
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
          </Box>
          
          {/* Risks */}
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Project Risks</Typography>
          
          {risksFields.map((field, index) => (
            <Box 
              key={field.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={11}>
                  <Controller
                    name={`risks.risks.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Risk ${index + 1}`}
                        placeholder="Describe a potential risk to the project"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <WarningIcon color="error" />
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
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeRisk(index)}
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
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => appendRisk({
              description: '',
              level: '',
              impact: '',
              mitigation: ''
            })}
            sx={{ 
              mt: 1,
              mb: 3,
              borderRadius: 2,
              borderColor: alpha(theme.palette.error.main, 0.5),
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                borderColor: theme.palette.error.main,
              }
            }}
          >
            Add Risk
          </Button>
          
          {/* Critical Dependencies */}
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Critical Dependencies</Typography>
          
          {criticalDependenciesFields.map((field, index) => (
            <Box 
              key={field.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={11}>
                  <Controller
                    name={`risks.criticalDependencies.${index}.dependency`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Dependency ${index + 1}`}
                        placeholder="Describe a critical external dependency"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon color="error" />
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
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeCriticalDependency(index)}
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
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => appendCriticalDependency({
              dependency: '',
              managementStrategy: ''
            })}
            sx={{ 
              mt: 1,
              mb: 3,
              borderRadius: 2,
              borderColor: alpha(theme.palette.error.main, 0.5),
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                borderColor: theme.palette.error.main,
              }
            }}
          >
            Add Critical Dependency
          </Button>
          
          {/* Mitigation Strategies */}
          <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Mitigation Strategies</Typography>
          
          {mitigationStrategiesFields.map((field, index) => (
            <Box 
              key={field.id} 
              sx={{ 
                mb: 2, 
                p: 2, 
                borderRadius: 2, 
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                }
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={11}>
                  <Controller
                    name={`risks.mitigationStrategies.${index}`}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={`Mitigation Strategy ${index + 1}`}
                        placeholder="Describe a strategy to mitigate identified risks"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="warning" />
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
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeMitigationStrategy(index)}
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
              </Grid>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => appendMitigationStrategy('' as any)}
            sx={{ 
              mt: 1,
              borderRadius: 2,
              borderColor: alpha(theme.palette.warning.main, 0.5),
              color: theme.palette.warning.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                borderColor: theme.palette.warning.main,
              }
            }}
          >
            Add Mitigation Strategy
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 