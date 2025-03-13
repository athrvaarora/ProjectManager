import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../phases/phase1-auth/utils/firebaseConfig';

export const getOrganizationChart = async (organizationId: string) => {
  try {
    const orgRef = doc(db, 'organizations', organizationId);
    const orgDoc = await getDoc(orgRef);

    if (!orgDoc.exists()) {
      throw new Error('Organization not found');
    }

    return orgDoc.data();
  } catch (error) {
    console.error('Error getting organization chart:', error);
    throw new Error('Failed to get organization chart');
  }
}; 