export interface IProjectRequirements {
  id: string;
  organizationId: string;
  projectName: string;
  clientInfo: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  overview: {
    description: string;
    objectives: string[];
    scope: string;
    constraints?: string[];
  };
  technical: {
    stack: {
      frontend?: string[];
      backend?: string[];
      database?: string[];
      infrastructure?: string[];
    };
    integrations?: string[];
    security?: string[];
    performance?: {
      metrics: string[];
      targets: { [key: string]: string };
    };
  };
  timeline: {
    startDate: Date;
    endDate: Date;
    phases?: {
      name: string;
      duration: number;
      description: string;
    }[];
    milestones?: {
      name: string;
      date: Date;
      description: string;
    }[];
  };
  scope: {
    features: {
      name: string;
      description: string;
      priority: 'must-have' | 'should-have' | 'nice-to-have';
      complexity?: 'low' | 'medium' | 'high';
    }[];
    outOfScope?: string[];
  };
  quality: {
    standards: string[];
    testing: {
      types: string[];
      coverage?: number;
      requirements?: string[];
    };
    compliance?: string[];
  };
  deployment: {
    environment: string;
    requirements: string[];
    strategy?: string;
    rollback?: string;
  };
  team: {
    roles: {
      title: string;
      count: number;
      skills: string[];
    }[];
    availability?: {
      [role: string]: string;
    };
  };
  risks: {
    identified: {
      description: string;
      impact: 'low' | 'medium' | 'high';
      probability: 'low' | 'medium' | 'high';
      mitigation: string;
    }[];
    assumptions?: string[];
    dependencies?: string[];
  };
  additionalNotes?: string[];
  status: 'draft' | 'review' | 'approved' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
} 