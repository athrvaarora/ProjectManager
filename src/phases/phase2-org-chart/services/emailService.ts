/**
 * Email service for sending invitations
 * 
 * Note: In a production environment, this would connect to a backend service
 * that handles email sending. For this demo, we'll just log the emails.
 */

/**
 * Sends an invitation email to a team member
 * 
 * @param email The recipient's email address
 * @param inviteCode The invitation code
 * @param organizationName The name of the organization
 */
export const sendInviteEmail = async (
  email: string,
  inviteCode: string,
  organizationName: string
): Promise<void> => {
  try {
    console.log(`Sending invite email to: ${email}`);
    console.log(`Invite code: ${inviteCode}`);
    console.log(`Organization: ${organizationName}`);
    
    // In a real implementation, this would call a backend API to send the email
    // For now, we'll just simulate a successful email send
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`Email sent successfully to ${email}`);
    
    return Promise.resolve();
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw new Error(`Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 