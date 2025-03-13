Phase 2: Organization Chart Creation
In this phase, we'll implement the drag-and-drop organization chart creator:
Phase 2 Prompt for Cursor:
CopyNow let's implement the organization chart creation module using React and TypeScript.

1. Create a drag-and-drop interface with:
   - Canvas area for chart building
   - Component sidebar with 4 component types:
     - Personnel box (5-field input)
     - Team connection arrows
     - Hierarchical reporting arrows
     - Annotation/context boxes

2. For personnel boxes, implement forms to capture:
   - Person's name
   - Corporate email for invitations
   - Jira email for integration
   - Organizational role (text input)
   - Technical proficiencies (multi-select)

3. Implement arrow connection logic:
   - Connect component to component
   - Different arrow styles for team vs. hierarchical relationships
   - Validation to prevent invalid connections

4. Create invitation system:
   - Generate unique alphanumeric codes for each invited member
   - Send invitation emails with registration instructions
   - Create API endpoint to verify invitation codes

5. Implement data models to store:
   - Organization structure with all relationships
   - Team member profiles and connections
   - Invitation status tracking

Use a library like react-flow or react-diagrams for the interactive chart. Ensure all data is properly typed and persisted to the database.
After implementing Phase 2, you should be able to:

Create organization charts with personnel boxes and connections
Add team members with detailed information
Connect team members with different relationship types
Send invitations to team members
Store and retrieve organization charts