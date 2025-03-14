/**
 * Test script for Firebase Functions email sending
 * 
 * This script tests the Firebase Functions HTTP endpoint for sending emails.
 * It requires a valid Firebase ID token, which you can obtain from the Firebase console.
 * 
 * Usage:
 * 1. Install dependencies: npm install axios
 * 2. Run the script: node test-email-function.js
 */

const axios = require('axios');

// Replace with your actual Firebase ID token
const FIREBASE_ID_TOKEN = 'YOUR_FIREBASE_ID_TOKEN';

// Firebase Function URL
const FIREBASE_FUNCTION_URL = 'https://us-central1-workflow-fc691.cloudfunctions.net/sendInviteEmailHttp';

// Test data
const testData = {
  email: 'athrvaarora259@gmail.com', // Replace with your email
  inviteCode: 'test123',
  organizationName: 'Test Organization',
  organizationCode: 'testorg',
  idToken: FIREBASE_ID_TOKEN,
  origin: 'https://workflow-fc691.web.app'
};

async function testEmailFunction() {
  console.log('Testing Firebase Function HTTP endpoint for sending emails...');
  console.log('Test data:', JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post(FIREBASE_FUNCTION_URL, testData);
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEmailFunction();

/**
 * To get a valid Firebase ID token, you can use the following code in your browser console
 * when logged into your application:
 * 
 * ```javascript
 * firebase.auth().currentUser.getIdToken(true).then(token => {
 *   console.log('Firebase ID Token:', token);
 * });
 * ```
 * 
 * Or you can use the Firebase Admin SDK to generate a custom token:
 * 
 * ```javascript
 * const admin = require('firebase-admin');
 * const serviceAccount = require('./path/to/serviceAccountKey.json');
 * 
 * admin.initializeApp({
 *   credential: admin.credential.cert(serviceAccount)
 * });
 * 
 * admin.auth().createCustomToken('user-id')
 *   .then(token => {
 *     console.log('Custom token:', token);
 *   })
 *   .catch(error => {
 *     console.error('Error creating custom token:', error);
 *   });
 * ```
 */ 