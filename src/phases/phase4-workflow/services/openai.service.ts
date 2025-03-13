import OpenAI from 'openai';
import { IPersonData } from '../../phase2-org-chart/types/org-chart.types';

export interface IGeneratedWorkflow {
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    tasks: Array<{
      id: string;
      title: string;
      description: string;
      assignedTo: string;
      startDate: string;
      endDate: string;
      status: 'todo' | 'in-progress' | 'completed';
      priority: 'low' | 'medium' | 'high';
      dependencies: string[];
      skills: string[];
      estimatedHours: number;
    }>;
  }>;
}

export interface ITeamMember {
  id: string;
  name: string;
  role: string;
  skills: string[];
  data: IPersonData;
}

export class OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateWorkflow(
    teamMembers: ITeamMember[],
    projectDescription: string,
    startDate: string,
    endDate: string
  ): Promise<IGeneratedWorkflow> {
    const prompt = this.buildWorkflowPrompt(
      teamMembers,
      projectDescription,
      startDate,
      endDate
    );

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      const workflowData = JSON.parse(content) as IGeneratedWorkflow;
      return this.validateAndCleanWorkflow(workflowData);
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }

  private buildWorkflowPrompt(
    teamMembers: ITeamMember[],
    projectDescription: string,
    startDate: string,
    endDate: string
  ): string {
    const teamData = teamMembers.map((member) => ({
      id: member.id,
      name: member.data.name,
      position: member.data.position,
      skills: [
        ...member.data.proficiencies.languages,
        ...member.data.proficiencies.frameworks,
        ...member.data.proficiencies.primarySkills,
      ],
    }));

    return `Generate a detailed project workflow for the following project:

Project Description: ${projectDescription}
Start Date: ${startDate}
End Date: ${endDate}

Team Members and their skills:
${JSON.stringify(teamData, null, 2)}

Please generate a workflow with milestones and tasks, considering:
1. Team members' skills and roles
2. Task dependencies
3. Balanced workload
4. Realistic time estimates

The response should be a JSON object matching this structure:
{
  "milestones": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "tasks": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "assignedTo": "string (team member ID)",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "status": "todo",
          "priority": "low/medium/high",
          "dependencies": ["task IDs"],
          "skills": ["required skills"],
          "estimatedHours": number
        }
      ]
    }
  ]
}`;
  }

  private validateAndCleanWorkflow(workflow: IGeneratedWorkflow): IGeneratedWorkflow {
    // Ensure all required fields are present and properly formatted
    return {
      milestones: workflow.milestones.map((milestone) => ({
        ...milestone,
        tasks: milestone.tasks.map((task) => ({
          ...task,
          status: task.status || 'todo',
          priority: task.priority || 'medium',
          dependencies: task.dependencies || [],
          skills: task.skills || [],
          estimatedHours: task.estimatedHours || 0,
        })),
      })),
    };
  }
} 