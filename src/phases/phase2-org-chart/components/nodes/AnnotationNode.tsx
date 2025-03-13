import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

interface AnnotationData {
  text: string;
  color?: string;
}

export const AnnotationNode: React.FC<NodeProps<AnnotationData>> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);

  const handleSave = () => {
    data.text = text;
    setIsEditing(false);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Paper
        elevation={3}
        onDoubleClick={handleDoubleClick}
        sx={{
          p: 2,
          minWidth: 200,
          backgroundColor: data.color || '#fff9c4',
          position: 'relative',
        }}
      >
        {isEditing ? (
          <Box>
            <TextField
              multiline
              fullWidth
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  handleSave();
                }
              }}
              autoFocus
              variant="standard"
              placeholder="Type your note here..."
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Tooltip title="Save (Ctrl + Enter)">
                <IconButton size="small" onClick={handleSave}>
                  <SaveIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography>{text || 'Double-click to edit'}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setIsEditing(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Paper>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}; 