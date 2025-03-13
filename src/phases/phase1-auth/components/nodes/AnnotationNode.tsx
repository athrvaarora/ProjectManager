import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import {
  Paper,
  Box,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface AnnotationData {
  text: string;
}

interface AnnotationNodeProps {
  data: AnnotationData;
  isConnectable: boolean;
}

export const AnnotationNode: React.FC<AnnotationNodeProps> = ({ data, isConnectable }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);

  const handleSave = () => {
    data.text = text;
    setIsEditing(false);
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
          minWidth: 200,
          minHeight: 100,
          backgroundColor: '#fff9c4',
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
          <TextField
            multiline
            rows={4}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add your note here..."
            variant="standard"
            sx={{ backgroundColor: 'transparent' }}
          />
        ) : (
          <Box sx={{ whiteSpace: 'pre-wrap' }}>
            {data.text || 'Click edit to add a note'}
          </Box>
        )}
      </Paper>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </>
  );
}; 