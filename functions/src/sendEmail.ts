import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import * as cors from 'cors';

admin.initializeApp();
const corsHandler = cors({ origin: true });

// Define the interface for the request data
interface InviteEmailData {
  email: string;
  inviteCode: string;
  organizationName: string;
  organizationCode: string;
  origin?: string;
}

// Initialize SendGrid with your API key
// The API key will be set using Firebase Functions config
export const sendInviteEmail = functions.https.onCall(async (data, context) => {
  console.log('sendInviteEmail function called');
  console.log('Auth context:', context.auth ? { uid: context.auth.uid } : 'No auth context');
  
  // Check if the user is authenticated
  if (!context.auth) {
    console.error('Authentication required');
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send invitations.'
    );
  }

  console.log('Request data:', JSON.stringify(data));
  const { email, inviteCode, organizationName, organizationCode } = data as InviteEmailData;

  if (!email || !inviteCode || !organizationName || !organizationCode) {
    console.error('Missing required parameters:', { 
      hasEmail: !!email, 
      hasInviteCode: !!inviteCode, 
      hasOrganizationName: !!organizationName, 
      hasOrganizationCode: !!organizationCode
    });
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters.'
    );
  }

  try {
    console.log('Setting SendGrid API key...');
    // Set the API key from Firebase config
    sgMail.setApiKey(functions.config().sendgrid.key);
    console.log('SendGrid API key set successfully');
    console.log('SendGrid config:', {
      key: functions.config().sendgrid.key ? 'API key exists (not shown for security)' : 'API key missing',
      from: functions.config().sendgrid.from,
      templateId: functions.config().sendgrid.template_id
    });

    // Create the signup URL with the invite code
    const signupUrl = `${data.origin || 'https://workflow-fc691.web.app'}/signup-invite/${inviteCode}`;
    const loginUrl = `${data.origin || 'https://workflow-fc691.web.app'}/login`;

    console.log(`Sending invite email to: ${email}`);
    console.log(`Invite code: ${inviteCode}`);
    console.log(`Organization: ${organizationName}`);
    console.log(`Organization code: ${organizationCode}`);
    console.log(`Signup URL: ${signupUrl}`);
    console.log(`Login URL: ${loginUrl}`);

    // Create email content
    const msg = {
      to: email,
      from: functions.config().sendgrid.from || 'noreply@workflow-app.com',
      templateId: functions.config().sendgrid.template_id,
      dynamicTemplateData: {
        organization_name: organizationName,
        invite_code: inviteCode,
        organization_code: organizationCode,
        signup_url: signupUrl,
        login_url: loginUrl
      }
    };

    // If no template ID is provided, use a basic HTML email
    if (!functions.config().sendgrid.template_id) {
      console.log('No template ID provided, using basic HTML email');
      delete (msg as any).templateId;
      Object.assign(msg, {
        subject: `You've been invited to join ${organizationName} on Workflow`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join ${organizationName}</h2>
            <p>You've been invited to join the ${organizationName} team on Workflow.</p>
            <p>Your organization code is: <strong>${organizationCode}</strong></p>
            <p>Your personal invite code is: <strong>${inviteCode}</strong></p>
            <p>Click the button below to create your account and join the organization:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${signupUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Join ${organizationName}
              </a>
            </div>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${signupUrl}</p>
            <p>Already have an account? <a href="${loginUrl}">Log in here</a> and use your organization code to join.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #777; font-size: 12px;">
              If you didn't expect this invitation, you can ignore this email.
            </p>
          </div>
        `
      });
    }

    console.log('Sending email...');
    // Send the email
    try {
      await sgMail.send(msg);
      console.log(`Email sent successfully to ${email}`);
      return { success: true, email };
    } catch (sendGridError: any) {
      console.error('SendGrid error:', sendGridError);
      console.error('SendGrid error response:', sendGridError.response ? sendGridError.response.body : 'No response body');
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send email via SendGrid',
        sendGridError instanceof Error ? sendGridError.message : String(sendGridError)
      );
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send invitation email.',
      error instanceof Error ? error.message : String(error)
    );
  }
});

// Define the interface for the HTTP request body
interface InviteEmailHttpRequest {
  email: string;
  inviteCode: string;
  organizationName: string;
  organizationCode: string;
  idToken: string;
}

// HTTP endpoint for sending emails (alternative to callable function)
export const sendInviteEmailHttp = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    console.log('sendInviteEmailHttp function called');
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    
    // Check request method
    if (req.method !== 'POST') {
      console.error('Method not allowed:', req.method);
      res.status(405).send('Method Not Allowed');
      return;
    }

    console.log('Request body:', JSON.stringify(req.body));
    
    // Get data from request body
    const { email, inviteCode, organizationName, organizationCode, idToken } = req.body as InviteEmailHttpRequest;

    if (!email || !inviteCode || !organizationName || !organizationCode || !idToken) {
      console.error('Missing required parameters:', { 
        hasEmail: !!email, 
        hasInviteCode: !!inviteCode, 
        hasOrganizationName: !!organizationName, 
        hasOrganizationCode: !!organizationCode, 
        hasIdToken: !!idToken 
      });
      res.status(400).send('Missing required parameters');
      return;
    }

    try {
      console.log('Verifying ID token...');
      // Verify the ID token
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID token verified successfully. User ID:', decodedToken.uid);
      } catch (tokenError) {
        console.error('Error verifying ID token:', tokenError);
        res.status(401).send({ 
          error: 'Failed to verify ID token',
          details: tokenError instanceof Error ? tokenError.toString() : 'Unknown error'
        });
        return;
      }

      console.log('Setting SendGrid API key...');
      // Set the API key from Firebase config
      sgMail.setApiKey(functions.config().sendgrid.key);
      console.log('SendGrid API key set successfully');

      // Create the signup URL with the invite code
      const origin = req.headers.origin || 'https://workflow-fc691.web.app';
      const signupUrl = `${origin}/signup-invite/${inviteCode}`;
      const loginUrl = `${origin}/login`;

      console.log('Creating email content...');
      console.log(`Sending invite email to: ${email}`);
      console.log(`Invite code: ${inviteCode}`);
      console.log(`Organization: ${organizationName}`);
      console.log(`Organization code: ${organizationCode}`);
      console.log(`Signup URL: ${signupUrl}`);
      console.log(`Login URL: ${loginUrl}`);
      console.log(`Template ID: ${functions.config().sendgrid.template_id}`);
      console.log(`From email: ${functions.config().sendgrid.from}`);

      // Create email content
      const msg = {
        to: email,
        from: functions.config().sendgrid.from || 'noreply@workflow-app.com',
        templateId: functions.config().sendgrid.template_id,
        dynamicTemplateData: {
          organization_name: organizationName,
          invite_code: inviteCode,
          organization_code: organizationCode,
          signup_url: signupUrl,
          login_url: loginUrl
        }
      };

      // If no template ID is provided, use a basic HTML email
      if (!functions.config().sendgrid.template_id) {
        console.log('No template ID provided, using basic HTML email');
        delete (msg as any).templateId;
        Object.assign(msg, {
          subject: `You've been invited to join ${organizationName} on Workflow`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You've been invited to join ${organizationName}</h2>
              <p>You've been invited to join the ${organizationName} team on Workflow.</p>
              <p>Your organization code is: <strong>${organizationCode}</strong></p>
              <p>Your personal invite code is: <strong>${inviteCode}</strong></p>
              <p>Click the button below to create your account and join the organization:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${signupUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                  Join ${organizationName}
                </a>
              </div>
              <p>Or copy and paste this URL into your browser:</p>
              <p>${signupUrl}</p>
              <p>Already have an account? <a href="${loginUrl}">Log in here</a> and use your organization code to join.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="color: #777; font-size: 12px;">
                If you didn't expect this invitation, you can ignore this email.
              </p>
            </div>
          `
        });
      }

      console.log('Sending email...');
      // Send the email
      try {
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${email}`);
        res.status(200).send({ success: true, email });
      } catch (sendGridError: any) {
        console.error('SendGrid error:', sendGridError);
        console.error('SendGrid error response:', sendGridError.response ? sendGridError.response.body : 'No response body');
        res.status(500).send({ 
          error: 'Failed to send email via SendGrid',
          details: sendGridError instanceof Error ? sendGridError.toString() : 'Unknown error',
          response: sendGridError.response ? sendGridError.response.body : null
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send({ 
        error: 'Failed to send invitation email',
        details: error instanceof Error ? error.toString() : 'Unknown error'
      });
    }
  });
}); 