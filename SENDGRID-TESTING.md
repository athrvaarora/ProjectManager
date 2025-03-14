# Testing SendGrid Email Sending

This guide explains how to test SendGrid email sending in your development environment.

## Setup

1. Make sure your `.env` file has the following SendGrid configuration:

```
REACT_APP_SENDGRID_API_KEY=your-sendgrid-api-key
REACT_APP_SENDGRID_TEMPLATE_ID=your-template-id
REACT_APP_SENDGRID_FROM_EMAIL=your-verified-sender-email
```

2. Install the required dependencies for the CORS proxy:

```bash
npm install express cors axios body-parser
```

## Running the CORS Proxy

To bypass CORS restrictions when testing SendGrid email sending from the browser, you need to run a local CORS proxy server:

```bash
npm run proxy
```

This will start the proxy server on http://localhost:3001.

## How It Works

1. The application will attempt to send real emails using SendGrid.
2. In development mode, it will use the local CORS proxy to bypass browser restrictions.
3. The proxy server forwards the request to SendGrid's API with the proper headers.
4. The invitation status dialog will show the actual status of the email sending.

## Troubleshooting

If you see "Failed to send invitation" errors:

1. Make sure the CORS proxy server is running (`npm run proxy`).
2. Check that your SendGrid API key is valid and has the necessary permissions.
3. Verify that your sender email is verified in SendGrid.
4. Check the browser console for detailed error messages.

## Production Deployment

For production, it's recommended to implement a server-side solution for sending emails, such as:

1. Firebase Cloud Functions (see `firebase-email-function-guide.md`)
2. A dedicated backend API
3. A serverless function (AWS Lambda, Vercel Functions, etc.)

This will provide better security and reliability for email sending in production. 