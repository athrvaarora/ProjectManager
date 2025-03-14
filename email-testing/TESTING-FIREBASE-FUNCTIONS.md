# Testing Firebase Cloud Functions for Email Sending

This guide explains how to test the Firebase Cloud Functions for email sending in your application.

## Overview

We've implemented Firebase Cloud Functions to handle email sending for organization invitations. This solves the CORS restrictions you were experiencing in the browser and provides a more secure and reliable way to send emails.

## Testing in Development Mode

To test the email sending functionality in development mode:

1. Make sure you're logged in to your application (Firebase Authentication is required).

2. Create an organization chart and add team members with valid email addresses.

3. Click "Save & Continue" to save the chart and send invitations.

4. The application will attempt to send emails using the following methods, in order:
   - Firebase Cloud Function (callable)
   - Firebase Cloud Function (HTTP endpoint)
   - CORS proxy (fallback)
   - Direct SendGrid API (fallback, likely to fail due to CORS)

5. Check the browser console for detailed logs about the email sending process.

## Troubleshooting

If you encounter issues with email sending:

### 1. Check Firebase Function Logs

```bash
firebase functions:log
```

This will show you any errors that occurred in the Firebase Functions.

### 2. Verify Firebase Authentication

Make sure you're properly authenticated in the application. The Firebase Functions require authentication to send emails.

### 3. Check SendGrid Configuration

Verify that your SendGrid configuration is correct:

```bash
firebase functions:config:get
```

This should show your SendGrid configuration:

```json
{
  "sendgrid": {
    "key": "your-api-key",
    "from": "your-sender-email",
    "template_id": "your-template-id"
  }
}
```

### 4. Test the HTTP Endpoint Directly

You can test the HTTP endpoint directly using a tool like Postman or curl:

```bash
curl -X POST https://us-central1-workflow-fc691.cloudfunctions.net/sendInviteEmailHttp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recipient@example.com",
    "inviteCode": "ABC123",
    "organizationName": "Test Organization",
    "organizationCode": "ORG123",
    "idToken": "your-firebase-id-token",
    "origin": "http://localhost:3000"
  }'
```

Replace `your-firebase-id-token` with a valid Firebase ID token. You can get this by running the following in your browser console while logged in:

```javascript
await firebase.auth().currentUser.getIdToken()
```

## Expected Behavior

When everything is working correctly:

1. The application will successfully send emails using the Firebase Cloud Function.
2. You'll see success messages in the browser console.
3. Recipients will receive invitation emails with the correct organization code and invite code.
4. The invitation confirmation dialog will show successful email sending status.

## Common Issues

1. **Authentication Errors**: Make sure you're logged in and have a valid Firebase ID token.

2. **SendGrid API Key Issues**: Verify that your SendGrid API key is valid and has the necessary permissions.

3. **SendGrid Sender Email**: Ensure your sender email is verified in SendGrid.

4. **CORS Issues**: These should be resolved by using the Firebase Cloud Functions, but if you're still seeing CORS errors, check that you're using the functions correctly.

5. **Function Deployment**: Make sure your functions are properly deployed. You can check this in the Firebase Console under "Functions" section.

## Conclusion

Using Firebase Cloud Functions for email sending provides a secure and reliable way to send emails from your application. It avoids CORS issues and keeps your SendGrid API key secure.

If you continue to experience issues, please check the Firebase Function logs for detailed error messages. 