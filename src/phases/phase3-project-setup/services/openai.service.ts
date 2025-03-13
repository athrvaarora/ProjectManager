import { ProjectRequirements } from '../types/project.types';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates a detailed project description using OpenAI's API based on project setup data
 */
export const generateProjectDescription = async (projectData: ProjectRequirements): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Create a detailed prompt based on the project data
    const prompt = createDetailedPrompt(projectData);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project manager and technical consultant. Your task is to analyze project requirements and generate a comprehensive project description with implementation strategy.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating project description:', error);
    throw new Error('Failed to generate project description. Please try again.');
  }
};

/**
 * Creates a detailed prompt for OpenAI based on project data
 */
const createDetailedPrompt = (projectData: ProjectRequirements): string => {
  return `
Generate a comprehensive and detailed project description based on the following project setup information. 
Include a step-by-step approach to build this project, highlighting key milestones, technical considerations, and potential challenges.

PROJECT INFORMATION:
Title: ${projectData.projectTitle}
Project ID: ${projectData.projectId}
Client: ${projectData.clientCompany}, ${projectData.clientDivision}
Summary: ${projectData.summary}
Description: ${projectData.description}

OBJECTIVES:
${projectData.objectives.map(obj => `- ${obj}`).join('\n')}

TARGET USERS:
${projectData.targetUsers}
Expected User Volume: ${projectData.expectedUserVolume}

TECHNICAL REQUIREMENTS:
Platform: ${Object.entries(projectData.platform)
  .filter(([key, value]) => value === true || (key === 'other' && value))
  .map(([key, _]) => key === 'other' ? projectData.platform.other : key)
  .join(', ')}
Technologies: ${projectData.requiredTechnologies.join(', ')}
Integrations: ${projectData.integrationRequirements.join(', ')}
Technical Constraints: ${projectData.technicalConstraints.join(', ')}
Infrastructure Details: ${projectData.infrastructure}
Security Requirements: ${projectData.securityRequirements.join(', ')}
Performance Expectations: ${projectData.performanceExpectations}

TIMELINE:
Start Date: ${projectData.startDate ? new Date(projectData.startDate).toLocaleDateString() : 'Not specified'}
Target Completion Date: ${projectData.completionDate ? new Date(projectData.completionDate).toLocaleDateString() : 'Not specified'}
Priority Level: ${projectData.priority}

MILESTONES:
${Object.entries(projectData.milestones)
  .filter(([_, date]) => date)
  .map(([phase, date]) => `- ${phase}: ${date ? new Date(date).toLocaleDateString() : 'Not specified'}`)
  .join('\n')}

SCOPE:
Core Features:
${projectData.coreFeatures.map(feature => `- ${feature}`).join('\n')}

Secondary Features:
${projectData.secondaryFeatures.map(feature => `- ${feature}`).join('\n')}

Out of Scope:
${projectData.outOfScope.map(item => `- ${item}`).join('\n')}

Future Plans:
${projectData.futurePlans.map(plan => `- ${plan}`).join('\n')}

QUALITY REQUIREMENTS:
Testing Levels: ${projectData.testingLevels.join(', ')}
Compliance Requirements: ${projectData.complianceRequirements.join(', ')}
Security Requirements: ${projectData.securityRequirements.join(', ')}
Performance Expectations: ${projectData.performanceExpectations}

DEPLOYMENT:
Environment: ${projectData.deploymentEnvironment}
Method: ${projectData.deploymentMethod}
Maintenance Requirements: ${projectData.maintenanceExpectations}
Training Requirements: ${projectData.trainingRequirements}

ADDITIONAL NOTES:
Special Instructions: ${projectData.specialInstructions}
Historical Context: ${projectData.historicalContext}
Initial Notes: ${projectData.initialNotes}

Based on the above information, please provide:
1. A comprehensive project description that summarizes all key aspects
2. A detailed step-by-step approach to building this project
3. Key technical considerations and architecture recommendations
4. Potential challenges and how to address them
5. Critical success factors for this project
6. Any additional recommendations or insights

Format your response with clear headings and bullet points where appropriate. Be thorough and specific, providing actionable insights and recommendations.
`;
};

/**
 * Updates the project description using OpenAI's API
 */
export const saveProjectDescription = async (projectId: string, description: string) => {
  try {
    // This function will be implemented to save the generated description to Firebase
    // Implementation will be added in the ProjectDescription component
  } catch (error) {
    console.error('Error saving project description:', error);
    throw new Error('Failed to save project description');
  }
}; 