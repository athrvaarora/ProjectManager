import { IProjectSetup } from '../types/project.types';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generates a detailed project description using OpenAI's API based on project setup data
 */
export const generateProjectDescription = async (projectData: IProjectSetup): Promise<string> => {
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
const createDetailedPrompt = (projectData: IProjectSetup): string => {
  // Extract basic info
  const basicInfo = projectData.basicInfo || {};
  const contacts = projectData.contacts || {};
  const technical = projectData.technical || {};
  const timeline = projectData.timeline || {};
  const scope = projectData.scope || {};
  const quality = projectData.quality || {};
  const deployment = projectData.deployment || {};

  return `
Generate a comprehensive and detailed project description based on the following project setup information. 
Include a step-by-step approach to build this project, highlighting key milestones, technical considerations, and potential challenges.

PROJECT INFORMATION:
Title: ${basicInfo.title || 'Not specified'}
Project ID: ${basicInfo.projectId || 'Not specified'}
Client Company: ${basicInfo.clientCompany || 'Not specified'}
Client Division: ${basicInfo.clientDivision || 'Not specified'}
Summary: ${basicInfo.summary || 'Not specified'}
Description: ${basicInfo.description || 'Not specified'}

OBJECTIVES:
${(basicInfo.objectives || []).map(obj => `- ${obj}`).join('\n') || 'Not specified'}

TARGET USERS:
${(basicInfo.targetUsers || []).map(user => `- ${user}`).join('\n') || 'Not specified'}
Expected User Volume: ${basicInfo.expectedUserVolume || 'Not specified'}

CONTACTS:
Primary Contact: ${contacts.primary?.name || 'Not specified'} (${contacts.primary?.position || 'Not specified'})
Secondary Contact: ${contacts.secondary?.name || 'Not specified'} (${contacts.secondary?.position || 'Not specified'})
Decision Makers: ${(contacts.decisionMakers || []).map(dm => dm.name).join(', ') || 'Not specified'}

TECHNICAL REQUIREMENTS:
Platform: ${(technical.platform || []).join(', ') || 'Not specified'}
Technologies: ${(technical.technologies || []).join(', ') || 'Not specified'}
Integrations: ${(technical.integrations || []).join(', ') || 'Not specified'}
Design Documents: ${technical.designDocuments || 'Not specified'}
Technical Constraints: ${technical.technicalConstraints || 'Not specified'}
Infrastructure Details: ${technical.infrastructureDetails || 'Not specified'}
Security Requirements: ${(technical.securityRequirements || []).join(', ') || 'Not specified'}
Performance Requirements:
- Load Capacity: ${technical.performanceRequirements?.loadCapacity || 'Not specified'}
- Response Time: ${technical.performanceRequirements?.responseTime || 'Not specified'}
- Availability: ${technical.performanceRequirements?.availability || 'Not specified'}

TIMELINE:
Start Date: ${timeline.startDate ? new Date(timeline.startDate).toLocaleDateString() : 'Not specified'}
Target Completion Date: ${timeline.targetCompletionDate ? new Date(timeline.targetCompletionDate).toLocaleDateString() : 'Not specified'}
Priority Level: ${timeline.priorityLevel || 'Not specified'}
Phase Breakdown: ${(timeline.phaseBreakdown || []).join(', ') || 'Not specified'}

MILESTONES:
${(timeline.milestones || []).map(m => `- ${m.phase}: ${m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'Not specified'} - ${m.description}`).join('\n') || 'Not specified'}

SCOPE:
Core Features:
${(scope.coreFeatures || []).map(feature => `- ${feature.description || 'Not specified'} (Priority: ${feature.priority || 'Not specified'}, Effort: ${feature.effort || 'Not specified'})`).join('\n') || 'Not specified'}

Secondary Features:
${(scope.secondaryFeatures || []).map(feature => `- ${feature.description || 'Not specified'} (Priority: ${feature.priority || 'Not specified'}, Effort: ${feature.effort || 'Not specified'})`).join('\n') || 'Not specified'}

Out of Scope:
${(scope.outOfScope || []).map(item => `- ${item.description || 'Not specified'} (Reason: ${item.reason || 'Not specified'})`).join('\n') || 'Not specified'}

Future Plans:
${(scope.futurePlans || []).map(plan => `- ${plan.description || 'Not specified'} (Timeline: ${plan.timeline || 'Not specified'})`).join('\n') || 'Not specified'}

QUALITY REQUIREMENTS:
Testing Levels: ${(quality.testingLevels || []).join(', ') || 'Not specified'}
Compliance Requirements: ${(quality.complianceRequirements || []).join(', ') || 'Not specified'}
Security Requirements: ${(quality.securityRequirements || []).join(', ') || 'Not specified'}
Performance Requirements:
- Load Capacity: ${quality.performanceRequirements?.loadCapacity || 'Not specified'}
- Response Time: ${quality.performanceRequirements?.responseTime || 'Not specified'}
- Availability: ${quality.performanceRequirements?.availability || 'Not specified'}
Acceptance Criteria: ${(quality.acceptanceCriteria || []).join(', ') || 'Not specified'}
Quality Metrics: ${(quality.qualityMetrics || []).join(', ') || 'Not specified'}

DEPLOYMENT:
Environment: ${deployment.environment || 'Not specified'}
Method: ${deployment.method || 'Not specified'}
Maintenance Requirements: ${deployment.maintenanceRequirements || 'Not specified'}
Training Requirements: ${deployment.trainingRequirements || 'Not specified'}
Rollback Plan: ${deployment.rollbackPlan || 'Not specified'}
Monitoring Strategy: ${deployment.monitoringStrategy || 'Not specified'}

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
 * Helper function to safely format a date for the prompt
 */
const safeFormatDate = (dateValue: any): string => {
  if (!dateValue) return 'Not specified';
  
  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Not specified';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date for prompt:', error, dateValue);
    return 'Not specified';
  }
};

/**
 * Generates a detailed project summary using OpenAI's GPT-4o model based on project setup data
 * and organization chart data
 */
export const generateProjectSummary = async (projectData: IProjectSetup): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Fetch organization chart data if organizationId is available
    let orgChartData = null;
    if (projectData.organizationId) {
      try {
        // Import the getOrganizationChart function dynamically to avoid circular dependencies
        const { getOrganizationChart } = await import('../../phase2-org-chart/services/organization.service');
        orgChartData = await getOrganizationChart(projectData.organizationId);
        console.log('Fetched organization chart data:', orgChartData);
      } catch (err) {
        console.warn('Could not fetch organization chart data:', err);
        // Continue without org chart data if there's an error
      }
    }

    // Fetch workflow data if available
    let workflowData = null;
    if (projectData.workflow) {
      workflowData = projectData.workflow;
      console.log('Using workflow data from project:', workflowData);
    }

    // Create a detailed prompt based on the project data, org chart data, and workflow data
    const prompt = createProjectSummaryPrompt(projectData, orgChartData, workflowData);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project manager and technical consultant with deep knowledge of software development methodologies, technical architectures, and project planning. Your task is to analyze project requirements and generate a comprehensive, highly detailed project summary with strategic insights and implementation recommendations. Make sure to include specific dates, timelines, and team structure information when available. Be extremely thorough and detailed in your analysis, providing specific actionable insights and recommendations. For team structure, provide both a recommended structure and a detailed breakdown of how work would be divided among existing team members, including specific tasks and responsibilities.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000  // Increased from 4000 to 8000 for more detailed responses
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating project summary:', error);
    throw new Error('Failed to generate project summary. Please try again.');
  }
};

/**
 * Generates a response to a user's question about the project using OpenAI's GPT-4o model
 */
export const generateProjectSummaryWithUserInput = async (
  projectData: IProjectSetup,
  userInput: string,
  previousQuestions: string[] = []
): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Fetch organization chart data if organizationId is available
    let orgChartData = null;
    if (projectData.organizationId) {
      try {
        // Import the getOrganizationChart function dynamically to avoid circular dependencies
        const { getOrganizationChart } = await import('../../phase2-org-chart/services/organization.service');
        orgChartData = await getOrganizationChart(projectData.organizationId);
        console.log('Fetched organization chart data for user question:', orgChartData);
      } catch (err) {
        console.warn('Could not fetch organization chart data for user question:', err);
        // Continue without org chart data if there's an error
      }
    }

    // Fetch workflow data if available
    let workflowData = null;
    if (projectData.workflow) {
      workflowData = projectData.workflow;
      console.log('Using workflow data from project for user question:', workflowData);
    }

    // Create a context prompt with project data and user's question
    const contextPrompt = createContextPrompt(projectData, userInput, previousQuestions, orgChartData, workflowData);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project consultant assistant. Your task is to provide helpful, accurate, and detailed responses to questions about the project. Focus on being informative and practical. Include specific dates, timelines, team structure information, and workflow details when relevant to the question. Provide comprehensive answers with specific examples and actionable insights whenever possible.'
          },
          {
            role: 'user',
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000  // Increased from 2000 to 4000 for more detailed responses
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response to user input:', error);
    throw new Error('Failed to generate a response. Please try again.');
  }
};

/**
 * Creates a detailed prompt for generating a project summary
 */
const createProjectSummaryPrompt = (
  projectData: IProjectSetup, 
  orgChartData: any = null,
  workflowData: any = null
): string => {
  // Extract basic info
  const basicInfo = projectData.basicInfo || {};
  const contacts = projectData.contacts || {};
  const technical = projectData.technical || {};
  const timeline = projectData.timeline || {};
  const scope = projectData.scope || {};
  const quality = projectData.quality || {};
  const deployment = projectData.deployment || {};
  const team = projectData.team || {};
  const risks = projectData.risks || {};

  // Format dates properly using the safe formatter
  const startDate = safeFormatDate(timeline.startDate);
  const targetCompletionDate = safeFormatDate(timeline.targetCompletionDate);
  
  // Format milestones with proper dates
  const formattedMilestones = (timeline.milestones || []).map(m => {
    const formattedDate = safeFormatDate(m.targetDate);
    return `- ${m.phase}: ${formattedDate} - ${m.description}`;
  }).join('\n');

  // Create organization chart section if data is available
  let orgChartSection = 'ORGANIZATION CHART: Not available';
  
  if (orgChartData) {
    try {
      // Extract team structure from org chart data
      const teams = orgChartData.metadata?.teams || {};
      const nodes = orgChartData.nodes || [];
      
      // Format team information
      const teamInfo = Object.entries(teams).map(([teamId, teamData]: [string, any]) => {
        const teamName = teamData.name || 'Unnamed Team';
        const teamLead = teamData.lead ? nodes.find((n: any) => n.id === teamData.lead)?.data?.name || 'Unknown' : 'None';
        const teamMembers = (teamData.members || [])
          .map((memberId: string) => nodes.find((n: any) => n.id === memberId)?.data?.name || 'Unknown')
          .join(', ');
        const teamSkills = (teamData.skills || []).join(', ');
        
        return `
Team: ${teamName}
Lead: ${teamLead}
Members: ${teamMembers || 'None'}
Skills: ${teamSkills || 'None'}`;
      }).join('\n\n');
      
      // Create personnel list with roles and skills
      const personnel = nodes
        .filter((node: any) => node.type === 'personnel' || !node.type)
        .map((node: any) => {
          const person = node.data || {};
          return `
- ${person.name || 'Unnamed'} (${person.position || 'No position'})
  Email: ${person.email || 'No email'}
  Skills: ${person.proficiencies?.primarySkills?.join(', ') || 'None'}
  Languages: ${person.proficiencies?.languages?.join(', ') || 'None'}
  Frameworks: ${person.proficiencies?.frameworks?.join(', ') || 'None'}
  Availability: ${person.availability?.status || 'Unknown'}`;
        }).join('\n');
      
      orgChartSection = `
ORGANIZATION CHART:
${teamInfo || 'No teams defined'}

PERSONNEL:
${personnel || 'No personnel defined'}`;
    } catch (err) {
      console.warn('Error formatting org chart data:', err);
      orgChartSection = 'ORGANIZATION CHART: Available but could not be processed';
    }
  }

  // Create workflow section if data is available
  let workflowSection = 'WORKFLOW: Not available';
  
  if (workflowData && Array.isArray(workflowData) && workflowData.length > 0) {
    try {
      // Format workflow steps
      const workflowSteps = workflowData.map((step: any, index: number) => {
        const assignedTo = (step.assignedTo || [])
          .map((person: any) => `${person.name} (${person.role})`)
          .join(', ');
        
        const tasks = (step.tasks || [])
          .map((task: any) => `- ${task.title}: ${task.description} (Priority: ${task.priority}, Status: ${task.status})`)
          .join('\n');
        
        return `
Step ${index + 1}: ${step.title}
Description: ${step.description || 'No description'}
Timeline: ${step.startDate || 'Not specified'} to ${step.endDate || 'Not specified'}
Priority: ${step.priority || 'Not specified'}
Status: ${step.status || 'Not specified'}
Assigned To: ${assignedTo || 'Not assigned'}
Dependencies: ${step.dependencies?.join(', ') || 'None'}
Tasks:
${tasks || 'No tasks defined'}`;
      }).join('\n\n');
      
      workflowSection = `
WORKFLOW STEPS:
${workflowSteps || 'No workflow steps defined'}`;
    } catch (err) {
      console.warn('Error formatting workflow data:', err);
      workflowSection = 'WORKFLOW: Available but could not be processed';
    }
  }

  // Format risks with more detail
  const risksSection = risks && risks.risks && risks.risks.length > 0 ? 
    risks.risks.map((risk: any) => 
      `- ${risk.description || 'Unnamed risk'} (Level: ${risk.level || 'Not specified'})
   Impact: ${risk.impact || 'Not specified'}
   Mitigation: ${risk.mitigation || 'Not specified'}`
    ).join('\n\n') : 'Not specified';

  return `
Generate a comprehensive and extremely detailed strategic project summary based on the following project setup information.
Include key insights, technical recommendations, implementation strategy, and potential challenges.
Make sure to include specific dates, timelines, and team structure information.

PROJECT INFORMATION:
Title: ${basicInfo.title || 'Not specified'}
Project ID: ${basicInfo.projectId || 'Not specified'}
Client Company: ${basicInfo.clientCompany || 'Not specified'}
Client Division: ${basicInfo.clientDivision || 'Not specified'}
Summary: ${basicInfo.summary || 'Not specified'}
Description: ${basicInfo.description || 'Not specified'}

OBJECTIVES:
${(basicInfo.objectives || []).map(obj => `- ${obj}`).join('\n') || 'Not specified'}

TARGET USERS:
${(basicInfo.targetUsers || []).map(user => `- ${user}`).join('\n') || 'Not specified'}
Expected User Volume: ${basicInfo.expectedUserVolume || 'Not specified'}

CONTACTS:
Primary Contact: ${contacts.primary?.name || 'Not specified'} (${contacts.primary?.position || 'Not specified'})
Secondary Contact: ${contacts.secondary?.name || 'Not specified'} (${contacts.secondary?.position || 'Not specified'})
Decision Makers: ${(contacts.decisionMakers || []).map(dm => dm.name).join(', ') || 'Not specified'}

TECHNICAL REQUIREMENTS:
Platform: ${(technical.platform || []).join(', ') || 'Not specified'}
Technologies: ${(technical.technologies || []).join(', ') || 'Not specified'}
Integrations: ${(technical.integrations || []).join(', ') || 'Not specified'}
Design Documents: ${technical.designDocuments || 'Not specified'}
Technical Constraints: ${technical.technicalConstraints || 'Not specified'}
Infrastructure Details: ${technical.infrastructureDetails || 'Not specified'}
Security Requirements: ${(technical.securityRequirements || []).join(', ') || 'Not specified'}
Performance Requirements:
- Load Capacity: ${technical.performanceRequirements?.loadCapacity || 'Not specified'}
- Response Time: ${technical.performanceRequirements?.responseTime || 'Not specified'}
- Availability: ${technical.performanceRequirements?.availability || 'Not specified'}

TIMELINE:
Start Date: ${startDate}
Target Completion Date: ${targetCompletionDate}
Priority Level: ${timeline.priorityLevel || 'Not specified'}
Phase Breakdown: ${(timeline.phaseBreakdown || []).join(', ') || 'Not specified'}

MILESTONES:
${formattedMilestones || 'Not specified'}

SCOPE:
Core Features:
${(scope.coreFeatures || []).map(feature => `- ${feature.description || 'Not specified'} (Priority: ${feature.priority || 'Not specified'}, Effort: ${feature.effort || 'Not specified'})`).join('\n') || 'Not specified'}

Secondary Features:
${(scope.secondaryFeatures || []).map(feature => `- ${feature.description || 'Not specified'} (Priority: ${feature.priority || 'Not specified'}, Effort: ${feature.effort || 'Not specified'})`).join('\n') || 'Not specified'}

Out of Scope:
${(scope.outOfScope || []).map(item => `- ${item.description || 'Not specified'} (Reason: ${item.reason || 'Not specified'})`).join('\n') || 'Not specified'}

Future Plans:
${(scope.futurePlans || []).map(plan => `- ${plan.description || 'Not specified'} (Timeline: ${plan.timeline || 'Not specified'})`).join('\n') || 'Not specified'}

QUALITY REQUIREMENTS:
Testing Levels: ${(quality.testingLevels || []).join(', ') || 'Not specified'}
Compliance Requirements: ${(quality.complianceRequirements || []).join(', ') || 'Not specified'}
Security Requirements: ${(quality.securityRequirements || []).join(', ') || 'Not specified'}
Performance Requirements:
- Load Capacity: ${quality.performanceRequirements?.loadCapacity || 'Not specified'}
- Response Time: ${quality.performanceRequirements?.responseTime || 'Not specified'}
- Availability: ${quality.performanceRequirements?.availability || 'Not specified'}
Acceptance Criteria: ${(quality.acceptanceCriteria || []).join(', ') || 'Not specified'}
Quality Metrics: ${(quality.qualityMetrics || []).join(', ') || 'Not specified'}

DEPLOYMENT:
Environment: ${deployment.environment || 'Not specified'}
Method: ${deployment.method || 'Not specified'}
Maintenance Requirements: ${deployment.maintenanceRequirements || 'Not specified'}
Training Requirements: ${deployment.trainingRequirements || 'Not specified'}
Rollback Plan: ${deployment.rollbackPlan || 'Not specified'}
Monitoring Strategy: ${deployment.monitoringStrategy || 'Not specified'}

TEAM REQUIREMENTS:
Special Expertise: ${(team.specialExpertise || []).join(', ') || 'Not specified'}
Client Involvement: ${(team.clientInvolvement || []).join(', ') || 'Not specified'}
Resource Constraints: ${team.resourceConstraints || 'Not specified'}
Cross-Team Dependencies: ${team.crossTeamDependencies || 'Not specified'}
Team Structure: ${team.teamStructure || 'Not specified'}
Communication Plan: ${team.communicationPlan || 'Not specified'}
Roles: ${(team.roles || []).join(', ') || 'Not specified'}
Responsibilities: ${(team.responsibilities || []).join(', ') || 'Not specified'}

RISKS:
${risksSection}
Critical Dependencies: ${(risks.criticalDependencies || []).map(dep => `${dep.dependency}: ${dep.managementStrategy}`).join(', ') || 'Not specified'}
Contingency Plans: ${risks.contingencyPlans || 'Not specified'}
Mitigation Strategies: ${(risks.mitigationStrategies || []).join(', ') || 'Not specified'}

${orgChartSection}

${workflowSection}

Based on the above information, please provide an extremely detailed and comprehensive summary with the following sections:

1. Executive Summary: A thorough overview of the project, its objectives, and key deliverables (at least 300 words)

2. Technical Strategy: Detailed architecture recommendations, technology stack, and implementation approach, including specific technologies, frameworks, and tools with justification for each choice (at least 400 words)

3. Project Roadmap: Comprehensive timeline with specific dates, phases, milestones, and dependencies, including detailed breakdown of each phase (at least 350 words)

4. Team Structure and Responsibilities: 
   a. Recommended Team Structure: Detailed breakdown of all roles needed for the project
   b. Current Team Allocation: Specific tasks and responsibilities for each existing team member
   c. Detailed Task List: Comprehensive list of tasks assigned to team members with estimated effort
   (at least 500 words total for this section)

5. Risk Assessment: Thorough analysis of potential challenges, their impact, and detailed mitigation strategies (at least 350 words)

6. Critical Success Factors: Comprehensive analysis of what will make this project successful, including specific metrics and KPIs (at least 250 words)

7. Implementation Recommendations: Detailed best practices and methodologies to follow, with specific tools and techniques (at least 350 words)

Format your response with clear headings, subheadings, and bullet points where appropriate. Be extremely thorough and detailed, providing actionable insights and strategic recommendations. Make sure to include specific dates, timeline information, and detailed task assignments throughout the summary.
`;
};

/**
 * Creates a context prompt for answering user questions about the project
 */
const createContextPrompt = (
  projectData: IProjectSetup,
  userInput: string,
  previousQuestions: string[] = [],
  orgChartData: any = null,
  workflowData: any = null
): string => {
  // Create a simplified context with key project information
  const basicInfo = projectData.basicInfo || {};
  const technical = projectData.technical || {};
  const timeline = projectData.timeline || {};
  const scope = projectData.scope || {};
  const risks = projectData.risks || {};
  
  // Format dates properly using the safe formatter
  const startDate = safeFormatDate(timeline.startDate);
  const targetCompletionDate = safeFormatDate(timeline.targetCompletionDate);

  // Create organization chart section if data is available
  let orgChartInfo = '';
  
  if (orgChartData) {
    try {
      // Extract team structure from org chart data
      const teams = orgChartData.metadata?.teams || {};
      const nodes = orgChartData.nodes || [];
      
      // Format team information
      const teamInfo = Object.entries(teams).map(([teamId, teamData]: [string, any]) => {
        const teamName = teamData.name || 'Unnamed Team';
        const teamLead = teamData.lead ? nodes.find((n: any) => n.id === teamData.lead)?.data?.name || 'Unknown' : 'None';
        const teamMembers = (teamData.members || [])
          .map((memberId: string) => nodes.find((n: any) => n.id === memberId)?.data?.name || 'Unknown')
          .join(', ');
        
        return `Team: ${teamName}, Lead: ${teamLead}, Members: ${teamMembers || 'None'}`;
      }).join('\n');
      
      // Create personnel list with roles and skills
      const personnel = nodes
        .filter((node: any) => node.type === 'personnel' || !node.type)
        .map((node: any) => {
          const person = node.data || {};
          return `${person.name || 'Unnamed'} (${person.position || 'No position'}) - Skills: ${person.proficiencies?.primarySkills?.join(', ') || 'None'}`;
        }).join('\n');
      
      orgChartInfo = `
Organization Teams:
${teamInfo || 'No teams defined'}

Personnel:
${personnel || 'No personnel defined'}`;
    } catch (err) {
      console.warn('Error formatting org chart data for context prompt:', err);
    }
  }

  // Create workflow section if data is available
  let workflowInfo = '';
  
  if (workflowData && Array.isArray(workflowData) && workflowData.length > 0) {
    try {
      // Format workflow steps
      const workflowSteps = workflowData.map((step: any, index: number) => {
        const assignedTo = (step.assignedTo || [])
          .map((person: any) => `${person.name} (${person.role})`)
          .join(', ');
        
        const tasks = (step.tasks || [])
          .map((task: any) => `- ${task.title}: ${task.description} (Priority: ${task.priority}, Status: ${task.status})`)
          .join(', ');
        
        return `Step ${index + 1}: ${step.title}, Assigned To: ${assignedTo || 'Not assigned'}, Timeline: ${step.startDate || 'Not specified'} to ${step.endDate || 'Not specified'}, Tasks: ${tasks || 'None'}`;
      }).join('\n');
      
      workflowInfo = `
Workflow Steps:
${workflowSteps || 'No workflow steps defined'}`;
    } catch (err) {
      console.warn('Error formatting workflow data for context prompt:', err);
    }
  }

  // Format risks with more detail if available
  let risksInfo = '';
  if (risks && risks.risks && risks.risks.length > 0) {
    const risksList = risks.risks.map((risk: any) => 
      `- ${risk.description || 'Unnamed risk'} (Level: ${risk.level || 'Not specified'}, Impact: ${risk.impact || 'Not specified'}, Mitigation: ${risk.mitigation || 'Not specified'})`
    ).join('\n');
    
    risksInfo = `
Project Risks:
${risksList}`;
  }

  const context = `
PROJECT CONTEXT:
Title: ${basicInfo.title || 'Not specified'}
Summary: ${basicInfo.summary || 'Not specified'}
Objectives: ${(basicInfo.objectives || []).join(', ') || 'Not specified'}
Platform: ${(technical.platform || []).join(', ') || 'Not specified'}
Technologies: ${(technical.technologies || []).join(', ') || 'Not specified'}
Timeline: ${startDate} to ${targetCompletionDate}
Priority: ${timeline.priorityLevel || 'Not specified'}
Core Features: ${(scope.coreFeatures || []).map(f => f.description).join(', ') || 'Not specified'}
${risksInfo}
${orgChartInfo}
${workflowInfo}

Previous questions from the user:
${previousQuestions.map(q => `- ${q}`).join('\n')}

Current user question: "${userInput}"

Please provide a helpful, accurate, and detailed response to the user's question based on the project information provided. If the question is about team structure or personnel, use the organization chart information. If the question is about project workflow or tasks, use the workflow information. If the question cannot be answered with the available information, suggest what additional details might be needed.
`;

  return context;
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

/**
 * Generates an edited version of the project summary based on user's edit request
 */
export const generateSummaryEdit = async (
  projectData: IProjectSetup,
  currentSummary: string,
  editRequest: string
): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Fetch organization chart data if organizationId is available
    let orgChartData = null;
    if (projectData.organizationId) {
      try {
        // Import the getOrganizationChart function dynamically to avoid circular dependencies
        const { getOrganizationChart } = await import('../../phase2-org-chart/services/organization.service');
        orgChartData = await getOrganizationChart(projectData.organizationId);
        console.log('Fetched organization chart data for edit:', orgChartData);
      } catch (err) {
        console.warn('Could not fetch organization chart data for edit:', err);
        // Continue without org chart data if there's an error
      }
    }

    // Fetch workflow data if available
    let workflowData = null;
    if (projectData.workflow) {
      workflowData = projectData.workflow;
      console.log('Using workflow data from project for edit:', workflowData);
    }

    // Create a prompt for editing the summary
    const editPrompt = createEditPrompt(projectData, currentSummary, editRequest, orgChartData, workflowData);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project editor and technical writer. Your task is to modify a project summary based on the user\'s edit request. You must ONLY change the specific section mentioned in the request and preserve all other content exactly as it is. Maintain all headings, formatting, and structure of the original summary. Return the complete updated summary with only the requested changes incorporated. Make sure to include specific dates, timelines, and team structure information when available. When editing a section, ensure it remains highly detailed and comprehensive, with specific actionable insights and recommendations.'
          },
          {
            role: 'user',
            content: editPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000  // Increased from 4000 to 8000 for more detailed responses
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary edit:', error);
    throw new Error('Failed to generate summary edit. Please try again.');
  }
};

/**
 * Creates a prompt for editing the project summary
 */
const createEditPrompt = (
  projectData: IProjectSetup,
  currentSummary: string,
  editRequest: string,
  orgChartData: any = null,
  workflowData: any = null
): string => {
  // Format dates properly
  const startDate = safeFormatDate(projectData.timeline?.startDate);
  const targetCompletionDate = safeFormatDate(projectData.timeline?.targetCompletionDate);
  
  // Create organization chart section if data is available
  let orgChartInfo = '';
  
  if (orgChartData) {
    try {
      // Extract team structure from org chart data
      const teams = orgChartData.metadata?.teams || {};
      const nodes = orgChartData.nodes || [];
      
      // Format team information
      const teamInfo = Object.entries(teams).map(([teamId, teamData]: [string, any]) => {
        const teamName = teamData.name || 'Unnamed Team';
        const teamLead = teamData.lead ? nodes.find((n: any) => n.id === teamData.lead)?.data?.name || 'Unknown' : 'None';
        const teamMembers = (teamData.members || [])
          .map((memberId: string) => nodes.find((n: any) => n.id === memberId)?.data?.name || 'Unknown')
          .join(', ');
        
        return `Team: ${teamName}, Lead: ${teamLead}, Members: ${teamMembers || 'None'}`;
      }).join('\n');
      
      // Create personnel list with roles and skills
      const personnel = nodes
        .filter((node: any) => node.type === 'personnel' || !node.type)
        .map((node: any) => {
          const person = node.data || {};
          return `${person.name || 'Unnamed'} (${person.position || 'No position'}) - Skills: ${person.proficiencies?.primarySkills?.join(', ') || 'None'}`;
        }).join('\n');
      
      orgChartInfo = `
Organization Teams:
${teamInfo || 'No teams defined'}

Personnel:
${personnel || 'No personnel defined'}`;
    } catch (err) {
      console.warn('Error formatting org chart data for edit prompt:', err);
    }
  }

  // Create workflow section if data is available
  let workflowInfo = '';
  
  if (workflowData && Array.isArray(workflowData) && workflowData.length > 0) {
    try {
      // Format workflow steps
      const workflowSteps = workflowData.map((step: any, index: number) => {
        const assignedTo = (step.assignedTo || [])
          .map((person: any) => `${person.name} (${person.role})`)
          .join(', ');
        
        return `Step ${index + 1}: ${step.title}, Assigned To: ${assignedTo || 'Not assigned'}, Timeline: ${step.startDate || 'Not specified'} to ${step.endDate || 'Not specified'}`;
      }).join('\n');
      
      workflowInfo = `
Workflow Steps:
${workflowSteps || 'No workflow steps defined'}`;
    } catch (err) {
      console.warn('Error formatting workflow data for edit prompt:', err);
    }
  }

  return `
I need you to edit a project summary based on the user's request. Here is the current summary:

---CURRENT SUMMARY---
${currentSummary}
---END CURRENT SUMMARY---

The user has requested the following edit:
"${editRequest}"

Here is some context about the project:
Title: ${projectData.basicInfo?.title || 'Not specified'}
Project ID: ${projectData.basicInfo?.projectId || 'Not specified'}
Summary: ${projectData.basicInfo?.summary || 'Not specified'}
Technologies: ${(projectData.technical?.technologies || []).join(', ') || 'Not specified'}
Start Date: ${startDate}
Target Completion Date: ${targetCompletionDate}
${orgChartInfo}
${workflowInfo}

IMPORTANT INSTRUCTIONS:
1. ONLY modify the specific section mentioned in the user's edit request.
2. Keep ALL other sections exactly as they are in the current summary.
3. Preserve all headings, formatting, and structure of the original summary.
4. If the user requests to add more details to a specific section (e.g., "Executive Summary"), only enhance that section.
5. If the requested section doesn't exist, add it while keeping all existing content intact.
6. Return the complete updated summary with your changes seamlessly integrated.
7. Make sure to include specific dates and timeline information when available.
8. If the edit request is about team structure or personnel, use the organization chart information provided.
9. When editing a section, make it extremely detailed and comprehensive, with specific actionable insights.
10. For team structure, include both recommended roles and specific task assignments for team members.
11. Aim for at least 300-500 words for major sections like Executive Summary, Technical Strategy, etc.

Please provide the complete updated summary with ONLY the requested changes incorporated. Return ONLY the updated summary text, with no additional explanations or notes.
`;
}; 