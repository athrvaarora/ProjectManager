import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { WorkflowDocument, WorkflowStep, WorkflowTask } from '../types/workflow.types';

interface TeamMemberWorkload {
  name: string;
  totalTasks: number;
  totalStoryPoints: number;
  completedTasks: number;
  tasksInProgress: number;
  upcomingTasks: number;
  notStartedTasks: number;
  completedStoryPoints: number;
  skills: string[];
  currentUtilization: number;
  tasksByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  tasksByRisk: {
    high: number;
    medium: number;
    low: number;
  };
}

export const WorkloadAnalysis: React.FC<{ workflow: WorkflowDocument }> = ({ workflow }) => {
  const [workloadData, setWorkloadData] = useState<Map<string, TeamMemberWorkload>>(new Map());
  const [sortBy, setSortBy] = useState<'utilization' | 'tasks' | 'storyPoints'>('utilization');

  useEffect(() => {
    const workloadMap = new Map<string, TeamMemberWorkload>();

    // Initialize workload for each team member
    workflow.workflow.teamAssignments.forEach(assignment => {
      workloadMap.set(assignment.userId, {
        name: assignment.userId,
        totalTasks: 0,
        totalStoryPoints: 0,
        completedTasks: 0,
        tasksInProgress: 0,
        upcomingTasks: 0,
        notStartedTasks: 0,
        completedStoryPoints: 0,
        skills: assignment.skills,
        currentUtilization: 0,
        tasksByPriority: {
          high: 0,
          medium: 0,
          low: 0,
        },
        tasksByRisk: {
          high: 0,
          medium: 0,
          low: 0,
        },
      });
    });

    // Analyze steps and tasks
    workflow.workflow.steps.forEach((step: WorkflowStep) => {
      step.assignedTo.forEach(assignee => {
        const workload = workloadMap.get(assignee);
        if (workload) {
          step.tasks.forEach((task: WorkflowTask) => {
            if (task.assignee === assignee) {
              workload.totalTasks++;
              workload.totalStoryPoints += task.storyPoints;

              switch (task.status) {
                case 'completed':
                  workload.completedTasks++;
                  workload.completedStoryPoints += task.storyPoints || 0;
                  break;
                case 'in_progress':
                  workload.tasksInProgress++;
                  break;
                case 'not_started':
                  workload.notStartedTasks++;
                  break;
              }

              // Update priority counts
              switch (task.priority) {
                case 'High':
                  workload.tasksByPriority.high++;
                  break;
                case 'Medium':
                  workload.tasksByPriority.medium++;
                  break;
                case 'Low':
                  workload.tasksByPriority.low++;
                  break;
              }

              // Update risk counts based on step risk level
              switch (step.riskLevel) {
                case 'High':
                  workload.tasksByRisk.high++;
                  break;
                case 'Medium':
                  workload.tasksByRisk.medium++;
                  break;
                case 'Low':
                  workload.tasksByRisk.low++;
                  break;
              }
            }
          });

          // Calculate utilization (tasks in progress / total capacity)
          // Assuming a standard capacity of 5 concurrent tasks
          workload.currentUtilization = (workload.tasksInProgress / 5) * 100;
        }
      });
    });

    setWorkloadData(workloadMap);
  }, [workflow]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Team Workload Analysis</Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'utilization' | 'tasks' | 'storyPoints')}
            label="Sort By"
          >
            <MenuItem value="utilization">Current Utilization</MenuItem>
            <MenuItem value="tasks">Total Tasks</MenuItem>
            <MenuItem value="storyPoints">Story Points</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {Array.from(workloadData.values()).sort((a, b) => {
          switch (sortBy) {
            case 'utilization':
              return b.currentUtilization - a.currentUtilization;
            case 'tasks':
              return b.totalTasks - a.totalTasks;
            case 'storyPoints':
              return b.totalStoryPoints - a.totalStoryPoints;
            default:
              return 0;
          }
        }).map((workload) => (
          <Grid item xs={12} md={6} key={workload.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {workload.name}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Current Utilization
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={workload.currentUtilization}
                    color={
                      workload.currentUtilization > 80
                        ? 'error'
                        : workload.currentUtilization > 60
                        ? 'warning'
                        : 'success'
                    }
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round(workload.currentUtilization)}%
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Tasks</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {workload.totalTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed: {workload.completedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Progress: {workload.tasksInProgress}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upcoming: {workload.upcomingTasks}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2">Story Points</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: {workload.totalStoryPoints}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Remaining:{' '}
                      {workload.totalStoryPoints - workload.completedStoryPoints}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Tasks by Priority
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={`High: ${workload.tasksByPriority.high}`}
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Medium: ${workload.tasksByPriority.medium}`}
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`Low: ${workload.tasksByPriority.low}`}
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Skills
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {workload.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}; 