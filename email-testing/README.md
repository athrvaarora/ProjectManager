# Email Functionality Testing Tools

This directory contains several tools to help test and troubleshoot the email sending functionality in the Workflow application.

## Overview

The Workflow application uses Firebase Cloud Functions to send invitation emails via SendGrid. These tools will help you test each component of the email sending process to identify and fix any issues.

## Available Tools

### 1. `verify-sendgrid.js`

This script verifies that your SendGrid API key is valid and working correctly by:
- Testing the API key by listing templates
- Verifying that the specified template ID exists
- Sending a test email using the SendGrid API directly

**Usage:**
```bash
npm install axios
node verify-sendgrid.js
```

### 2. `test-sendgrid-template.js`

This script tests sending an email using SendGrid's dynamic templates without going through Firebase Functions.

**Usage:**
```bash
npm install @sendgrid/mail
node test-sendgrid-template.js
```

### 3. `test-firebase-functions.js`

This script tests both the HTTP endpoint and callable Firebase Functions for sending invitation emails.

**Usage:**
```bash
npm install axios firebase
# Edit the script to add your Firebase ID token
node test-firebase-functions.js
```

### 4. `test-email-function.js`

A simpler script that tests only the HTTP endpoint Firebase Function for sending emails.

**Usage:**
```bash
npm install axios
# Edit the script to add your Firebase ID token
node test-email-function.js
```

### 5. `check-sender-verification.js`

This script checks if your sender email is verified in SendGrid, which is required for sending emails.

**Usage:**
```bash
npm install axios
node check-sender-verification.js
```

## Troubleshooting Guides

We've also included two comprehensive guides to help you troubleshoot email sending issues:

### 1. `EMAIL-TROUBLESHOOTING.md`

A detailed guide covering common issues and solutions for email sending problems, including:
- Authentication issues
- SendGrid configuration issues
- Firebase Functions deployment issues
- CORS issues
- Testing methods
- Checking logs

### 2. `TESTING-FIREBASE-FUNCTIONS.md`

A guide specifically focused on testing Firebase Cloud Functions for email sending, including:
- Overview of the implementation
- Testing in development mode
- Troubleshooting steps
- Expected behavior
- Common issues and solutions

## Getting a Firebase ID Token

Several of these tools require a valid Firebase ID token. To get one:

1. Log in to the Workflow application
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Run the following code:
```javascript
const auth = firebase.auth();
auth.currentUser.getIdToken(true).then(token => {
  console.log('Firebase ID Token:', token);
});
```
4. Copy the token and use it in the test scripts

## Checking Firebase Functions Logs

To check the logs for the Firebase Functions:

```bash
firebase functions:log --only sendInviteEmail
firebase functions:log --only sendInviteEmailHttp
```

## Checking SendGrid Configuration

To check the SendGrid configuration in Firebase Functions:

```bash
firebase functions:config:get
```

The output should include your SendGrid API key, template ID, and sender email.

## Recommended Testing Sequence

For systematic troubleshooting, follow this testing sequence:

1. Run `check-sender-verification.js` to ensure your sender email is verified
2. Run `verify-sendgrid.js` to check your API key and template ID
3. Run `test-sendgrid-template.js` to test sending an email directly via SendGrid
4. Run `test-firebase-functions.js` to test the Firebase Functions
5. Check the Firebase Functions logs for any errors

## Next Steps

If you're still experiencing issues after using these tools, consider:

1. Checking the Firebase Functions logs for detailed error messages
2. Verifying that your SendGrid account is in good standing
3. Checking that your sender email is verified in SendGrid
4. Reviewing the SendGrid API documentation for any changes or issues
5. Updating the Firebase Functions code to include more detailed error logging 