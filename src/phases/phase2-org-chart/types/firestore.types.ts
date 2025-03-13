import { Timestamp, FieldValue } from 'firebase/firestore';

// Type for timestamp fields that can be either Timestamp or FieldValue
export type TimestampField = Timestamp | FieldValue;

export interface FirestoreUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  organizationId?: string;
  role: 'admin' | 'member' | 'observer';
  hasOrganization: boolean;
  organizationRole: 'creator' | 'member';
  inviteCode?: string;
  metadata: {
    createdAt: TimestampField;
    lastLoginAt: TimestampField;
    lastActiveAt: TimestampField;
    preferences: {
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
      emailNotifications: boolean;
    }
  }
}

export interface TeamMember {
  id: string;
  type: 'personnel' | 'annotation';
  position: { x: number; y: number };
  data: {
    name?: string;
    email?: string;
    position?: string;
    timezone?: string;
    proficiencies?: {
      languages: string[];
      frameworks: string[];
      primarySkills: string[];
    };
    teamConnections: string[];
    reportsTo?: string;
    isObserver: boolean;
    isAdmin: boolean;
    availability: {
      status: 'available' | 'busy' | 'away';
      dayAvailability: Record<string, string>;
      notes: string;
    };
    inviteStatus: 'pending' | 'accepted' | 'declined';
    metadata: {
      lastActive?: TimestampField;
      joinedAt?: TimestampField;
    }
  }
}

export interface OrganizationEdge {
  id: string;
  source: string;
  target: string;
  type: 'team' | 'hierarchy';
  data: {
    relationshipType: 'collaborator' | 'direct-report';
  }
}

export interface PendingInvite {
  code: string;
  expiresAt: TimestampField;
  role: string;
  teamConnections: string[];
  invitedAt: TimestampField;
  status: 'pending' | 'accepted' | 'expired';
}

export interface FirestoreOrganization {
  id: string;
  name: string;
  code: string;
  nodes: TeamMember[];
  edges: OrganizationEdge[];
  metadata: {
    createdAt: TimestampField;
    updatedAt: TimestampField;
    createdBy: string;
    totalMembers: number;
    teams: {
      [teamId: string]: {
        name: string;
        members: string[];
        skills: string[];
        lead?: string;
      }
    };
    workflowGenerated: boolean;
    version: number;
    description: string;
    tags: string[];
    status: 'setup' | 'active' | 'archived';
  };
  pendingInvites: {
    [email: string]: PendingInvite;
  }
}

export interface FirestoreProject {
  projectId: string;
  organizationId: string;
  name: string;
  description: string;
  startDate: TimestampField;
  completionDate: TimestampField;
  status: 'pending_workflow_generation' | 'in_progress' | 'completed';
  milestones: {
    discovery: TimestampField;
    design: TimestampField;
    development: TimestampField;
    testing: TimestampField;
    deployment: TimestampField;
  };
  metadata: {
    createdAt: TimestampField;
    updatedAt: TimestampField;
    createdBy: string;
  }
} 