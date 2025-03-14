#!/bin/bash

# Create the email-testing directory if it doesn't exist
mkdir -p email-testing

# Move the testing files to the email-testing directory
mv verify-sendgrid.js email-testing/ 2>/dev/null || echo "verify-sendgrid.js not found"
mv test-sendgrid-template.js email-testing/ 2>/dev/null || echo "test-sendgrid-template.js not found"
mv test-firebase-functions.js email-testing/ 2>/dev/null || echo "test-firebase-functions.js not found"
mv test-email-function.js email-testing/ 2>/dev/null || echo "test-email-function.js not found"
mv check-sender-verification.js email-testing/ 2>/dev/null || echo "check-sender-verification.js not found"
mv EMAIL-TROUBLESHOOTING.md email-testing/ 2>/dev/null || echo "EMAIL-TROUBLESHOOTING.md not found"
mv TESTING-FIREBASE-FUNCTIONS.md email-testing/ 2>/dev/null || echo "TESTING-FIREBASE-FUNCTIONS.md not found"
mv EMAIL-TESTING-README.md email-testing/README.md 2>/dev/null || echo "EMAIL-TESTING-README.md not found"

echo "All testing files have been moved to the email-testing directory."
echo "To use the testing tools, run the following commands:"
echo "  cd email-testing"
echo "  npm install"
echo "  npm run test-all" 