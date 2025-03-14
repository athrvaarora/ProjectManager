# Project Manager

A comprehensive project management tool that helps teams organize their workflow, create organization charts, and manage project setup efficiently.

## Features

- Organization Chart Builder
- Project Setup Wizard
- Team Member Invitations via Email
- AI-Powered Workflow Suggestions
- Real-time Collaboration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- SendGrid account (for email functionality)
- OpenAI API key (for AI features)

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/athrvaarora/ProjectManager.git
   cd ProjectManager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your actual API keys and configuration values in `.env`

4. Firebase Setup:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Set up Firebase Functions for email functionality
   - Update Firebase configuration in `.env`

5. Start the development server:
   ```bash
   npm start
   ```

## Security Notes

- Never commit `.env` files containing actual API keys
- Use environment variables for all sensitive information
- Keep API keys and secrets secure
- Follow the principle of least privilege for API keys

## Development Guidelines

1. Branch naming convention:
   - feature/feature-name
   - bugfix/bug-description
   - hotfix/issue-description

2. Commit messages:
   - Use clear, descriptive commit messages
   - Start with a verb (add, fix, update, etc.)
   - Keep messages concise but informative

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Firebase for the backend infrastructure
- Material UI for the component library
