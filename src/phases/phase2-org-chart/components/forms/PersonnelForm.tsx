import React, { useState, KeyboardEvent, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Autocomplete,
  Chip,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  FormGroup,
  IconButton,
  Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { IPersonData, IProficiencyItem } from '../../types/org-chart.types';
import { format, addDays, startOfWeek, setHours, setMinutes } from 'date-fns';

type PersonnelData = IPersonData;

interface PersonnelFormProps {
  nodeId: string;
  initialData?: Partial<PersonnelData>;
  onSubmit: (nodeId: string, data: PersonnelData) => void;
  onCancel: () => void;
}

interface TimeSlot {
  start: Date;
  end: Date;
}

interface DayAvailability {
  [key: string]: TimeSlot[];
}

interface WeeklyTimeSlot {
  dayOfWeek: number; // 1-5 for Monday-Friday
  start: Date;
  end: Date;
}

interface WeeklyAvailability {
  [key: number]: TimeSlot[]; // key is day of week (1-5)
}

const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const commonSkills = {
  languages: [
    'JavaScript',
    'TypeScript',
    'Python',
    'Java',
    'C#',
    'C++',
    'Ruby',
    'Go',
    'PHP',
    'Swift',
    'Kotlin',
  ],
  frameworks: [
    'React',
    'Angular',
    'Vue.js',
    'Node.js',
    'Django',
    'Spring Boot',
    'ASP.NET',
    'Laravel',
    'Flutter',
    'React Native',
  ],
  primarySkills: [
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Mobile Development',
    'DevOps',
    'UI/UX Design',
    'Project Management',
    'Quality Assurance',
    'Data Science',
    'Machine Learning',
    'Cloud Architecture',
    'Security',
  ],
};

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland'
];

const weekDays = [
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
  { day: 7, label: 'Sun' },
];

const defaultFormData: IPersonData = {
  name: '',
  email: '',
  position: '',
  timezone: 'UTC',
  proficiencies: {
    languages: [],
    frameworks: [],
    primarySkills: []
  },
  teamConnections: [],
  reportsTo: undefined,
  isObserver: false,
  isAdmin: false,
  availability: {
    status: 'available',
    dayAvailability: {},
    notes: ''
  },
  inviteStatus: 'pending',
  metadata: {
    lastActive: undefined,
    joinedAt: undefined
  }
};

const defaultWorkingHours = {
  start: setMinutes(setHours(new Date(), 8), 0), // 8:00 AM
  end: setMinutes(setHours(new Date(), 17), 0), // 5:00 PM
};

