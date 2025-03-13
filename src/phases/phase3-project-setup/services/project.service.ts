import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../phases/phase1-auth/utils/firebaseConfig';
import { ProjectRequirements, IWorkflowStep } from '../types/project.types';

export const saveProjectRequirements = async (projectData: any) => {
  try {
    const projectId = projectData.projectId || crypto.randomUUID();
    const projectRef = doc(db, 'projects', projectId);
    
    await setDoc(projectRef, {
      projectId,
      ...projectData,
      createdAt: projectData.createdAt || new Date(),
      updatedAt: projectData.updatedAt || new Date(),
    });

    return projectId;
  } catch (error) {
    console.error('Error saving project requirements:', error);
    throw new Error('Failed to save project requirements');
  }
};

export const getProjectRequirements = async (projectId: string): Promise<ProjectRequirements> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (!projectDoc.exists()) {
      throw new Error('Project not found');
    }

    return projectDoc.data() as ProjectRequirements;
  } catch (error) {
    console.error('Error getting project requirements:', error);
    throw new Error('Failed to get project requirements');
  }
};

export const updateWorkflow = async (projectId: string, workflow: IWorkflowStep[]) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      workflow,
      'updatedAt': new Date()
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw new Error('Failed to update workflow');
  }
};

/**
 * Saves the generated project description to Firebase
 */
export const saveProjectDescription = async (projectId: string, description: string) => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    
    // Update the project document with the generated description
    await updateDoc(projectRef, {
      'generatedDescription': description,
      'metadata.hasGeneratedDescription': true,
      'updatedAt': new Date()
    });

    // Create a separate document for the project description
    const descriptionRef = doc(db, 'projectDescriptions', projectId);
    await setDoc(descriptionRef, {
      projectId,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('Error saving project description:', error);
    throw new Error('Failed to save project description');
  }
};

/**
 * Retrieves the generated project description from Firebase
 */
export const getProjectDescription = async (projectId: string): Promise<string | null> => {
  try {
    // First try to get from the dedicated collection
    const descriptionRef = doc(db, 'projectDescriptions', projectId);
    const descriptionDoc = await getDoc(descriptionRef);

    if (descriptionDoc.exists()) {
      return descriptionDoc.data().description;
    }

    // If not found, try to get from the project document
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);

    if (projectDoc.exists() && projectDoc.data().generatedDescription) {
      return projectDoc.data().generatedDescription;
    }

    return null;
  } catch (error) {
    console.error('Error getting project description:', error);
    throw new Error('Failed to get project description');
  }
}; 