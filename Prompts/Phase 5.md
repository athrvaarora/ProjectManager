Phase 5: Jira Integration and Dashboard
Now let's implement the Jira integration and dashboard:
Phase 5 Prompt for Cursor:
CopyLet's implement the Jira integration and analytics dashboard for our enterprise workflow system.

1. Create Jira API integration:
   - Authentication flow for Jira accounts
   - Permission management for API access
   - Issue creation and update endpoints
   - Bidirectional synchronization logic

2. Build ticket generation system:
   - Convert workflow tasks to Jira issues
   - Map team members to Jira assignees
   - Transform milestones to epics/sprints
   - Generate appropriate hierarchies (epics, stories, tasks)

3. Implement the analytics dashboard:
   - Project progress visualization
   - Milestone completion tracking
   - Upcoming deadline alerts
   - Resource allocation metrics
   - Burndown/velocity charts

4. Create personalized views based on user roles:
   - Team member task lists
   - Manager overview dashboards
   - Administrator system views
   - Observer-only perspectives

5. Build notification system:
   - Email alerts for approaching deadlines
   - Status change notifications
   - Assignment updates
   - Milestone completion alerts

6. Implement real-time synchronization:
   - Webhook listeners for Jira updates
   - Polling fallback for environments without webhooks
   - Conflict resolution for simultaneous changes

Use React for the frontend dashboard and implement proper error handling for API interactions.
After implementing Phase 5, you should be able to:

Connect to Jira and authenticate
Import generated workflows as Jira tickets
View project progress on the dashboard
Receive notifications for important events
See updates synchronized from Jira