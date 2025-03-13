import { Node, Edge } from 'reactflow';
import { Timestamp } from 'firebase/firestore';

export interface IProficiencyItem {
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface TimeSlot {
  start: Date;
  end: Date;
}

interface DayAvailability {
  [key: string]: TimeSlot[];
}

export interface IPersonData {
  name: string;
  email: string;
  position: string;
  timezone: string;
  proficiencies: {
    languages: string[];
    frameworks: string[];
    primarySkills: string[];
  };
  teamConnections: string[];
  reportsTo?: string;
  isObserver: boolean;
  isAdmin: boolean;
  availability: {
    status: 'available' | 'unavailable' | 'limited';
    dayAvailability: Record<string, number>;
    notes: string;
  };
  inviteStatus: 'pending' | 'accepted' | 'expired';
  metadata: {
    lastActive?: Date;
    joinedAt?: Date;
  };
}

export interface IAnnotationData {
  text: string;
  color?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  type: 'availability' | 'teamRelation' | 'workload' | 'general';
}

export interface IAnnotation {
  id: string;
  text: string;
  position: { x: number; y: number };
  data: IAnnotationData;
}

export type IPersonnelNode = Node<IPersonData>;

export type ITeamEdge = Edge<{
  type: 'team';
  notes?: string;
}>;

export type IHierarchyEdge = Edge<{
  type: 'hierarchy';
  notes?: string;
}>;

export interface IOrganizationMember {
  id: string;
  data: IPersonData;
  position: {
    x: number;
    y: number;
  };
}

export interface IOrganizationEdge {
  id: string;
  source: string;
  target: string;
  type: 'team' | 'hierarchy';
  data?: {
    relationshipType: 'collaborator' | 'direct-report';
  };
}

export interface IOrganization {
  id: string;
  name: string;
  members: IOrganizationMember[];
  createdBy: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  metadata?: {
    version: number;
    lastModifiedBy: string;
    lastModifiedAt?: Date | Timestamp;
  };
}

export interface IInvite {
  id: string;
  organizationId: string;
  email: string;
  code: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  invitedBy: string;
  teamIds?: string[];
  metadata?: {
    message?: string;
    customData?: Record<string, any>;
  };
}

// Remove duplicate interfaces
export type { Node, Edge }; 