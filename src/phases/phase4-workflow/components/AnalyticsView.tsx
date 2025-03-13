import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { IWorkflow } from '../types/workflow.types';

interface AnalyticsViewProps {
  workflow: IWorkflow;
}

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ workflow }) => {
  const tasksByPriority = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    workflow.milestones.forEach((milestone) => {
      milestone.tasks.forEach((task) => {
        counts[task.priority]++;
      });
    });
    return Object.entries(counts).map(([priority, count]) => ({
      name: priority,
      value: count,
    }));
  }, [workflow]);

  const statusCounts = useMemo(() => {
    const counts = {
      not_started: 0,
      in_progress: 0,
      completed: 0,
    };

    workflow.milestones.forEach((milestone) => {
      milestone.tasks.forEach((task) => {
        counts[task.status]++;
      });
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [workflow]);

  const milestoneProgress = useMemo(() => {
    return workflow.milestones.map((milestone) => ({
      name: milestone.title,
      completed: milestone.tasks.filter((task) => task.status === 'completed').length,
      total: milestone.tasks.length,
    }));
  }, [workflow]);

  const calculateCompletionRate = () => {
    const { completedTasks, totalTasks } = workflow.metadata;
    return ((completedTasks / totalTasks) * 100).toFixed(1);
  };

  const calculateBurndown = () => {
    const { completedStoryPoints, totalStoryPoints } = workflow.metadata;
    return ((completedStoryPoints / totalStoryPoints) * 100).toFixed(1);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Key Metrics
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Completion Rate
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={parseFloat(calculateCompletionRate())}
                        size={80}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" color="text.secondary">
                          {`${calculateCompletionRate()}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Story Points Burndown
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={parseFloat(calculateBurndown())}
                        size={80}
                        color="secondary"
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" color="text.secondary">
                          {`${calculateBurndown()}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Critical Tasks
                    </Typography>
                    <Typography variant="h4" component="div">
                      {workflow.metadata.criticalTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      of {workflow.metadata.totalTasks} total tasks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Delayed Tasks
                    </Typography>
                    <Typography variant="h4" component="div">
                      {workflow.metadata.delayedTasks}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      need attention
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Priority
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByPriority}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              {tasksByPriority.map((entry, index) => (
                <Chip
                  key={entry.name}
                  label={`${entry.name}: ${entry.value}`}
                  size="small"
                  sx={{ bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
              {statusCounts.map((entry, index) => (
                <Chip
                  key={entry.status}
                  label={`${entry.status}: ${entry.count}`}
                  size="small"
                  sx={{ bgcolor: COLORS[index % COLORS.length], color: 'white' }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Milestone Progress */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Milestone Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={milestoneProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#4caf50" name="Completed" />
                  <Bar
                    dataKey="total"
                    stackId="a"
                    fill="#ff9800"
                    name="Remaining"
                    opacity={0.3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 