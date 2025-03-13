import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../phase1-auth/contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../phase1-auth/utils/firebaseConfig';

const steps = [
  'Project Identification',
  'Client Contact',
  'Project Overview',
  'Technical Specifications',
  'Timeline',
  'Scope Details',
  'Quality & Compliance',
  'Deployment',
  'Team & Risk Assessment',
  'Additional Notes'
];

interface IProjectRequirements {
  // Project Identification
  projectTitle: string;
  projectId: string;
  clientCompany: string;
  clientDivision: string;

  // Client Contact
  primaryContactName: string;
  primaryContactPosition: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  secondaryContactDetails: string;
  decisionMakers: string;

  // Project Overview
  projectSummary: string;
  detailedDescription: string;
  projectObjectives: string;
  targetEndUsers: string;
  expectedUserVolume: string;

  // Technical Specifications
  platformRequirements: string[];
  requiredTechnologies: string[];
  integrationRequirements: string;
  designDocuments: string;
  technicalConstraints: string;
  infrastructureDetails: string;

  // Timeline
  startDate: Date | null;
  completionDate: Date | null;
  priorityLevel: 'High' | 'Medium' | 'Low';
  milestones: {
    discovery: Date | null;
    design: Date | null;
    development: Date | null;
    testing: Date | null;
    deployment: Date | null;
  };

  // Scope Details
  coreFeatures: string[];
  secondaryFeatures: string[];
  outOfScope: string[];
  futurePhasePlans: string;

  // Quality & Compliance
  testingLevels: string[];
  complianceRequirements: string;
  securityRequirements: string;
  performanceExpectations: string;

  // Deployment
  deploymentEnvironment: string;
  deploymentMethod: string;
  maintenanceExpectations: string;
  trainingRequirements: string;

  // Team & Risk
  specialExpertise: string;
  clientInvolvement: string;
  resourceConstraints: string;
  crossTeamDependencies: string;
  knownChallenges: string;
  criticalDependencies: string;
  contingencyOptions: string;

  // Additional Notes
  specialInstructions: string;
  historicalContext: string;
  attachments: string;
  initialNotes: string;
}

const initialRequirements: IProjectRequirements = {
  projectTitle: '',
  projectId: '',
  clientCompany: '',
  clientDivision: '',
  primaryContactName: '',
  primaryContactPosition: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  secondaryContactDetails: '',
  decisionMakers: '',
  projectSummary: '',
  detailedDescription: '',
  projectObjectives: '',
  targetEndUsers: '',
  expectedUserVolume: '',
  platformRequirements: [],
  requiredTechnologies: [],
  integrationRequirements: '',
  designDocuments: '',
  technicalConstraints: '',
  infrastructureDetails: '',
  startDate: null,
  completionDate: null,
  priorityLevel: 'Medium',
  milestones: {
    discovery: null,
    design: null,
    development: null,
    testing: null,
    deployment: null,
  },
  coreFeatures: [],
  secondaryFeatures: [],
  outOfScope: [],
  futurePhasePlans: '',
  testingLevels: [],
  complianceRequirements: '',
  securityRequirements: '',
  performanceExpectations: '',
  deploymentEnvironment: '',
  deploymentMethod: '',
  maintenanceExpectations: '',
  trainingRequirements: '',
  specialExpertise: '',
  clientInvolvement: '',
  resourceConstraints: '',
  crossTeamDependencies: '',
  knownChallenges: '',
  criticalDependencies: '',
  contingencyOptions: '',
  specialInstructions: '',
  historicalContext: '',
  attachments: '',
  initialNotes: '',
};

