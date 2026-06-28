Act as a Senior Frontend Engineer. Your goal is to implement the detail view of a position within the internal content of the page (assume that the top menu, footer, and global container already exist).

Please read the following requirements carefully and implement them in the project:

### 1. UI/UX Requirements (Design-Based)
- **Title and Navigation:** Display the position title at the top. Add a button/arrow to the left of the title that allows navigating back to the positions list (use the project's routing system).
- **Kanban Board:** Display as many columns as phases the flow endpoint returns. Candidate cards must be placed in the column corresponding to their current phase.
- **Candidate Cards:** Each card must display the full name (`fullName`) and their average score (`averageScore`) represented visually (e.g., with green circles/dots according to the score, mimicking the reference design image).
- **Responsiveness (Mobile First):** On large screens, columns are displayed horizontally (standard Kanban layout). On mobile devices, phases must stack vertically occupying the full screen width.

### 2. Functionality and Interaction (Drag and Drop)
- Implement drag-and-drop functionality to move candidate cards between columns (phases).
- When a candidate is dropped into a new column, the interface must be updated optimistically or after API confirmation.

### 3. API Integration (Endpoints)
You must consume/connect the following endpoints (adapt them to the project's services, axios, or fetch):

- **GET `/positions/:id/interviewFlow`**: To obtain the position name and the list of phases (`interviewSteps`).
- **GET `/positions/:id/candidates`**: To obtain the list of candidates, their current phase (`currentInterviewStep`) and their score (`averageScore`).
- **PUT `/candidates/:id/stage`**: Must be triggered when moving a candidate between columns. Send `currentInterviewStep` (with the new phase ID) in the request body.

### 4. Instructions for Claude Code
1. Analyze the current project structure to identify where to place this component/page, which styling library is used (Tailwind, CSS Modules, etc.), and which routing or global state system is implemented.
2. If needed for Drag and Drop, use the native HTML5 API or a lightweight library already installed in `package.json` (or propose its installation if it is a project standard).
3. Make sure to handle loading and error states when connecting to the endpoints.
4. Run the project's tests if they exist to ensure nothing breaks, and create clean, modular, and typed components if the project uses TypeScript.

Please proceed to review the relevant files and implement the solution step by step.
