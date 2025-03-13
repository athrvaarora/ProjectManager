import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  Node,
  Edge,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { 
  Box, 
  Button,
  Typography,
  Paper, 
  AppBar,
  Toolbar, 
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Snackbar,
  Alert,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TuneIcon from '@mui/icons-material/Tune';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import SaveIcon from '@mui/icons-material/Save';
import { PersonnelNode } from './nodes/PersonnelNode';
import { TeamEdge } from './edges/TeamEdge';
import { HierarchyEdge } from './edges/HierarchyEdge';
import { PersonnelForm } from './forms/PersonnelForm';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../../phase1-auth/utils/firebaseConfig';
import { generateInviteCode } from '../utils/codeGenerator';
import { sendInviteEmail } from '../services/emailService';
import { AnnotationNode } from './nodes/AnnotationNode';
import { FirestoreOrganization, TeamMember, OrganizationEdge, PendingInvite } from '../types/firestore.types';
import { IPersonData } from '../types/org-chart.types';
import { OrganizationChart as OrgChart, saveOrganizationChart } from '../../phase1-auth/utils/organization';

const nodeTypes = {
  personnel: PersonnelNode,
  annotation: AnnotationNode,
};

const edgeTypes = {
  team: TeamEdge,
  hierarchy: HierarchyEdge,
};

const DRAWER_WIDTH = 280;

const OrganizationChartContent: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { project } = useReactFlow();
  const [showPersonnelForm, setShowPersonnelForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeType, setEdgeType] = useState<'team' | 'hierarchy'>('team');
  const [isSaved, setIsSaved] = useState(false);
  const [chartId] = useState(uuidv4());
  const [chartName, setChartName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReferenceBox, setShowReferenceBox] = useState(false);
  const [selectedNodeForReference, setSelectedNodeForReference] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{
    step: string;
    progress: number;
  }>({ step: '', progress: 0 });
  const [snackbarMessage, setSnackbarMessage] = useState<{
    text: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ text: '', severity: 'info' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: edgeType,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeType === 'team' ? '#1976d2' : '#4caf50',
        },
        data: {
          relationshipType: edgeType === 'team' ? 'collaborator' : 'direct-report',
        },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [edgeType, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const nodeType = event.dataTransfer.getData('application/reactflow');

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      if (nodeType === 'annotation') {
        const newNode = {
          id: uuidv4(),
          type: 'annotation',
          position,
          data: {
            text: '',
            color: '#fff9c4', // Light yellow background
          },
          draggable: true,
        };
        setNodes((nds) => [...nds, newNode]);
        return;
      }

      const newNode = {
        id: uuidv4(),
        type: 'personnel',
        position,
        data: {
          name: '',
          email: '',
          position: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        },
        draggable: true,
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNode(newNode.id);
      setShowPersonnelForm(true);
    },
    [project, setNodes]
  );

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'personnel') {
      setSelectedNode(node.id);
      setShowPersonnelForm(true);
    }
  };

  const handleNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    if (node.type === 'personnel') {
      setSelectedNodeForReference(node.id);
      setShowReferenceBox(true);
    }
  };

  const handleSaveChart = async () => {
    if (!user) {
      setSnackbarMessage({
        text: 'You must be logged in to save the organization chart',
        severity: 'error'
      });
      setSnackbarOpen(true);
      return;
    }

    try {
      setSaving(true);
      setSaveProgress({ step: 'Preparing data...', progress: 10 });

      // Clean nodes data
      const cleanNodes = nodes.map(node => ({
        id: node.id,
        type: node.type || 'personnel',
        position: node.position || { x: 0, y: 0 },
        data: node.type === 'annotation' 
          ? { text: node.data?.text || '' }
          : {
              name: node.data?.name || '',
              email: node.data?.email || '',
              position: node.data?.position || '',
              timezone: node.data?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              proficiencies: {
                languages: Array.isArray(node.data?.proficiencies?.languages) ? node.data.proficiencies.languages : [],
                frameworks: Array.isArray(node.data?.proficiencies?.frameworks) ? node.data.proficiencies.frameworks : [],
                primarySkills: Array.isArray(node.data?.proficiencies?.primarySkills) ? node.data.proficiencies.primarySkills : []
              },
              teamConnections: Array.isArray(node.data?.teamConnections) ? node.data.teamConnections : [],
              reportsTo: node.data?.reportsTo || null,
              isObserver: Boolean(node.data?.isObserver),
              isAdmin: Boolean(node.data?.isAdmin),
              availability: {
                status: node.data?.availability?.status || 'available',
                dayAvailability: node.data?.availability?.dayAvailability || {},
                notes: node.data?.availability?.notes || ''
              },
              inviteStatus: node.data?.inviteStatus || 'pending'
            }
      }));

      // Clean edges data
      const cleanEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        animated: Boolean(edge.animated),
        sourceHandle: edge.sourceHandle || null,
        targetHandle: edge.targetHandle || null,
        data: {
          relationshipType: edge.data?.relationshipType || 'collaborator'
        },
        style: edge.style || {}
      }));

      const timestamp = serverTimestamp();
      const chartData: Partial<OrgChart> = {
        id: chartId,
        nodes: cleanNodes,
        edges: cleanEdges,
        name: chartName || 'Untitled Organization',
        createdBy: user.uid,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          version: 1,
          lastModifiedBy: user.uid
        }
      };

      setSaveProgress({ step: 'Saving organization chart...', progress: 50 });
      await saveOrganizationChart(user.organizationId || user.uid, chartData, user.uid);
      setChartName(chartName);
      
      setSaveProgress({ step: 'Sending invites to team members...', progress: 70 });
      
      // Send invites to team members
      const personnelNodes = cleanNodes.filter(node => node.type === 'personnel');
      const invitePromises = personnelNodes.map(async (node) => {
        if (node.data.email && node.data.email !== user.email) {
          try {
            const inviteCode = generateInviteCode();
            
            // Save invite in Firestore
            const inviteRef = doc(db, 'invites', inviteCode);
            await setDoc(inviteRef, {
              email: node.data.email,
              organizationId: user.organizationId || user.uid,
              createdBy: user.uid,
              createdAt: timestamp,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              status: 'pending'
            });
            
            // Send email invitation
            await sendInviteEmail(node.data.email, inviteCode, chartName);
            
            return { email: node.data.email, success: true };
          } catch (err) {
            console.error(`Failed to send invite to ${node.data.email}:`, err);
            return { email: node.data.email, success: false, error: err };
          }
        }
        return null;
      }).filter(Boolean);
      
      // Wait for all invites to be sent
      await Promise.all(invitePromises);
      
      setSaveProgress({ step: 'Updating user status...', progress: 90 });
      // Update user's organization status if needed
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        organizationId: user.organizationId || user.uid,
        hasOrganization: true,
        role: 'admin',
        organizationRole: 'creator',
        isCreator: true,
        isFirstLogin: false,
        organizationChartCompleted: true,
        metadata: {
          lastActiveAt: timestamp
        }
      });

      setSaveProgress({ step: 'Complete', progress: 100 });
      setSnackbarMessage({
        text: 'Organization chart saved successfully',
        severity: 'success'
      });
      setSnackbarOpen(true);
      
      // Navigate to project setup after successful save
      setTimeout(() => {
        navigate('/project-setup');
      }, 1500);
    } catch (error) {
      console.error('Error saving organization chart:', error);
      setSnackbarMessage({
        text: error instanceof Error ? error.message : 'Failed to save organization chart',
        severity: 'error'
      });
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNode = (nodeId: string, data: IPersonData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...data,
              inviteStatus: 'pending',
            },
          };
        }
        return node;
      })
    );
    setSelectedNode(null);
    setShowPersonnelForm(false);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Organization Chart Builder
          </Typography>
          <Button
            color="inherit"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveChart}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Left Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100% - 64px)',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Organization Tools
            </Typography>
          </Box>
          <Divider />
          <List>
            <ListItem>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  cursor: 'grab',
                  width: '100%',
                  backgroundColor: '#fff',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'personnel');
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  <Typography>Add Team Member</Typography>
                </Box>
              </Paper>
            </ListItem>
            <ListItem>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  cursor: 'grab',
                  width: '100%',
                  backgroundColor: '#fff9c4',
                  '&:hover': { backgroundColor: '#fff59d' },
                }}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow', 'annotation');
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StickyNote2Icon color="warning" />
                  <Typography>Add Note</Typography>
                </Box>
              </Paper>
            </ListItem>
            <ListItem>
              <Typography variant="subtitle2" gutterBottom>
                Connection Types
              </Typography>
            </ListItem>
            <ListItem>
              <Button
                variant={edgeType === 'team' ? 'contained' : 'outlined'}
                startIcon={<GroupIcon />}
                onClick={() => setEdgeType('team')}
                fullWidth
              >
                Team Connection
              </Button>
            </ListItem>
            <ListItem>
              <Button 
                variant={edgeType === 'hierarchy' ? 'contained' : 'outlined'}
                startIcon={<AccountTreeIcon />}
                onClick={() => setEdgeType('hierarchy')}
                fullWidth
              >
                Reporting Line
              </Button>
            </ListItem>
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Double-click any team member to fine-tune their details
            </Typography>
            </Box>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, position: 'relative' }} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Box>

        {/* Reference Box Drawer */}
        <Drawer
          anchor="right"
          open={showReferenceBox}
          onClose={() => setShowReferenceBox(false)}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Team Member Details
              </Typography>
              <IconButton onClick={() => setShowReferenceBox(false)}>
                <TuneIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {selectedNodeForReference && (
              <PersonnelForm
                nodeId={selectedNodeForReference}
                initialData={nodes.find((n) => n.id === selectedNodeForReference)?.data}
                onSubmit={(nodeId, data) => {
                  handleUpdateNode(nodeId, data);
                  setShowReferenceBox(false);
                }}
                onCancel={() => setShowReferenceBox(false)}
              />
            )}
          </Box>
        </Drawer>
      </Box>

      {/* Organization Name Dialog */}
      <Dialog
        open={showNameDialog}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Organization Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter Organization Name"
            fullWidth
            value={chartName}
            onChange={(e) => setChartName(e.target.value)}
            variant="outlined"
          />
          <Button 
            variant="contained" 
            onClick={() => setShowNameDialog(false)}
            disabled={!chartName.trim()}
            sx={{ mt: 2 }}
          >
            Continue
          </Button>
        </DialogContent>
      </Dialog>

      {/* Personnel Form Dialog */}
      <Dialog
        open={showPersonnelForm}
        onClose={() => {
          setShowPersonnelForm(false);
          setSelectedNode(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNode ? 'Edit Team Member' : 'Add Team Member'}
        </DialogTitle>
        <DialogContent>
          {(selectedNode || showPersonnelForm) && (
            <PersonnelForm
              nodeId={selectedNode || ''}
              initialData={nodes.find((n) => n.id === selectedNode)?.data}
              onSubmit={handleUpdateNode}
              onCancel={() => {
                setShowPersonnelForm(false);
                setSelectedNode(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Save Progress Dialog */}
      <Dialog
        open={saving}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
        onClose={() => {}}
      >
        <DialogTitle>Saving Organization Chart</DialogTitle>
        <DialogContent>
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {saveProgress.step}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={saveProgress.progress} 
              sx={{ mt: 1, mb: 2 }} 
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Status Snackbar */}
      <Snackbar 
        open={!!error || snackbarOpen}
        autoHideDuration={6000} 
        onClose={() => {
          setError(null);
          setSnackbarOpen(false);
        }}
      >
        <Alert 
          onClose={() => {
            setError(null);
            setSnackbarOpen(false);
          }} 
          severity={error ? 'error' : snackbarMessage.severity}
        >
          {error || snackbarMessage.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export const OrganizationChart: React.FC = () => {
  return (
    <ReactFlowProvider>
      <OrganizationChartContent />
    </ReactFlowProvider>
  );
}; 