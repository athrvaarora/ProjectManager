import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SendIcon from '@mui/icons-material/Send';
import { useParams } from 'react-router-dom';
import { getProjectRequirements, updateWorkflow } from '../../services/project.service';
import { getOrganizationChart } from '../../../phase2-org-chart/services/organization.service';
import { generateWorkflowSteps, updateWorkflowSteps } from '../../services/workflow.service';
import { IWorkflowStep, ProjectRequirements } from '../../types/project.types';

export const WorkflowGenerator: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectRequirements | null>(null);
  const [orgChart, setOrgChart] = useState<any>(null);
  const [workflowSteps, setWorkflowSteps] = useState<IWorkflowStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ message: string; sender: 'user' | 'ai' }>>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<IWorkflowStep | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      try {
        const projectData = await getProjectRequirements(projectId);
        
        if (!projectData.organizationId) {
          console.error('No organization ID found in project data');
          setLoading(false);
          return;
        }
        
        const orgChartData = await getOrganizationChart(projectData.organizationId);
        setProject(projectData);
        setOrgChart(orgChartData);
        
        // Generate initial workflow if not exists
        if (!projectData.workflow) {
          // Convert ProjectRequirements to format expected by generateWorkflowSteps
          const workflowData = await generateWorkflowStepsFromRequirements(projectData, orgChartData);
          setWorkflowSteps(workflowData);
          await updateWorkflow(projectId, workflowData);
        } else {
          setWorkflowSteps(projectData.workflow);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  // Helper function to adapt ProjectRequirements to the format expected by generateWorkflowSteps
  const generateWorkflowStepsFromRequirements = async (
    projectData: ProjectRequirements, 
    orgChartData: any
  ): Promise<IWorkflowStep[]> => {
    // Create a simplified project structure that matches what generateWorkflowSteps expects
    const adaptedProject = {
      id: projectData.projectId,
      organizationId: projectData.organizationId || '',
      basicInfo: {
        title: projectData.projectTitle,
        projectId: projectData.projectId,
        clientCompany: projectData.clientCompany,
        clientDivision: projectData.clientDivision,
        summary: projectData.summary,
        description: projectData.description,
        objectives: projectData.objectives,
        targetUsers: [projectData.targetUsers],
        expectedUserVolume: projectData.expectedUserVolume.toString(),
      },
      timeline: {
        startDate: projectData.startDate,
        targetCompletionDate: projectData.completionDate,
        priorityLevel: projectData.priority,
        milestones: Object.entries(projectData.milestones)
          .filter(([_, date]) => date)
          .map(([phase, date]) => ({
            phase,
            targetDate: date,
            description: `${phase} phase completion`,
            isRequired: '1',
          })),
        dependencies: [],
        phaseBreakdown: [],
      },
      scope: {
        coreFeatures: projectData.coreFeatures.map(feature => ({
          description: feature,
          priority: 'high',
          effort: 'medium',
          dependencies: [],
          acceptance: [],
        })),
        secondaryFeatures: projectData.secondaryFeatures.map(feature => ({
          description: feature,
          priority: 'medium',
          effort: 'medium',
          dependencies: [],
          acceptance: [],
        })),
        outOfScope: projectData.outOfScope.map(item => ({
          description: item,
          reason: 'Out of current scope',
          impact: 'None',
        })),
        futurePlans: projectData.futurePlans.map(plan => ({
          description: plan,
          timeline: 'Future',
          prerequisites: [],
        })),
        assumptions: [],
        constraints: [],
      },
      technical: {
        platform: Object.entries(projectData.platform)
          .filter(([key, value]) => value === true || (key === 'other' && value))
          .map(([key, _]) => key === 'other' ? projectData.platform.other : key),
        technologies: projectData.requiredTechnologies,
        integrations: projectData.integrationRequirements,
        designDocuments: projectData.designDocuments.join(', '),
        technicalConstraints: projectData.technicalConstraints.join(', '),
        infrastructureDetails: projectData.infrastructure,
        securityRequirements: projectData.securityRequirements,
        performanceRequirements: {
          loadCapacity: '',
          responseTime: '',
          availability: '',
        },
      },
      quality: {
        testingLevels: projectData.testingLevels,
        complianceRequirements: projectData.complianceRequirements,
        securityRequirements: projectData.securityRequirements,
        performanceRequirements: {
          loadCapacity: '',
          responseTime: '',
          availability: '',
        },
        acceptanceCriteria: [],
        qualityMetrics: [],
      },
      team: {
        specialExpertise: projectData.specialExpertise,
        clientInvolvement: [projectData.clientInvolvement],
        resourceConstraints: projectData.resourceConstraintsText || '',
        crossTeamDependencies: projectData.crossTeamDependenciesText || '',
        teamStructure: '',
        communicationPlan: '',
        roles: [],
        responsibilities: [],
      },
      risks: {
        risks: projectData.knownChallenges.map(challenge => ({
          description: challenge,
          level: 'medium',
          impact: 'medium',
          mitigation: '',
        })),
        criticalDependencies: projectData.criticalDependencies.map(dependency => ({
          dependency,
          managementStrategy: '',
        })),
        contingencyPlans: projectData.contingencyPlans,
        mitigationStrategies: [],
        riskAssessmentMatrix: [],
      },
      metadata: {
        status: 'draft',
        createdBy: projectData.createdBy || '',
        createdAt: projectData.createdAt || new Date(),
        updatedAt: projectData.updatedAt || new Date(),
        version: '1.0',
        lastModifiedBy: projectData.createdBy || '',
      },
    };

    return await generateWorkflowSteps(adaptedProject, orgChartData);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !projectId) return;

    const items = Array.from(workflowSteps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWorkflowSteps(items);
    await updateWorkflow(projectId, items);
  };

  const handleStepExpand = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleEditStep = (step: IWorkflowStep) => {
    setSelectedStep(step);
    setEditDialogOpen(true);
  };

  const handleUpdateStep = async () => {
    if (!selectedStep || !projectId) return;

    const updatedSteps = workflowSteps.map(step =>
      step.id === selectedStep.id ? selectedStep : step
    );

    setWorkflowSteps(updatedSteps);
    await updateWorkflow(projectId, updatedSteps);
    setEditDialogOpen(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !projectId) return;

    const userMessage = { message: chatMessage, sender: 'user' as const };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      const updatedWorkflow = await updateWorkflowSteps(
        projectId,
        workflowSteps,
        chatMessage
      );
      setWorkflowSteps(updatedWorkflow);
      
      const aiResponse = { 
        message: 'Workflow has been updated based on your request.', 
        sender: 'ai' as const 
      };
      setChatHistory(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error updating workflow:', error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Workflow Steps */}
          <Box sx={{ flex: 2 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                Project Workflow
              </Typography>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="workflow">
                  {(provided: DroppableProvided) => (
                    <List {...provided.droppableProps} ref={provided.innerRef}>
                      {workflowSteps.map((step, index) => (
                        <Draggable key={step.id} draggableId={step.id} index={index}>
                          {(provided: DraggableProvided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ mb: 2 }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="h6">{step.title}</Typography>
                                  <Box>
                                    <IconButton onClick={() => handleEditStep(step)} size="small">
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleStepExpand(step.id)} size="small">
                                      {expandedSteps[step.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                  <Chip 
                                    label={`Start: ${new Date(step.startDate).toLocaleDateString()}`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                  <Chip 
                                    label={`End: ${new Date(step.endDate).toLocaleDateString()}`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                  <Chip 
                                    label={`Priority: ${step.priority}`}
                                    color={step.priority === 'high' ? 'error' : 'default'}
                                    variant="outlined"
                                    size="small"
                                  />
                                </Box>

                                <Collapse in={expandedSteps[step.id]}>
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Description
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                      {step.description}
                                    </Typography>

                                    <Typography variant="subtitle2" color="text.secondary">
                                      Team Members
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                      {step.assignedTo.map(member => (
                                        <Chip
                                          key={member.id}
                                          label={member.name}
                                          size="small"
                                        />
                                      ))}
                                    </Box>

                                    <Typography variant="subtitle2" color="text.secondary">
                                      Tasks
                                    </Typography>
                                    <List dense>
                                      {step.tasks.map(task => (
                                        <ListItem key={task.id}>
                                          <ListItemText
                                            primary={task.title}
                                            secondary={task.description}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                </Collapse>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </DragDropContext>
            </Paper>
          </Box>

          {/* Chat Interface */}
          <Box sx={{ flex: 1 }}>
            <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Workflow Assistant
              </Typography>
              
              <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                {chatHistory.map((chat, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '80%',
                        bgcolor: chat.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: chat.sender === 'user' ? 'white' : 'text.primary'
                      }}
                    >
                      <Typography variant="body2">
                        {chat.message}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <form onSubmit={handleChatSubmit}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                  >
                    Send
                  </Button>
                </Box>
              </form>
            </Paper>
          </Box>
        </Box>

        {/* Edit Step Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Step</DialogTitle>
          <DialogContent>
            {selectedStep && (
              <Box sx={{ pt: 2 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={selectedStep.title}
                  onChange={(e) => setSelectedStep({ ...selectedStep, title: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={selectedStep.description}
                  onChange={(e) => setSelectedStep({ ...selectedStep, description: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <DatePicker
                    label="Start Date"
                    value={new Date(selectedStep.startDate)}
                    onChange={(date) => setSelectedStep({ ...selectedStep, startDate: date?.toISOString() || '' })}
                  />
                  <DatePicker
                    label="End Date"
                    value={new Date(selectedStep.endDate)}
                    onChange={(date) => setSelectedStep({ ...selectedStep, endDate: date?.toISOString() || '' })}
                  />
                </Box>
                {/* Add more fields as needed */}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStep} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}; 