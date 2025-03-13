import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../phase1-auth/utils/firebaseConfig';
import { IProjectSetup } from '../../phase3-project-setup/types/project.types';
import { IOrganization } from '../../phase2-org-chart/types/org-chart.types';
import { WorkflowDocument } from '../types/workflow.types';

export class FirestoreService {
  private static instance: FirestoreService;

  public static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  public async getProject(projectId: string): Promise<IProjectSetup | null> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        return null;
      }

      return projectSnap.data() as IProjectSetup;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  public async getOrganization(orgId: string): Promise<IOrganization | null> {
    try {
      const orgRef = doc(db, 'organizations', orgId);
      const orgSnap = await getDoc(orgRef);
      
      if (!orgSnap.exists()) {
        return null;
      }

      return orgSnap.data() as IOrganization;
    } catch (error) {
      console.error('Error getting organization:', error);
      throw error;
    }
  }

  public async getWorkflow(workflowId: string): Promise<WorkflowDocument | null> {
    try {
      const workflowRef = doc(db, 'workflows', workflowId);
      const workflowSnap = await getDoc(workflowRef);
      
      if (!workflowSnap.exists()) {
        return null;
      }

      return workflowSnap.data() as WorkflowDocument;
    } catch (error) {
      console.error('Error getting workflow:', error);
      throw error;
    }
  }

  public async createWorkflow(workflowData: WorkflowDocument): Promise<void> {
    const workflowId = crypto.randomUUID();
    const batch = writeBatch(db);

    // Create main workflow document
    const workflowRef = doc(db, 'workflows', workflowId);
    batch.set(workflowRef, workflowData);

    // Create index document
    const indexRef = doc(db, 'projectWorkflows', workflowId);
    batch.set(indexRef, {
      projectId: workflowData.projectId,
      organizationId: workflowData.organizationId,
      status: workflowData.workflow.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  }

  public async updateWorkflow(workflowId: string, updates: Partial<WorkflowDocument>): Promise<void> {
    const batch = writeBatch(db);

    // Update main workflow document
    const workflowRef = doc(db, 'workflows', workflowId);
    batch.update(workflowRef, {
      ...updates,
      'metadata.lastModifiedAt': serverTimestamp(),
    });

    // Update index if status changed
    if (updates.workflow?.status) {
      const indexRef = doc(db, 'projectWorkflows', workflowId);
      batch.update(indexRef, {
        status: updates.workflow.status,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }

  public async getOrganizationWorkflows(organizationId: string): Promise<WorkflowDocument[]> {
    try {
      const workflowsQuery = query(
        collection(db, 'workflows'),
        where('organizationId', '==', organizationId),
        orderBy('updatedAt', 'desc')
      );

      const workflowsSnap = await getDocs(workflowsQuery);
      return workflowsSnap.docs.map(doc => doc.data() as WorkflowDocument);
    } catch (error) {
      console.error('Error getting organization workflows:', error);
      throw error;
    }
  }

  public async getProjectWorkflows(projectId: string): Promise<WorkflowDocument[]> {
    try {
      const indexQuery = query(
        collection(db, 'projectWorkflows'),
        where('projectId', '==', projectId),
        orderBy('createdAt', 'desc')
      );

      const indexSnap = await getDocs(indexQuery);
      const workflowIds = indexSnap.docs.map(doc => doc.data().workflowId);

      const workflows: WorkflowDocument[] = [];
      for (const workflowId of workflowIds) {
        const workflow = await this.getWorkflow(workflowId);
        if (workflow) {
          workflows.push(workflow);
        }
      }

      return workflows;
    } catch (error) {
      console.error('Error getting project workflows:', error);
      throw error;
    }
  }

  async saveWorkflow(projectId: string, workflowDoc: WorkflowDocument): Promise<void> {
    try {
      // Get the project first to verify permissions
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }

      const project = projectSnap.data();
      const workflowRef = doc(db, 'projects', projectId, 'workflows', 'current');
      
      // Add metadata if not present
      const currentVersion = typeof workflowDoc.metadata?.version === 'number' ? workflowDoc.metadata.version : 0;
      const enrichedWorkflowDoc = {
        ...workflowDoc,
        metadata: {
          ...workflowDoc.metadata,
          lastModifiedAt: serverTimestamp(),
          version: currentVersion + 1
        },
        organizationId: project.organizationId, // Ensure organizationId is set
        projectId, // Ensure projectId is set
      };

      await setDoc(workflowRef, enrichedWorkflowDoc);

      // Update project status
      await updateDoc(projectRef, {
        'status': 'workflow_generated',
        'metadata.lastModifiedAt': serverTimestamp(),
        'metadata.workflowGenerated': true
      });
    } catch (error) {
      console.error('Error saving workflow:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save workflow');
    }
  }
} 