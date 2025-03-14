# Firebase Permissions Fix

## Issue
The application was encountering a "Missing or insufficient permissions" error when trying to save the organization chart. This error occurred because the Firestore security rules were not properly configured to allow users to create and update organization documents.

## Root Cause
The issue was in the `isOrgCreator` function in the Firestore rules. When a user was trying to create a new organization, the function was trying to check if the user was the creator by reading the existing document. However, since the document didn't exist yet (as it was being created), this check would fail.

```javascript
// Original problematic function
function isOrgCreator(orgId) {
  return isSignedIn() && 
    get(/databases/$(database)/documents/organizations/$(orgId)).data.createdBy == request.auth.uid;
}
```

## Solution
The solution was to update the `isOrgCreator` function to handle the case where the organization document doesn't exist yet:

```javascript
// Updated function
function isOrgCreator(orgId) {
  return isSignedIn() && (
    // Check if the document exists and user is creator
    (exists(/databases/$(database)/documents/organizations/$(orgId)) && 
     get(/databases/$(database)/documents/organizations/$(orgId)).data.createdBy == request.auth.uid) ||
    // Or if the document doesn't exist yet and orgId matches user ID (new org creation)
    (!exists(/databases/$(database)/documents/organizations/$(orgId)) && orgId == request.auth.uid)
  );
}
```

Additionally, we updated the rules for the organizations collection to explicitly allow users to create and update their own organizations:

```javascript
// Organizations collection
match /organizations/{orgId} {
  allow read: if isSignedIn() && (isOrgMember(orgId) || request.auth.uid == resource.data.createdBy);
  // Allow create if signed in and either:
  // 1. Creating with their own UID as the orgId, or
  // 2. They have permission to create an org
  allow create: if isSignedIn() && (orgId == request.auth.uid || request.resource.data.createdBy == request.auth.uid);
  // Allow update if admin or creator
  allow update: if isSignedIn() && (
    isOrgAdmin(orgId) || 
    isOrgCreator(orgId) || 
    // Allow update if user is setting themselves as creator
    (orgId == request.auth.uid && request.resource.data.createdBy == request.auth.uid)
  );
  allow delete: if isOrgCreator(orgId);
}
```

We also added explicit rules for the invites collection, which was missing from the original rules:

```javascript
// Invites collection
match /invites/{inviteCode} {
  allow read: if isSignedIn();
  allow create: if isSignedIn() && request.resource.data.createdBy == request.auth.uid;
  allow update: if isSignedIn() && (
    resource.data.email == request.auth.email || 
    resource.data.createdBy == request.auth.uid
  );
  allow delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
}
```

## Deployment
To deploy these updated rules, you need to run:

```bash
firebase deploy --only firestore:rules --project workflow-fc691
```

Or if you don't have the Firebase CLI installed globally:

```bash
npx firebase-tools deploy --only firestore:rules --project workflow-fc691
```

Make sure you're logged in to Firebase first:

```bash
firebase login
```

Or:

```bash
npx firebase-tools login
```

## Testing
After deploying the updated rules, you should be able to save your organization chart successfully. The "Save & Continue" button should work without the "Missing or insufficient permissions" error. 