import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../phases/phase1-auth/utils/firebaseConfig';
import { IWorkflowStep, IProjectSetup } from '../types/project.types';

/**
 * Utility function to serialize dates in an object for Firestore
 * This recursively goes through the object and converts Date objects to ISO strings
 */
const serializeDates = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDates(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeDates(obj[key]);
    }
    return result;
  }
  
  return obj;
};

/**
 * Utility function to parse dates in an object from Firestore
 * This recursively goes through the object and converts ISO date strings to Date objects
 */
const parseDates = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(obj)) {
    return new Date(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => parseDates(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = parseDates(obj[key]);
    }
    return result;
  }
  
  return obj;
};

/**
 * Backward-compatible version of saveProjectRequirements that accepts a single parameter
 * for compatibility with existing code
 */
export const saveProjectRequirements = async (
  projectDataOrId: any,
  projectData?: IProjectSetup,
  userId?: string
): Promise<string> => {
  try {
    // Handle the case where the function is called with a single parameter (old style)
    if (typeof projectDataOrId !== 'string') {
      const data = projectDataOrId;
      const id = data.projectId || data.basicInfo?.projectId || crypto.randomUUID();
      
      // Create a reference to the project document
      const projectRef = doc(db, 'projects', id);
      
      // Serialize dates before saving
      const serializedData = serializeDates(data);
      
      // Save the document
      await setDoc(projectRef, {
        ...serializedData,
        projectId: id,
        updatedAt: new Date().toISOString(),
      });
      
      return id;
    } 
    // Handle the case where the function is called with three parameters (new style)
    else if (typeof projectDataOrId === 'string' && projectData && userId) {
      const projectId = projectDataOrId;
      
      // Create a reference to the project document
      const projectRef = doc(db, 'projects', projectId);
      
      // Serialize dates before saving
      const serializedData = serializeDates(projectData);
      
      // Add metadata
      const updatedProjectData = {
        ...serializedData,
        lastModifiedBy: userId,
        updatedAt: new Date().toISOString(),
      };
      
      // Check if the document exists
      const docSnap = await getDoc(projectRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(projectRef, updatedProjectData);
      } else {
        // Create new document with additional metadata
        const newProjectData = {
          ...updatedProjectData,
          createdBy: userId,
          createdAt: new Date().toISOString(),
          projectId,
        };
        await setDoc(projectRef, newProjectData);
      }
      
      return projectId;
    } else {
      throw new Error('Invalid parameters for saveProjectRequirements');
    }
  } catch (error) {
    console.error('Error saving project requirements:', error);
    throw new Error('Failed to save project requirements');
  }
};

/**
 * Retrieves project requirements from Firestore
 */
export const getProjectRequirements = async (projectId: string): Promise<IProjectSetup | null> => {
  try {
    const projectRef = doc(db, 'projects', projectId);
    const docSnap = await getDoc(projectRef);
    
    if (docSnap.exists()) {
      // Parse dates from the retrieved data
      const data = docSnap.data();
      const parsedData = parseDates(data);
      
      // Ensure timeline dates are properly parsed
      if (parsedData.timeline) {
        // Double-check startDate
        if (parsedData.timeline.startDate && !(parsedData.timeline.startDate instanceof Date)) {
          parsedData.timeline.startDate = new Date(parsedData.timeline.startDate);
        }
        
        // Double-check targetCompletionDate
        if (parsedData.timeline.targetCompletionDate && !(parsedData.timeline.targetCompletionDate instanceof Date)) {
          parsedData.timeline.targetCompletionDate = new Date(parsedData.timeline.targetCompletionDate);
        }
        
        // Double-check milestone dates
        if (parsedData.timeline.milestones && Array.isArray(parsedData.timeline.milestones)) {
          parsedData.timeline.milestones = parsedData.timeline.milestones.map((milestone: any) => {
            if (milestone.targetDate && !(milestone.targetDate instanceof Date)) {
              milestone.targetDate = new Date(milestone.targetDate);
            }
            return milestone;
          });
        }
      }
      
      return parsedData as IProjectSetup;
    } else {
      console.log('No project found with ID:', projectId);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving project requirements:', error);
    throw new Error('Failed to retrieve project requirements');
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
 * Saves project description to Firestore
 */
export const saveProjectDescription = async (
  projectId: string,
  description: string,
  userId: string
): Promise<void> => {
  try {
    // Create a reference to the project descriptions collection
    const descriptionRef = doc(db, 'projectDescriptions', projectId);
    
    // Data to save
    const descriptionData = {
      projectId,
      description,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save the description
    await setDoc(descriptionRef, descriptionData);
  } catch (error) {
    console.error('Error saving project description:', error);
    throw new Error('Failed to save project description');
  }
};

/**
 * Retrieves project description from Firestore
 */
export const getProjectDescription = async (projectId: string): Promise<string | null> => {
  try {
    const descriptionRef = doc(db, 'projectDescriptions', projectId);
    const docSnap = await getDoc(descriptionRef);
    
    if (docSnap.exists()) {
      return docSnap.data().description;
    } else {
      console.log('No description found for project ID:', projectId);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving project description:', error);
    throw new Error('Failed to retrieve project description');
  }
};

/**
 * Saves project summary to Firestore
 */
export const saveProjectSummary = async (
  projectId: string,
  summary: string,
  userId: string
): Promise<void> => {
  try {
    // Create a reference to the project summaries collection
    const summaryRef = doc(db, 'projectSummaries', projectId);
    
    // Data to save
    const summaryData = {
      projectId,
      summary,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save the summary
    await setDoc(summaryRef, summaryData);
  } catch (error) {
    console.error('Error saving project summary:', error);
    throw new Error('Failed to save project summary');
  }
};

/**
 * Retrieves project summary from Firestore
 */
export const getProjectSummary = async (projectId: string): Promise<string | null> => {
  try {
    const summaryRef = doc(db, 'projectSummaries', projectId);
    const docSnap = await getDoc(summaryRef);
    
    if (docSnap.exists()) {
      return docSnap.data().summary;
    } else {
      console.log('No summary found for project ID:', projectId);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving project summary:', error);
    throw new Error('Failed to retrieve project summary');
  }
}; 