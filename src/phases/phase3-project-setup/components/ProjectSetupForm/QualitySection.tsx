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
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

const TESTING_LEVELS = [
  'unit',
  'integration',
  'e2e',
  'performance',
  'security',
] as const;

const COMPLIANCE_STANDARDS = [
  'GDPR',
  'HIPAA',
  'SOC 2',
  'ISO 27001',
  'PCI DSS',
  'WCAG 2.1',
  'Section 508',
  'CCPA',
  'Other',
];

const SECURITY_REQUIREMENTS = [
  'Authentication',
  'Authorization',
  'Data Encryption',
  'Secure Communication',
  'Input Validation',
  'Session Management',
  'Audit Logging',
  'Vulnerability Scanning',
  'Penetration Testing',
  'Other',
];

export const QualitySection: React.FC = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  const { fields: testingLevelsFields, append: appendTestingLevel, remove: removeTestingLevel } = useFieldArray({
    control,
    name: 'quality.testingLevels' as any,
  });

  const { fields: complianceRequirementsFields, append: appendComplianceRequirement, remove: removeComplianceRequirement } = useFieldArray({
    control,
    name: 'quality.complianceRequirements' as any,
  });

  const { fields: securityRequirementsFields, append: appendSecurityRequirement, remove: removeSecurityRequirement } = useFieldArray({
    control,
    name: 'quality.securityRequirements' as any,
  });

  const { fields: acceptanceCriteriaFields, append: appendAcceptanceCriteria, remove: removeAcceptanceCriteria } = useFieldArray({
    control,
    name: 'quality.acceptanceCriteria' as any,
  });

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quality Requirements
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="quality.testingLevels"
            control={control}
            rules={{ required: 'At least one testing level is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.quality?.testingLevels}>
                <InputLabel>Testing Levels</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Testing Levels" />}
                  renderValue={(selected: string[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {TESTING_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.quality?.testingLevels?.message}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="quality.complianceRequirements"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Compliance Standards</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Compliance Standards" />}
                  renderValue={(selected: string[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {COMPLIANCE_STANDARDS.map((standard) => (
                    <MenuItem key={standard} value={standard}>
                      {standard}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="quality.securityRequirements"
            control={control}
            rules={{ required: 'At least one security requirement is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.quality?.securityRequirements}>
                <InputLabel>Security Requirements</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Security Requirements" />}
                  renderValue={(selected: string[]) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {SECURITY_REQUIREMENTS.map((req) => (
                    <MenuItem key={req} value={req}>
                      {req}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.quality?.securityRequirements?.message}
                </FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="quality.performanceRequirements.loadCapacity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Load Capacity"
                placeholder="Expected concurrent users or requests"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="quality.performanceRequirements.responseTime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Response Time"
                placeholder="Expected response time requirements"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="quality.performanceRequirements.availability"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Availability"
                placeholder="Expected system uptime requirements"
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}; 