import { Timestamp } from 'firebase/firestore';

export interface ITask {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  storyPoints: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  dependencies: string[];
  milestone: string;
  status: 'todo' | 'in_progress' | 'done';
  aiSuggestions?: {
    timeEstimate: string;
    suggestedAssignees: string[];
    riskLevel: 'High' | 'Medium' | 'Low';
    technicalComplexity: 'High' | 'Medium' | 'Low';
    recommendedApproach: string;
  };
  subtasks: ISubtask[];
  comments: IComment[];
  attachments: IAttachment[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    lastModifiedBy: string;
    version: number;
  };
}

export interface ISubtask {
  id: string;
  title: string;
  status: 'todo' | 'done';
  assignedTo?: string;
  dueDate?: Date;
  notes?: string;
}

export interface IComment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  attachments?: IAttachment[];
  mentions?: string[];
  reactions?: {
    [key: string]: string[]; // emoji: userIds[]
  };
}

export interface IAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  metadata?: {
    contentType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    thumbnailUrl?: string;
  };
}

export interface IMilestone {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  dueDate: Date;
  tasks: ITask[];
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  dependencies?: string[];
  owner?: string;
  metadata?: {
    priority: 'high' | 'medium' | 'low';
    notes?: string;
    tags?: string[];
  };
}

export interface IWorkflow {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  steps: WorkflowStep[];
  milestones: WorkflowMilestone[];
  teamAssignments: TeamAssignment[];
  timeline: WorkflowTimeline;
  constraints: WorkflowConstraints;
  metadata: {
    completedTasks: number;
    totalTasks: number;
    completedStoryPoints: number;
    totalStoryPoints: number;
    criticalTasks: number;
    delayedTasks: number;
  };
}

export interface ITaskActivity {
  id: string;
  taskId: string;
  type: 'status_change' | 'assignment' | 'comment' | 'time_tracking' | 'attachment' | 'ai_suggestion';
  timestamp: Date;
  user: string;
  details: any;
}

export interface IAIAnalysis {
  analysis: {
    estimatedTime: string;
    suggestedApproach: string;
    riskAssessment: number;
    technicalComplexity: number;
    skillsRequired: string[];
    potentialBlockers: string[];
    recommendations: string[];
  };
}

export interface ITaskUpdate {
  taskId: string;
  changes: Partial<ITask>;
  aiAnalysis?: IAIAnalysis;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'todo' | 'in_progress' | 'done';
  storyPoints: number;
  dependencies: string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  estimatedDuration: number;
  dependencies: string[];
  status: 'todo' | 'in_progress' | 'done';
  startDate: Date;
  endDate: Date;
  riskLevel: 'High' | 'Medium' | 'Low';
  skills: string[];
  storyPoints: number;
  tasks: WorkflowTask[];
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'High' | 'Medium' | 'Low';
  riskLevel: 'High' | 'Medium' | 'Low';
  storyPoints: number;
  dependencies: string[];
  startDate: Date;
  endDate: Date;
}

export interface WorkflowSubtask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assignee: string;
}

export interface WorkflowMilestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  isCompleted: boolean;
  dependencies: string[];
  tasks: WorkflowTask[];
}

export interface WorkflowDependency {
  from: string;
  to: string;
  type: 'blocking' | 'related';
}

export interface TeamAssignment {
  userId: string;
  role: string;
  skills: string[];
  availability: number;
  currentLoad: number;
  stepIds?: string[];
  workload?: number;
}

export interface WorkflowTimeline {
  startDate: Date;
  endDate: Date;
  criticalPath: string[];
  estimatedDuration: number;
}

export interface WorkflowConstraints {
  maxParallelTasks: number;
  resourceLimits: {
    [key: string]: number;
  };
  deadlines: {
    [key: string]: Date;
  };
}

export interface WorkflowMetadata {
  version: string;
  lastModifiedBy: string;
  lastModifiedAt: Date;
  requiresRegeneration: boolean;
  lastOptimized: Date | null;
  generationPrompt: string;
}

export interface WorkflowDocument {
  id: string;
  projectId: string;
  organizationId: string;
  workflow: IWorkflow;
  metadata: WorkflowMetadata;
}

export interface TeamMemberWorkload {
  id: string;
  name: string;
  assignedTasks: WorkflowTask[];
  totalTasks: number;
  completedTasks: number;
  tasksInProgress: number;
  upcomingTasks: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  criticalTasks: number;
  skills: string[];
  currentUtilization: number;
  tasksByPriority: {
    High: number;
    Medium: number;
    Low: number;
  };
  tasksByRisk: {
    High: number;
    Medium: number;
    Low: number;
  };
} 