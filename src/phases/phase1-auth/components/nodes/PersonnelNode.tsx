import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Paper,
  Box,
  TextField,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import { JiraService } from '../../utils/jira';

interface Proficiency {
  language: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
}

interface PersonnelData {
  name: string;
  corporateEmail: string;
  jiraEmail: string;
  role: string;
  proficiencies: Proficiency[];
}

interface PersonnelNodeProps {
  data: PersonnelData;
  isConnectable: boolean;
}

interface JiraLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onLink: (email: string) => void;
  jiraService: JiraService;
  currentEmail?: string;
}

const JiraLinkDialog: React.FC<JiraLinkDialogProps> = ({
  open,
  onClose,
  onLink,
  jiraService,
  currentEmail,
}) => {
  const [email, setEmail] = useState(currentEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLink = async () => {
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      const users = await jiraService.searchUsers(email);
      if (users.length > 0) {
        onLink(email);
        onClose();
      } else {
        // Create new Jira account
        await jiraService.createJiraAccount(email, email.split('@')[0]);
        onLink(email);
        onClose();
      }
    } catch (error) {
      setError('Error linking Jira account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Link Jira Account</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Jira Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleLink}
          variant="contained"
          disabled={!email || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
        >
          Link Account
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const PersonnelNode: React.FC<PersonnelNodeProps> = ({ data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);
  const [proficiencyDialogOpen, setProficiencyDialogOpen] = useState(false);
  const [jiraLinkDialogOpen, setJiraLinkDialogOpen] = useState(false);
  const [newProficiency, setNewProficiency] = useState<Proficiency>({
    language: '',
    level: 'Beginner',
    yearsOfExperience: 0,
  });

  // Initialize JiraService with environment variables
  const jiraService = new JiraService({
    baseUrl: process.env.REACT_APP_JIRA_BASE_URL || '',
    email: process.env.REACT_APP_JIRA_EMAIL || '',
    apiToken: process.env.REACT_APP_JIRA_API_TOKEN || '',
  });

  const handleSave = () => {
    Object.assign(data, formData);
    setIsEditing(false);
  };

  const handleAddProficiency = () => {
    if (newProficiency.language && newProficiency.level) {
      setFormData({
        ...formData,
        proficiencies: [...formData.proficiencies, { ...newProficiency }],
      });
      setNewProficiency({
        language: '',
        level: 'Beginner',
        yearsOfExperience: 0,
      });
      setProficiencyDialogOpen(false);
    }
  };

  const handleLinkJira = (email: string) => {
    setFormData({
      ...formData,
      jiraEmail: email,
    });
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <Paper
        elevation={3}
        sx={{
          p: 2,
          minWidth: 300,
          minHeight: 200,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton
            size="small"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <SaveIcon onClick={handleSave} /> : <EditIcon />}
          </IconButton>
        </Box>

        {isEditing ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              size="small"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              size="small"
              label="Corporate Email"
              value={formData.corporateEmail}
              onChange={(e) => setFormData({ ...formData, corporateEmail: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                label="Jira Email"
                value={formData.jiraEmail}
                disabled
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setJiraLinkDialogOpen(true)}
                size="small"
              >
                Link
              </Button>
            </Box>
            <TextField
              size="small"
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Box>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setProficiencyDialogOpen(true)}
                size="small"
              >
                Add Proficiency
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ fontWeight: 'bold' }}>{data.name || 'Unnamed'}</Box>
            <Box sx={{ color: 'text.secondary' }}>{data.role || 'No role specified'}</Box>
            <Box sx={{ fontSize: '0.875rem' }}>
              {data.corporateEmail && <div>Corporate: {data.corporateEmail}</div>}
              {data.jiraEmail && <div>Jira: {data.jiraEmail}</div>}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {data.proficiencies.map((prof, index) => (
                <Chip
                  key={index}
                  label={`${prof.language} (${prof.level})`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Paper>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />

      <Dialog
        open={proficiencyDialogOpen}
        onClose={() => setProficiencyDialogOpen(false)}
      >
        <DialogTitle>Add Proficiency</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Language/Framework"
              value={newProficiency.language}
              onChange={(e) =>
                setNewProficiency({ ...newProficiency, language: e.target.value })
              }
            />
            <FormControl>
              <InputLabel>Level</InputLabel>
              <Select
                value={newProficiency.level}
                label="Level"
                onChange={(e: SelectChangeEvent<string>) =>
                  setNewProficiency({
                    ...newProficiency,
                    level: e.target.value as Proficiency['level'],
                  })
                }
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
                <MenuItem value="Expert">Expert</MenuItem>
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Years of Experience"
              value={newProficiency.yearsOfExperience}
              onChange={(e) =>
                setNewProficiency({
                  ...newProficiency,
                  yearsOfExperience: parseInt(e.target.value) || 0,
                })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProficiencyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddProficiency} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <JiraLinkDialog
        open={jiraLinkDialogOpen}
        onClose={() => setJiraLinkDialogOpen(false)}
        onLink={handleLinkJira}
        jiraService={jiraService}
        currentEmail={formData.jiraEmail}
      />
    </>
  );
}; 