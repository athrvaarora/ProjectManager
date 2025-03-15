# Workflow Management System

A comprehensive project management application that helps teams set up projects, generate detailed descriptions, and create automated workflows.

## Features

- **Project Setup**: Guided form to capture all project requirements
- **AI-Powered Description Generation**: Automatically generate detailed project descriptions using OpenAI
- **Workflow Generation**: Create comprehensive project workflows with tasks and timelines
- **Team Management**: Assign tasks to team members and track progress
- **Organization Structure**: Manage your organization's structure and team hierarchy

## Tech Stack

- React 18
- TypeScript
- Material UI
- Firebase (Authentication, Firestore)
- OpenAI API
- React Router
- React Hook Form

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/workflow.git
   cd workflow
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in the `.env` file.

5. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Project Structure

- `src/phases/phase1-auth`: Authentication and user management
- `src/phases/phase2-org-chart`: Organization structure management
- `src/phases/phase3-project-setup`: Project setup and workflow generation
  - `components`: React components for the project setup
  - `services`: API and service functions
  - `types`: TypeScript type definitions
  - `utils`: Utility functions

## Deployment

1. Build the project:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Firebase for the backend infrastructure
- Material UI for the component library
