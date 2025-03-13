import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  IconButton,
  Box,
  Button,
  Divider,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import ContactsIcon from '@mui/icons-material/Contacts';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { IProjectSetup } from '../../types/project.types';

type ProjectSetupFormData = Omit<IProjectSetup, 'id' | 'organizationId' | 'metadata'>;

type ContactFieldPrefix = 'contacts.primary' | 'contacts.secondary' | `contacts.decisionMakers.${number}`;

interface ContactFieldsProps {
  prefix: ContactFieldPrefix;
  required?: boolean;
  showDelete?: boolean;
  onDelete?: () => void;
  title?: string;
}

const ContactFields: React.FC<ContactFieldsProps> = ({
  prefix,
  required = false,
  showDelete = false,
  onDelete,
  title,
}) => {
  const theme = useTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectSetupFormData>();

  const getNestedError = (path: string) => {
    const parts = path.split('.');
    let error: any = errors;
    for (const part of parts) {
      if (!error?.[part]) return undefined;
      error = error[part];
    }
    return error;
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        borderRadius: 2,
        borderColor: alpha(theme.palette.primary.main, 0.2),
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
          borderColor: alpha(theme.palette.primary.main, 0.4),
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} display="flex" alignItems="center" gap={2}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            >
              <PersonIcon fontSize="small" />
              {title || 'Contact Information'}
            </Typography>
            {showDelete && (
              <IconButton 
                onClick={onDelete} 
                color="error" 
                size="small"
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name={`${prefix}.name`}
              control={control}
              rules={{ required: required ? 'Name is required' : false }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={required ? "Name" : "Name (Optional)"}
                  fullWidth
                  required={required}
                  error={!!getNestedError(`${prefix}.name`)}
                  helperText={getNestedError(`${prefix}.name`)?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
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
              name={`${prefix}.position`}
              control={control}
              rules={{ required: false }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Position (Optional)"
                  fullWidth
                  required={false}
                  error={!!getNestedError(`${prefix}.position`)}
                  helperText={getNestedError(`${prefix}.position`)?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon color="primary" />
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
              name={`${prefix}.email`}
              control={control}
              rules={{
                required: required ? 'Email is required' : false,
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={required ? "Email" : "Email (Optional)"}
                  type="email"
                  fullWidth
                  required={required}
                  error={!!getNestedError(`${prefix}.email`)}
                  helperText={getNestedError(`${prefix}.email`)?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
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
              name={`${prefix}.phone`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone (Optional)"
                  fullWidth
                  error={!!getNestedError(`${prefix}.phone`)}
                  helperText={getNestedError(`${prefix}.phone`)?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" />
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
            <Controller
              name={`${prefix}.isDecisionMaker`}
              control={control}
              render={({ field: { value, ...field } }) => (
                <FormControlLabel
                  control={
                    <Switch 
                      checked={value} 
                      {...field} 
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.primary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.5),
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">Has decision-making authority</Typography>
                      <Tooltip title="This person can make final decisions about the project">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Box>
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const ContactsSection: React.FC = () => {
  const theme = useTheme();
  const { control } = useFormContext<ProjectSetupFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts.decisionMakers',
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
          <ContactsIcon /> Contact Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Provide contact details for key project stakeholders (only primary contact name and email required)
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label="Primary Contact" 
              color="primary" 
              size="small"
              sx={{ 
                fontWeight: 600,
                background: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                borderRadius: 1.5
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Main point of contact for this project (required)
            </Typography>
          </Box>
          <ContactFields prefix="contacts.primary" required title="Primary Contact" />
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label="Additional Contacts" 
              size="small"
              sx={{ 
                fontWeight: 600,
                background: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                borderRadius: 1.5
              }} 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              Other stakeholders (optional)
            </Typography>
          </Box>
          
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ mb: 3 }}>
              <ContactFields
                prefix={`contacts.decisionMakers.${index}`}
                showDelete
                onDelete={() => remove(index)}
                title={`Additional Contact ${index + 1}`}
              />
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => append({
              name: '',
              position: '',
              email: '',
              phone: '',
              isDecisionMaker: false,
            })}
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
            Add Contact
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 