import { Node, Edge } from 'reactflow';
import { doc, setDoc, getDoc, serverTimestamp, FieldValue, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface OrganizationChart {
  id?: string;
  name: string;
  nodes: any[];
  edges: any[];
  createdBy: string;
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
  metadata?: {
    version: number;
    lastModifiedBy: string;
  };
}

// Helper function to clean object by removing undefined values
const cleanObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        cleaned[key] = cleanObject(obj[key]);
      } else {
        // Replace undefined with null for Firestore
        cleaned[key] = null;
      }
    }
    return cleaned;
  }
  
  return obj;
};

export const saveOrganizationChart = async (
  organizationId: string,
  chart: Partial<OrganizationChart>,
  userId: string
): Promise<void> => {
  try {
    console.log(`Saving organization chart for org: ${organizationId}, user: ${userId}`);
    
    if (!organizationId || !userId) {
      throw new Error('Missing required parameters: organizationId or userId');
    }

    // Clean the chart data to remove undefined values
    const cleanedChart = cleanObject(chart);
    
    // Prepare data for saving
    const saveData = {
      ...cleanedChart,
      createdAt: chart.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: {
        ...(cleanedChart.metadata || {}),
        version: (cleanedChart.metadata?.version || 0) + 1,
        lastModifiedBy: userId,
      }
    };

    console.log(`Saving organization chart: ${saveData.name}, nodes: ${saveData.nodes?.length}, edges: ${saveData.edges?.length}`);

    // Save to Firestore
    const orgDocRef = doc(db, 'organizations', organizationId);
    await setDoc(orgDocRef, saveData, { merge: true });

    console.log('Organization chart saved successfully');
  } catch (error) {
    console.error('Error saving organization chart:', error);
    throw new Error(`Failed to save organization chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const loadOrganizationChart = async (organizationId: string): Promise<OrganizationChart | null> => {
  try {
    console.log(`Loading organization chart for org: ${organizationId}`);
    
    if (!organizationId) {
      throw new Error('Missing required parameter: organizationId');
    }

    const orgDocRef = doc(db, 'organizations', organizationId);
    const orgDoc = await getDoc(orgDocRef);

    if (!orgDoc.exists()) {
      console.log('No organization chart found');
      return null;
    }

    const orgData = orgDoc.data() as OrganizationChart;
    console.log(`Loaded organization chart: ${orgData.name}, nodes: ${orgData.nodes?.length}, edges: ${orgData.edges?.length}`);
    
    return orgData;
  } catch (error) {
    console.error('Error loading organization chart:', error);
    throw new Error(`Failed to load organization chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 