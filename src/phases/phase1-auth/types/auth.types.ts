import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp, FieldValue } from 'firebase/firestore';
import { TimestampField } from '../../phase2-org-chart/types/firestore.types';

export interface IUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  organizationId?: string;
  role: 'admin' | 'member' | 'observer';
  isFirstLogin: boolean;
  hasOrganization: boolean;
  organizationRole: 'creator' | 'member';
  inviteCode?: string;
  metadata: {
    createdAt: TimestampField;
    lastLoginAt: TimestampField;
    lastActiveAt: TimestampField;
    preferences?: {
      theme: 'light' | 'dark' | 'system';
      notifications: boolean;
      emailNotifications: boolean;
    };
  };
}

export interface IAuthState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegistrationData {
  email: string;
  password: string;
  displayName: string;
  acceptedTerms: boolean;
  inviteCode?: string;
}

export interface IAuthContext {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  login: (credentials: ILoginCredentials) => Promise<void>;
  register: (data: IRegistrationData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithSSO: (domain: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  checkOrganizationStatus: () => Promise<void>;
  setAuthUser: (updatedUser: Partial<IUser>) => void;
  clearError: () => void;
} 