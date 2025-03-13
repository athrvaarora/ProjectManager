import React, { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import { IWorkflow, ITask } from '../types/workflow.types';
import { IOrganization, IOrganizationMember } from '../../phase2-org-chart/types/org-chart.types';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TeamViewProps {
  workflow: IWorkflow;
  organization: IOrganization;
}

interface TeamMemberWorkload {
  id: string;
  name: string;
  assignedTasks: number;
  completedTasks: number;
  tasksInProgress: number;
  notStartedTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  criticalTasks: number;
  skills: string[];
  currentUtilization: number;
  tasksByPriority: Record<string, number>;
  tasksByRisk: Record<string, number>;
}

const initializeMemberWorkload = (member: IOrganizationMember): TeamMemberWorkload => {
  return {
    id: member.id,
    name: member.data.name,
    assignedTasks: 0,
    completedTasks: 0,
    tasksInProgress: 0,
    notStartedTasks: 0,
    totalStoryPoints: 0,
    completedStoryPoints: 0,
    criticalTasks: 0,
    skills: member.data.proficiencies.primarySkills || [],
    currentUtilization: 0,
    tasksByPriority: {},
    tasksByRisk: {}
  };
};

export const TeamView: React.FC<TeamViewProps> = ({ workflow, organization }) => {
  const [workloadData, setWorkloadData] = useState<Record<string, TeamMemberWorkload>>({});

  useEffect(() => {
    const workload = new Map<string, TeamMemberWorkload>();
    
    // Initialize workload for each team member
    organization.members.forEach((member) => {
      workload.set(member.id, initializeMemberWorkload(member));
    });

    // Calculate workload from workflow tasks
    workflow.milestones.forEach((milestone) => {
      milestone.tasks.forEach((task) => {
        const assigneeId = task.assignee;
        const memberWorkload = workload.get(assigneeId);
        if (memberWorkload) {
          memberWorkload.assignedTasks++;
          memberWorkload.totalStoryPoints += task.storyPoints || 0;
          
          if (task.status === 'completed') {
            memberWorkload.completedTasks++;
            memberWorkload.completedStoryPoints += task.storyPoints || 0;
          } else if (task.status === 'in_progress') {
            memberWorkload.tasksInProgress++;
          } else {
            memberWorkload.notStartedTasks++;
          }

          if (task.priority) {
            const priorityKey = task.priority.toLowerCase();
            memberWorkload.tasksByPriority[priorityKey] = (memberWorkload.tasksByPriority[priorityKey] || 0) + 1;
          }

          if (task.status === 'in_progress') {
            const memberCapacity = 40; // Default capacity per week in story points
            memberWorkload.currentUtilization = 
              ((task.storyPoints || 0) / memberCapacity) * 100;
          }
        }
      });
    });

    setWorkloadData(Object.fromEntries(workload));
  }, [workflow, organization]);

  const getWorkloadColor = (completedPercentage: number) => {
    if (completedPercentage >= 80) return 'success';
    if (completedPercentage >= 50) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Team Workload
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(workloadData).map(([id, member]) => (
            <Grid item xs={12} md={6} key={id}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>{member.name[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{member.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {member.skills.join(', ')}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Task Completion
                    </Typography>
                    <Typography variant="body2">
                      {member.completedTasks} / {member.assignedTasks}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (member.completedTasks / Math.max(member.assignedTasks, 1)) *
                      100
                    }
                    color={getWorkloadColor(
                      (member.completedTasks / Math.max(member.assignedTasks, 1)) * 100
                    )}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<AssignmentIcon />}
                    label={`${member.assignedTasks} Tasks`}
                    size="small"
                  />
                  <Chip
                    icon={<PriorityHighIcon />}
                    label={`${member.criticalTasks} Critical`}
                    size="small"
                    color="error"
                  />
                  <Chip
                    icon={<CheckCircleIcon />}
                    label={`${member.completedStoryPoints} Points`}
                    size="small"
                    color="success"
                  />
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Current Tasks
                </Typography>
                <List dense>
                  {Object.entries(member.tasksByPriority)
                    .filter(([priority, count]) => count > 0)
                    .map(([priority, count]) => (
                      <React.Fragment key={priority}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor:
                                  priority === 'high'
                                    ? 'error.main'
                                    : priority === 'medium'
                                    ? 'warning.main'
                                    : 'info.main',
                              }}
                            >
                              <AssignmentIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={priority.charAt(0).toUpperCase() + priority.slice(1)}
                            secondary={`${count} tasks`}
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}; 