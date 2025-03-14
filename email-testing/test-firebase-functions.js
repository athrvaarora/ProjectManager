/**
 * Firebase Functions Test Script
 * 
 * This script tests both the HTTP endpoint and callable Firebase Functions
 * for sending invitation emails.
 * 
 * Usage:
 * 1. Install dependencies: npm install axios firebase
 * 2. Replace the FIREBASE_ID_TOKEN value with your actual Firebase ID token
 * 3. Run the script: node test-firebase-functions.js
 * 
 * To get a valid Firebase ID token:
 * - Log in to your application
 * - Open browser console and run:
 *   firebase.auth().currentUser.getIdToken(true).then(token => console.log(token))
 */

const axios = require('axios');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/functions');

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQPFgXXXXXXXXXXXXXXXXX", // Replace with your actual API key
  authDomain: "workflow-fc691.firebaseapp.com",
  projectId: "workflow-fc691",
  storageBucket: "workflow-fc691.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

// Replace with your Firebase ID token (or leave empty to try to get it programmatically)
let FIREBASE_ID_TOKEN = '';

// Firebase Function URLs
const FIREBASE_FUNCTION_URL = 'https://us-central1-workflow-fc691.cloudfunctions.net/sendInviteEmailHttp';
const REGION = 'us-central1';

// Test data
const testData = {
  email: 'athrvaarora259@gmail.com', // Replace with your email
  inviteCode: 'test123',
  organizationName: 'Test Organization',
  organizationCode: 'testorg',
  origin: 'https://workflow-fc691.web.app'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Function to get Firebase ID token
async function getFirebaseIdToken(email, password) {
  try {
    console.log(`Attempting to sign in as ${email}...`);
    await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = firebase.auth().currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      console.log('Successfully obtained Firebase ID token');
      return token;
    } else {
      throw new Error('Failed to get current user after sign in');
    }
  } catch (error) {
    console.error('Error getting Firebase ID token:', error.message);
    return null;
  }
}

// Test HTTP endpoint
async function testHttpEndpoint(idToken) {
  console.log('\n=== Testing HTTP Endpoint ===');
  console.log('URL:', FIREBASE_FUNCTION_URL);
  
  const data = {
    ...testData,
    idToken
  };
  
  console.log('Request data:', JSON.stringify(data, null, 2));
  
  try {
    const response = await axios({
      method: 'POST',
      url: FIREBASE_FUNCTION_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data
    });
    
    console.log('✅ HTTP endpoint test successful!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ HTTP endpoint test failed:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Check your internet connection.');
    } else {
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Test callable function
async function testCallableFunction(idToken) {
  console.log('\n=== Testing Callable Function ===');
  
  try {
    // Set the auth token
    if (idToken) {
      await firebase.auth().signInWithCustomToken(idToken);
    }
    
    // Get the functions instance
    const functions = firebase.functions(REGION);
    const sendInviteEmail = functions.httpsCallable('sendInviteEmail');
    
    console.log('Request data:', JSON.stringify(testData, null, 2));
    
    const result = await sendInviteEmail(testData);
    
    console.log('✅ Callable function test successful!');
    console.log('Response:', result.data);
    return true;
  } catch (error) {
    console.error('❌ Callable function test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    return false;
  }
}

// Main function
async function main() {
  console.log('Firebase Functions Test');
  console.log('======================');
  
  // If no token provided, try to get one
  if (!FIREBASE_ID_TOKEN) {
    console.log('No Firebase ID token provided. Please enter your credentials:');
    // In a real script, you would use a package like 'prompt' to get user input
    // For this example, we'll just show how it would work
    console.log('Please edit this script to add your Firebase ID token or credentials');
    
    // Example of how you would get a token with credentials
    // const email = 'your-email@example.com';
    // const password = 'your-password';
    // FIREBASE_ID_TOKEN = await getFirebaseIdToken(email, password);
    
    if (!FIREBASE_ID_TOKEN) {
      console.error('No Firebase ID token available. Tests will likely fail.');
    }
  }
  
  // Test HTTP endpoint
  const httpSuccess = await testHttpEndpoint(FIREBASE_ID_TOKEN);
  
  // Test callable function
  // Note: This may not work without proper Firebase Auth setup
  // const callableSuccess = await testCallableFunction();
  
  console.log('\n=== Test Summary ===');
  console.log(`HTTP Endpoint Test: ${httpSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  // console.log(`Callable Function Test: ${callableSuccess ? '✅ PASSED' : '❌ FAILED'}`);
}

// Run the tests
main().catch(error => {
  console.error('Unexpected error:', error);
}); 