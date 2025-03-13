import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../phases/phase1-auth/utils/firebaseConfig';
import { IProjectSetup, IWorkflowStep } from '../types/project.types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const WORKFLOW_GENERATION_PROMPT = `
As an AI project management expert, analyze the provided project requirements and organization structure to create a detailed workflow. Consider the following aspects:

1. Project scope and objectives
2. Technical requirements and constraints
3. Team structure and expertise
4. Timeline and milestones
5. Dependencies and risks
6. Quality and compliance requirements

For each workflow step, provide:
1. A clear title and description
2. Start and end dates
3. Priority level
4. Required team members and their roles
5. Detailed tasks and acceptance criteria
6. Dependencies on other steps

Ensure the workflow follows industry best practices and standards.
`;

const WORKFLOW_UPDATE_PROMPT = `
As an AI project management expert, analyze the current workflow and the requested changes. Update the workflow while maintaining:

1. Logical step sequence and dependencies
2. Resource allocation and team member availability
3. Timeline feasibility
4. Project constraints and requirements
5. Quality standards and compliance

Provide a detailed explanation of the changes made and their impact on the project timeline and resources.
`;

export const generateWorkflowSteps = async (
  project: any, // Accept any project format (IProjectSetup or adapted format)
  orgChart: any
): Promise<IWorkflowStep[]> => {
  try {
    const prompt = `${WORKFLOW_GENERATION_PROMPT}

Project Requirements:
${JSON.stringify(project, null, 2)}

Organization Structure:
${JSON.stringify(orgChart, null, 2)}

Generate a detailed workflow in JSON format.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert project management AI assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const workflowSteps = JSON.parse(completion.choices[0].message.content || '[]');
    return workflowSteps;
  } catch (error) {
    console.error('Error generating workflow steps:', error);
    throw new Error('Failed to generate workflow steps');
  }
};

export const updateWorkflowSteps = async (
  projectId: string,
  currentWorkflow: IWorkflowStep[],
  userRequest: string
): Promise<IWorkflowStep[]> => {
  try {
    const prompt = `${WORKFLOW_UPDATE_PROMPT}

Current Workflow:
${JSON.stringify(currentWorkflow, null, 2)}

User Request:
${userRequest}

Update the workflow in JSON format while maintaining data consistency.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert project management AI assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const updatedWorkflow = JSON.parse(completion.choices[0].message.content || '[]');
    
    // Update the workflow in Firestore
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      workflow: updatedWorkflow,
      'metadata.updatedAt': new Date()
    });

    return updatedWorkflow;
  } catch (error) {
    console.error('Error updating workflow steps:', error);
    throw new Error('Failed to update workflow steps');
  }
}; 