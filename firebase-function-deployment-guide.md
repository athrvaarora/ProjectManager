# Deploying Firebase Functions for Email Sending

This guide will walk you through the process of deploying the Firebase Cloud Functions for email sending with SendGrid.

## Prerequisites

1. Make sure you have the Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Make sure you're logged in to Firebase:
   ```bash
   firebase login
   ```

## Step 1: Install Dependencies

Navigate to the functions directory and install the dependencies:

```bash
cd functions
npm install
```

## Step 2: Configure SendGrid API Key

Set your SendGrid API key and other configuration values using the Firebase CLI:

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY" sendgrid.from="noreply@workflow-app.com" sendgrid.template_id="your-template-id"
```

Replace the values with your actual SendGrid API key, sender email, and template ID.

## Step 3: Build the Functions

Build the TypeScript functions:

```bash
cd functions
npm run build
```

## Step 4: Deploy the Functions

Deploy your functions to Firebase:

```bash
firebase deploy --only functions
```

## Step 5: Verify Deployment

After deployment, you should see output similar to:

```
✔  functions[sendInviteEmail(us-central1)]: Successful create operation.
✔  functions[sendInviteEmailHttp(us-central1)]: Successful create operation.
```

You can verify the functions in the Firebase Console under "Functions" section.

## Testing the Functions

You can test the functions by creating an organization chart and inviting team members. The emails should now be sent through the Firebase Cloud Functions, bypassing any CORS restrictions.

## Troubleshooting

If you encounter any issues:

1. Check the Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. Make sure your SendGrid API key has the necessary permissions to send emails.

3. Verify that your sender email is verified in SendGrid.

4. Check that the template ID is correct and the template contains the expected dynamic fields.

## Security Considerations

The Firebase Cloud Functions are secured with Firebase Authentication. Only authenticated users can call the `sendInviteEmail` function. The HTTP endpoint (`sendInviteEmailHttp`) requires a valid Firebase ID token to be included in the request body.

## Updating the Functions

If you need to make changes to the functions:

1. Edit the code in the `functions/src` directory
2. Build the functions: `npm run build`
3. Deploy the updated functions: `firebase deploy --only functions` 