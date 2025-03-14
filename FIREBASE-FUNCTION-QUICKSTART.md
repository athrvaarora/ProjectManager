# Firebase Function for Email Sending - Quick Start Guide

This guide provides quick steps to deploy the Firebase Cloud Function for email sending.

## Quick Deployment Steps

1. **Install dependencies in the functions directory:**

```bash
cd functions
npm install
```

2. **Set your SendGrid configuration:**

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from="noreply@workflow-app.com"
firebase functions:config:set sendgrid.template_id="your-template-id"
```

Replace the values with your actual SendGrid API key, sender email, and template ID.

3. **Build and deploy the functions:**

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Verifying Deployment

After successful deployment, you should see output similar to:

```
✔  functions[sendInviteEmail(us-central1)]: Successful create operation.
✔  functions[sendInviteEmailHttp(us-central1)]: Successful create operation.
```

## Testing

Create an organization chart and invite team members. The emails should now be sent through the Firebase Cloud Function, bypassing any CORS restrictions.

## Troubleshooting

If you encounter issues:

- Check Firebase Function logs: `firebase functions:log`
- Verify your SendGrid API key and permissions
- Ensure your sender email is verified in SendGrid
- Check that the template ID is correct

For more detailed instructions, see the [Firebase Function Deployment Guide](./firebase-function-deployment-guide.md). 