import { TimestampField } from '../../phase2-org-chart/types/firestore.types';

export interface IContactPerson {
  name: string;
  position: string;
  email: string;
  phone?: string;
  isDecisionMaker: boolean;
}

export interface ITechnicalRequirement {
  platform: ('web' | 'mobile-ios' | 'mobile-android' | 'desktop')[];
  technologies?: string[];
  integrations?: string[];
  designDocuments?: string[];
  technicalConstraints?: string[];
  infrastructureDetails?: string;
}

export interface IDeploymentInfo {
  environment: string;
  method: 'ci-cd' | 'manual' | 'phased';
  maintenanceRequirements?: string;
  trainingRequirements?: string;
}

export interface IProjectTimeline {
  startDate: Date;
  endDate: Date;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  milestones: Array<{
    phase: string;
    targetDate: Date;
    description: string;
    isRequired: '1' | '0';
  }>;
}

export interface IProjectScope {
  coreFeatures: Array<{ description: string }>;
  secondaryFeatures?: Array<{ description: string }>;
  outOfScope?: Array<{ description: string }>;
  futurePlans?: Array<{ description: string }>;
}

export interface IQualityRequirements {
  testingLevels?: ('unit' | 'integration' | 'e2e' | 'performance' | 'security')[];
  complianceRequirements?: string[];
  securityRequirements?: string[];
  performanceRequirements?: {
    loadCapacity?: string;
    responseTime?: string;
    availability?: string;
  };
}

export interface ITeamRequirements {
  specialExpertise?: string[];
  clientInvolvement?: ('daily' | 'weekly' | 'monthly' | 'as-needed')[];
  resourceConstraints?: string[];
  crossTeamDependencies?: string[];
  teamStructure?: string;
  communicationPlan?: string;
}

export interface IRiskAssessment {
  risks?: {
    description?: string;
    level?: 'high' | 'medium' | 'low';
    impact?: string;
    mitigation?: string;
  }[];
  criticalDependencies?: {
    dependency: string;
    managementStrategy: string;
  }[];
  contingencyPlans?: string[];
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  dependencies: string[];
  acceptanceCriteria: string[];
}

export interface IWorkflowStep {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  tasks: ITask[];
  dependencies: string[];
  status: 'not-started' | 'in-progress' | 'completed';
  acceptanceCriteria: string[];
  notes: string;
}

export interface IProjectSetup {
  id: string;
  organizationId: string;
  basicInfo: {
    title: string;
    projectId: string;
    clientCompany: string;
    clientDivision: string;
    summary: string;
    description: string;
    objectives: string[];
    targetUsers: string[];
    expectedUserVolume: string;
  };
  contacts: {
    primary: IContactPerson;
    secondary: IContactPerson;
    decisionMakers: IContactPerson[];
  };
  technical: {
    platform: string[];
    technologies: string[];
    integrations: string[];
    designDocuments: string;
    technicalConstraints: string;
    infrastructureDetails: string;
    securityRequirements: string[];
    performanceRequirements: {
      loadCapacity: string;
      responseTime: string;
      availability: string;
    };
  };
  deployment: {
    environment: string;
    method: string;
    maintenanceRequirements: string;
    trainingRequirements: string;
    rollbackPlan: string;
    monitoringStrategy: string;
  };
  timeline: {
    startDate: Date;
    targetCompletionDate: Date;
    priorityLevel: 'High' | 'Medium' | 'Low' | 'Urgent';
    milestones: {
      phase: string;
      targetDate: Date;
      description: string;
      isRequired: '1' | '0';
    }[];
    dependencies: string[];
    phaseBreakdown: string[];
  };
  scope: {
    coreFeatures: {
      description: string;
      priority: string;
      effort: string;
      dependencies: string[];
      acceptance: string[];
    }[];
    secondaryFeatures: {
      description: string;
      priority: string;
      effort: string;
      dependencies: string[];
      acceptance: string[];
    }[];
    outOfScope: {
      description: string;
      reason: string;
      impact: string;
    }[];
    futurePlans: {
      description: string;
      timeline: string;
      prerequisites: string[];
    }[];
    assumptions: {
      description: string;
      impact: string;
      validation: string;
    }[];
    constraints: {
      description: string;
      type: string;
      impact: string;
    }[];
  };
  quality: {
    testingLevels: string[];
    complianceRequirements: string[];
    securityRequirements: string[];
    performanceRequirements: {
      loadCapacity?: string;
      responseTime?: string;
      availability?: string;
    };
    acceptanceCriteria: string[];
    qualityMetrics: string[];
  };
  team: {
    specialExpertise: string[];
    clientInvolvement: string[];
    resourceConstraints: string;
    crossTeamDependencies: string;
    teamStructure: string;
    communicationPlan: string;
    roles: string[];
    responsibilities: string[];
  };
  risks: {
    risks: {
      description: string;
      level: string;
      impact: string;
      mitigation: string;
    }[];
    criticalDependencies: {
      dependency: string;
      managementStrategy: string;
    }[];
    contingencyPlans: string;
    mitigationStrategies: string[];
    riskAssessmentMatrix: string[];
  };
  workflow?: IWorkflowStep[];
  metadata: {
    status: 'draft' | 'submitted' | 'approved' | 'rejected';
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    lastModifiedBy: string;
  };
}

export interface ProjectRequirements {
  // Project Identification
  projectId: string;
  projectTitle: string;
  clientCompany: string;
  clientDivision: string;

  // Client Contact
  primaryContact: IContactPerson;
  secondaryContact: IContactPerson;
  decisionMakers: string[];

  // Project Overview
  summary: string;
  description: string;
  objectives: string[];
  targetUsers: string;
  expectedUserVolume: number;

  // Technical Specifications
  platform: {
    web: boolean;
    mobile: boolean;
    desktop: boolean;
    other: string;
  };
  requiredTechnologies: string[];
  integrationRequirements: string[];
  designDocuments: string[];
  technicalConstraints: string[];
  infrastructure: string;

  // Timeline
  startDate: Date | null;
  completionDate: Date | null;
  priority: 'High' | 'Medium' | 'Low';
  milestones: {
    discovery: Date | null;
    design: Date | null;
    development: Date | null;
    testing: Date | null;
    deployment: Date | null;
  };

  // Scope
  coreFeatures: string[];
  secondaryFeatures: string[];
  outOfScope: string[];
  futurePlans: string[];

  // Quality & Compliance
  testingLevels: string[];
  complianceRequirements: string[];
  securityRequirements: string[];
  performanceExpectations: string;

  // Deployment
  deploymentEnvironment: string;
  deploymentMethod: string;
  maintenanceExpectations: string;
  trainingRequirements: string;

  // Team & Risk
  specialExpertise: string[];
  specialExpertiseInput?: string;
  clientInvolvement: 'High' | 'Medium' | 'Low' | 'Very High';
  resourceConstraints: string[];
  resourceConstraintsText?: string;
  crossTeamDependencies: string[];
  crossTeamDependenciesText?: string;
  knownChallenges: string[];
  knownChallengesInput?: string;
  criticalDependencies: string[];
  criticalDependenciesInput?: string;
  contingencyPlans: string;

  // Additional Notes
  specialInstructions: string;
  historicalContext: string;
  attachments: string[];
  initialNotes: string;
  
  // Firebase and metadata fields
  organizationId?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
  status?: string;
  metadata?: {
    version: number;
    lastModifiedBy: string;
    workflowStatus: string;
    hasGeneratedDescription?: boolean;
  };
  
  // Workflow data
  workflow?: IWorkflowStep[];
  generatedDescription?: string;
} 