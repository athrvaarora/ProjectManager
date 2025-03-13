import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { ITask } from '../types/workflow.types';

interface TaskEditFormProps {
  task: ITask;
  onTaskChange: (updatedTask: ITask) => void;
}

export const TaskEditForm: React.FC<TaskEditFormProps> = ({ task, onTaskChange }) => {
  const handleChange = (field: keyof ITask, value: any) => {
    onTaskChange({
      ...task,
      [field]: value,
    });
  };

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={task.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={task.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={task.priority}
                    label="Priority"
                    onChange={(e) => handleChange('priority', e.target.value)}
                  >
                    <MenuItem value="Critical">Critical</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={task.status}
                    label="Status"
                    onChange={(e) => handleChange('status', e.target.value)}
                  >
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="Story Points"
              type="number"
              fullWidth
              value={task.storyPoints}
              onChange={(e) => handleChange('storyPoints', parseInt(e.target.value) || 0)}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          {task.aiSuggestions && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                AI Suggestions
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Time
                  </Typography>
                  <Typography variant="body2">{task.aiSuggestions.timeEstimate}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Risk Level
                  </Typography>
                  <Chip
                    size="small"
                    label={task.aiSuggestions.riskLevel}
                    color={
                      task.aiSuggestions.riskLevel === 'High'
                        ? 'error'
                        : task.aiSuggestions.riskLevel === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Technical Complexity
                  </Typography>
                  <Chip
                    size="small"
                    label={task.aiSuggestions.technicalComplexity}
                    color={
                      task.aiSuggestions.technicalComplexity === 'High'
                        ? 'error'
                        : task.aiSuggestions.technicalComplexity === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Suggested Assignees
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {task.aiSuggestions.suggestedAssignees.map((assignee) => (
                      <Chip key={assignee} label={assignee} size="small" />
                    ))}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Recommended Approach
                  </Typography>
                  <Typography variant="body2">{task.aiSuggestions.recommendedApproach}</Typography>
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}; 