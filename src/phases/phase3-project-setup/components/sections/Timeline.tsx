import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ProjectRequirements } from '../../types/project.types';

interface TimelineProps {
  requirements: ProjectRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<ProjectRequirements>>;
}

export const Timeline: React.FC<TimelineProps> = ({
  requirements,
  setRequirements,
}) => {
  const handleDateChange = (field: 'startDate' | 'completionDate' | keyof typeof requirements.milestones) => (
    date: Date | null
  ) => {
    if (field === 'startDate' || field === 'completionDate') {
      setRequirements((prev) => ({
        ...prev,
        [field]: date,
      }));
    } else {
      setRequirements((prev) => ({
        ...prev,
        milestones: {
          ...prev.milestones,
          [field]: date,
        },
      }));
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Start Date"
            value={requirements.startDate}
            onChange={handleDateChange('startDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Completion Date"
            value={requirements.completionDate}
            onChange={handleDateChange('completionDate')}
            slotProps={{
              textField: {
                fullWidth: true,
                required: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={requirements.priority}
              onChange={(e) =>
                setRequirements((prev) => ({
                  ...prev,
                  priority: e.target.value as 'High' | 'Medium' | 'Low',
                }))
              }
              label="Priority"
            >
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Project Milestones
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Discovery Phase"
            value={requirements.milestones.discovery}
            onChange={handleDateChange('discovery')}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Design Phase"
            value={requirements.milestones.design}
            onChange={handleDateChange('design')}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Development Phase"
            value={requirements.milestones.development}
            onChange={handleDateChange('development')}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Testing Phase"
            value={requirements.milestones.testing}
            onChange={handleDateChange('testing')}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <DatePicker
            label="Deployment Phase"
            value={requirements.milestones.deployment}
            onChange={handleDateChange('deployment')}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}; 