export const ProjectRequirements: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [requirements, setRequirements] = useState<IProjectRequirements>(initialRequirements);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const projectRef = doc(db, 'projects', `${user.organizationId}-${requirements.projectId}`);
      
      // Convert dates to strings before saving to Firestore
      const formattedRequirements = {
        ...requirements,
        startDate: requirements.startDate ? requirements.startDate.toISOString() : null,
        completionDate: requirements.completionDate ? requirements.completionDate.toISOString() : null,
        milestones: {
          discovery: requirements.milestones.discovery ? requirements.milestones.discovery.toISOString() : null,
          design: requirements.milestones.design ? requirements.milestones.design.toISOString() : null,
          development: requirements.milestones.development ? requirements.milestones.development.toISOString() : null,
          testing: requirements.milestones.testing ? requirements.milestones.testing.toISOString() : null,
          deployment: requirements.milestones.deployment ? requirements.milestones.deployment.toISOString() : null,
        }
      };

      await setDoc(projectRef, {
        ...formattedRequirements,
        organizationId: user.organizationId,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'pending_workflow_generation'
      });

      // Navigate to workflow generation
      navigate('/workflow-generation');
    } catch (err) {
      console.error('Error saving project requirements:', err);
      setError('Failed to save project requirements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof IProjectRequirements, value: any) => {
    setRequirements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof IProjectRequirements, value: string) => {
    if (!value.trim()) return;

    setRequirements(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), value.trim()]
    }));
  };

  const handleRemoveArrayItem = (field: keyof IProjectRequirements, index: number) => {
    setRequirements(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const renderDateInput = (
    label: string,
    value: Date | null,
    onChange: (date: Date | null) => void,
    required?: boolean
  ) => (
    <TextField
      label={label}
      type="date"
      fullWidth
      required={required}
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onChange(date);
      }}
      InputLabelProps={{
        shrink: true,
      }}
    />
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Project Title"
                value={requirements.projectTitle}
                onChange={(e) => handleInputChange('projectTitle', e.target.value)}
                helperText="The official name that will identify the project"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Project ID/Reference Number"
                value={requirements.projectId}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                helperText="For internal tracking"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Client Company Name"
                value={requirements.clientCompany}
                onChange={(e) => handleInputChange('clientCompany', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Client Division/Department"
                value={requirements.clientDivision}
                onChange={(e) => handleInputChange('clientDivision', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Primary Contact Name"
                value={requirements.primaryContactName}
                onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Primary Contact Position"
                value={requirements.primaryContactPosition}
                onChange={(e) => handleInputChange('primaryContactPosition', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Primary Contact Email"
                type="email"
                value={requirements.primaryContactEmail}
                onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Primary Contact Phone"
                value={requirements.primaryContactPhone}
                onChange={(e) => handleInputChange('primaryContactPhone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Secondary Contact Details"
                value={requirements.secondaryContactDetails}
                onChange={(e) => handleInputChange('secondaryContactDetails', e.target.value)}
                helperText="Backup contact person information"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Decision Makers"
                value={requirements.decisionMakers}
                onChange={(e) => handleInputChange('decisionMakers', e.target.value)}
                helperText="Person(s) with final approval authority"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={2}
                label="Project Summary"
                value={requirements.projectSummary}
                onChange={(e) => handleInputChange('projectSummary', e.target.value)}
                helperText="Brief overview (2-3 sentences)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={6}
                label="Detailed Project Description"
                value={requirements.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                helperText="Comprehensive explanation of requirements"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Project Objectives"
                value={requirements.projectObjectives}
                onChange={(e) => handleInputChange('projectObjectives', e.target.value)}
                helperText="Clear goals the software should achieve"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Target End Users"
                value={requirements.targetEndUsers}
                onChange={(e) => handleInputChange('targetEndUsers', e.target.value)}
                helperText="Who will be using the software"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Expected User Volume"
                value={requirements.expectedUserVolume}
                onChange={(e) => handleInputChange('expectedUserVolume', e.target.value)}
                helperText="Estimated number of concurrent/total users"
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Platform Requirement"
                placeholder="e.g., Web, iOS, Android, Desktop"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInputChange('platformRequirements', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {requirements.platformRequirements.map((platform, index) => (
                  <Chip
                    key={index}
                    label={platform}
                    onDelete={() => handleRemoveArrayItem('platformRequirements', index)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Required Technology"
                placeholder="e.g., React, Node.js, PostgreSQL"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInputChange('requiredTechnologies', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {requirements.requiredTechnologies.map((tech, index) => (
                  <Chip
                    key={index}
                    label={tech}
                    onDelete={() => handleRemoveArrayItem('requiredTechnologies', index)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Integration Requirements"
                value={requirements.integrationRequirements}
                onChange={(e) => handleInputChange('integrationRequirements', e.target.value)}
                helperText="Existing systems to connect with"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Design Documents"
                value={requirements.designDocuments}
                onChange={(e) => handleInputChange('designDocuments', e.target.value)}
                helperText="Links/attachments to wireframes, mockups, or specifications"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Technical Constraints"
                value={requirements.technicalConstraints}
                onChange={(e) => handleInputChange('technicalConstraints', e.target.value)}
                helperText="Any limitations that must be considered"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Infrastructure Details"
                value={requirements.infrastructureDetails}
                onChange={(e) => handleInputChange('infrastructureDetails', e.target.value)}
                helperText="Client's existing setup or requirements"
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Requested Start Date",
                requirements.startDate,
                (date) => handleInputChange('startDate', date),
                true
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Target Completion Date",
                requirements.completionDate,
                (date) => handleInputChange('completionDate', date),
                true
              )}
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={requirements.priorityLevel}
                  onChange={(e) => handleInputChange('priorityLevel', e.target.value)}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
                <FormHelperText>Project urgency level</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Key Milestones
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Discovery/Requirements Phase Completion",
                requirements.milestones.discovery,
                (date) => handleInputChange('milestones', { ...requirements.milestones, discovery: date })
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Design Approval",
                requirements.milestones.design,
                (date) => handleInputChange('milestones', { ...requirements.milestones, design: date })
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Development Phase Completion",
                requirements.milestones.development,
                (date) => handleInputChange('milestones', { ...requirements.milestones, development: date })
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Testing Phase Completion",
                requirements.milestones.testing,
                (date) => handleInputChange('milestones', { ...requirements.milestones, testing: date })
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderDateInput(
                "Deployment Readiness",
                requirements.milestones.deployment,
                (date) => handleInputChange('milestones', { ...requirements.milestones, deployment: date })
              )}
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Core Feature"
                placeholder="Enter a must-have functionality"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInputChange('coreFeatures', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {requirements.coreFeatures.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => handleRemoveArrayItem('coreFeatures', index)}
                    color="primary"
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Secondary Feature"
                placeholder="Enter a nice-to-have functionality"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInputChange('secondaryFeatures', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {requirements.secondaryFeatures.map((feature, index) => (
                  <Chip
                    key={index}
                    label={feature}
                    onDelete={() => handleRemoveArrayItem('secondaryFeatures', index)}
                    color="secondary"
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Out of Scope Item"
                placeholder="Enter explicitly excluded features"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInputChange('outOfScope', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {requirements.outOfScope.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => handleRemoveArrayItem('outOfScope', index)}
                    color="error"
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Future Phase Plans"
                value={requirements.futurePhasePlans}
                onChange={(e) => handleInputChange('futurePhasePlans', e.target.value)}
                helperText="Features for later implementation"
              />
            </Grid>
          </Grid>
        );

      case 6:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Testing Level"
                placeholder="e.g., Unit Testing, Integration Testing, UAT"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleArrayInputChange('testingLevels', (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {requirements.testingLevels.map((level, index) => (
                  <Chip
                    key={index}
                    label={level}
                    onDelete={() => handleRemoveArrayItem('testingLevels', index)}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Compliance Requirements"
                value={requirements.complianceRequirements}
                onChange={(e) => handleInputChange('complianceRequirements', e.target.value)}
                helperText="Industry standards or regulations"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Security Requirements"
                value={requirements.securityRequirements}
                onChange={(e) => handleInputChange('securityRequirements', e.target.value)}
                helperText="Specific security protocols or certifications"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Performance Expectations"
                value={requirements.performanceExpectations}
                onChange={(e) => handleInputChange('performanceExpectations', e.target.value)}
                helperText="Speed, load capacity, response times"
              />
            </Grid>
          </Grid>
        );

      case 7:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Deployment Environment"
                value={requirements.deploymentEnvironment}
                onChange={(e) => handleInputChange('deploymentEnvironment', e.target.value)}
                helperText="Production environment details"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Deployment Method"
                value={requirements.deploymentMethod}
                onChange={(e) => handleInputChange('deploymentMethod', e.target.value)}
                helperText="CI/CD, manual, phased rollout"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Maintenance Expectations"
                value={requirements.maintenanceExpectations}
                onChange={(e) => handleInputChange('maintenanceExpectations', e.target.value)}
                helperText="Post-launch support requirements"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Training Requirements"
                value={requirements.trainingRequirements}
                onChange={(e) => handleInputChange('trainingRequirements', e.target.value)}
                helperText="End-user or admin training needs"
              />
            </Grid>
          </Grid>
        );

      case 8:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Expertise Required"
                value={requirements.specialExpertise}
                onChange={(e) => handleInputChange('specialExpertise', e.target.value)}
                helperText="Any specialized skills needed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Client Involvement Level"
                value={requirements.clientInvolvement}
                onChange={(e) => handleInputChange('clientInvolvement', e.target.value)}
                helperText="How actively the client will participate"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Resource Constraints"
                value={requirements.resourceConstraints}
                onChange={(e) => handleInputChange('resourceConstraints', e.target.value)}
                helperText="Any limitations on available personnel"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Cross-Team Dependencies"
                value={requirements.crossTeamDependencies}
                onChange={(e) => handleInputChange('crossTeamDependencies', e.target.value)}
                helperText="Reliance on other internal teams"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Known Challenges"
                value={requirements.knownChallenges}
                onChange={(e) => handleInputChange('knownChallenges', e.target.value)}
                helperText="Identified potential problems"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Critical Dependencies"
                value={requirements.criticalDependencies}
                onChange={(e) => handleInputChange('criticalDependencies', e.target.value)}
                helperText="External factors that could impact delivery"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Contingency Options"
                value={requirements.contingencyOptions}
                onChange={(e) => handleInputChange('contingencyOptions', e.target.value)}
                helperText="Alternative approaches if issues arise"
              />
            </Grid>
          </Grid>
        );

      case 9:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Instructions"
                value={requirements.specialInstructions}
                onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                helperText="Any unique considerations"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Historical Context"
                value={requirements.historicalContext}
                onChange={(e) => handleInputChange('historicalContext', e.target.value)}
                helperText="Previous related projects or attempts"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Attachments/References"
                value={requirements.attachments}
                onChange={(e) => handleInputChange('attachments', e.target.value)}
                helperText="Links to supporting documentation"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes from Initial Client Conversation"
                value={requirements.initialNotes}
                onChange={(e) => handleInputChange('initialNotes', e.target.value)}
                helperText="Insights from preliminary discussions"
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Project Requirements
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/organization-chart')}
              sx={{ mr: 1 }}
            >
              Back to Organization Chart
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving && <CircularProgress size={20} />}
              >
                {saving ? 'Saving...' : 'Save and Continue'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}; 