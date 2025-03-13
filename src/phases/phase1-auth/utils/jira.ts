import axios from 'axios';

interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

interface JiraUser {
  accountId: string;
  emailAddress: string;
  displayName: string;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
}

export class JiraService {
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;
  }

  private get axiosInstance() {
    return axios.create({
      baseURL: this.config.baseUrl,
      auth: {
        username: this.config.email,
        password: this.config.apiToken,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  async searchUsers(query: string): Promise<JiraUser[]> {
    try {
      const response = await this.axiosInstance.get('/rest/api/3/user/search', {
        params: {
          query,
          maxResults: 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching Jira users:', error);
      throw error;
    }
  }

  async getProjects(): Promise<JiraProject[]> {
    try {
      const response = await this.axiosInstance.get('/rest/api/3/project');
      return response.data;
    } catch (error) {
      console.error('Error fetching Jira projects:', error);
      throw error;
    }
  }

  async assignUserToProject(accountId: string, projectKey: string): Promise<void> {
    try {
      await this.axiosInstance.post(`/rest/api/3/project/${projectKey}/role/10002/actors`, {
        user: [accountId],
      });
    } catch (error) {
      console.error('Error assigning user to Jira project:', error);
      throw error;
    }
  }

  async createJiraAccount(email: string, displayName: string): Promise<JiraUser> {
    try {
      const response = await this.axiosInstance.post('/rest/api/3/user', {
        emailAddress: email,
        displayName: displayName,
        notification: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Jira account:', error);
      throw error;
    }
  }
}

// Example usage:
// const jiraService = new JiraService({
//   baseUrl: 'https://your-domain.atlassian.net',
//   email: 'your-email@example.com',
//   apiToken: 'your-api-token',
// });

// async function setupJiraUser(email: string, displayName: string, projectKey: string) {
//   try {
//     // Create Jira account
//     const user = await jiraService.createJiraAccount(email, displayName);
    
//     // Assign user to project
//     await jiraService.assignUserToProject(user.accountId, projectKey);
    
//     return user;
//   } catch (error) {
//     console.error('Error setting up Jira user:', error);
//     throw error;
//   }
// } 