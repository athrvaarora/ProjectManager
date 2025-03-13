import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  Tooltip,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IPersonData } from '../../types/org-chart.types';

export const PersonnelNode: React.FC<NodeProps<IPersonData>> = ({ data, selected }) => {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper
        elevation={selected ? 3 : 1}
        sx={{
          p: 2,
          minWidth: 200,
          backgroundColor: 'background.paper',
          border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ bgcolor: data.isAdmin ? 'primary.main' : 'secondary.main' }}>
            {data.name ? data.name[0].toUpperCase() : <PersonIcon />}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {data.name || 'Unnamed Member'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.position || 'No Role Specified'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {data.isAdmin && (
              <Tooltip title="Team Lead">
                <AdminPanelSettingsIcon color="primary" />
              </Tooltip>
            )}
            {data.isObserver && (
              <Tooltip title="Observer">
                <VisibilityIcon color="action" />
              </Tooltip>
            )}
          </Box>
        </Box>

        {data.proficiencies?.primarySkills?.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {data.proficiencies.primarySkills.slice(0, 2).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {data.proficiencies.primarySkills.length > 2 && (
              <Chip
                label={`+${data.proficiencies.primarySkills.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            )}
          </Box>
        )}
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}; 