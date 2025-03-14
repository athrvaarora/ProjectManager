# Email Sending Troubleshooting Guide

This guide will help you troubleshoot issues with sending invitation emails in the Workflow application.

## Overview

The application uses Firebase Cloud Functions to send emails via SendGrid. There are three methods of sending emails, in order of preference:

1. Firebase Cloud Function (callable) - `sendInviteEmail`
2. Firebase Cloud Function (HTTP endpoint) - `sendInviteEmailHttp`
3. Direct SendGrid API or CORS proxy (fallback)

## Prerequisites

- You must be logged in to the application to send invitation emails
- Your Firebase project must have the Cloud Functions deployed
- SendGrid API key must be configured in Firebase Functions config

## Common Issues and Solutions

### 1. Authentication Issues

**Symptoms:**
- Error message: "You must be logged in to send invitations"
- Error message: "Failed to get Firebase ID token"

**Solutions:**
- Make sure you are logged in to the application
- Try refreshing the page and logging in again
- Check browser console for authentication errors

### 2. SendGrid Configuration Issues

**Symptoms:**
- Error message: "Failed to send email via SendGrid"
- No error message, but emails are not received

**Solutions:**
- Verify that the SendGrid API key is correctly configured in Firebase Functions
- Check that the SendGrid template ID is valid
- Verify that the sender email is verified in SendGrid

To check the SendGrid configuration in Firebase Functions:
```bash
firebase functions:config:get
```

The output should include:
```json
{
  "sendgrid": {
    "from": "your-verified-email@example.com",
    "key": "SG.your-sendgrid-api-key",
    "template_id": "d-your-template-id"
  }
}
```

### 3. Firebase Functions Deployment Issues

**Symptoms:**
- Error message: "Function not found"
- Error message: "Failed to send invitation email"

**Solutions:**
- Make sure the Firebase Functions are deployed correctly
- Check the Firebase Functions logs for errors
- Redeploy the functions if necessary

To check the Firebase Functions logs:
```bash
firebase functions:log --only sendInviteEmail
firebase functions:log --only sendInviteEmailHttp
```

### 4. CORS Issues

**Symptoms:**
- Error message: "CORS error" or "Network Error"
- Error in browser console related to CORS

**Solutions:**
- This is expected when using the direct SendGrid API fallback
- The application should automatically fall back to the Firebase Functions
- If all methods fail, check the browser console for detailed error messages

## Testing the Email Functionality

### Method 1: Using the Application

1. Log in to the application
2. Create an organization chart
3. Add team members with valid email addresses
4. Click "Save & Continue" to save the chart and send invitations
5. Check the browser console for logs related to email sending

### Method 2: Using the Test Script

1. Install dependencies:
```bash
npm install axios
```

2. Get a valid Firebase ID token:
   - Log in to the application
   - Open the browser console
   - Run the following code:
```javascript
const auth = firebase.auth();
auth.currentUser.getIdToken(true).then(token => {
  console.log('Firebase ID Token:', token);
});
```

3. Update the `test-email-function.js` script with your Firebase ID token and email address

4. Run the test script:
```bash
node test-email-function.js
```

### Method 3: Using curl

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "inviteCode": "test123",
    "organizationName": "Test Organization",
    "organizationCode": "testorg",
    "idToken": "your-firebase-id-token",
    "origin": "https://workflow-fc691.web.app"
  }' \
  https://us-central1-workflow-fc691.cloudfunctions.net/sendInviteEmailHttp
```

## Checking Firebase Functions Logs

To check the logs for the Firebase Functions:

```bash
firebase functions:log --only sendInviteEmail
firebase functions:log --only sendInviteEmailHttp
```

Look for error messages or warnings in the logs that might indicate the cause of the issue.

## Verifying SendGrid API Key

To verify that the SendGrid API key is working correctly:

```bash
curl -X "GET" "https://api.sendgrid.com/v3/templates" \
  -H "Authorization: Bearer YOUR_SENDGRID_API_KEY" \
  -H "Content-Type: application/json"
```

Replace `YOUR_SENDGRID_API_KEY` with your actual SendGrid API key. If the API key is valid, you should receive a JSON response with your templates.

## Conclusion

If you've followed all the troubleshooting steps and are still experiencing issues, please check the browser console for detailed error messages and the Firebase Functions logs for any errors on the server side. If the issue persists, you may need to contact support for further assistance. 