export const PersonnelForm: React.FC<PersonnelFormProps> = ({
  nodeId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<IPersonData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    position: initialData?.position || '',
    timezone: initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    proficiencies: {
      languages: initialData?.proficiencies?.languages || [],
      frameworks: initialData?.proficiencies?.frameworks || [],
      primarySkills: initialData?.proficiencies?.primarySkills || []
    },
    teamConnections: initialData?.teamConnections || [],
    reportsTo: initialData?.reportsTo,
    isObserver: initialData?.isObserver || false,
    isAdmin: initialData?.isAdmin || false,
    availability: {
      status: initialData?.availability?.status || 'available',
      dayAvailability: initialData?.availability?.dayAvailability || {},
      notes: initialData?.availability?.notes || ''
    },
    inviteStatus: initialData?.inviteStatus || 'pending',
    metadata: {
      lastActive: initialData?.metadata?.lastActive,
      joinedAt: initialData?.metadata?.joinedAt
    }
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newFramework, setNewFramework] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>({});
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    start: defaultWorkingHours.start,
    end: defaultWorkingHours.end
  });
  const [selectedDay, setSelectedDay] = useState<number>(1); // Monday by default

  // Initialize default weekly availability
  useEffect(() => {
    if (!initialData?.availability) {
      const defaultAvailability: WeeklyAvailability = {};
      // Add default working hours for Monday to Friday
      for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
        defaultAvailability[dayOfWeek] = [{
          start: defaultWorkingHours.start,
          end: defaultWorkingHours.end,
        }];
      }
      setWeeklyAvailability(defaultAvailability);
    } else if (initialData.availability.dayAvailability) {
      // Convert existing availability to weekly format
      const weeklyFormat: WeeklyAvailability = {};
      Object.entries(initialData.availability.dayAvailability).forEach(([dateStr, slots]) => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay() || 7; // Convert Sunday (0) to 7
        if (dayOfWeek <= 5) { // Only include weekdays
          if (Array.isArray(slots)) {
            weeklyFormat[dayOfWeek] = slots.map(slot => ({
              start: slot instanceof Date ? slot : new Date(slot.start),
              end: slot instanceof Date ? slot : new Date(slot.end)
            }));
          }
        }
      });
      setWeeklyAvailability(weeklyFormat);
    }
  }, [initialData]);

  const handleChange = (field: keyof PersonnelData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(nodeId, formData);
  };

  const handleSkillChange = (
    category: 'languages' | 'frameworks' | 'primarySkills',
    newValue: string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      proficiencies: {
        ...prev.proficiencies,
        [category]: newValue,
      },
    }));
  };

  const handleKeyPress = (
    e: KeyboardEvent<HTMLDivElement>,
    type: 'languages' | 'frameworks'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = type === 'languages' ? newLanguage : newFramework;
      if (value.trim()) {
        setFormData((prev) => ({
          ...prev,
          proficiencies: {
            ...prev.proficiencies,
            [type]: [...prev.proficiencies[type], value.trim()]
          }
        }));
        if (type === 'languages') {
          setNewLanguage('');
        } else {
          setNewFramework('');
        }
      }
    }
  };

  const handleDeleteSkill = (type: 'languages' | 'frameworks', index: number) => {
    setFormData((prev) => ({
      ...prev,
      proficiencies: {
        ...prev.proficiencies,
        [type]: prev.proficiencies[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddTimeSlot = () => {
    if (newTimeSlot.start && newTimeSlot.end) {
      const start = new Date(newTimeSlot.start);
      const end = new Date(newTimeSlot.end);

      setWeeklyAvailability((prev) => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), { start, end }]
      }));
      
      setNewTimeSlot({ 
        start: defaultWorkingHours.start,
        end: defaultWorkingHours.end
      });
    }
  };

  const handleDeleteTimeSlot = (dayOfWeek: number, index: number) => {
    setWeeklyAvailability((prev) => ({
      ...prev,
      [dayOfWeek]: prev[dayOfWeek].filter((_, i) => i !== index)
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Name"
            value={formData.name}
            onChange={handleChange('name')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Position"
            value={formData.position}
            onChange={handleChange('position')}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Timezone</InputLabel>
            <Select
              value={formData.timezone || 'UTC'}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value as string })}
              label="Timezone"
            >
              {timezones.map((timezone: string) => (
                <MenuItem key={timezone} value={timezone}>
                  {timezone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                />
              }
              label="Team Lead"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isObserver}
                  onChange={(e) => setFormData({ ...formData, isObserver: e.target.checked })}
                />
              }
              label="Observer"
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Skills & Proficiencies
          </Typography>
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.proficiencies.primarySkills}
            onChange={(_, newValue) => handleSkillChange('primarySkills', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Primary Skills"
                placeholder="Add skills"
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Weekly Schedule (in {formData.timezone})
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
            {weekDays.map(({ day, label }) => (
              <Button
                key={day}
                onClick={() => setSelectedDay(day)}
                variant={selectedDay === day ? 'contained' : 'outlined'}
                sx={{
                  minWidth: '40px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  p: 0,
                  backgroundColor: selectedDay === day ? 'primary.main' : 'transparent',
                  borderColor: weeklyAvailability[day]?.length ? 'primary.main' : 'divider',
                  color: selectedDay === day ? 'white' : weeklyAvailability[day]?.length ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: selectedDay === day ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {weekDays.find(d => d.day === selectedDay)?.label} Schedule
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={5}>
                  <TimePicker
                    label="Start Time"
                    value={newTimeSlot.start}
                    onChange={(date) => setNewTimeSlot(prev => ({ ...prev, start: date || defaultWorkingHours.start }))}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TimePicker
                    label="End Time"
                    value={newTimeSlot.end}
                    onChange={(date) => setNewTimeSlot(prev => ({ ...prev, end: date || defaultWorkingHours.end }))}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button variant="contained" onClick={handleAddTimeSlot}>
                    Add
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>

            {/* Display time slots for selected day */}
            {weeklyAvailability[selectedDay]?.map((slot, index) => (
              <Box key={index} sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>
                  {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteTimeSlot(selectedDay, index)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}; 