import { customAlphabet } from 'nanoid';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CODE_LENGTH = 8;

/**
 * Generates a random alphanumeric invite code
 * 
 * @param length The length of the code (default: 8)
 * @returns A random alphanumeric code
 */
export const generateInviteCode = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
};

/**
 * Generates a random organization code
 * This code will be shared by all members of the same organization
 * 
 * @param length The length of the code (default: 10)
 * @returns A random organization code
 */
export const generateOrganizationCode = (length: number = 10): string => {
  // Use nanoid for more secure random code generation
  const nanoid = customAlphabet(ALPHABET, length);
  return nanoid();
};

/**
 * Validates an organization code format
 * 
 * @param code The organization code to validate
 * @returns True if the code is valid, false otherwise
 */
export const isValidOrganizationCode = (code: string): boolean => {
  // Organization codes should be alphanumeric and of the correct length
  const regex = new RegExp(`^[${ALPHABET}]{10}$`);
  return regex.test(code);
}; 