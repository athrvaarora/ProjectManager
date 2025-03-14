/**
 * Email service for sending invitations using Firebase Cloud Functions
 * 
 * This service uses a Firebase Cloud Function to send emails via SendGrid,
 * which avoids CORS issues and provides better security.
 */
import axios from 'axios';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// SendGrid API endpoint (used as fallback)
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
// Local CORS proxy endpoint (for development fallback)
const CORS_PROXY_URL = 'http://localhost:3001/sendgrid-proxy';
// Firebase Function URL (for HTTP endpoint)
const FIREBASE_FUNCTION_URL = 'https://us-central1-workflow-fc691.cloudfunctions.net/sendInviteEmailHttp';

/**
 * Sends an invitation email to a team member using Firebase Cloud Functions
 * 
 * @param email The recipient's email address
 * @param inviteCode The invitation code
 * @param organizationName The name of the organization
 * @param organizationCode The organization code (same for all members of the org)
 */
export const sendInviteEmail = async (
  email: string,
  inviteCode: string,
  organizationName: string,
  organizationCode: string
): Promise<void> => {
  try {
    console.log('=== SENDING INVITATION EMAIL ===');
    console.log(`Sending invite email to: ${email}`);
    console.log(`Invite code: ${inviteCode}`);
    console.log(`Organization: ${organizationName}`);
    console.log(`Organization code: ${organizationCode}`);
    console.log('Origin:', window.location.origin);
    
    // Get the Firebase Functions instance
    console.log('Getting Firebase Functions instance...');
    const functions = getFunctions();
    
    // Create a reference to the Cloud Function
    console.log('Creating reference to sendInviteEmail Cloud Function...');
    const sendEmailFunction = httpsCallable(functions, 'sendInviteEmail');
    
    // Call the function with the required data
    console.log('Calling Firebase Function with data...');
    const result = await sendEmailFunction({
      email,
      inviteCode,
      organizationName,
      organizationCode,
      origin: window.location.origin
    });
    
    console.log('Email sent successfully via Firebase Function:', result.data);
    return Promise.resolve();
  } catch (firebaseFunctionError) {
    console.error('Firebase Function error:', firebaseFunctionError);
    console.error('Error details:', JSON.stringify(firebaseFunctionError));
    
    // If the Firebase Function fails, try the HTTP endpoint
    try {
      console.warn('Falling back to Firebase Function HTTP endpoint...');
      await sendEmailViaHttpEndpoint(email, inviteCode, organizationName, organizationCode);
      return Promise.resolve();
    } catch (httpEndpointError) {
      console.error('Firebase Function HTTP endpoint error:', httpEndpointError);
      console.error('HTTP endpoint error details:', 
        httpEndpointError instanceof Error ? httpEndpointError.message : JSON.stringify(httpEndpointError));
      
      if (axios.isAxiosError(httpEndpointError) && httpEndpointError.response) {
        console.error('HTTP endpoint response:', httpEndpointError.response.data);
      }
      
      // If the HTTP endpoint fails, try the fallback methods
      try {
        console.warn('Falling back to direct SendGrid API or CORS proxy...');
        await sendEmailFallback(email, inviteCode, organizationName, organizationCode);
        return Promise.resolve();
      } catch (fallbackError) {
        console.error('All email sending methods failed:', fallbackError);
        console.error('Fallback error details:', 
          fallbackError instanceof Error ? fallbackError.message : JSON.stringify(fallbackError));
        
        throw new Error(`Failed to send invitation email: ${
          fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
        }`);
      }
    }
  }
};

/**
 * Sends an email using the Firebase Function HTTP endpoint
 */
