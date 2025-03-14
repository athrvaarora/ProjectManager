# Firebase Cloud Function for SendGrid Email Sending

This guide will help you implement a Firebase Cloud Function to handle email sending with SendGrid. This is the recommended approach for sending emails from your application, as it avoids the CORS and security issues of calling the SendGrid API directly from the browser.

## Step 1: Set Up Firebase Cloud Functions

1. Install the Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase Functions in your project:
   ```bash
   firebase login
   firebase init functions
   ```

3. Choose JavaScript or TypeScript when prompted.

## Step 2: Install Dependencies

Navigate to the functions directory and install the required dependencies:

```bash
cd functions
npm install @sendgrid/mail cors
```

## Step 3: Create the Cloud Function

Create a new file in the `functions/src` directory called `sendEmail.js` or `sendEmail.ts` (depending on whether you chose JavaScript or TypeScript):

```typescript
// functions/src/sendEmail.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';
import * as cors from 'cors';

admin.initializeApp();
const corsHandler = cors({ origin: true });

// Initialize SendGrid with your API key
sgMail.setApiKey(functions.config().sendgrid.key);

export const sendInviteEmail = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send invitations.'
    );
  }

  const { email, inviteCode, organizationName, organizationCode } = data;

  if (!email || !inviteCode || !organizationName || !organizationCode) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters.'
    );
  }

  try {
    // Create the signup URL with the invite code
    const signupUrl = `${data.origin || 'https://your-app-domain.com'}/signup-invite/${inviteCode}`;
    const loginUrl = `${data.origin || 'https://your-app-domain.com'}/login`;

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

    // Send the email
    await sgMail.send(msg);

    return { success: true, email };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send invitation email.',
      error
    );
  }
});

// HTTP endpoint for sending emails (alternative to callable function)
export const sendInviteEmailHttp = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    // Check request method
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Get data from request body
    const { email, inviteCode, organizationName, organizationCode, idToken } = req.body;

    if (!email || !inviteCode || !organizationName || !organizationCode || !idToken) {
      res.status(400).send('Missing required parameters');
      return;
    }

    try {
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Create the signup URL with the invite code
      const origin = req.headers.origin || 'https://your-app-domain.com';
      const signupUrl = `${origin}/signup-invite/${inviteCode}`;
      const loginUrl = `${origin}/login`;

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

      // Send the email
      await sgMail.send(msg);

      res.status(200).send({ success: true, email });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send({ 
        error: 'Failed to send invitation email',
        details: error.toString()
      });
    }
  });
});
```

## Step 4: Update the index.ts File

Update your `functions/src/index.ts` file to export the new functions:

```typescript
import * as functions from 'firebase-functions';
import { sendInviteEmail, sendInviteEmailHttp } from './sendEmail';

// Export the functions
exports.sendInviteEmail = sendInviteEmail;
exports.sendInviteEmailHttp = sendInviteEmailHttp;
```

## Step 5: Set Environment Variables

Set your SendGrid API key and other configuration values using the Firebase CLI:

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY" sendgrid.from="noreply@your-domain.com" sendgrid.template_id="your-template-id"
```

## Step 6: Deploy the Functions

Deploy your functions to Firebase:

```bash
firebase deploy --only functions
```

## Step 7: Update Your Client Code

Now, update your client-side code to use the Firebase Cloud Function instead of calling SendGrid directly:

```typescript
// src/phases/phase2-org-chart/services/emailService.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

export const sendInviteEmail = async (
  email: string,
  inviteCode: string,
  organizationName: string,
  organizationCode: string
): Promise<void> => {
  try {
    console.log(`Sending invite email to: ${email}`);
    
    // Get the Firebase Functions instance
    const functions = getFunctions();
    
    // Create a reference to the Cloud Function
    const sendEmailFunction = httpsCallable(functions, 'sendInviteEmail');
    
    // Call the function with the required data
    const result = await sendEmailFunction({
      email,
      inviteCode,
      organizationName,
      organizationCode,
      origin: window.location.origin
    });
    
    console.log('Email sent successfully:', result.data);
    return Promise.resolve();
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw new Error(`Failed to send invitation email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
```

## Conclusion

By implementing this Firebase Cloud Function, you'll be able to securely send emails from your application without exposing your SendGrid API key or running into CORS issues. The function acts as a secure intermediary between your client application and the SendGrid API.

Remember to update your Firebase security rules to ensure that only authorized users can call this function. 