# Firebase Cloud Functions for Workflow App

This directory contains Firebase Cloud Functions for the Workflow application, specifically for sending emails via SendGrid.

## Functions

### `sendInviteEmail`

A callable function that sends an invitation email to a team member. This function is secured with Firebase Authentication and can only be called by authenticated users.

### `sendInviteEmailHttp`

An HTTP endpoint that sends an invitation email to a team member. This endpoint requires a valid Firebase ID token to be included in the request body.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Run the emulator:
   ```bash
   npm run serve
   ```

## Deployment

1. Set the SendGrid configuration:
   ```bash
   firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY" sendgrid.from="noreply@workflow-app.com" sendgrid.template_id="your-template-id"
   ```

2. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

## Configuration

The functions use the following configuration values:

- `sendgrid.key`: Your SendGrid API key
- `sendgrid.from`: The email address to send from
- `sendgrid.template_id`: The SendGrid template ID to use

You can set these values using the Firebase CLI:

```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from="noreply@workflow-app.com"
firebase functions:config:set sendgrid.template_id="your-template-id"
```

## Logs

You can view the function logs using the Firebase CLI:

```bash
firebase functions:log
``` 