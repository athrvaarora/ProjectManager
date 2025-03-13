import OpenAI from 'openai';
import { IProjectSetup } from '../../phase3-project-setup/types/project.types';
import { IOrganization } from '../../phase2-org-chart/types/org-chart.types';
import { 
  WorkflowDocument, 
  WorkflowStep, 
  WorkflowTask,
  WorkflowMilestone,
  TeamAssignment 
} from '../types/workflow.types';
import { Timestamp } from 'firebase/firestore';

export class AIWorkflowService {
  private openai: OpenAI;
  private lastPrompt: string = '';

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  private static instance: AIWorkflowService;

  public static getInstance(): AIWorkflowService {
    if (!AIWorkflowService.instance) {
      AIWorkflowService.instance = new AIWorkflowService();
    }
    return AIWorkflowService.instance;
  }

  public async getLastPrompt(): Promise<string> {
    return this.lastPrompt;
  }

  private generatePrompt(project: IProjectSetup, organization: IOrganization): string {
    this.lastPrompt = `
Project Details:
- Title: ${project.basicInfo.title}
- Description: ${project.basicInfo.description}
- Technical Stack: ${project.technical.technologies.join(', ')}
- Timeline: ${project.timeline.startDate} to ${project.timeline.targetCompletionDate}
- Priority: ${project.timeline.priorityLevel}

Requirements:
${project.basicInfo.objectives.map(obj => `- ${obj}`).join('\n')}

Please create a detailed workflow that includes:
1. Major milestones and their deadlines
2. Tasks and subtasks with story points
3. Dependencies between tasks
4. Resource allocation based on team skills
5. Risk assessment for each task

Team Members:
${organization.members.map(member => `- ${member.data.name} (${member.data.proficiencies.primarySkills.join(', ')})`).join('\n')}
`;
    return this.lastPrompt;
  }

  public async generateWorkflow(project: IProjectSetup, organization: IOrganization): Promise<WorkflowDocument> {
    const prompt = await this.generatePrompt(project, organization);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert project manager and technical lead with extensive experience in software development workflows. Generate a detailed, structured workflow in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const workflowData = JSON.parse(completion.choices[0].message.content || '{}');
    return this.processWorkflowResponse(workflowData, project, organization);
  }

  private processWorkflowResponse(data: any, project: IProjectSetup, organization: IOrganization): WorkflowDocument {
    const now = new Date();
    const steps = this.processSteps(data.steps || []);
    const milestones = this.processMilestones(data.milestones || []);
    const teamAssignments = this.generateTeamAssignments(steps, organization);

    return {
      id: '',
      projectId: project.id,
      organizationId: project.organizationId,
      metadata: {
        version: '1.0',
        lastModifiedBy: project.metadata?.lastModifiedBy || 'system',
        lastModifiedAt: now,
        requiresRegeneration: false,
        lastOptimized: now,
        generationPrompt: this.lastPrompt
      },
      workflow: {
        id: '',
        title: project.basicInfo.title,
        description: project.basicInfo.description,
        status: 'draft',
        createdBy: project.metadata?.createdBy || 'system',
        createdAt: now,
        updatedAt: now,
        steps,
        milestones,
        teamAssignments,
        timeline: {
          startDate: project.timeline.startDate,
          endDate: project.timeline.targetCompletionDate,
          criticalPath: this.calculateCriticalPath(steps),
          estimatedDuration: this.calculateEstimatedDuration(steps)
        },
        constraints: {
          maxParallelTasks: 5,
          resourceLimits: {},
          deadlines: {}
        },
        metadata: {
          completedTasks: 0,
          totalTasks: steps.length,
          completedStoryPoints: 0,
          totalStoryPoints: steps.reduce((acc, step) => acc + step.storyPoints, 0),
          criticalTasks: steps.filter(step => step.riskLevel === 'High').length,
          delayedTasks: 0
        }
      }
    };
  }

  private processSteps(steps: any[]): WorkflowStep[] {
    // Implementation of processSteps method
    return [];
  }

  private processMilestones(milestones: any[]): WorkflowMilestone[] {
    // Implementation of processMilestones method
    return [];
  }

  private generateTeamAssignments(steps: WorkflowStep[], organization: IOrganization): TeamAssignment[] {
    // Implementation of generateTeamAssignments method
    return [];
  }

  private calculateCriticalPath(steps: WorkflowStep[]): string[] {
    // Implementation of calculateCriticalPath method
    return [];
  }

  private calculateEstimatedDuration(steps: WorkflowStep[]): number {
    // Implementation of calculateEstimatedDuration method
    return 0;
  }

  public async optimizeWorkflow(workflow: WorkflowDocument): Promise<WorkflowDocument> {
    // Implement workflow optimization logic here
    return workflow;
  }

  private generateTeamPrompt(organization: IOrganization): string {
    this.lastPrompt = `
Project Team Analysis:

Team Members:
${organization.members.map(member => 
  `- ${member.data.name} (${member.data.proficiencies.primarySkills.join(', ')})`
).join('\n')}
`;
    return this.lastPrompt;
  }
} 