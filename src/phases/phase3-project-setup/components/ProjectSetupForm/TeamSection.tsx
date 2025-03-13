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
  Chip,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

const EXPERTISE_AREAS = [
  'Frontend Development',
  'Backend Development',
  'DevOps',
  'UI/UX Design',
  'Mobile Development',
  'Cloud Architecture',
  'Security',
  'Data Engineering',
  'Machine Learning',
  'Project Management',
] as const;

const INVOLVEMENT_LEVELS = ['daily', 'weekly', 'monthly', 'as-needed'] as const;

const RESOURCE_CONSTRAINTS = [
  'Budget Limitations',
  'Time Constraints',
  'Team Availability',
  'Hardware Limitations',
  'Software Licenses',
  'Third-party Dependencies',
  'Legal Restrictions',
  'Other',
];

const TEAM_DEPENDENCIES = [
  'Design Team',
  'Development Team',
  'QA Team',
  'DevOps Team',
  'Security Team',
  'Business Team',
  'Legal Team',
  'External Vendors',
  'Other',
];

export const TeamSection: React.FC = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Team Requirements
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="team.specialExpertise"
            control={control}
            rules={{ required: 'At least one expertise area is required' }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Required Expertise</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Required Expertise" />}
                  renderValue={(selected: string[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {EXPERTISE_AREAS.map((area) => (
                    <MenuItem key={area} value={area}>
                      {area}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{error?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="team.clientInvolvement"
            control={control}
            rules={{ required: 'Client involvement details are required' }}
            render={({ field, fieldState: { error } }) => (
              <FormControl fullWidth error={!!error}>
                <InputLabel>Client Involvement</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Client Involvement" />}
                  renderValue={(selected: string[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {INVOLVEMENT_LEVELS.map((level) => (
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

        <Grid item xs={12}>
          <Controller
            name="team.resourceConstraints"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Resource Constraints"
                fullWidth
                multiline
                rows={2}
                placeholder="List any resource constraints or limitations"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="team.crossTeamDependencies"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Cross-Team Dependencies"
                fullWidth
                multiline
                rows={2}
                placeholder="List any dependencies on other teams or departments"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="team.teamStructure"
            control={control}
            rules={{ required: 'Team structure is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Team Structure"
                fullWidth
                multiline
                rows={4}
                required
                error={!!error}
                helperText={error?.message}
                placeholder="Describe the proposed team structure, roles, and responsibilities"
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="team.communicationPlan"
            control={control}
            rules={{ required: 'Communication plan is required' }}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                label="Communication Plan"
                fullWidth
                multiline
                rows={4}
                required
                error={!!error}
                helperText={error?.message}
                placeholder="Outline the communication plan, including meetings, reporting, and collaboration tools"
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}; 