Phase 1: Authentication System
Let's begin with the authentication module that will serve as the entry point to the application.
Phase 1 Prompt for Cursor:
CopyI'm building an enterprise workflow management system. Let's implement the authentication module first.

1. Create a Firebase authentication system with:
   - Email/password registration with email verification
   - Google authentication
   - Enterprise SSO integration

2. Create React components for:
   - Login page with multiple auth options
   - Registration page with email verification
   - Password recovery flow
   - Email verification with 6-digit OTP

3. Set up user context and auth state management 

4. Create user profile schema with:
   - Basic information
   - Organization associations
   - Authentication method

5. Implement conditional routing:
   - Direct new users to organization selection
   - Return existing users to their dashboard

Use TypeScript for type safety, implement proper error handling, and follow modern authentication best practices.
After implementing Phase 1, you should be able to:

Register a new user with email verification
Log in with email/password or Google
Test the conditional routing based on user state
Verify that user profiles are stored correctly