import React, { useEffect, useRef, useState } from 'react';
import { Timeline, DataItem } from 'vis-timeline/standalone';
import { DataSet } from 'vis-data';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { WorkflowDocument, WorkflowStep, WorkflowMilestone } from '../types/workflow.types';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineViewProps {
  workflow: WorkflowDocument;
}

interface CustomTimelineItem extends DataItem {
  id: string;
  content: string;
  title?: string;
  start: Date;
  end?: Date;
  group?: string;
  className?: string;
}

interface TimelineGroup {
  id: string;
  content: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ workflow }) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInstance = useRef<Timeline | null>(null);
  const [items, setItems] = useState<CustomTimelineItem[]>([]);
  const [groups, setGroups] = useState<TimelineGroup[]>([]);

  useEffect(() => {
    if (!timelineRef.current || !workflow) return;

    // Convert workflow steps to timeline items
    const timelineItems: CustomTimelineItem[] = workflow.workflow.steps.map((step: WorkflowStep) => ({
      id: step.id,
      content: step.title,
      title: `${step.description}\nAssigned To: ${step.assignedTo.join(', ')}\nStatus: ${step.status}\nRisk Level: ${step.riskLevel}`,
      start: step.startDate instanceof Date ? step.startDate : new Date(step.startDate),
      end: step.endDate instanceof Date ? step.endDate : new Date(step.endDate),
      group: step.assignedTo[0] || 'Unassigned',
      className: `risk-${step.riskLevel.toLowerCase()}`,
    }));

    // Add milestones
    workflow.workflow.milestones.forEach((milestone: WorkflowMilestone) => {
      timelineItems.push({
        id: milestone.id,
        content: milestone.title,
        title: milestone.description,
        start: milestone.date instanceof Date ? milestone.date : new Date(milestone.date),
        end: milestone.date instanceof Date ? milestone.date : new Date(milestone.date),
        className: 'milestone',
      });
    });

    setItems(timelineItems);

    // Create groups based on team members
    const groups: TimelineGroup[] = Array.from(
      new Set(workflow.workflow.steps.flatMap(step => step.assignedTo))
    ).map(assignee => ({
      id: assignee,
      content: assignee,
    }));

    setGroups(groups);

    // Create timeline
    const container = timelineRef.current;
    const itemsDataSet = new DataSet<CustomTimelineItem>(timelineItems);
    const groupsDataSet = new DataSet<TimelineGroup>(groups);

    const options = {
      stack: true,
      showCurrentTime: true,
      zoomable: true,
      editable: false,
      margin: {
        item: {
          horizontal: 10,
          vertical: 5,
        },
      },
      orientation: 'top',
    };

    timelineInstance.current = new Timeline(container, itemsDataSet, groupsDataSet, options);

    // Add custom CSS
    const style = document.createElement('style');
    style.textContent = `
      .priority-high { background-color: #ffebee; border-color: #ef5350; }
      .priority-medium { background-color: #fff3e0; border-color: #ffa726; }
      .priority-low { background-color: #e8f5e9; border-color: #66bb6a; }
      .milestone { 
        background-color: #e3f2fd; 
        border-color: #2196f3;
        border-style: solid;
        border-width: 2px;
        border-radius: 50%;
        width: 20px !important;
        height: 20px !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (timelineInstance.current) {
        timelineInstance.current.destroy();
      }
      document.head.removeChild(style);
    };
  }, [workflow]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Project Timeline
      </Typography>
      <Box ref={timelineRef} sx={{ height: '600px', mt: 2 }} />
    </Paper>
  );
}; 