import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  FormHelperText,
  OutlinedInput,
  useTheme,
  alpha,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { IProjectSetup } from '../../types/project.types';
import CodeIcon from '@mui/icons-material/Code';
import DevicesIcon from '@mui/icons-material/Devices';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import StorageIcon from '@mui/icons-material/Storage';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

const PLATFORMS = [
  { value: 'web', label: 'Web Application' },
  { value: 'mobile-ios', label: 'iOS Mobile App' },
  { value: 'mobile-android', label: 'Android Mobile App' },
  { value: 'desktop', label: 'Desktop Application' }
];

const TECHNOLOGIES = [
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Python',
  'Java',
  'C#',
  '.NET',
  'PHP',
  'Ruby',
  'Go',
  'Kotlin',
  'Swift',
  'Flutter',
  'React Native',
] as const;

const INTEGRATIONS = [
  'REST APIs',
  'GraphQL',
  'Database',
  'Authentication',
  'Payment Gateway',
  'Email Service',
  'Analytics',
  'CMS',
  'Other',
];

export const TechnicalRequirementsSection: React.FC = () => {
  const theme = useTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  // State for technologies input
  const [techInput, setTechInput] = useState('');
  
  // Function to handle adding technologies
  const handleAddTech = (currentTechs: string[], onChange: (value: string[]) => void) => {
    if (!techInput.trim()) return;
    
    const newTechs = techInput.split(',')
      .map(tech => tech.trim())
      .filter(tech => tech && !currentTechs.includes(tech));
    
    if (newTechs.length > 0) {
      onChange([...currentTechs, ...newTechs]);
      setTechInput('');
    }
  };

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
          <CodeIcon /> Technical Requirements
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Specify the technical aspects of your project
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                  Platform
                </Typography>
                <Tooltip title="Select the platforms your application will run on">
                  <IconButton size="small">
                    <HelpOutlineIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Controller
                name="technical.platform"
                control={control}
                rules={{ required: false }}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <Select
                      {...field}
                      multiple
                      displayEmpty
                      placeholder="Select platforms"
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return <Typography color="text.secondary">Select platforms</Typography>;
                        }
                        return (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip 
                                key={value} 
                                label={PLATFORMS.find(p => p.value === value)?.label || value} 
                                size="small"
                                sx={{
                                  borderRadius: '16px',
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 500
                                }}
                              />
                            ))}
                          </Box>
                        );
                      }}
                      sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 0.5,
                          alignItems: 'center',
                          p: 1.5,
                          minHeight: '56px',
                        }
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            mt: 1,
                            borderRadius: 2,
                          }
                        }
                      }}
                    >
                      {PLATFORMS.map((platform) => (
                        <MenuItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select the platforms your application will run on</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="technical.technologies"
              control={control}
              rules={{ required: false }}
              render={({ field: { value = [], onChange } }) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Technologies (Optional)
                    </Typography>
                    <Tooltip title="Enter technologies separated by commas (e.g., 'React, Node.js, MongoDB')">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Enter technologies and press Enter or comma"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTech(value, onChange);
                      }
                    }}
                    onBlur={() => handleAddTech(value, onChange)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        minHeight: '56px',
                      }
                    }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.isArray(value) && value.map((tech, index) => (
                      <Chip
                        key={index}
                        label={tech}
                        onDelete={() => {
                          const newTechs = [...value];
                          newTechs.splice(index, 1);
                          onChange(newTechs);
                        }}
                        sx={{
                          borderRadius: '16px',
                          background: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.dark,
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.2),
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }}>
              <Chip 
                label="Additional Technical Details" 
                sx={{ 
                  background: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }} 
              />
            </Divider>
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="technical.integrations"
              control={control}
              render={({ field: { value = [], onChange } }) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Integrations (Optional)
                    </Typography>
                    <Tooltip title="Enter integrations separated by commas (e.g., 'REST APIs, Payment Gateway')">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="Enter integrations separated by commas"
                    value={Array.isArray(value) ? value.join(', ') : ''}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const integrations = inputValue
                        ? inputValue.split(',').map(s => s.trim()).filter(Boolean)
                        : [];
                      onChange(integrations);
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        minHeight: '56px',
                      }
                    }}
                  />
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.isArray(value) && value.length > 0 && value.map((integration, index) => (
                      <Chip
                        key={index}
                        label={integration}
                        onDelete={() => {
                          const newIntegrations = [...value];
                          newIntegrations.splice(index, 1);
                          onChange(newIntegrations);
                        }}
                        sx={{
                          borderRadius: '16px',
                          background: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.dark,
                          '&:hover': {
                            background: alpha(theme.palette.info.main, 0.2),
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="technical.infrastructureDetails"
              control={control}
              render={({ field }) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Infrastructure (Optional)
                    </Typography>
                    <Tooltip title="Describe hosting, servers, databases, etc.">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Describe infrastructure requirements"
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
              name="technical.technicalConstraints"
              control={control}
              render={({ field }) => (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      Technical Constraints (Optional)
                    </Typography>
                    <Tooltip title="List any technical limitations or constraints">
                      <IconButton size="small">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="List any technical limitations or constraints"
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