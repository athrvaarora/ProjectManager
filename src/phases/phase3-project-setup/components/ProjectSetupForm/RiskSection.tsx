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
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

const RISK_LEVELS = ['high', 'medium', 'low'] as const;

export const RiskSection: React.FC = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  const risks = useFieldArray({
    control,
    name: 'risks.risks' as const,
  });

  const criticalDependencies = useFieldArray({
    control,
    name: 'risks.criticalDependencies' as const,
  });

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Risk Assessment
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Known Risks
          </Typography>
          {risks.fields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`risks.risks.${index}.description`}
                    control={control}
                    rules={{ required: 'Risk description is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Risk Description"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name={`risks.risks.${index}.level`}
                    control={control}
                    rules={{ required: 'Risk level is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <FormControl fullWidth error={!!error}>
                        <InputLabel>Risk Level</InputLabel>
                        <Select {...field} label="Risk Level">
                          {RISK_LEVELS.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{error?.message}</FormHelperText>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => risks.remove(index)}
                    color="error"
                  >
                    Remove
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name={`risks.risks.${index}.impact`}
                    control={control}
                    rules={{ required: 'Impact description is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Impact"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name={`risks.risks.${index}.mitigation`}
                    control={control}
                    rules={{ required: 'Mitigation strategy is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Mitigation Strategy"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              risks.append({
                description: '',
                level: 'medium',
                impact: '',
                mitigation: '',
              })
            }
            sx={{ mt: 1 }}
          >
            Add Risk
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Critical Dependencies
          </Typography>
          {criticalDependencies.fields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`risks.criticalDependencies.${index}.dependency`}
                    control={control}
                    rules={{ required: 'Dependency description is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Dependency"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name={`risks.criticalDependencies.${index}.managementStrategy`}
                    control={control}
                    rules={{ required: 'Management strategy is required' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        label="Management Strategy"
                        fullWidth
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    startIcon={<DeleteIcon />}
                    onClick={() => criticalDependencies.remove(index)}
                    color="error"
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() =>
              criticalDependencies.append({
                dependency: '',
                managementStrategy: '',
              })
            }
            sx={{ mt: 1 }}
          >
            Add Critical Dependency
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Contingency Plans
          </Typography>
          <Controller
            name="risks.contingencyPlans"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                multiline
                rows={4}
                required
                error={!!error}
                helperText={error?.message}
                placeholder="Describe the overall contingency plan for handling unforeseen issues and risks"
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}; 