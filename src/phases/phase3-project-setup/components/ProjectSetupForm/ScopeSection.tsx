import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton,
  Box,
  Button,
  useTheme,
  alpha,
  Divider,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import UpdateIcon from '@mui/icons-material/Update';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

// Define valid color types that exist in the Material-UI palette
type PaletteColorType = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

export const ScopeSection: React.FC = () => {
  const theme = useTheme();
  const { control } = useFormContext<ProjectSetupFormData>();

  const coreFeatures = useFieldArray({
    control,
    name: 'scope.coreFeatures',
  });

  const secondaryFeatures = useFieldArray({
    control,
    name: 'scope.secondaryFeatures',
  });

  const outOfScope = useFieldArray({
    control,
    name: 'scope.outOfScope',
  });

  const handleAddCoreFeature = () => {
    coreFeatures.append({
      description: '',
      priority: 'Medium',
      effort: 'Medium',
      dependencies: [],
      acceptance: [],
    });
  };

  const handleAddSecondaryFeature = () => {
    secondaryFeatures.append({
      description: '',
      priority: 'Low',
      effort: 'Low',
      dependencies: [],
      acceptance: [],
    });
  };

  const handleAddOutOfScope = () => {
    outOfScope.append({
      description: '',
      reason: '',
      impact: '',
    });
  };

  const renderFeatureSection = (
    title: string, 
    description: string,
    fields: any[],
    fieldNamePrefix: 'scope.coreFeatures' | 'scope.secondaryFeatures' | 'scope.outOfScope',
    onAdd: () => void,
    onRemove: (index: number) => void,
    icon: React.ReactNode,
    chipColor: PaletteColorType
  ) => (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Chip 
          label={title} 
          size="small"
          sx={{ 
            fontWeight: 600,
            background: alpha(theme.palette[chipColor].main, 0.1),
            color: theme.palette[chipColor].main,
            borderRadius: 1.5
          }} 
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          {description}
        </Typography>
      </Box>
      
      {fields.map((field, index) => (
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
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={11}>
              <Controller
                name={`${fieldNamePrefix}.${index}.description` as any}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    label={`${title} ${index + 1}`}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {icon}
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
            <Grid item xs={1} display="flex" justifyContent="flex-end">
              <IconButton
                onClick={() => onRemove(index)}
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
        onClick={onAdd}
        sx={{ 
          mt: 1,
          borderRadius: 2,
          borderColor: alpha(theme.palette[chipColor].main, 0.5),
          color: theme.palette[chipColor].main,
          '&:hover': {
            backgroundColor: alpha(theme.palette[chipColor].main, 0.05),
            borderColor: theme.palette[chipColor].main,
          }
        }}
      >
        Add {title}
      </Button>
    </Box>
  );

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
          <ListAltIcon /> Project Scope
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define what's included and excluded in your project (all fields optional)
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {renderFeatureSection(
          "Core Feature", 
          "Essential features that must be included in the MVP",
          coreFeatures.fields,
          "scope.coreFeatures",
          handleAddCoreFeature,
          coreFeatures.remove,
          <CheckCircleOutlineIcon color="success" />,
          "success"
        )}

        <Divider sx={{ my: 3 }} />

        {renderFeatureSection(
          "Secondary Feature", 
          "Nice-to-have features that enhance the product",
          secondaryFeatures.fields,
          "scope.secondaryFeatures",
          handleAddSecondaryFeature,
          secondaryFeatures.remove,
          <UpdateIcon color="info" />,
          "info"
        )}

        <Divider sx={{ my: 3 }} />

        {renderFeatureSection(
          "Out of Scope", 
          "Features explicitly excluded from this project",
          outOfScope.fields,
          "scope.outOfScope",
          handleAddOutOfScope,
          outOfScope.remove,
          <NotInterestedIcon color="error" />,
          "error"
        )}
      </Box>
    </Paper>
  );
}; 