const sendEmailViaHttpEndpoint = async (
  email: string,
  inviteCode: string,
  organizationName: string,
  organizationCode: string
): Promise<void> => {
  try {
    console.log('=== SENDING EMAIL VIA HTTP ENDPOINT ===');
    // Get the Firebase ID token from the current user
    console.log('Getting Firebase auth instance...');
    const auth = getAuth();
    const user = auth.currentUser;
    
    console.log('Current user:', user ? `User ID: ${user.uid}` : 'No user logged in');
    
    if (!user) {
      throw new Error('No user is currently logged in. User must be logged in to send invitations.');
    }
    
    console.log('Getting ID token...');
    const idToken = await user.getIdToken(true); // Force refresh the token
    
    if (!idToken) {
      throw new Error('Failed to get Firebase ID token. User must be logged in.');
    }
    
    console.log('ID token obtained successfully');
    console.log('Sending request to Firebase Function HTTP endpoint...');
    
    // Send the request to the Firebase Function HTTP endpoint
    const response = await axios.post(FIREBASE_FUNCTION_URL, {
      email,
      inviteCode,
      organizationName,
      organizationCode,
      idToken,
      origin: window.location.origin
    });
    
    console.log('Email sent successfully via Firebase Function HTTP endpoint:', response.data);
    return Promise.resolve();
  } catch (error) {
    console.error('Error sending email via Firebase Function HTTP endpoint:', error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('HTTP response status:', error.response.status);
      console.error('HTTP response data:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * Fallback method for sending emails if the Firebase Function fails
 * This uses either the CORS proxy (in development) or direct API call (in production)
 */
const sendEmailFallback = async (
  email: string,
  inviteCode: string,
  organizationName: string,
  organizationCode: string
): Promise<void> => {
  const apiKey = process.env.REACT_APP_SENDGRID_API_KEY;
  const templateId = process.env.REACT_APP_SENDGRID_TEMPLATE_ID || 'd-4976e0d3f8ed481d8a06df181d47a85e';
  const fromEmail = process.env.REACT_APP_SENDGRID_FROM_EMAIL || 'athrvaarora259@gmail.com';
  
  console.log(`SendGrid API Key exists: ${!!apiKey}`);
  console.log(`SendGrid Template ID: ${templateId}`);
  console.log(`SendGrid From Email: ${fromEmail}`);
  
  if (!apiKey) {
    throw new Error('SendGrid API key is not configured. Please add it to your .env file.');
  }
  
  // Create the signup URL with the invite code
  const signupUrl = `${window.location.origin}/signup-invite/${inviteCode}`;
  const loginUrl = `${window.location.origin}/login`;
  
  console.log(`Signup URL: ${signupUrl}`);
  console.log(`Login URL: ${loginUrl}`);
  
  // Create email content
  const emailContent = {
    personalizations: [
      {
        to: [{ email }],
        subject: `You've been invited to join ${organizationName} on Workflow`,
        dynamic_template_data: {
          organization_name: organizationName,
          invite_code: inviteCode,
          organization_code: organizationCode,
          signup_url: signupUrl,
          login_url: loginUrl
        }
      }
    ],
    from: {
      email: fromEmail,
      name: 'Workflow App'
    },
    template_id: templateId
  };
  
  console.log('Sending email with content:', JSON.stringify(emailContent, null, 2));
  
  try {
    let response;
    
    // In development, use the CORS proxy
    if (process.env.NODE_ENV === 'development') {
      console.log('Using CORS proxy for development');
      // Check if the CORS proxy is running
      try {
        await axios.get(CORS_PROXY_URL.replace('/sendgrid-proxy', ''));
        console.log('CORS proxy is running');
        
        // Send via CORS proxy
        response = await axios.post(CORS_PROXY_URL, emailContent, {
          headers: {
            'Content-Type': 'application/json',
            'sendgrid-api-key': apiKey
          }
        });
        
        console.log(`Email sent successfully via CORS proxy to ${email}. Status: ${response.status}`);
      } catch (proxyError: unknown) {
        console.error('CORS proxy error or not running:', 
          proxyError instanceof Error ? proxyError.message : String(proxyError));
        throw new Error(`CORS proxy error: ${
          proxyError instanceof Error ? proxyError.message : String(proxyError)
        }. Make sure the proxy server is running (node cors-proxy-server.js)`);
      }
    } else {
      // In production, try direct API call (may fail due to CORS)
      console.log('Using direct SendGrid API call');
      response = await axios.post(SENDGRID_API_URL, emailContent, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Email sent successfully to ${email}. Status: ${response.status}`);
    }
    
    return Promise.resolve();
  } catch (apiError) {
    console.error('SendGrid API Error:', apiError);
    if (axios.isAxiosError(apiError)) {
      console.error('Axios error details:', {
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        data: apiError.response?.data,
        headers: apiError.response?.headers,
        message: apiError.message
      });
      
      // If we get a CORS error, provide a helpful message
      if (apiError.message.includes('Network Error') || apiError.message.includes('CORS')) {
        if (process.env.NODE_ENV === 'development') {
          console.error('CORS ERROR: Make sure the CORS proxy server is running. Run: node cors-proxy-server.js');
          throw new Error('Email sending failed: CORS proxy server is not running. Run: node cors-proxy-server.js');
        } else {
          console.error('CORS ERROR: SendGrid API cannot be called directly from the browser in production. Use a server-side function instead.');
          throw new Error('Email sending failed due to CORS restrictions. Use a server-side function in production.');
        }
      }
    }
    throw new Error(`Failed to send invitation email: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
  }
}; 