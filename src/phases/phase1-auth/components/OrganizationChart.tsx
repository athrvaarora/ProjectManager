import React, { useState, useCallback, DragEvent, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ReactFlowProvider,
  EdgeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Note as NoteIcon,
  ArrowForward as ArrowIcon,
  ArrowDownward as HierarchyIcon,
  Menu as MenuIcon,
  Save as SaveIcon,
  PersonAdd as InviteIcon,
} from '@mui/icons-material';
import { PersonnelNode } from './nodes/PersonnelNode';
import { AnnotationNode } from './nodes/AnnotationNode';
import { useAuth } from '../contexts/AuthContext';
import { saveOrganizationChart, loadOrganizationChart, OrganizationChart as OrgChart } from '../utils/organization';
import { InviteMembers } from './InviteMembers';

const nodeTypes = {
  personnel: PersonnelNode,
  annotation: AnnotationNode,
};

interface DragItem {
  type: 'personnel' | 'annotation' | 'team-arrow' | 'hierarchy-arrow';
  label: string;
  icon: React.ReactNode;
}

const dragItems: DragItem[] = [
  { type: 'personnel', label: 'Team Member', icon: <PersonIcon /> },
  { type: 'annotation', label: 'Note', icon: <NoteIcon /> },
  { type: 'team-arrow', label: 'Team Connection', icon: <ArrowIcon /> },
  { type: 'hierarchy-arrow', label: 'Reporting Line', icon: <HierarchyIcon /> },
];

interface SaveDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  defaultName?: string;
}

const SaveDialog: React.FC<SaveDialogProps> = ({ open, onClose, onSave, defaultName = '' }) => {
  const [name, setName] = useState(defaultName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Save Organization Chart</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Chart Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const OrganizationChart: React.FC = () => {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionType, setConnectionType] = useState<'team' | 'hierarchy' | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [chartName, setChartName] = useState<string>('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    const loadChart = async () => {
      if (user?.organizationId) {
        try {
          const chart = await loadOrganizationChart(user.organizationId);
          if (chart) {
            setNodes(chart.nodes);
            setEdges(chart.edges);
            setChartName(chart.name);
            showNotification('Organization chart loaded successfully', 'success');
          }
        } catch (error) {
          showNotification('Error loading organization chart', 'error');
        }
      }
    };

    loadChart();
  }, [user?.organizationId]);

  const showNotification = (message: string, severity: 'success' | 'error') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleSave = async (name: string) => {
    if (!user) return;

    try {
      // Clean nodes to remove any undefined values
      const cleanNodes = nodes.map(node => {
        // Ensure node data exists
        const nodeData = node.data || {};
        
        // Create base cleaned data structure
        const cleanedData = {
          name: nodeData.name || '',
          corporateEmail: nodeData.corporateEmail || '',
          jiraEmail: nodeData.jiraEmail || '',
          role: nodeData.role || '',
          proficiencies: {
            languages: Array.isArray(nodeData.proficiencies?.languages) ? nodeData.proficiencies.languages : [],
            frameworks: Array.isArray(nodeData.proficiencies?.frameworks) ? nodeData.proficiencies.frameworks : [],
            primarySkills: Array.isArray(nodeData.proficiencies?.primarySkills) ? nodeData.proficiencies.primarySkills : []
          }
        };

        // Add text field only for annotation nodes
        if (node.type === 'annotation') {
          return {
            ...node,
            data: {
              text: nodeData.text || ''
            }
          };
        }

        // Return personnel node
        return {
          id: node.id || `node-${Date.now()}`,
          type: node.type || 'personnel',
          position: node.position || { x: 0, y: 0 },
          data: cleanedData
        };
      });

      // Clean edges to remove any undefined values
      const cleanEdges = edges.map(edge => ({
        id: edge.id || `edge-${Date.now()}`,
        source: edge.source || '',
        target: edge.target || '',
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        type: edge.type || 'default',
        animated: Boolean(edge.animated),
        style: edge.style || {
          stroke: edge.type === 'team' ? '#1976d2' : '#2e7d32',
          strokeWidth: 2
        }
      }));

      const chart: OrgChart = {
        nodes: cleanNodes,
        edges: cleanEdges,
        name: name || 'Untitled Chart',
        createdBy: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          version: 1,
          lastModifiedBy: user.uid
        }
      };

      // Debug log
      console.log('Saving chart data:', JSON.stringify(chart, null, 2));

      await saveOrganizationChart(user.organizationId || user.uid, chart, user.uid);
      setChartName(name);
      showNotification('Organization chart saved successfully', 'success');
    } catch (error) {
      console.error('Error saving organization chart:', error);
      // Log the full error details
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
      showNotification(
        error instanceof Error ? error.message : 'Failed to save organization chart',
        'error'
      );
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      if (connectionType) {
        const newEdge: Edge = {
          id: `${params.source}-${params.target}-${connectionType}`,
          type: connectionType,
          animated: connectionType === 'team',
          style: {
            stroke: connectionType === 'team' ? '#1976d2' : '#2e7d32',
            strokeWidth: 2,
          },
          source: params.source || '',
          target: params.target || '',
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
        };
        setEdges((eds) => addEdge(newEdge, eds));
        setIsConnecting(false);
        setConnectionType(null);
      }
    },
    [connectionType, setEdges]
  );

  const onDragStart = (event: DragEvent<HTMLElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = (event.target as HTMLElement)
        .closest('.react-flow')
        ?.getBoundingClientRect();

      if (!reactFlowBounds) return;

      const type = event.dataTransfer.getData('application/reactflow');

      if (type === 'team-arrow' || type === 'hierarchy-arrow') {
        setIsConnecting(true);
        setConnectionType(type === 'team-arrow' ? 'team' : 'hierarchy');
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `${type}-${nodes.length + 1}`,
        type,
        position,
        data: type === 'personnel'
          ? {
              name: '',
              corporateEmail: '',
              jiraEmail: '',
              role: '',
              proficiencies: [],
            }
          : { text: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [nodes.length, setNodes]
  );

  return (
    <Box sx={{ height: '100vh', width: '100%' }}>
      <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1000, display: 'flex', gap: 1 }}>
        <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
          <MenuIcon />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
        >
          Save Chart
        </Button>
        <Button
          variant="contained"
          startIcon={<InviteIcon />}
          onClick={() => setInviteDialogOpen(true)}
        >
          Invite Members
        </Button>
      </Box>

      {chartName && (
        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          {chartName}
        </Typography>
      )}

      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            top: 64,
          },
        }}
      >
        <List>
          {dragItems.map((item) => (
            <ListItem
              key={item.type}
              draggable
              onDragStart={(event) => onDragStart(event, item.type)}
              sx={{ cursor: 'grab' }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        sx={{
          ml: drawerOpen ? '240px' : 0,
          height: '100%',
          transition: 'margin 225ms cubic-bezier(0, 0, 0.2, 1) 0ms',
        }}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>

      {isConnecting && (
        <Box
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            zIndex: 1000,
          }}
        >
          <Typography>
            Click and drag between nodes to create a{' '}
            {connectionType === 'team' ? 'team connection' : 'reporting line'}
          </Typography>
        </Box>
      )}

      <SaveDialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSave}
        defaultName={chartName}
      />

      <InviteMembers
        open={inviteDialogOpen}
        onClose={() => setInviteDialogOpen(false)}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 