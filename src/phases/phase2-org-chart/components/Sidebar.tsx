import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Person as PersonIcon,
  Note as NoteIcon,
  ArrowForward as TeamArrowIcon,
  ArrowDownward as HierarchyArrowIcon,
} from '@mui/icons-material';

interface SidebarProps {
  width?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ width = 240 }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          top: 64,
          height: 'calc(100% - 64px)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem>
            <Typography variant="subtitle1" fontWeight="bold">
              Organization Elements
            </Typography>
          </ListItem>
          <Divider />
          
          <ListItem
            button
            draggable
            onDragStart={(event) => onDragStart(event, 'personnel')}
            sx={{ cursor: 'grab' }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Team Member" secondary="Add a person to your organization" />
          </ListItem>
          
          <ListItem
            button
            draggable
            onDragStart={(event) => onDragStart(event, 'annotation')}
            sx={{ cursor: 'grab' }}
          >
            <ListItemIcon>
              <NoteIcon />
            </ListItemIcon>
            <ListItemText primary="Note" secondary="Add a note or comment" />
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          <ListItem>
            <Typography variant="subtitle1" fontWeight="bold">
              Connection Types
            </Typography>
          </ListItem>
          <Divider />
          
          <ListItem
            button
            draggable
            onDragStart={(event) => onDragStart(event, 'team-arrow')}
            sx={{ cursor: 'grab' }}
          >
            <ListItemIcon>
              <TeamArrowIcon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Team Connection" 
              secondary="Connect team members working together" 
            />
          </ListItem>
          
          <ListItem
            button
            draggable
            onDragStart={(event) => onDragStart(event, 'hierarchy-arrow')}
            sx={{ cursor: 'grab' }}
          >
            <ListItemIcon>
              <HierarchyArrowIcon sx={{ color: '#2e7d32' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Reporting Line" 
              secondary="Show reporting relationships" 
            />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}; 